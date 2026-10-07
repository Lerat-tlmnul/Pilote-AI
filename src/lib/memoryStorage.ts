import { Conversation, MemoryItem, UserProfileData, Message } from '../types';

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'preference',
    content: 'Préfère les tables bistronomiques soignées, ambiance chaleureuse avec options de réservation rapide.',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'mem-2',
    category: 'projet',
    content: 'Pilote actuellement le projet "Lancement Commercial Europe 2026" et l\'événement gastronomique éphémère.',
    createdAt: Date.now() - 43200000,
  },
  {
    id: 'mem-3',
    category: 'contact',
    content: 'Correspondances régulières avec Alexandre D. (alexandre@pilote.studio) et l\'équipe produit.',
    createdAt: Date.now() - 21600000,
  },
];

export const getStorageKey = (userId?: string | null): string => {
  return `pilote_profile_${userId || 'guest'}`;
};

export const loadProfileData = (userId?: string | null): UserProfileData => {
  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.conversations) && parsed.conversations.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load profile data from localStorage', err);
  }

  // Create initial conversation if none exists
  const initialConvId = `conv-${Date.now()}`;
  const initialConv: Conversation = {
    id: initialConvId,
    title: 'Nouvelle discussion',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };

  const initialProfile: UserProfileData = {
    userId: userId || 'guest',
    email: null,
    displayName: null,
    memories: DEFAULT_MEMORIES,
    conversations: [initialConv],
    activeConversationId: initialConvId,
  };

  saveProfileData(initialProfile);
  return initialProfile;
};

export const saveProfileData = (profile: UserProfileData): void => {
  const key = getStorageKey(profile.userId);
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile data to localStorage', err);
  }
};

export const createNewConversation = (
  profile: UserProfileData,
  title = 'Nouvelle discussion'
): { profile: UserProfileData; newConv: Conversation } => {
  const newConv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };

  const updatedProfile: UserProfileData = {
    ...profile,
    conversations: [newConv, ...profile.conversations],
    activeConversationId: newConv.id,
  };

  saveProfileData(updatedProfile);
  return { profile: updatedProfile, newConv };
};

export const addMemoryItem = (
  profile: UserProfileData,
  category: MemoryItem['category'],
  content: string
): UserProfileData => {
  const newItem: MemoryItem = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category,
    content: content.trim(),
    createdAt: Date.now(),
  };

  const updated: UserProfileData = {
    ...profile,
    memories: [newItem, ...profile.memories],
  };

  saveProfileData(updated);
  return updated;
};

export const removeMemoryItem = (
  profile: UserProfileData,
  memoryId: string
): UserProfileData => {
  const updated: UserProfileData = {
    ...profile,
    memories: profile.memories.filter((m) => m.id !== memoryId),
  };

  saveProfileData(updated);
  return updated;
};

export const deleteConversation = (
  profile: UserProfileData,
  convId: string
): UserProfileData => {
  const remaining = profile.conversations.filter((c) => c.id !== convId);
  let nextActiveId = profile.activeConversationId;

  if (profile.activeConversationId === convId) {
    if (remaining.length > 0) {
      nextActiveId = remaining[0].id;
    } else {
      // Create empty fallback
      const fallbackConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: 'Nouvelle discussion',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      remaining.push(fallbackConv);
      nextActiveId = fallbackConv.id;
    }
  }

  const updated: UserProfileData = {
    ...profile,
    conversations: remaining,
    activeConversationId: nextActiveId,
  };

  saveProfileData(updated);
  return updated;
};

export const renameConversation = (
  profile: UserProfileData,
  convId: string,
  newTitle: string
): UserProfileData => {
  const updated: UserProfileData = {
    ...profile,
    conversations: profile.conversations.map((c) =>
      c.id === convId ? { ...c, title: newTitle.trim(), updatedAt: Date.now() } : c
    ),
  };

  saveProfileData(updated);
  return updated;
};

/**
 * Builds memory & context prompt segment to inject into Pilote 1
 */
export const buildMemoryContextPrompt = (profile: UserProfileData): string => {
  if (!profile.memories || profile.memories.length === 0) return '';

  const memoryLines = profile.memories.map(
    (m, i) => `${i + 1}. [${m.category.toUpperCase()}] ${m.content}`
  );

  return `\n\n[MÉMOIRE & CONTEXTE PERSISTANT SUR LE PROFIL DE L'UTILISATEUR] :
Tu disposes d'une mémoire continue des préférences et habitudes de cet utilisateur pour personnaliser chaque réponse :
${memoryLines.join('\n')}
Prends en compte ce contexte naturellement sans réciter mécaniquement la liste. Si l'utilisateur mentionne de nouvelles préférences, adapte-toi instantanément.`;
};
