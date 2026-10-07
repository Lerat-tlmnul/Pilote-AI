import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  CheckSquare, 
  FolderSync, 
  Repeat, 
  MapPin, 
  Brain, 
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ImportantWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTasksModal: () => void;
  isGoogleConnected: boolean;
  onSignInGoogle: () => void;
}

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

export const ImportantWelcomeModal: React.FC<ImportantWelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenTasksModal,
  isGoogleConnected,
  onSignInGoogle,
}) => {
  if (!isOpen) return null;

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
          {/* Header Banner */}
          <div className="relative px-5 sm:px-7 pt-6 pb-4 bg-linear-to-br from-indigo-900 via-slate-900 to-sky-950 text-white overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <img
                    src={LOGO_URL}
                    alt="Pilote 1"
                    className="h-9 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Message Important</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Bienvenue sur Pilote 1
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Pilote 1 est votre copilote d'action complet. Vous pouvez simplement <strong>lui dire de faire et il fait</strong>, sans jamais devoir remplir de formulaires fastidieux.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="p-5 sm:p-7 space-y-4 max-h-[62vh] overflow-y-auto no-scrollbar text-xs sm:text-sm">
            {/* Feature 1: Tu dis de faire et il fait */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  « Tu dis de faire et il fait » — Autonomie totale
                </h4>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  Pilote 1 ne se contente pas de conseiller : il rédige les messages, complète les adresses e-mails lui-même, synchronise votre agenda et génère vos documents immédiatement.
                </p>
              </div>
            </div>

            {/* Feature 2: Workspace Complet */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Google Workspace entièrement connecté & modifiable
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-sky-100">
                  <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Gmail</strong> : Rédige et expédie de vrais e-mails pour vous sans quitter l'interface.
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-sky-100">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Google Calendar</strong> : Inscrit directement vos rendez-vous et créneaux.
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-sky-100">
                  <CheckSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Google Tasks</strong> : Crée et met à jour vos listes de tâches officielles.
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-sky-100">
                  <FolderSync className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Google Drive</strong> : Rédige et enregistre vos notes et comptes-rendus.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Système de Tâches Programmées Quotidiennes */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Repeat className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Tâches programmées TOUS LES JOURS
                </h4>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  En un clic, donnez une instruction à Pilote 1 et choisissez la fréquence (tous les matins à 08:30, tous les soirs, ou heure personnalisée). Il les exécute automatiquement avec rapport de succès !
                </p>
              </div>
            </div>

            {/* Feature 4: Google Maps officiel & Mémoire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Vraie carte Google Maps</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">
                    Recherche directe des restaurants de votre ville avec la vraie API Google Maps Platform.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200 flex items-start gap-2.5">
                <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Mémoire & Profil synchronisé</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">
                    Toutes vos discussions et préférences sont mémorisées sur votre profil Firebase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-5 sm:px-7 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!isGoogleConnected ? (
              <button
                type="button"
                onClick={onSignInGoogle}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Connecter Google Workspace</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Google Workspace Connecté</span>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTasksModal();
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Voir les tâches quotidiennes</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                C'est compris
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
