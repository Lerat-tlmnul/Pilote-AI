import React, { useState } from 'react';
import { Brain, Sparkles, X, Plus, Trash2, CheckCircle, ShieldCheck } from 'lucide-react';
import { MemoryItem, UserProfileData } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onAddMemory: (category: MemoryItem['category'], content: string) => void;
  onRemoveMemory: (id: string) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddMemory,
  onRemoveMemory,
}) => {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('preference');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddMemory(newCategory, newContent.trim());
    setNewContent('');
  };

  const getCategoryBadge = (cat: MemoryItem['category']) => {
    switch (cat) {
      case 'preference':
        return { label: 'Préférence', color: 'bg-amber-500/10 text-amber-800 border-amber-500/20' };
      case 'contact':
        return { label: 'Contact', color: 'bg-sky-500/10 text-sky-800 border-sky-500/20' };
      case 'projet':
        return { label: 'Projet', color: 'bg-indigo-500/10 text-indigo-800 border-indigo-500/20' };
      default:
        return { label: 'Fait clé', color: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-indigo-500 via-sky-400 to-amber-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 flex items-center justify-center shadow-xs">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Mémoire & Contexte du Profil
            </h3>
            <p className="text-xs text-slate-500">
              Sauvegardé sur votre compte personnel.
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
          Pilote 1 retient ces informations à travers toutes vos discussions pour adapter automatiquement ses choix de restaurants, la tonalité de vos e-mails et la gestion de vos projets.
        </p>

        {/* Add new memory input form */}
        <form onSubmit={handleAdd} className="mt-4 flex flex-col sm:flex-row gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryItem['category'])}
            className="px-2.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="preference">Préférence</option>
            <option value="projet">Projet</option>
            <option value="contact">Contact</option>
            <option value="fait">Fait clé</option>
          </select>

          <input
            type="text"
            placeholder="ex. Préfère les tables au calme, allergique aux fruits de mer..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-98 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </form>

        {/* List of remembered items */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Éléments actifs ({profile.memories.length})</span>
            <span className="text-emerald-800 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Actif dans le contexte
            </span>
          </div>

          {profile.memories.length === 0 ? (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Aucune mémoire enregistrée pour le moment.
            </div>
          ) : (
            profile.memories.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMemory(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Supprimer ce souvenir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mémoire privée liée à votre identifiant</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
