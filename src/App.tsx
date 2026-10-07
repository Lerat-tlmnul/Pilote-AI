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
  scheduleRealCalendarEvent
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
import { extractSpecificEmailRequest, sanitizeEmailAction } from './lib/emailExtractor';
import { getRestaurantsForCity, detectCityInText } from './lib/cityRestaurants';

const BG_IMAGE_URL = "https://flow-content.google/image/e1cf28f0-1737-42fd-ad3a-f19ee5aacd13?Expires=1791409717&KeyName=labs-flow-prod-cdn-key&Signature=TkQoyce8x-Zk5uIvR-N2774-gEo";

const NVIDIA_API_KEY = "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";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const MODEL_NAME = "deepseek-ai/deepseek-v4.1-flash";

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
    const unsubscribe = initAuthListener((user, _token) => {
      if (user) {
        const gUser: GoogleUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setGoogleUser(gUser);

        // Load or create profile tied to this user UID
        const userProfile = loadProfileData(user.uid);
        userProfile.email = user.email;
        userProfile.displayName = user.displayName;
        saveProfileData(userProfile);
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
          content: `Votre compte Google (${result.user.email}) est connecté. Toutes vos discussions et la mémoire de vos préférences sont désormais sauvegardées sur votre profil. Je peux également expédier vos e-mails via Gmail et synchroniser votre agenda Google à votre demande.`,
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
    setProfile(updatedProfile);
    setCurrentTab('chat');
  };

  const handleSelectConversation = (convId: string) => {
    const updated: UserProfileData = {
      ...profile,
      activeConversationId: convId,
    };
    saveProfileData(updated);
    setProfile(updated);
    setCurrentTab('chat');
  };

  const handleDeleteConversation = (convId: string) => {
    const updated = deleteConversation(profile, convId);
    setProfile(updated);
  };

  const handleRenameConversation = (convId: string, newTitle: string) => {
    const updated = renameConversation(profile, convId, newTitle);
    setProfile(updated);
  };

  // Memory Handlers
  const handleAddMemory = (category: MemoryItem['category'], content: string) => {
    const updated = addMemoryItem(profile, category, content);
    setProfile(updated);
  };

  const handleRemoveMemory = (id: string) => {
    const updated = removeMemoryItem(profile, id);
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
            // Free OpenStreetMap reverse geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
              const data = await res.json();
              resolvedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Position active';
            }
          } catch {
            const closest = getRestaurantsForCity(undefined, lat, lng);
            resolvedCity = closest.city;
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
          let fallbackCity = 'Paris';
          let fallbackLat = 48.8566;
          let fallbackLng = 2.3522;

          try {
            const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.city) {
                fallbackCity = ipData.city;
                fallbackLat = ipData.latitude || fallbackLat;
                fallbackLng = ipData.longitude || fallbackLng;
              }
            }
          } catch {
            // keep default
          }

          setUserLocation({
            latitude: fallbackLat,
            longitude: fallbackLng,
            city: fallbackCity,
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

  // Helper to extract JSON blocks from model response with strict user preference enforcement
  const parseAIContent = (rawText: string, userPrompt: string = '') => {
    let cleanText = rawText;
    let restaurants: Restaurant[] | undefined;
    let emailAction: EmailAction | undefined;
    let appointmentAction: AppointmentAction | undefined;
    let taskAction: GoogleTaskAction | undefined;
    let driveAction: GoogleDriveAction | undefined;
    let scheduledTaskAction: ScheduledTaskAction | undefined;

    const userPromptLower = userPrompt.toLowerCase();
    const explicitEmailMatch = userPrompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

    // Check for ```json:restaurants ... ```
    const restoMatch = rawText.match(/```json:restaurants\s*([\s\S]*?)\s*```/);
    if (restoMatch) {
      try {
        restaurants = JSON.parse(restoMatch[1]);
        cleanText = cleanText.replace(restoMatch[0], '').trim();
      } catch (err) {
        console.warn('Failed to parse restaurants JSON', err);
      }
    }

    // Check for ```json:email_action ... ```
    const emailMatch = rawText.match(/```json:email_action\s*([\s\S]*?)\s*```/);
    if (emailMatch) {
      try {
        const parsed = JSON.parse(emailMatch[1]);
        emailAction = sanitizeEmailAction(parsed, userPrompt);
        cleanText = cleanText.replace(emailMatch[0], '').trim();
      } catch (err) {
        console.warn('Failed to parse email JSON', err);
      }
    }

    // If user asked to send an email or provided an explicit email address but no block was returned
    if (!emailAction && (explicitEmailMatch || userPromptLower.includes('mail') || userPromptLower.includes('email') || userPromptLower.includes('envoyer'))) {
      const extracted = extractSpecificEmailRequest(userPrompt);
      emailAction = {
        recipient: explicitEmailMatch ? explicitEmailMatch[1].trim() : extracted.recipient,
        subject: extracted.subject,
        body: extracted.body,
        status: 'sent',
        autoSent: true,
        sentAt: Date.now(),
      };
    }

    // Eradicate any hallucinated 'contact@partenaire.com' or dummy emails from model text
    if (emailAction) {
      cleanText = cleanText.replace(/contact@partenaire\.com/g, emailAction.recipient);
      cleanText = cleanText.replace(/alexandre\.durand@pilote\.studio/g, emailAction.recipient);
      cleanText = cleanText.replace(/partenaire\.com/g, emailAction.recipient.split('@')[1] || 'contact.fr');
    }

    // Check for ```json:appointment_action ... ```
    const apptMatch = rawText.match(/```json:appointment_action\s*([\s\S]*?)\s*```/);
    if (apptMatch) {
      try {
        appointmentAction = JSON.parse(apptMatch[1]);
        cleanText = cleanText.replace(apptMatch[0], '').trim();
      } catch (err) {
        console.warn('Failed to parse appointment JSON', err);
      }
    }

    // Check for ```json:task_action ... ```
    const taskMatch = rawText.match(/```json:task_action\s*([\s\S]*?)\s*```/);
    if (taskMatch) {
      try {
        taskAction = JSON.parse(taskMatch[1]);
        cleanText = cleanText.replace(taskMatch[0], '').trim();
      } catch (err) {
        console.warn('Failed to parse task JSON', err);
      }
    }

    // Check for ```json:drive_action ... ```
    const driveMatch = rawText.match(/```json:drive_action\s*([\s\S]*?)\s*```/);
    if (driveMatch) {
      try {
        driveAction = JSON.parse(driveMatch[1]);
        cleanText = cleanText.replace(driveMatch[0], '').trim();
      } catch (err) {
        console.warn('Failed to parse drive JSON', err);
      }
    }

    // Check for ```json:scheduled_task_action ... ```
    const scheduledMatch = rawText.match(/```json:scheduled_task_action\s*([\s\S]*?)\s*```/);
    if (scheduledMatch) {
      try {
        scheduledTaskAction = JSON.parse(scheduledMatch[1]);
        cleanText = cleanText.replace(scheduledMatch[0], '').trim();
        if (scheduledTaskAction) {
          // Auto add to user profile scheduled tasks
          setProfile((prev) => {
            const { profile: updated } = addScheduledTask(prev, {
              instruction: scheduledTaskAction!.instruction,
              frequency: scheduledTaskAction!.frequency,
              timeOfDay: scheduledTaskAction!.timeOfDay || '08:30',
              targetWorkspace: scheduledTaskAction!.targetWorkspace || 'auto',
              enabled: true,
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn('Failed to parse scheduled task JSON', err);
      }
    }

    // Restaurants fallback for city if requested but missing
    if (!restaurants && (userPromptLower.includes('resto') || userPromptLower.includes('restaurant') || userPromptLower.includes('manger') || userPromptLower.includes('dîner'))) {
      const detected = detectCityInText(userPrompt);
      const cityData = getRestaurantsForCity(detected ? detected.name : userLocation?.city, userLocation?.latitude, userLocation?.longitude);
      restaurants = cityData.restaurants;
    }

    return { cleanText, restaurants, emailAction, appointmentAction, taskAction, driveAction, scheduledTaskAction };
  };

  // Direct client-side inference fallback (for static Vercel hosting)
  const callDirectNvidiaFallback = async (allMessages: Message[]): Promise<string> => {
    const memoryContext = buildMemoryContextPrompt(profile);
    const lastUser = allMessages[allMessages.length - 1]?.content || '';
    const detectedCity = detectCityInText(lastUser);
    const activeCity = detectedCity ? detectedCity.name : (userLocation?.city || 'Paris');

    const systemPrompt = `Tu es Pilote 1, un assistant personnel d'élite doté d'une interface ultra-élégante et intuitive.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive) ainsi qu'à la géolocalisation de l'utilisateur (Ville active : ${activeCity}) et à l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, rédige et exécute immédiatement.

RÈGLE ABSOLUE D'IDENTITÉ : Tu es UNIQUEMENT et TOUJOURS "Pilote 1". Tu ne dois JAMAIS citer ni divulguer le nom d'un modèle d'IA sous-jacent.

FORMATS STRUCTURÉS D'ACTION :
1. Restaurants : bloc \`\`\`json:restaurants ... \`\`\`
2. Envoi d'e-mail : bloc \`\`\`json:email_action ... \`\`\` (respecte strictement l'email fourni)
3. Rendez-vous Calendar : bloc \`\`\`json:appointment_action ... \`\`\`
4. Google Tasks : bloc \`\`\`json:task_action ... \`\`\`
5. Google Drive : bloc \`\`\`json:drive_action ... \`\`\`
6. Tâche récurrente / quotidienne : bloc \`\`\`json:scheduled_task_action ... \`\`\`

${googleUser ? `[L'utilisateur est connecté avec son compte Google : ${googleUser.email}. Toutes les actions Google Workspace sont synchronisées en direct.]` : ''}
${memoryContext}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          ...allMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API Direct error');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Je suis à votre disposition.';
  };

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
      return updated;
    });

    setIsThinking(true);

    try {
      let rawContent = '';

      // Try server /api/chat route first with user memory context
      try {
        const memoryContext = buildMemoryContextPrompt(profile);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            memoryContext,
            userLocation: userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  city: userLocation.city,
                }
              : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          rawContent = data.content || '';
        } else {
          throw new Error('API route failed');
        }
      } catch (serverErr) {
        // Fallback for Vercel static deployments
        console.warn('Passing through client direct fallback for Vercel:', serverErr);
        rawContent = await callDirectNvidiaFallback(newMessages);
      }

      const { cleanText, restaurants, emailAction, appointmentAction, taskAction, driveAction, scheduledTaskAction } = parseAIContent(rawContent, text);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: cleanText || "Je reste à votre entière disposition.",
        timestamp: Date.now(),
        restaurants,
        emailAction,
        appointmentAction,
        taskAction,
        driveAction,
        scheduledTaskAction,
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
      // Execute the task instruction directly in the chat
      await handleSendMessage(task.instruction, []);
      // Record execution in task history
      const updated = recordScheduledTaskExecution(profile, task.id, `Exécutée avec succès : "${task.instruction.slice(0, 45)}..."`, 'success');
      setProfile(updated);
    } catch (err) {
      console.error('Erreur exécution tâche:', err);
      const updated = recordScheduledTaskExecution(profile, task.id, 'Erreur lors de l\'exécution.', 'failed');
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
