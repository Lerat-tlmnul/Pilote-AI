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
  AlertCircle
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
    subtitle: "Bistrot ou gastronomique avec carte",
    prompt: "Trouve-moi 3 restaurants d'exception près de ma position avec une ambiance chaleureuse.",
  },
  {
    icon: Mail,
    title: "Rédiger et envoyer un mail",
    subtitle: "Confirmation d'accord ou point d'étape",
    prompt: "Rédige un e-mail professionnel pour confirmer notre rendez-vous stratégique de jeudi.",
  },
  {
    icon: Calendar,
    title: "Organiser un rendez-vous",
    subtitle: "Bloquer un créneau d'agenda",
    prompt: "Planifie un rendez-vous déjeuner vendredi à 12h30 avec Alexandre au Bistrot Paul Bert.",
  },
  {
    icon: Sparkles,
    title: "Cadrer un grand projet",
    subtitle: "Structure, jalons & rétroplanning",
    prompt: "Aide-moi à structurer les 4 jalons clés pour notre lancement européen 2026.",
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
      setFileLimitWarning("Limite atteinte : vous pouvez joindre jusqu'à 10 fichiers maximum.");
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
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
  };

  return (
    /* Expanded width for PC / Desktop: w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl */
    <div className="relative flex flex-col h-full w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-20 md:pt-24 pb-20 md:pb-6 px-3 sm:px-6 md:px-8">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 sm:space-y-6 pb-28 pt-2">
        {/* Welcome Empty State - Logo as central hero replacing text */}
        {messages.length === 0 && (
          <div className="my-auto py-8 sm:py-14 flex flex-col items-center text-center max-w-2xl mx-auto animate-in fade-in duration-500">
            {/* Prominent Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative mb-5 flex items-center justify-center"
            >
              <div className="relative p-3.5 rounded-3xl bg-white/80 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-white/80">
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </motion.div>

            <p className="text-xs sm:text-base text-slate-700 max-w-lg leading-relaxed font-medium">
              Votre assistant personnel intelligent. Gérez vos restaurants avec carte interactive, expédiez vos e-mails, organisez vos rendez-vous et pilotez vos projets.
            </p>

            {/* Location Status pill */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/75 hover:bg-white text-slate-800 border border-white/70 shadow-xs transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {userLocation?.city
                    ? `Position active : ${userLocation.city}`
                    : 'Activer la géolocalisation pour les restaurants'}
                </span>
              </button>
            </div>

            {/* Quick Prompts Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => onSendMessage(item.prompt, [])}
                    className="p-4 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-xl transition-all text-left flex items-start gap-3.5 group cursor-pointer border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-md"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900/5 group-hover:bg-slate-900 group-hover:text-white text-slate-800 flex items-center justify-center shrink-0 transition-colors">
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
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
              >
                <div className={`flex items-start gap-2.5 max-w-[94%] sm:max-w-[88%] lg:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar - Logo replacing text */}
                  {!isUser ? (
                    <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
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

                  {/* Bubble Container */}
                  <div
                    className={`px-4 sm:px-6 py-3.5 sm:py-4 transition-all text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'glass-user-bubble text-slate-900 rounded-[26px] rounded-tr-md shadow-xs'
                        : 'bubble-ai text-slate-900 rounded-[26px] rounded-tl-md shadow-sm'
                    }`}
                  >
                    {/* Attachments preview inside message bubble */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2.5 pb-2.5 border-b border-black/10 flex flex-wrap gap-2">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 border border-black/5 text-[11px] font-medium text-slate-800"
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="w-4 h-4 rounded-xs object-cover" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="truncate max-w-[130px]">{att.name}</span>
                            <span className="text-slate-400 text-[10px]">({formatFileSize(att.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formatted Content with Markdown */}
                    <div className="selection:bg-slate-900 selection:text-white font-normal">
                      <MarkdownRenderer content={message.content} />
                    </div>

                    {/* Integrated Restaurant Map Card if available */}
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

                    {/* Integrated Email Action Card */}
                    {message.emailAction && (
                      <EmailActionCard
                        action={message.emailAction}
                        onSendSuccess={(action) => onSendEmailAction(action)}
                      />
                    )}

                    {/* Integrated Appointment Action Card */}
                    {message.appointmentAction && (
                      <AppointmentActionCard
                        action={message.appointmentAction}
                        onConfirmSuccess={(action) => onScheduleAppointment(action)}
                      />
                    )}

                    {/* Integrated Google Tasks Action Card */}
                    {message.taskAction && (
                      <GoogleTaskActionCard
                        action={message.taskAction}
                      />
                    )}

                    {/* Integrated Google Drive Action Card */}
                    {message.driveAction && (
                      <GoogleDriveActionCard
                        action={message.driveAction}
                      />
                    )}

                    {/* Integrated Scheduled Task Action Card */}
                    {message.scheduledTaskAction && (
                      <ScheduledTaskActionCard
                        action={message.scheduledTaskAction}
                        onOpenTasksModal={onOpenTasksModal}
                      />
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] text-slate-600 mt-1 px-2 ${isUser ? 'mr-1' : 'ml-11'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pilote Thinking State with glowing shimmer animation */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2.5 max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
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

            {/* Glowing Shimmer Thinking Bubble ("Quand Pilote réflechis, animation de surbrillance aussi") */}
            <div className="relative overflow-hidden rounded-[26px] rounded-tl-md bg-white border border-white/90 shadow-lg px-5 py-3.5 min-w-[240px] animate-shimmer glow-shimmer">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  Analyse de votre requête...
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Recherche contextuelle & localisation</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Fixed Area - Longer on PC as requested */}
      <div className="fixed md:relative bottom-20 md:bottom-0 left-0 right-0 p-3 sm:p-4 md:p-0 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto z-20 pointer-events-none">
        <div className="pointer-events-auto">
          {/* File limit alert */}
          {fileLimitWarning && (
            <div className="mb-2 p-2.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fileLimitWarning}</span>
            </div>
          )}

          {/* Pending Attachments Strip (10 max) */}
          {attachments.length > 0 && (
            <div className="mb-2.5 p-2.5 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-sm flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-700 px-1">
                Fichiers joints ({attachments.length}/10 max) :
              </div>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs border border-slate-200/60 text-xs text-slate-800 group"
                >
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Input Capsule - Sleek iOS rounded pill, significantly longer on PC */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 p-2 sm:p-2.5 pl-3 sm:pl-4 pr-2 sm:pr-2.5 rounded-full bg-white/80 backdrop-blur-3xl shadow-[0_12px_44px_rgba(0,0,0,0.12)] border border-white/70 transition-all focus-within:ring-2 focus-within:ring-white/90 focus-within:bg-white/90"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Attach File Button (10 max) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= 10 || isThinking}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                attachments.length >= 10
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-white/80 shadow-2xs'
              }`}
              title="Ajouter des fichiers (10 max)"
            >
              <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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
                placeholder="Écrivez votre demande (restaurants, e-mails, rendez-vous, planification)..."
                className="w-full py-2 px-1 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-500 focus:outline-hidden resize-none max-h-28 overflow-y-auto"
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isThinking}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                (!input.trim() && attachments.length === 0) || isThinking
                  ? 'bg-slate-300/60 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
              }`}
            >
              <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};
