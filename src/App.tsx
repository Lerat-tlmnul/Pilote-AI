import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { ChatView } from './components/ChatView';
import { ProjectsView } from './components/ProjectsView';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';
import { ConversationDrawer } from './components/ConversationDrawer';
import { MemoryModal } from './components/MemoryModal';
import { ImportantWelcomeModal } from './components/ImportantWelcomeModal';
import { ScheduledTasksModal } from './components/ScheduledTasksModal';
import { 
  Message, 
  Attachment, 
  UserLocation, 
  Restaurant, 
  EmailAction, 
  AppointmentAction,
  GoogleTaskAction,
  GoogleDriveAction,
  ScheduledTaskAction,
  ScheduledTask,
  GoogleUser,
  UserProfileData,
  MemoryItem
} from './types';
import { 
  initAuthListener, 
  signInWithGoogle, 
  signOutGoogle, 
  createRealGoogleTask,
  createRealGoogleDriveFile,
  sendRealGmail,
  scheduleRealCalendarEvent,
  syncProfileToFirestore,
  fetchProfileFromFirestore
} from './lib/firebase';
import {
  loadProfileData,
  saveProfileData,
  createNewConversation,
  deleteConversation,
  renameConversation,
  addMemoryItem,
  removeMemoryItem,
  buildMemoryContextPrompt,
  addScheduledTask,
  recordScheduledTaskExecution
} from './lib/memoryStorage';
import { sendChatMessage } from './lib/aiService';

const BG_IMAGE_URL = "https://flow-content.google/image/e1cf28f0-1737-42fd-ad3a-f19ee5aacd13?Expires=1791409717&KeyName=labs-flow-prod-cdn-key&Signature=TkQoyce8x-Zk5uIvR-N2774-gEo";

export default function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'projects'>('chat');
  const [isThinking, setIsThinking] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isImportantModalOpen, setIsImportantModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isExecutingScheduledTask, setIsExecutingScheduledTask] = useState(false);

  // Persistent User Profile State (Conversations + Memory + Scheduled Tasks)
  const [profile, setProfile] = useState<UserProfileData>(() => loadProfileData('guest'));

  // Show important welcome modal on first app load
  useEffect(() => {
    try {
      const seen = localStorage.getItem('pilote_welcome_seen_v2');
      if (!seen) {
        setIsImportantModalOpen(true);
        localStorage.setItem('pilote_welcome_seen_v2', 'true');
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const [userLocation, setUserLocation] = useState<UserLocation | null>({
    latitude: 48.8566,
    longitude: 2.3522,
    city: 'Paris',
    isAllowed: false,
  });

  // Current active conversation
  const activeConversation = profile.conversations.find(
    (c) => c.id === profile.activeConversationId
  ) || profile.conversations[0];

  const messages = activeConversation?.messages || [];

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuthListener(async (user, _token) => {
      if (user) {
        const gUser: GoogleUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setGoogleUser(gUser);

        // Load profile from Firestore or local storage
        let userProfile = loadProfileData(user.uid);
        const remoteProfile = await fetchProfileFromFirestore(user.uid);
        if (remoteProfile) {
          userProfile = {
            ...userProfile,
            ...remoteProfile,
            email: user.email,
            displayName: user.displayName,
          };
        } else {
          userProfile.email = user.email;
          userProfile.displayName = user.displayName;
        }

        saveProfileData(userProfile);
        syncProfileToFirestore(user.uid, userProfile);
        setProfile(userProfile);
      } else {
        setGoogleUser(null);
        // Load guest profile
        const guestProfile = loadProfileData('guest');
        setProfile(guestProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const handleSignInGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        const welcomeMsg: Message = {
          id: `msg-${Date.now()}-auth-welcome`,
          role: 'assistant',
          content: `Votre compte Google (${result.user.email}) est connecté. Toutes vos discussions, mémoires et automatisations sont sauvegardées sur Firebase et Google Workspace. Je peux expédier vos e-mails via Gmail, synchroniser votre Google Calendar et gérer vos Google Tasks.`,
          timestamp: Date.now(),
        };

        // Append to active conversation
        setProfile((prev) => {
          const updatedConversations = prev.conversations.map((c) =>
            c.id === prev.activeConversationId
              ? { ...c, messages: [...c.messages, welcomeMsg], updatedAt: Date.now() }
              : c
          );
          const updated = { ...prev, conversations: updatedConversations };
          saveProfileData(updated);
          syncProfileToFirestore(prev.userId, updated);
          return updated;
        });
      }
    } catch (err: any) {
      console.warn('Erreur de connexion Google:', err);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleSignOutGoogle = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    const guestProfile = loadProfileData('guest');
    setProfile(guestProfile);
  };

  // Conversation Management Handlers
  const handleCreateNewChat = () => {
    const { profile: updatedProfile } = createNewConversation(profile);
    saveProfileData(updatedProfile);
    syncProfileToFirestore(updatedProfile.userId, updatedProfile);
    setProfile(updatedProfile);
    setCurrentTab('chat');
  };

  const handleSelectConversation = (convId: string) => {
    const updated: UserProfileData = {
      ...profile,
      activeConversationId: convId,
    };
    saveProfileData(updated);
    syncProfileToFirestore(updated.userId, updated);
    setProfile(updated);
    setCurrentTab('chat');
  };

  const handleDeleteConversation = (convId: string) => {
    const updated = deleteConversation(profile, convId);
    saveProfileData(updated);
    syncProfileToFirestore(updated.userId, updated);
    setProfile(updated);
  };

  const handleRenameConversation = (convId: string, newTitle: string) => {
    const updated = renameConversation(profile, convId, newTitle);
    saveProfileData(updated);
    syncProfileToFirestore(updated.userId, updated);
    setProfile(updated);
  };

  // Memory Handlers
  const handleAddMemory = (category: MemoryItem['category'], content: string) => {
    const updated = addMemoryItem(profile, category, content);
    saveProfileData(updated);
    syncProfileToFirestore(updated.userId, updated);
    setProfile(updated);
  };

  const handleRemoveMemory = (id: string) => {
    const updated = removeMemoryItem(profile, id);
    saveProfileData(updated);
    syncProfileToFirestore(updated.userId, updated);
    setProfile(updated);
  };

  // Geolocation with real city reverse-geocoding
  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let resolvedCity = 'Position active';

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
              const data = await res.json();
              resolvedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Position active';
            }
          } catch {
            resolvedCity = 'Position active';
          }

          setUserLocation({
            latitude: lat,
            longitude: lng,
            city: resolvedCity,
            accuracy: position.coords.accuracy,
            isAllowed: true,
          });
        },
        async (error) => {
          console.warn('Geolocation access declined or error:', error);
          setUserLocation({
            latitude: 48.8566,
            longitude: 2.3522,
            city: 'Paris',
            isAllowed: true,
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const currentConv = activeConversation;
    const newMessages = [...currentConv.messages, userMessage];

    // Determine automatic title if it's the first user message
    let updatedTitle = currentConv.title;
    if (currentConv.messages.length === 0) {
      updatedTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    }

    // Optimistically update conversation state
    setProfile((prev) => {
      const updatedConversations = prev.conversations.map((c) =>
        c.id === currentConv.id
          ? { ...c, title: updatedTitle, messages: newMessages, updatedAt: Date.now() }
          : c
      );
      const updated = { ...prev, conversations: updatedConversations };
      saveProfileData(updated);
      syncProfileToFirestore(prev.userId, updated);
      return updated;
    });

    setIsThinking(true);

    try {
      // Execute robust multi-layered AI completion service (Dev, Server, Direct & Fallback)
      const aiResult = await sendChatMessage(newMessages, profile, userLocation, googleUser);

      // Auto create task in state if returned
      if (aiResult.scheduledTaskAction) {
        setProfile((prev) => {
          const { profile: updated } = addScheduledTask(prev, {
            instruction: aiResult.scheduledTaskAction!.instruction,
            frequency: aiResult.scheduledTaskAction!.frequency,
            timeOfDay: aiResult.scheduledTaskAction!.timeOfDay || '08:30',
            targetWorkspace: aiResult.scheduledTaskAction!.targetWorkspace || 'auto',
            enabled: true,
          });
          syncProfileToFirestore(prev.userId, updated);
          return updated;
        });
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResult.cleanText || "Je reste à votre entière disposition.",
        timestamp: Date.now(),
        restaurants: aiResult.restaurants,
        emailAction: aiResult.emailAction,
        appointmentAction: aiResult.appointmentAction,
        taskAction: aiResult.taskAction,
        driveAction: aiResult.driveAction,
        scheduledTaskAction: aiResult.scheduledTaskAction,
      };

      // Persist assistant message in active conversation
      setProfile((prev) => {
        const updatedConversations = prev.conversations.map((c) =>
          c.id === currentConv.id
            ? { ...c, messages: [...newMessages, assistantMessage], updatedAt: Date.now() }
            : c
        );
        const updated = { ...prev, conversations: updatedConversations };
        saveProfileData(updated);
        syncProfileToFirestore(prev.userId, updated);
        return updated;
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: `msg-${Date.now()}-ai-fallback`,
        role: 'assistant',
        content: "Je suis à votre entière disposition pour vos restaurants avec carte interactive, l'envoi d'e-mails via Gmail, la gestion d'agenda, vos tâches Google Workspace et la planification de vos grands projets.",
        timestamp: Date.now(),
      };

      setProfile((prev) => {
        const updatedConversations = prev.conversations.map((c) =>
          c.id === currentConv.id
            ? { ...c, messages: [...newMessages, fallbackMsg], updatedAt: Date.now() }
            : c
        );
        const updated = { ...prev, conversations: updatedConversations };
        saveProfileData(updated);
        syncProfileToFirestore(prev.userId, updated);
        return updated;
      });
    } finally {
      setIsThinking(false);
    }
  };

  // Immediate execution of a scheduled task on-demand
  const handleExecuteScheduledTaskNow = async (task: ScheduledTask) => {
    setIsExecutingScheduledTask(true);
    try {
      await handleSendMessage(task.instruction, []);
      const updated = recordScheduledTaskExecution(profile, task.id, `Exécutée avec succès : "${task.instruction.slice(0, 45)}..."`, 'success');
      saveProfileData(updated);
      syncProfileToFirestore(updated.userId, updated);
      setProfile(updated);
    } catch (err) {
      console.error('Erreur exécution tâche:', err);
      const updated = recordScheduledTaskExecution(profile, task.id, 'Erreur lors de l\'exécution.', 'failed');
      saveProfileData(updated);
      syncProfileToFirestore(updated.userId, updated);
      setProfile(updated);
    } finally {
      setIsExecutingScheduledTask(false);
    }
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt, []);
  };

  return (
    <div
      className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-cover bg-center select-none"
      style={{
        backgroundImage: `url(${BG_IMAGE_URL})`,
        backgroundColor: '#9bc2e5',
      }}
    >
      {/* Subtle Atmospheric Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />

      {/* Header and Mobile Dock */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userLocation={userLocation}
        onRequestLocation={requestLocation}
        onOpenProModal={() => setIsProModalOpen(true)}
        googleUser={googleUser}
        isConnectingGoogle={isConnectingGoogle}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onCreateNewChat={handleCreateNewChat}
        conversationsCount={profile.conversations.length}
        onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
        onOpenImportantModal={() => setIsImportantModalOpen(true)}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
        scheduledTasksCount={profile.scheduledTasks?.length || 0}
      />

      {/* Main View Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        {currentTab === 'chat' ? (
          <ChatView
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            userLocation={userLocation}
            onRequestLocation={requestLocation}
            onOpenTasksModal={() => setIsTasksModalOpen(true)}
            onScheduleAppointment={(action) => {
              const confirmationMsg: Message = {
                id: `msg-${Date.now()}-confirm`,
                role: 'assistant',
                content: `Le rendez-vous "${action.title}" a bien été synchronisé avec votre agenda le ${action.date} à ${action.time}.`,
                timestamp: Date.now(),
              };
              setProfile((prev) => {
                const updatedConversations = prev.conversations.map((c) =>
                  c.id === activeConversation.id
                    ? { ...c, messages: [...c.messages, confirmationMsg], updatedAt: Date.now() }
                    : c
                );
                const updated = { ...prev, conversations: updatedConversations };
                saveProfileData(updated);
                return updated;
              });
            }}
            onSendEmailAction={(action) => {
              const confirmationMsg: Message = {
                id: `msg-${Date.now()}-mail-confirm`,
                role: 'assistant',
                content: `Votre e-mail pour "${action.recipient}" a été envoyé avec succès sous l'objet "${action.subject}".`,
                timestamp: Date.now(),
              };
              setProfile((prev) => {
                const updatedConversations = prev.conversations.map((c) =>
                  c.id === activeConversation.id
                    ? { ...c, messages: [...c.messages, confirmationMsg], updatedAt: Date.now() }
                    : c
                );
                const updated = { ...prev, conversations: updatedConversations };
                saveProfileData(updated);
                return updated;
              });
            }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ProjectsView onOpenChatWithPrompt={handleOpenChatWithPrompt} />
          </div>
        )}
      </main>

      {/* Important Welcome & Features Guide Modal */}
      <ImportantWelcomeModal
        isOpen={isImportantModalOpen}
        onClose={() => setIsImportantModalOpen(false)}
        onOpenTasksModal={() => {
          setIsImportantModalOpen(false);
          setIsTasksModalOpen(true);
        }}
        isGoogleConnected={!!googleUser}
        onSignInGoogle={handleSignInGoogle}
      />

      {/* Daily & Recurring Scheduled Tasks Manager Modal */}
      <ScheduledTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onExecuteTaskNow={handleExecuteScheduledTaskNow}
        isExecutingTask={isExecutingScheduledTask}
      />

      {/* PRO Subscription Modal */}
      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Multi-Chat History Drawer */}
      <ConversationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={profile}
        onSelectConversation={handleSelectConversation}
        onCreateNewChat={handleCreateNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
      />

      {/* Profile Memory Modal */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        profile={profile}
        onAddMemory={handleAddMemory}
        onRemoveMemory={handleRemoveMemory}
      />
    </div>
  );
}
