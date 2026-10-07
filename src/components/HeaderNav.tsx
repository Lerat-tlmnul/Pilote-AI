import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  FolderKanban, 
  Sparkles, 
  Navigation, 
  LogOut, 
  CheckCircle2,
  ChevronDown,
  History,
  Plus,
  Brain
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
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'projects' as const, label: 'Projets', icon: FolderKanban },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar - iOS Floating Pill */}
      <header className="fixed top-4 left-0 right-0 z-30 px-3 sm:px-6 md:px-8 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="pointer-events-auto flex items-center justify-between h-14 px-3 sm:px-5 rounded-full bg-white/80 backdrop-blur-3xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300"
        >
          {/* Left: Brand Logo + Conversations Drawer Trigger */}
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center cursor-pointer"
              onClick={() => onSelectTab('chat')}
            >
              {!logoError ? (
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-8 md:h-9 w-auto max-w-[120px] object-contain drop-shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  P
                </div>
              )}
            </motion.div>

            {/* Discussions History Button with Counter */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10 border border-black/5 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
              title="Historique des discussions"
            >
              <History className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Discussions</span>
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                {conversationsCount}
              </span>
            </motion.button>

            {/* Quick New Chat Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onCreateNewChat}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              title="Nouveau chat"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>Nouveau</span>
            </motion.button>
          </div>

          {/* Center: iOS Segmented Animated Switcher */}
          <nav className="hidden md:flex items-center p-1 bg-black/[0.04] rounded-full border border-black/[0.03] shadow-inner">
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
                      layoutId="ios-nav-pill"
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

          {/* Right: Memory, Location & Google Actions */}
          <div className="flex items-center gap-2">
            {/* Memory Modal Trigger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenMemoryModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-900 border border-indigo-500/20 transition-all cursor-pointer shadow-2xs"
              title="Mémoire et préférences de votre profil"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline font-semibold">Mémoire</span>
            </motion.button>

            {/* Geolocation Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onRequestLocation}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium border transition-all cursor-pointer shadow-2xs ${
                userLocation?.isAllowed
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 hover:bg-emerald-500/15'
                  : 'bg-white/80 text-slate-700 border-white/80 hover:bg-white'
              }`}
              title="Position géographique"
            >
              <span className={`w-2 h-2 rounded-full ${userLocation?.isAllowed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline font-semibold">
                {userLocation?.city || (userLocation?.isAllowed ? 'Position active' : 'Localiser')}
              </span>
            </motion.button>

            {/* Google Authentication Control */}
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
                  <span className="hidden md:inline max-w-[100px] truncate text-slate-900">
                    {googleUser.displayName?.split(' ')[0] || 'Google'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </motion.button>

                {/* User Dropdown */}
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

                      <div className="py-2 space-y-1.5 text-slate-700">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Profil & discussions synchronisés</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOutGoogle();
                        }}
                        className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
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
                <span className="hidden sm:inline">
                  {isConnectingGoogle ? 'Connexion...' : 'Google'}
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </header>

      {/* Enhanced Mobile Top App Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 pt-safe px-3.5 py-2.5 bg-white/80 backdrop-blur-2xl border-b border-white/60 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-1 rounded-lg bg-black/5 text-slate-700"
            title="Historique"
          >
            <History className="w-4 h-4" />
          </button>

          {!logoError ? (
            <img
              src={LOGO_URL}
              alt="Logo"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-7 w-auto max-w-[100px] object-contain drop-shadow-2xs"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
              P
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick New Chat Button on Mobile */}
          <button
            type="button"
            onClick={onCreateNewChat}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>Nouveau</span>
          </button>

          {/* Google status on Mobile */}
          {googleUser ? (
            <button
              type="button"
              onClick={onSignOutGoogle}
              className="flex items-center gap-1 p-0.5 rounded-full bg-emerald-50 border border-emerald-200"
            >
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                  G
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignInGoogle}
              disabled={isConnectingGoogle}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold shadow-2xs"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Mobile iOS Floating Bottom Dock */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-xs mx-auto">
        <div className="relative flex items-center justify-around h-14 rounded-full bg-white/85 backdrop-blur-3xl border border-white/70 shadow-[0_12px_36px_rgba(0,0,0,0.14)] p-1.5">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex-1 flex flex-col items-center justify-center h-full rounded-full text-slate-500 hover:text-slate-800"
          >
            <History className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Historique</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center h-full rounded-full transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="ios-mobile-nav-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-black/[0.03]"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon className="relative z-10 w-4 h-4" />
                <span className="relative z-10 text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
