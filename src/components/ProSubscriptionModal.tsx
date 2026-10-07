import React from 'react';
import { Sparkles, Check, X, ShieldCheck, Zap, MapPin, Mail, Calendar, FolderKanban } from 'lucide-react';

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-white/80 overflow-hidden">
        {/* Shimmer effect at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-amber-400 via-orange-400 to-sky-500" />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900">
                Abonnement PRO
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Actif · Offert à vie
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-700">Votre tarif actuel</span>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">0,00 €</span>
              <span className="text-xs text-slate-500"> / mois</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Félicitations ! Vous bénéficiez de l'accès PRO intégralement débloqué.
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-900">Vitesse maximale Pilote 1</strong> : Temps de réponse instantané sans temps d'attente.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-900">Localisation & Cartes avec surbrillance</strong> : Détection de position et carte des restaurants en temps réel.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-900">Envoi d'e-mails & Gestion de rendez-vous</strong> : Synchronisation directe de vos actions d'agenda.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-900">Jusqu'à 10 fichiers joints</strong> : Partage de documents et médias avec Pilote 1.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-900">Espace Projets illimité</strong> : Planifiez vos gros chantiers étape par étape.
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer"
          >
            Continuer avec Pilote 1 PRO
          </button>
        </div>
      </div>
    </div>
  );
};
