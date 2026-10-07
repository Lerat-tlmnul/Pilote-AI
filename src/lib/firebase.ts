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

// Configure Google Auth Provider with Workspace Scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
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
