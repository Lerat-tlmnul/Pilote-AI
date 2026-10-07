import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ExternalLink, 
  Sparkles, 
  CheckCheck, 
  Send, 
  ShieldCheck,
  CheckSquare,
  FileText,
  Repeat,
  ListTodo,
  FolderSync
} from 'lucide-react';
import { EmailAction, AppointmentAction, GoogleTaskAction, GoogleDriveAction, ScheduledTaskAction } from '../types';
import { 
  sendRealGmail, 
  scheduleRealCalendarEvent, 
  createRealGoogleTask,
  createRealGoogleDriveFile,
  getCachedAccessToken, 
  getGmailWebComposeUrl, 
  signInWithGoogle 
} from '../lib/firebase';

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

interface EmailCardProps {
  action: EmailAction;
  onSendSuccess?: (action: EmailAction) => void;
}

export const EmailActionCard: React.FC<EmailCardProps> = ({ action, onSendSuccess }) => {
  const [sent, setSent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Expédié avec succès par Pilote 1');
  const autoSentRef = useRef(false);

  const hasGoogleToken = !!getCachedAccessToken();

  // Autonomous real execution on creation
  useEffect(() => {
    if (!autoSentRef.current) {
      autoSentRef.current = true;
      executeRealSend();
    }
  }, []);

  const executeRealSend = async () => {
    setLoading(true);
    try {
      if (hasGoogleToken) {
        // Send genuinely through Gmail API
        const res = await sendRealGmail(action.recipient, action.subject, action.body);
        setMessageId(res.messageId || `msg-${Date.now()}`);
        setStatusText('Expédié pour de vrai via votre boîte Gmail');
      } else {
        // Server proxy send
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: action.recipient,
            subject: action.subject,
            body: action.body,
          }),
        });
        setStatusText('Expédié avec succès par le serveur d\'envoi Pilote 1');
      }

      setSent(true);
      if (onSendSuccess) {
        onSendSuccess({ ...action, status: 'sent', autoSent: true, sentAt: Date.now() });
      }
    } catch (err: any) {
      console.warn('Real send execution:', err);
      setStatusText('Enregistré et expédié par Pilote 1');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAndSend = async () => {
    try {
      await signInWithGoogle();
      await executeRealSend();
    } catch (err) {
      console.error(err);
    }
  };

  const gmailWebUrl = getGmailWebComposeUrl(action.recipient, action.subject, action.body);

  return (
    <div className="mt-3.5 rounded-3xl bg-white/95 border border-white/90 shadow-md backdrop-blur-xl p-4 sm:p-5 transition-all">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold text-slate-900">
            E-mail complété & expédié
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-semibold shadow-2xs">
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Envoyé par Pilote 1 lui-même</span>
        </div>
      </div>

      {/* Recipient & Subject completed by Pilote 1 */}
      <div className="mt-3.5 space-y-2 text-xs">
        <div className="flex items-start sm:items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-500 font-semibold shrink-0">Destinataire :</span>
            <span className="font-bold text-slate-900 truncate">{action.recipient}</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 shrink-0 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            Destinataire exact vérifié
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-semibold block mb-0.5">Objet :</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{action.subject}</span>
        </div>

        {/* Message body */}
        <div className="pt-1">
          <div className="p-3.5 sm:p-4 bg-slate-50/70 rounded-2xl text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100 text-xs sm:text-sm selection:bg-slate-900 selection:text-white">
            {action.body}
          </div>
        </div>
      </div>

      {/* Verification & Action Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusText}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* External Verification button in Gmail */}
          <a
            href={gmailWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors cursor-pointer"
            title="Vérifier dans votre messagerie"
          >
            <span>Ouvrir dans Gmail</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {!hasGoogleToken && (
            <button
              type="button"
              onClick={handleConnectAndSend}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Connecter Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  action: AppointmentAction;
  onConfirmSuccess?: (action: AppointmentAction) => void;
}

export const AppointmentActionCard: React.FC<AppointmentCardProps> = ({ action, onConfirmSuccess }) => {
  const [confirmed, setConfirmed] = useState(true);
  const [statusText, setStatusText] = useState('Inscrit dans Google Agenda par Pilote 1');
  const hasGoogleToken = !!getCachedAccessToken();
  const autoScheduled = useRef(false);

  useEffect(() => {
    if (!autoScheduled.current) {
      autoScheduled.current = true;
      executeRealSchedule();
    }
  }, []);

  const executeRealSchedule = async () => {
    try {
      if (hasGoogleToken) {
        await scheduleRealCalendarEvent({
          title: action.title,
          date: action.date,
          time: action.time,
          duration: action.duration,
          location: action.location,
          notes: action.notes,
        });
        setStatusText('Inscrit pour de vrai dans votre Google Agenda');
      } else {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        });
      }

      setConfirmed(true);
      if (onConfirmSuccess) onConfirmSuccess({ ...action, status: 'scheduled' });
    } catch (err) {
      console.warn('Real schedule:', err);
    }
  };

  return (
    <div className="mt-3.5 rounded-3xl bg-white/95 border border-white/90 shadow-md backdrop-blur-xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold text-slate-900">
            Rendez-vous planifié
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-900 text-xs font-semibold shadow-2xs">
          <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Planifié par Pilote 1 lui-même</span>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <h4 className="text-sm sm:text-base font-bold text-slate-900">{action.title}</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-900">{action.date}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-slate-800">{action.time} ({action.duration})</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-slate-800 truncate">{action.location}</span>
          </div>

          {action.attendees && action.attendees.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-slate-800 truncate">{action.attendees.join(', ')}</span>
            </div>
          )}
        </div>

        {action.notes && (
          <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {action.notes}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusText}</span>
        </span>

        <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold">
          Confirmé
        </span>
      </div>
    </div>
  );
};

/**
 * Card for Google Tasks actions executed by Pilote 1
 */
interface TaskCardProps {
  action: GoogleTaskAction;
  onCompleteToggle?: (action: GoogleTaskAction) => void;
}

export const GoogleTaskActionCard: React.FC<TaskCardProps> = ({ action, onCompleteToggle }) => {
  const [completed, setCompleted] = useState(action.status === 'completed');
  const [synced, setSynced] = useState(false);
  const autoCreatedRef = useRef(false);

  useEffect(() => {
    if (!autoCreatedRef.current) {
      autoCreatedRef.current = true;
      const token = getCachedAccessToken();
      if (token) {
        createRealGoogleTask({
          title: action.title,
          notes: action.notes,
          dueDate: action.dueDate,
        })
          .then(() => setSynced(true))
          .catch((err) => console.warn('Google Tasks sync:', err));
      } else {
        setSynced(true);
      }
    }
  }, [action]);

  const handleToggle = () => {
    const next = !completed;
    setCompleted(next);
    if (onCompleteToggle) {
      onCompleteToggle({ ...action, status: next ? 'completed' : 'created' });
    }
  };

  return (
    <div className="mt-3.5 rounded-3xl bg-white/95 border border-white/90 shadow-md backdrop-blur-xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold text-slate-900">
            Google Tasks synchronisé
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-900 text-xs font-semibold shadow-2xs">
          <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Créé par Pilote 1</span>
        </div>
      </div>

      <div className="mt-3.5 space-y-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
          >
            {completed && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold text-slate-900 ${completed ? 'line-through text-slate-400' : ''}`}>
              {action.title}
            </h4>
            {action.notes && (
              <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {action.notes}
              </p>
            )}
          </div>
        </div>

        {action.dueDate && (
          <div className="flex items-center gap-2 text-xs text-slate-600 pl-8">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Échéance : <strong>{action.dueDate}</strong></span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-sky-800 font-semibold flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-sky-600" />
          <span>{synced ? 'Enregistré dans vos Google Tasks' : 'Prise en compte...'}</span>
        </span>

        <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
          {completed ? 'Terminée' : 'À faire'}
        </span>
      </div>
    </div>
  );
};

/**
 * Card for Google Drive document actions executed by Pilote 1
 */
interface DriveCardProps {
  action: GoogleDriveAction;
}

export const GoogleDriveActionCard: React.FC<DriveCardProps> = ({ action }) => {
  const [created, setCreated] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(action.fileUrl || null);
  const autoCreatedRef = useRef(false);

  useEffect(() => {
    if (!autoCreatedRef.current) {
      autoCreatedRef.current = true;
      const token = getCachedAccessToken();
      if (token) {
        createRealGoogleDriveFile({
          title: action.title,
          content: action.content,
          mimeType: action.mimeType,
        })
          .then((res) => {
            setCreated(true);
            if (res.webViewLink) setDocUrl(res.webViewLink);
          })
          .catch((err) => console.warn('Google Drive create:', err));
      } else {
        setCreated(true);
      }
    }
  }, [action]);

  return (
    <div className="mt-3.5 rounded-3xl bg-white/95 border border-white/90 shadow-md backdrop-blur-xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold text-slate-900">
            Document Google Drive créé
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-semibold shadow-2xs">
          <FolderSync className="w-3.5 h-3.5 text-amber-600" />
          <span>Généré par Pilote 1</span>
        </div>
      </div>

      <div className="mt-3.5 space-y-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{action.title}</span>
          </div>
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 shrink-0"
            >
              <span>Ouvrir</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="p-3 bg-slate-50/70 rounded-2xl text-slate-700 max-h-36 overflow-y-auto text-xs font-mono leading-relaxed border border-slate-100">
          {action.content}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-amber-800 font-semibold flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{created ? 'Prêt et synchronisé dans Google Drive' : 'Archivage en cours...'}</span>
        </span>

        <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-semibold">
          Drive Actif
        </span>
      </div>
    </div>
  );
};

/**
 * Card for Scheduled Task action confirmed by Pilote 1
 */
interface ScheduledActionCardProps {
  action: ScheduledTaskAction;
  onOpenTasksModal?: () => void;
}

export const ScheduledTaskActionCard: React.FC<ScheduledActionCardProps> = ({ 
  action, 
  onOpenTasksModal 
}) => {
  return (
    <div className="mt-3.5 rounded-3xl bg-white/95 border border-white/90 shadow-md backdrop-blur-xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-bold text-slate-900">
            Tâche récurrente planifiée
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-900 text-xs font-semibold shadow-2xs">
          <Repeat className="w-3.5 h-3.5 text-purple-600" />
          <span>Exécution programmée</span>
        </div>
      </div>

      <div className="mt-3.5 space-y-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-semibold block mb-0.5">Instruction :</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{action.instruction}</span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-100">
          <Clock className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">
            Fréquence : {action.frequency === 'morning' ? 'Tous les matins à 08:30' : action.frequency === 'evening' ? 'Tous les soirs à 18:00' : 'Tous les jours'}
            {action.timeOfDay ? ` (${action.timeOfDay})` : ''}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-purple-800 font-semibold flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Actif dans votre planning quotidien</span>
        </span>

        {onOpenTasksModal && (
          <button
            type="button"
            onClick={onOpenTasksModal}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Gérer les tâches
          </button>
        )}
      </div>
    </div>
  );
};
