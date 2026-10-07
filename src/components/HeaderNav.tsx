import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  FolderKanban, 
  Sparkles, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  ChevronDown, 
  History, 
  Plus, 
  Brain,
  Repeat,
  Compass,
  Mail,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { UserLocation, GoogleUser } from '../types';

interface HeaderNavProps {
  currentTab: 'chat' | 'projects';
  onSelectTab: (tab: 'chat' | 'projects') => void;
  userLocation: UserLocation | null;
  onRequestLocation: () => void;
  onOpenProModal: () => void;
  googleUser: GoogleUser | null;
  isConnectingGoogle: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onOpenDrawer: () => void;
  onCreateNewChat: () => void;
  conversationsCount: number;
  onOpenMemoryModal: () => void;
  onOpenImportantModal: () => void;
  onOpenTasksModal: () => void;
  scheduledTasksCount?: number;
}

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  userLocation,
  onRequestLocation,
  onOpenProModal,
  googleUser,
  isConnectingGoogle,
  onSignInGoogle,
  onSignOutGoogle,
  onOpenDrawer,
  onCreateNewChat,
  conversationsCount,
  onOpenMemoryModal,
  onOpenImportantModal,
  onOpenTasksModal,
  scheduledTasksCount = 0,
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat' as const, label: 'Pilote', icon: MessageSquare },
    { id: 'projects' as const, label: 'Projets', icon: FolderKanban },
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP TOP BAR (Apple macOS / iPadOS Glass Floating Capsule) */}
      {/* ============================================================ */}
      <header className="hidden md:block fixed top-4 left-0 right-0 z-30 px-4 md:px-8 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pointer-events-none">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="pointer-events-auto flex items-center justify-between h-14 px-4 rounded-full bg-white/75 backdrop-blur-3xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all"
        >
          {/* Left: Brand + Discussions History */}
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center cursor-pointer"
              onClick={() => onSelectTab('chat')}
            >
              {!logoError ? (
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-8 md:h-9 w-auto max-w-[120px] object-contain drop-shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-2xs">
                  P
                </div>
              )}
            </motion.div>

            {/* iOS History Pill */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 border border-black/5 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
              title="Historique des discussions"
            >
              <History className="w-3.5 h-3.5 text-slate-700" />
              <span>Discussions</span>
              <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                {conversationsCount}
              </span>
            </motion.button>

            {/* Quick New Chat */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onCreateNewChat}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              title="Nouveau fil"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>Nouveau</span>
            </motion.button>

            {/* Guide & Important Features */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenImportantModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/25 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Guide & Pouvoirs</span>
            </motion.button>

            {/* Scheduled Tasks */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenTasksModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-900 border border-purple-500/25 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Repeat className="w-3.5 h-3.5 text-purple-600" />
              <span>Tâches</span>
              {scheduledTasksCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {scheduledTasksCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Center: Apple Segmented Nav Pill */}
          <nav className="flex items-center p-1 bg-black/[0.04] rounded-full border border-black/[0.03] shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="apple-desktop-nav-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-black/[0.04]"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <Icon className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Location + Memory + Google Profile */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenMemoryModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-900 border border-indigo-500/20 transition-all cursor-pointer shadow-2xs"
              title="Mémoire continue"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Mémoire</span>
            </motion.button>

            {/* Geolocation Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onRequestLocation}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold border transition-all cursor-pointer shadow-2xs ${
                userLocation?.isAllowed
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 hover:bg-emerald-500/15'
                  : 'bg-white/80 text-slate-700 border-white/80 hover:bg-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${userLocation?.isAllowed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="font-semibold">
                {userLocation?.city || (userLocation?.isAllowed ? 'Position active' : 'Localiser')}
              </span>
            </motion.button>

            {/* Google Account */}
            {googleUser ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-800 hover:bg-white transition-all cursor-pointer"
                >
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {(googleUser.displayName || googleUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline max-w-[90px] truncate text-slate-900">
                    {googleUser.displayName?.split(' ')[0] || 'Google'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl p-3 shadow-xl border border-white/80 z-50 text-xs"
                    >
                      <div className="pb-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-900 truncate">
                          {googleUser.displayName || 'Compte Google'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {googleUser.email}
                        </div>
                      </div>

                      <div className="py-2 space-y-1 text-slate-700">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Google Workspace Actif</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOutGoogle();
                        }}
                        className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                disabled={isConnectingGoogle}
                onClick={onSignInGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isConnectingGoogle ? 'Connexion...' : 'Google'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE TOP BAR (Apple iOS Dynamic Island Glass Capsule)      */}
      {/* ============================================================ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 pt-safe px-3 py-2 bg-white/75 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
        {/* Left: History Drawer & Logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-full bg-black/5 active:bg-black/10 flex items-center justify-center text-slate-800 transition-colors"
            title="Historique"
          >
            <History className="w-4 h-4 text-slate-700" />
          </button>

          <div onClick={() => onSelectTab('chat')} className="flex items-center">
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt="Logo"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-7 w-auto max-w-[90px] object-contain drop-shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                P
              </div>
            )}
          </div>
        </div>

        {/* Center: Dynamic Location / Active Status Capsule */}
        <button
          type="button"
          onClick={onRequestLocation}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/70 text-[11px] font-semibold text-slate-800 shadow-2xs active:scale-95 transition-transform max-w-[130px]"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${userLocation?.isAllowed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="truncate">{userLocation?.city || 'Localiser'}</span>
        </button>

        {/* Right: Quick Actions (Guide, Tâches, Nouveau Chat) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenImportantModal}
            className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-900 active:scale-95 transition-transform"
            title="Guide & Pouvoirs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          </button>

          <button
            type="button"
            onClick={onOpenTasksModal}
            className="relative w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-900 active:scale-95 transition-transform"
            title="Tâches quotidiennes"
          >
            <Repeat className="w-3.5 h-3.5 text-purple-700" />
            {scheduledTasksCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[8px] flex items-center justify-center font-bold">
                {scheduledTasksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onCreateNewChat}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center active:scale-95 transition-transform shadow-xs"
            title="Nouveau"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM DOCK (Apple Cupertino Floating Bar)           */}
      {/* ============================================================ */}
      <div className="md:hidden fixed bottom-3 left-4 right-4 z-40 max-w-sm mx-auto pointer-events-none">
        <div className="pointer-events-auto relative flex items-center justify-around h-14 rounded-[26px] bg-white/80 backdrop-blur-3xl border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-1.5">
          {/* Discussions button */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex-1 flex flex-col items-center justify-center h-full rounded-2xl text-slate-500 active:scale-95 transition-all"
          >
            <History className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Historique</span>
          </button>

          {/* Main Tabs (Pilote / Projets) */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center h-full rounded-2xl transition-all cursor-pointer ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="apple-mobile-dock-pill"
                    className="absolute inset-0 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-black/[0.03]"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon className="relative z-10 w-4 h-4" />
                <span className="relative z-10 text-[9px] font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Memory Modal trigger */}
          <button
            type="button"
            onClick={onOpenMemoryModal}
            className="flex-1 flex flex-col items-center justify-center h-full rounded-2xl text-slate-500 active:scale-95 transition-all"
          >
            <Brain className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Mémoire</span>
          </button>

          {/* Google Workspace status */}
          <button
            type="button"
            onClick={googleUser ? onSignOutGoogle : onSignInGoogle}
            disabled={isConnectingGoogle}
            className="flex-1 flex flex-col items-center justify-center h-full rounded-2xl text-slate-600 active:scale-95 transition-all"
          >
            {googleUser ? (
              <>
                <div className="relative">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] flex items-center justify-center font-bold">
                      G
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                </div>
                <span className="text-[9px] font-semibold mt-0.5 text-emerald-700">Compte</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-[9px] font-semibold mt-0.5">Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
