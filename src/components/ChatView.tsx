import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Paperclip, 
  X, 
  Compass, 
  MapPin, 
  Mail, 
  Calendar, 
  FileText, 
  AlertCircle,
  Plus,
  Repeat,
  ArrowUp,
  Brain,
  ChevronDown,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { Message, Attachment, UserLocation, Restaurant, EmailAction, AppointmentAction, AutonomousOrderAction, PiloteModelId } from '../types';
import { RestaurantMapCard } from './RestaurantMapCard';
import { 
  EmailActionCard, 
  AppointmentActionCard, 
  GoogleTaskActionCard, 
  GoogleDriveActionCard, 
  ScheduledTaskActionCard,
  AutonomousOrderActionCard
} from './ActionCards';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  userLocation: UserLocation | null;
  onRequestLocation: () => void;
  onScheduleAppointment: (action: AppointmentAction) => void;
  onSendEmailAction: (action: EmailAction) => void;
  onOpenTasksModal?: () => void;
  onOpenPaymentModal?: () => void;
  onConfirmOrderAction?: (action: AutonomousOrderAction) => void;
  onCancelOrderAction?: (action: AutonomousOrderAction) => void;
  thinkingEnabled: boolean;
  onToggleThinking: () => void;
  selectedModelId?: PiloteModelId;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Compass,
    title: "Trouver des restaurants",
    subtitle: "Bistrot ou gastronomique avec carte Maps",
    prompt: "Trouve-moi 3 restaurants d'exception près de ma position avec une ambiance chaleureuse.",
  },
  {
    icon: Mail,
    title: "Rédiger et envoyer un email",
    subtitle: "Gmail en direct sur simple consigne",
    prompt: "Rédige et envoie un e-mail professionnel pour confirmer notre rendez-vous stratégique de jeudi.",
  },
  {
    icon: Calendar,
    title: "Organiser un rendez-vous",
    subtitle: "Google Calendar synchronisé",
    prompt: "Planifie un rendez-vous déjeuner vendredi à 12h30 avec Alexandre au Bistrot Paul Bert.",
  },
  {
    icon: Repeat,
    title: "Programmer une routine quotidienne",
    subtitle: "Exécution automatique tous les jours",
    prompt: "Chaque matin à 08h30, prépare le récapitulatif de mes priorités et vérifie mes tâches Google Tasks.",
  },
];

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isThinking,
  onSendMessage,
  userLocation,
  onRequestLocation,
  onScheduleAppointment,
  onSendEmailAction,
  onOpenTasksModal,
  onOpenPaymentModal,
  onConfirmOrderAction,
  onCancelOrderAction,
  thinkingEnabled,
  onToggleThinking,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileLimitWarning, setFileLimitWarning] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);
    return () => window.removeEventListener('resize', updateIsDesktop);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !input.trim() &&
        attachments.length === 0
      ) {
        setIsInputFocused(false);
        setIsActionSheetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [input, attachments.length]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 10) {
      setFileLimitWarning("Limite atteinte : 10 fichiers maximum.");
      setTimeout(() => setFileLimitWarning(null), 4000);
    }

    const availableSlots = 10 - attachments.length;
    const filesToAdd = Array.from(files).slice(0, availableSlots);

    const newAttachments: Attachment[] = filesToAdd.map((file) => {
      const isImg = file.type.startsWith('image/');
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsActionSheetOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isThinking) return;

    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    setIsActionSheetOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
  };

  return (
    <div className="relative flex flex-col h-full w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-14 md:pt-24 pb-0 md:pb-6 px-3 sm:px-6 md:px-8">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 sm:space-y-6 pb-24 md:pb-8 pt-3">
        {/* Apple iOS Clean Empty Hero State */}
        {messages.length === 0 && (
          <div className="my-auto py-6 sm:py-12 flex flex-col items-center text-center max-w-2xl mx-auto animate-in fade-in duration-500">
            {/* Apple Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="relative mb-3 flex items-center justify-center"
            >
              <div className="p-3 rounded-[24px] bg-white/90 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04]">
                <img
                  src={LOGO_URL}
                  alt="Pilote 1"
                  referrerPolicy="no-referrer"
                  className="h-14 sm:h-16 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pilote 1
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-normal">
              Exécution autonome : Google Workspace (Gmail, Agenda, Drive, Tasks), recherche d'adresses et routines.
            </p>

            {/* Apple Location Button */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-50 text-slate-800 border border-black/[0.06] shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>
                  {userLocation?.city
                    ? `Position active : ${userLocation.city}`
                    : 'Activer la géolocalisation'}
                </span>
              </button>
            </div>

            {/* Clean Prompt Cards Grid (Neutral Apple HIG Design) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(item.prompt, [])}
                    className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:scale-98 transition-all text-left flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-black/[0.04]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
              >
                <div className={`flex items-start gap-2 max-w-[94%] sm:max-w-[88%] lg:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Assistant Avatar */}
                  {!isUser ? (
                    <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-black/[0.06] p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                      <img
                        src={LOGO_URL}
                        alt="Logo"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Bubble Container with Apple iOS Styling */}
                  <div
                    className={`px-4 sm:px-5 py-3 text-xs sm:text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-[#007AFF] text-white rounded-[20px] rounded-br-[5px] shadow-[0_2px_12px_rgba(0,122,255,0.2)]'
                        : 'bg-white border border-black/[0.06] text-slate-900 rounded-[20px] rounded-bl-[5px] shadow-xs'
                    }`}
                  >
                    {/* Attachments preview */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-black/10 flex flex-wrap gap-1.5">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ${
                              isUser ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="w-4 h-4 rounded-xs object-cover" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                            <span className="truncate max-w-[120px]">{att.name}</span>
                            <span className="opacity-75 text-[10px]">({formatFileSize(att.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Collapsible Thinking Block (Mode Réflexion - iOS Style Sobre) */}
                    {!isUser && message.thinking && (
                      <div className="mb-2.5 rounded-xl border border-black/[0.06] bg-slate-50 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedThinkingIds(prev => ({
                              ...prev,
                              [message.id]: !prev[message.id],
                            }));
                          }}
                          className="w-full px-3 py-2 flex items-center justify-between text-slate-800 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-slate-600" />
                            <span>Processus de réflexion</span>
                            {message.modelUsed && (
                              <span className="text-[10px] text-slate-500 bg-white border border-black/[0.06] px-1.5 py-0.5 rounded-md font-mono">
                                {message.modelUsed}
                              </span>
                            )}
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                            expandedThinkingIds[message.id] ? 'rotate-180' : ''
                          }`} />
                        </button>
                        <AnimatePresence>
                          {expandedThinkingIds[message.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3 pb-2.5 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-black/[0.06] bg-white font-mono whitespace-pre-wrap"
                            >
                              {message.thinking}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Markdown Content */}
                    <div className="selection:bg-slate-900 selection:text-white font-normal">
                      <MarkdownRenderer content={message.content} />
                    </div>

                    {/* Interactive Attached Cards */}
                    {message.restaurants && message.restaurants.length > 0 && (
                      <RestaurantMapCard
                        restaurants={message.restaurants}
                        initialCity={userLocation?.city || 'Paris'}
                        onBookTable={(resto: Restaurant) => {
                          onSendMessage(`Donne-moi tous les détails pour réserver chez ${resto.name} à ${resto.address}.`, []);
                        }}
                        onSendEmail={(resto: Restaurant) => {
                          onSendMessage(`Rédige un e-mail pour inviter un collègue chez ${resto.name} (${resto.address}).`, []);
                        }}
                        onSchedule={(resto: Restaurant) => {
                          onSendMessage(`Note un dîner chez ${resto.name} dans mon agenda ce jeudi à 20h.`, []);
                        }}
                      />
                    )}

                    {message.emailAction && (
                      <EmailActionCard
                        action={message.emailAction}
                        onSendSuccess={(action) => onSendEmailAction(action)}
                      />
                    )}

                    {message.appointmentAction && (
                      <AppointmentActionCard
                        action={message.appointmentAction}
                        onConfirmSuccess={(action) => onScheduleAppointment(action)}
                      />
                    )}

                    {message.taskAction && (
                      <GoogleTaskActionCard
                        action={message.taskAction}
                      />
                    )}

                    {message.driveAction && (
                      <GoogleDriveActionCard
                        action={message.driveAction}
                      />
                    )}

                    {message.scheduledTaskAction && (
                      <ScheduledTaskActionCard
                        action={message.scheduledTaskAction}
                        onOpenTasksModal={onOpenTasksModal}
                      />
                    )}

                    {message.orderAction && (
                      <AutonomousOrderActionCard
                        action={message.orderAction}
                        onConfirmOrder={onConfirmOrderAction}
                        onCancelOrder={onCancelOrderAction}
                        onOpenPaymentModal={onOpenPaymentModal}
                      />
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] text-slate-400 font-medium mt-1 px-2 ${isUser ? 'mr-1' : 'ml-9'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pilote Thinking State */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 max-w-[85%]"
          >
            <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-black/[0.06] p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
              <img
                src={LOGO_URL}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="rounded-[20px] rounded-bl-[5px] bg-white border border-black/[0.06] shadow-xs px-4 py-3 min-w-[200px]">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  Pilote réfléchit...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================ */}
      {/* Apple iOS Anchored Input Bar (Petite, Arrondie & Extensible) */}
      {/* ============================================================ */}
      <div className="fixed md:relative bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 md:p-0 pb-safe bg-transparent pointer-events-none w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex justify-center">
        <div className="w-full relative flex flex-col items-center">
          {/* File limit alert */}
          {fileLimitWarning && (
            <div className="pointer-events-auto mb-2 p-2 px-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 shadow-xs max-w-md">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fileLimitWarning}</span>
            </div>
          )}

          {/* Pending Attachments Strip */}
          {attachments.length > 0 && (
            <div className="pointer-events-auto mb-2 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-md flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto w-full max-w-2xl">
              <div className="text-[11px] font-semibold text-slate-700 px-1">
                Fichiers ({attachments.length}/10) :
              </div>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Sheet Popup */}
          <AnimatePresence>
            {isActionSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="pointer-events-auto absolute bottom-14 left-4 sm:left-2 z-50 p-2 rounded-2xl bg-white/95 backdrop-blur-3xl border border-black/[0.08] shadow-2xl flex flex-col gap-1 min-w-[210px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer text-left"
                >
                  <Paperclip className="w-4 h-4 text-slate-600" />
                  <span>Joindre un fichier (max 10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    onSendMessage("Trouve les meilleurs restaurants gastronomiques et bistrots autour de moi avec carte Maps interactive.", []);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer text-left"
                >
                  <Compass className="w-4 h-4 text-slate-600" />
                  <span>Repérer restaurants (Maps)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    if (onOpenTasksModal) onOpenTasksModal();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer text-left"
                >
                  <Repeat className="w-4 h-4 text-slate-600" />
                  <span>Tâche quotidienne programmée</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    if (onOpenPaymentModal) onOpenPaymentModal();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer text-left"
                >
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span>Commander à ma place (Paiement)</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Interactive Spring Capsule (Petite & Arrondie -> S'agrandit avec une vraie animation) */}
          <motion.div
            ref={containerRef}
            layout
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.8
            }}
            onClick={() => {
              if (!isDesktop && !(isInputFocused || input.trim().length > 0 || attachments.length > 0)) {
                setIsInputFocused(true);
                setTimeout(() => textareaRef.current?.focus(), 80);
              }
            }}
            className={`pointer-events-auto relative rounded-full bg-white/90 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden transition-colors ${
              !isDesktop && !(isInputFocused || input.trim().length > 0 || attachments.length > 0)
                ? 'w-[165px] h-10 px-3 cursor-pointer shadow-[0_6px_24px_rgba(0,0,0,0.14)] active:scale-95 flex items-center justify-between'
                : 'w-full p-1.5 sm:p-2 pl-2 sm:pl-3 pr-1.5 flex items-center'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!isDesktop && !(isInputFocused || input.trim().length > 0 || attachments.length > 0) ? (
                /* Resting Petite Capsule (iPhone iOS Style) */
                <motion.div
                  key="capsule-petite"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex items-center justify-between select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5.5 h-5.5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 tracking-tight truncate">
                      Écrire...
                    </span>
                  </div>
                  <div className="w-5.5 h-5.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </motion.div>
              ) : (
                /* Expanded Full Bar Form */
                <motion.form
                  key="capsule-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleSubmit}
                  className="w-full flex items-center gap-1.5 sm:gap-2"
                >
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />

                  {/* Apple iOS `+` Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionSheetOpen(!isActionSheetOpen);
                    }}
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white/90 md:bg-slate-200/60 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
                    title="Actions rapides"
                  >
                    <Plus className={`w-4 h-4 transition-transform duration-200 ${isActionSheetOpen ? 'rotate-45' : ''}`} />
                  </button>

                  {/* Expanded Textarea (16px on mobile to avoid iOS Safari auto-zoom) */}
                  <div className="flex-1 min-w-0">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!input.trim() && attachments.length === 0 && !isActionSheetOpen) {
                            setIsInputFocused(false);
                          }
                        }, 250);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      rows={1}
                      placeholder="Message à Pilote 1..."
                      className="w-full py-1.5 px-1 text-[16px] sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none max-h-28 overflow-y-auto leading-relaxed"
                    />
                  </div>

                  {/* Mode Réflexion Toggle Button (Sleek Apple Monochrome Style) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleThinking();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      thinkingEnabled
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white/90 md:bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 shadow-2xs'
                    }`}
                    title={thinkingEnabled ? "Mode Réflexion activé" : "Activer le mode Réflexion"}
                  >
                    <Brain className={`w-3.5 h-3.5 ${thinkingEnabled ? 'text-white' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline">Réflexion</span>
                  </button>

                  {/* Mobile Reduce / Minimize Button */}
                  {!isDesktop && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!input.trim()) {
                          setIsInputFocused(false);
                          setIsActionSheetOpen(false);
                        } else {
                          textareaRef.current?.blur();
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
                      title="Réduire"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Apple Blue Circular Send Arrow Button */}
                  <button
                    type="submit"
                    disabled={(!input.trim() && attachments.length === 0) || isThinking}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      (!input.trim() && attachments.length === 0) || isThinking
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 text-white shadow-xs'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
