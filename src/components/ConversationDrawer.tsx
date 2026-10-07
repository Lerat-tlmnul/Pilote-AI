import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  X, 
  Sparkles, 
  Search, 
  Brain, 
  Clock, 
  Check, 
  Edit2
} from 'lucide-react';
import { Conversation, UserProfileData } from '../types';

interface ConversationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onSelectConversation: (convId: string) => void;
  onCreateNewChat: () => void;
  onDeleteConversation: (convId: string) => void;
  onRenameConversation: (convId: string, newTitle: string) => void;
  onOpenMemoryModal: () => void;
}

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

export const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectConversation,
  onCreateNewChat,
  onDeleteConversation,
  onRenameConversation,
  onOpenMemoryModal,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const filteredConversations = profile.conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveRename = (convId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Body - iOS Glass Panel */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-w-xs sm:max-w-sm h-full bg-white/90 backdrop-blur-3xl border-r border-white/80 shadow-2xl flex flex-col z-10"
      >
        {/* Top Header */}
        <div className="p-4 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="h-7 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold text-slate-900">
              Historique des discussions
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary CTA */}
        <div className="p-4 pb-2">
          <button
            type="button"
            onClick={() => {
              onCreateNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau chat</span>
          </button>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 no-scrollbar">
          <div className="px-2 pb-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Discussions ({filteredConversations.length})</span>
            <span className="text-[10px] text-emerald-800 font-medium">Sauvegardé</span>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucune discussion trouvée.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === profile.activeConversationId;
              const isEditing = editingId === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1]?.content || 'Nouvelle discussion';

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`group relative flex flex-col p-2.5 rounded-2xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm border-slate-900'
                      : 'bg-white/60 hover:bg-white text-slate-800 border-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      
                      {isEditing ? (
                        <form
                          onSubmit={(e) => saveRename(conv.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 flex-1"
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            autoFocus
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full px-2 py-0.5 rounded text-xs bg-white text-slate-900 border border-slate-300"
                          />
                          <button
                            type="submit"
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs font-semibold truncate leading-tight">
                          {conv.title}
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Rename & Delete) */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => startRename(conv, e)}
                          className={`p-1 rounded-md transition-colors ${
                            isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Renommer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isActive ? 'hover:bg-white/20 text-rose-300' : 'hover:bg-slate-100 text-slate-400 hover:text-rose-600'
                          }`}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Snippet & Date */}
                  <div className="mt-1 flex items-center justify-between text-[11px] gap-2">
                    <span className={`truncate flex-1 ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                      {lastMsg}
                    </span>
                    <span className={`text-[10px] shrink-0 ${isActive ? 'text-white/50' : 'text-slate-400'}`}>
                      {new Date(conv.updatedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Profile & Memory Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMemoryModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-white/90 border border-slate-200/80 shadow-2xs transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Mémoire de Pilote 1
                </div>
                <div className="text-[10px] text-slate-500">
                  {profile.memories.length} faits mémorisés sur votre profil
                </div>
              </div>
            </div>

            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
