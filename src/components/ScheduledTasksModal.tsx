import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Repeat, 
  Clock, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Mail, 
  CheckSquare, 
  FolderSync, 
  AlertCircle,
  Sun,
  Moon,
  Zap,
  CheckCheck
} from 'lucide-react';
import { ScheduledTask, UserProfileData } from '../types';
import { 
  getScheduledTasks, 
  addScheduledTask, 
  toggleScheduledTask, 
  deleteScheduledTask, 
  recordScheduledTaskExecution 
} from '../lib/memoryStorage';

interface ScheduledTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onUpdateProfile: (updated: UserProfileData) => void;
  onExecuteTaskNow: (task: ScheduledTask) => Promise<void>;
  isExecutingTask?: boolean;
}

const TEMPLATE_TASKS = [
  {
    instruction: "Prépare le récapitulatif de ma journée, mes e-mails importants et vérifie mes priorités sur Google Tasks.",
    frequency: 'morning' as const,
    timeOfDay: '08:30',
    targetWorkspace: 'tasks' as const,
    label: "🌅 Briefing matinal & Google Tasks",
  },
  {
    instruction: "Repère les meilleures adresses de restaurants pour le déjeuner dans ma ville active avec la carte Google Maps.",
    frequency: 'daily' as const,
    timeOfDay: '11:45',
    targetWorkspace: 'auto' as const,
    label: "🍽️ Repérage restaurants pour midi",
  },
  {
    instruction: "Rédige et prépare mon e-mail de synthèse d'avancement pour l'équipe sur Gmail.",
    frequency: 'evening' as const,
    timeOfDay: '18:00',
    targetWorkspace: 'gmail' as const,
    label: "✉️ Email récapitulatif de fin de journée",
  },
  {
    instruction: "Bloque 1 heure de pause déjeuner dans mon agenda Google Calendar.",
    frequency: 'daily' as const,
    timeOfDay: '12:00',
    targetWorkspace: 'calendar' as const,
    label: "📅 Bloquer pause déjeuner dans Calendar",
  },
];

export const ScheduledTasksModal: React.FC<ScheduledTasksModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onExecuteTaskNow,
  isExecutingTask = false,
}) => {
  const [instruction, setInstruction] = useState('');
  const [frequency, setFrequency] = useState<ScheduledTask['frequency']>('daily');
  const [timeOfDay, setTimeOfDay] = useState('08:30');
  const [targetWorkspace, setTargetWorkspace] = useState<ScheduledTask['targetWorkspace']>('auto');
  const [isAdding, setIsAdding] = useState(false);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  if (!isOpen) return null;

  const tasks = getScheduledTasks(profile);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    const { profile: updated } = addScheduledTask(profile, {
      instruction: instruction.trim(),
      frequency,
      timeOfDay: frequency === 'morning' ? '08:30' : frequency === 'evening' ? '18:00' : timeOfDay,
      targetWorkspace,
      enabled: true,
    });

    onUpdateProfile(updated);
    setInstruction('');
    setIsAdding(false);
  };

  const handleApplyTemplate = (tmpl: typeof TEMPLATE_TASKS[0]) => {
    const { profile: updated } = addScheduledTask(profile, {
      instruction: tmpl.instruction,
      frequency: tmpl.frequency,
      timeOfDay: tmpl.timeOfDay,
      targetWorkspace: tmpl.targetWorkspace,
      enabled: true,
    });
    onUpdateProfile(updated);
  };

  const handleToggle = (taskId: string) => {
    const updated = toggleScheduledTask(profile, taskId);
    onUpdateProfile(updated);
  };

  const handleDelete = (taskId: string) => {
    const updated = deleteScheduledTask(profile, taskId);
    onUpdateProfile(updated);
  };

  const handleRunTask = async (task: ScheduledTask) => {
    setExecutingTaskId(task.id);
    try {
      await onExecuteTaskNow(task);
    } finally {
      setExecutingTaskId(null);
    }
  };

  const formatFrequencyLabel = (freq: ScheduledTask['frequency'], time?: string) => {
    switch (freq) {
      case 'morning':
        return `Tous les matins à ${time || '08:30'}`;
      case 'evening':
        return `Tous les soirs à ${time || '18:00'}`;
      case 'daily':
        return `Tous les jours à ${time || '12:00'}`;
      case 'hourly':
        return 'Toutes les heures';
      case 'weekly':
        return 'Chaque semaine (Lundi)';
      default:
        return `Quotidien (${time || '08:30'})`;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-3xl border border-white/80 shadow-[0_24px_70px_rgba(0,0,0,0.22)] overflow-hidden z-10 my-auto text-slate-800"
        >
          {/* Header */}
          <div className="px-5 sm:px-7 pt-6 pb-4 bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Tâches & Automatisations Quotidiennes
                </h3>
                <p className="text-xs text-purple-200">
                  Pilote 1 exécute vos instructions automatiquement à la fréquence choisie
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="p-5 sm:p-7 space-y-6 max-h-[66vh] overflow-y-auto no-scrollbar">
            {/* Create New Task Accordion / Form */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Programmer une nouvelle tâche
                  </h4>
                </div>

                <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
                  Exécution automatique
                </span>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instruction pour Pilote 1 :
                  </label>
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Ex: Vérifie mes emails reçus aujourd'hui et fais-moi une note, ou trouve 3 restaurants italiens ouverts pour ce midi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Frequency selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fréquence d'exécution :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setFrequency('morning');
                        setTimeOfDay('08:30');
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        frequency === 'morning'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Tous les matins</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFrequency('daily');
                        setTimeOfDay('12:00');
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        frequency === 'daily'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Tous les jours</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFrequency('evening');
                        setTimeOfDay('18:00');
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        frequency === 'evening'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Tous les soirs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFrequency('hourly')}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        frequency === 'hourly'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Toutes les heures</span>
                    </button>
                  </div>
                </div>

                {/* Time picker if not hourly */}
                {frequency !== 'hourly' && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                      Heure de déclenchement :
                    </label>
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                )}

                {/* Target Workspace service */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cible Google Workspace :
                  </label>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { id: 'auto' as const, label: 'Auto (Pilote 1)', icon: Sparkles },
                      { id: 'tasks' as const, label: 'Google Tasks', icon: CheckSquare },
                      { id: 'calendar' as const, label: 'Google Calendar', icon: Calendar },
                      { id: 'gmail' as const, label: 'Gmail', icon: Mail },
                      { id: 'drive' as const, label: 'Google Drive', icon: FolderSync },
                    ].map((target) => {
                      const Icon = target.icon;
                      const active = targetWorkspace === target.id;
                      return (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => setTargetWorkspace(target.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-xl border font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{target.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!instruction.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programmer cette tâche pour tous les jours</span>
                </button>
              </form>
            </div>

            {/* Quick Templates */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Modèles prêts en 1 clic :</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TEMPLATE_TASKS.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-2.5 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/80 text-left transition-all group cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-purple-950 truncate mr-2">
                      {tmpl.label}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-purple-600 group-hover:scale-125 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tasks List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vos tâches planifiées ({tasks.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  {tasks.filter((t) => t.enabled).length} active(s)
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-xs">
                  Aucune tâche programmée. Ajoutez-en une ci-dessus ou choisissez un modèle en 1 clic !
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isRunning = executingTaskId === task.id || isExecutingTask;
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          task.enabled
                            ? 'bg-white border-slate-200/90 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold text-[11px]">
                                <Clock className="w-3 h-3" />
                                {formatFrequencyLabel(task.frequency, task.timeOfDay)}
                              </span>

                              <span className="text-[10px] font-medium text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                                {task.targetWorkspace}
                              </span>

                              {task.enabled ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  En pause
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {task.instruction}
                            </p>

                            {/* Execution History Snippet */}
                            {task.executionHistory && task.executionHistory.length > 0 && (
                              <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">
                                  Dernier rapport : {task.executionHistory[0].resultSummary}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Run Now Button */}
                            <button
                              type="button"
                              disabled={isRunning}
                              onClick={() => handleRunTask(task)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                              title="Exécuter immédiatement par Pilote 1"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span className="hidden sm:inline">
                                {isRunning ? 'Exécution...' : 'Exécuter'}
                              </span>
                            </button>

                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggle(task.id)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                task.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                              title={task.enabled ? 'Mettre en pause' : 'Activer'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              title="Supprimer la tâche"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Synchronisé avec votre profil Pilote 1 & Google
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
