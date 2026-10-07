import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Configure Google Auth Provider with full Workspace Scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (Do NOT store in localStorage per security requirements)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onUserChanged: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    onUserChanged(user, cachedAccessToken);
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    throw new Error('Une tentative de connexion est déjà en cours.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    return { 
      user: result.user, 
      accessToken: cachedAccessToken || '' 
    };
  } catch (error: any) {
    console.error('Erreur de connexion Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Safe UTF-8 to Base64URL encoder for RFC 2822
function encodeBase64UrlUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send real email via Gmail API
 */
export const sendRealGmail = async (
  recipient: string, 
  subject: string, 
  body: string
): Promise<{ success: boolean; messageId?: string; threadId?: string }> => {
  if (!cachedAccessToken) {
    throw new Error('Non connecté à Google. Connexion requise pour expédier via Gmail.');
  }

  // Construct standard RFC 2822 email payload
  const encodedSubject = `=?UTF-8?B?${btoa(encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}?=`;
  const emailLines = [
    `To: ${recipient}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ];
  const emailContent = emailLines.join('\r\n');
  const raw = encodeBase64UrlUtf8(emailContent);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Échec de l\'envoi via Gmail');
  }

  const data = await response.json();
  return { success: true, messageId: data.id, threadId: data.threadId };
};

/**
 * Direct web Gmail composer helper
 */
export const getGmailWebComposeUrl = (recipient: string, subject: string, body: string): string => {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Schedule real event via Google Calendar API
 */
export const scheduleRealCalendarEvent = async (params: {
  title: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  notes?: string;
}): Promise<any> => {
  if (!cachedAccessToken) {
    throw new Error('Non connecté à Google. Veuillez vous connecter pour planifier sur votre agenda.');
  }

  const { title, date, time, duration = '1h', location, notes } = params;
  
  const startDateTime = new Date(`${date}T${time}:00`);
  const durationHours = duration.includes('h') ? parseFloat(duration.replace('h', '')) : 1;
  const endDateTime = new Date(startDateTime.getTime() + durationHours * 3600000);

  const eventPayload = {
    summary: title,
    description: notes || 'Planifié avec Pilote 1',
    location: location || '',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Échec de l\'ajout dans Google Calendar');
  }

  return await response.json();
};

/**
 * Create a new task in Google Tasks API
 */
export const createRealGoogleTask = async (params: {
  title: string;
  notes?: string;
  dueDate?: string;
}): Promise<any> => {
  if (!cachedAccessToken) {
    throw new Error('Non connecté à Google. Connexion requise pour synchroniser avec Google Tasks.');
  }

  const payload: any = {
    title: params.title,
    notes: params.notes || 'Créé automatiquement par Pilote 1',
  };

  if (params.dueDate) {
    // RFC 3339 timestamp
    const d = new Date(params.dueDate);
    if (!isNaN(d.getTime())) {
      payload.due = d.toISOString();
    }
  }

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Échec de la création dans Google Tasks');
  }

  return await response.json();
};

/**
 * List active tasks from Google Tasks API
 */
export const listRealGoogleTasks = async (): Promise<any[]> => {
  if (!cachedAccessToken) return [];
  try {
    const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&maxResults=10', {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.warn('Google Tasks list error:', err);
    return [];
  }
};

/**
 * Create a new file or doc in Google Drive API
 */
export const createRealGoogleDriveFile = async (params: {
  title: string;
  content: string;
  mimeType?: string;
}): Promise<{ id: string; name: string; webViewLink?: string }> => {
  if (!cachedAccessToken) {
    throw new Error('Non connecté à Google. Connexion requise pour enregistrer dans Google Drive.');
  }

  const fileTitle = params.title.endsWith('.txt') || params.title.endsWith('.md') 
    ? params.title 
    : `${params.title}.md`;

  const metadata = {
    name: fileTitle,
    mimeType: params.mimeType || 'text/markdown',
    description: 'Document généré automatiquement par Pilote 1',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    params.content +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Échec de la création dans Google Drive');
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
};

/**
 * List recent events from Google Calendar API
 */
export const listRealCalendarEvents = async (maxResults = 5): Promise<any[]> => {
  if (!cachedAccessToken) return [];
  try {
    const nowIso = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`,
        },
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.warn('Calendar list error:', err);
    return [];
  }
};

/**
 * List recent emails from Gmail API
 */
export const listRealGmailMessages = async (maxResults = 5): Promise<any[]> => {
  if (!cachedAccessToken) return [];
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.messages || [];
  } catch (err) {
    console.warn('Gmail messages list error:', err);
    return [];
  }
};
