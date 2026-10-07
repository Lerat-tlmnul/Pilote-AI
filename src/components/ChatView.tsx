import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paperclip, 
  X, 
  Sparkles, 
  Compass, 
  MapPin, 
  Mail, 
  Calendar, 
  FileText, 
  AlertCircle,
  Plus,
  CheckSquare,
  Repeat,
  ArrowUp
} from 'lucide-react';
import { Message, Attachment, UserLocation, Restaurant, EmailAction, AppointmentAction } from '../types';
import { RestaurantMapCard } from './RestaurantMapCard';
import { 
  EmailActionCard, 
  AppointmentActionCard, 
  GoogleTaskActionCard, 
  GoogleDriveActionCard, 
  ScheduledTaskActionCard 
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
}

const SUGGESTED_PROMPTS = [
  {
    icon: Compass,
    title: "Trouver des restaurants",
    subtitle: "Bistrot ou gastronomique avec carte Maps",
    prompt: "Trouve-moi 3 restaurants d'exception près de ma position avec une ambiance chaleureuse.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Mail,
    title: "Rédiger et envoyer un email",
    subtitle: "Gmail en direct sur simple consigne",
    prompt: "Rédige et envoie un e-mail professionnel pour confirmer notre rendez-vous stratégique de jeudi.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Calendar,
    title: "Organiser un rendez-vous",
    subtitle: "Google Calendar synchronisé",
    prompt: "Planifie un rendez-vous déjeuner vendredi à 12h30 avec Alexandre au Bistrot Paul Bert.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: Repeat,
    title: "Programmer une routine quotidienne",
    subtitle: "Exécution automatique tous les jours",
    prompt: "Chaque matin à 08h30, prépare le récapitulatif de mes priorités et vérifie mes tâches Google Tasks.",
    color: "from-purple-500 to-indigo-600",
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
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileLimitWarning, setFileLimitWarning] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="relative flex flex-col h-full w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-16 md:pt-24 pb-20 md:pb-6 px-3 sm:px-6 md:px-8">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 sm:space-y-6 pb-28 pt-2">
        {/* Apple Empty Hero State */}
        {messages.length === 0 && (
          <div className="my-auto py-6 sm:py-12 flex flex-col items-center text-center max-w-2xl mx-auto animate-in fade-in duration-500">
            {/* Apple Squircle Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="relative mb-4 flex items-center justify-center"
            >
              <div className="relative p-3.5 rounded-[28px] bg-white/80 backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.07)] border border-white/80">
                <img
                  src={LOGO_URL}
                  alt="Pilote 1"
                  referrerPolicy="no-referrer"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-2xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pilote 1
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium">
              « Tu dis de faire, il fait ». Exécution autonome sur Google Workspace, cartes Maps, emails, agendas et tâches quotidiennes.
            </p>

            {/* Apple iOS Location Chip */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 hover:bg-white text-slate-800 border border-white/70 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {userLocation?.city
                    ? `Position active : ${userLocation.city}`
                    : 'Activer la géolocalisation pour les adresses'}
                </span>
              </button>
            </div>

            {/* Apple Control Center Quick Action Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => onSendMessage(item.prompt, [])}
                    className="p-3.5 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-2xl transition-all text-left flex items-start gap-3 group cursor-pointer border border-white/60 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-md"
                  >
                    <div className={`w-8.5 h-8.5 rounded-xl bg-linear-to-tr ${item.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </motion.button>
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
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
              >
                <div className={`flex items-start gap-2 max-w-[94%] sm:max-w-[88%] lg:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Assistant Avatar */}
                  {!isUser ? (
                    <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-white/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
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
                    className={`px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-[#007AFF] text-white rounded-[22px] rounded-br-[6px] shadow-[0_4px_16px_rgba(0,122,255,0.22)]'
                        : 'bg-white/85 backdrop-blur-2xl border border-white/80 text-slate-900 rounded-[22px] rounded-bl-[6px] shadow-xs'
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

                    {/* Markdown Content */}
                    <div className="selection:bg-slate-900 selection:text-white font-normal">
                      <MarkdownRenderer content={message.content} />
                    </div>

                    {/* Integrated Action Cards */}
                    {message.restaurants && message.restaurants.length > 0 && (
                      <RestaurantMapCard
                        restaurants={message.restaurants}
                        initialCity={userLocation?.city || 'Paris'}
                        onBookTable={(resto) => {
                          onSendMessage(`Je souhaite réserver une table chez ${resto.name} pour 2 personnes ce soir vers 20h.`, []);
                        }}
                        onSendEmail={(resto) => {
                          onSendMessage(`Rédige un e-mail pour inviter un collègue chez ${resto.name} (${resto.address}).`, []);
                        }}
                        onSchedule={(resto) => {
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
                  </div>
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] text-slate-500 font-medium mt-1 px-2 ${isUser ? 'mr-1' : 'ml-9'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pilote Thinking State with Apple Dynamic Shimmer */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 max-w-[85%]"
          >
            <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-white/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
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

            <div className="relative overflow-hidden rounded-[22px] rounded-bl-[6px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-md px-4 py-3 min-w-[220px]">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  Pilote réfléchit...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Apple Floating Input Bar */}
      <div className="fixed md:relative bottom-18 md:bottom-0 left-0 right-0 p-3 sm:p-4 md:p-0 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto z-20 pointer-events-none">
        <div className="pointer-events-auto relative">
          {/* File limit alert */}
          {fileLimitWarning && (
            <div className="mb-2 p-2 px-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fileLimitWarning}</span>
            </div>
          )}

          {/* Pending Attachments Strip */}
          {attachments.length > 0 && (
            <div className="mb-2 p-2 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-sm flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-700 px-1">
                Fichiers ({attachments.length}/10) :
              </div>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-2xs border border-slate-200 text-xs text-slate-800"
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

          {/* Apple iOS Quick Action Sheet Popup */}
          <AnimatePresence>
            {isActionSheetOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-14 left-2 z-50 p-2 rounded-2xl bg-white/95 backdrop-blur-3xl border border-white/80 shadow-2xl flex flex-col gap-1 min-w-[200px]"
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-semibold text-emerald-900 transition-colors cursor-pointer text-left"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Repérer restaurants (Maps)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    if (onOpenTasksModal) onOpenTasksModal();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50 text-xs font-semibold text-purple-900 transition-colors cursor-pointer text-left"
                >
                  <Repeat className="w-4 h-4 text-purple-600" />
                  <span>Tâche quotidienne programmée</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Input Capsule with Apple Messages iOS Styling */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 sm:p-2 pl-2 sm:pl-3 pr-1.5 sm:pr-2 rounded-full bg-white/85 backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/70 transition-all focus-within:ring-2 focus-within:ring-white/90"
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
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setIsActionSheetOpen(!isActionSheetOpen)}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Actions rapides"
            >
              <Plus className={`w-4 h-4 transition-transform duration-200 ${isActionSheetOpen ? 'rotate-45' : ''}`} />
            </motion.button>

            {/* Expanded Textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={1}
                placeholder="Message à Pilote 1..."
                className="w-full py-2 px-1 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none max-h-28 overflow-y-auto"
              />
            </div>

            {/* Apple Blue Circular Send Arrow Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isThinking}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                (!input.trim() && attachments.length === 0) || isThinking
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#007AFF] hover:bg-blue-600 text-white shadow-xs'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};
