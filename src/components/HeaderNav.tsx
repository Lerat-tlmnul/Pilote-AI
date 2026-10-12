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
  Mail,
  Check,
  Zap,
  Flame,
  ChevronRight,
  MoreHorizontal,
  CreditCard
} from 'lucide-react';
import { UserLocation, GoogleUser, PiloteModelId } from '../types';

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
  onOpenPaymentModal?: () => void;
  isPaymentLinked?: boolean;
  scheduledTasksCount?: number;
  selectedModelId: PiloteModelId;
  onSelectModelId: (model: PiloteModelId) => void;
}

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  userLocation,
  onRequestLocation,
  googleUser,
  isConnectingGoogle,
  onSignInGoogle,
  onSignOutGoogle,
  onOpenDrawer,
  onCreateNewChat,
  onOpenMemoryModal,
  onOpenImportantModal,
  onOpenTasksModal,
  onOpenPaymentModal,
  isPaymentLinked = false,
  scheduledTasksCount = 0,
  selectedModelId = 'flash',
  onSelectModelId,
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isModelSheetOpen, setIsModelSheetOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);

  const AVAILABLE_MODELS: { id: PiloteModelId; name: string; tag: string; desc: string; icon: any }[] = [
    {
      id: 'flash',
      name: 'Pilote 1 Flash',
      tag: 'Ultra-rapide',
      desc: 'Réactivité instantanée, exécution Google Workspace & adresses',
      icon: Zap,
    },
    {
      id: 'large',
      name: 'Pilote 1 Large',
      tag: 'Puissance Max',
      desc: 'Raisonnement complexe, synthèse de dossiers et grands projets',
      icon: Flame,
    },
  ];

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

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
          className="pointer-events-auto flex items-center justify-between h-14 px-4 rounded-full bg-white/80 backdrop-blur-3xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all"
        >
          {/* Left: Brand + Model Selector */}
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
                <div className="w-8 h-8 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs shadow-2xs">
                  P
                </div>
              )}
            </motion.div>

            {/* Apple iOS Model Selector Dropdown (Desktop) */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                title="Choisir le modèle Pilote"
              >
                <currentModel.icon className="w-3.5 h-3.5 text-slate-700" />
                <span className="font-bold">{currentModel.name}</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isModelMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute left-0 mt-2 w-72 rounded-2xl bg-white/95 backdrop-blur-2xl p-2 shadow-2xl border border-white/80 z-50 text-xs"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Modèles Pilote</span>
                      <span className="text-slate-400 font-normal">NVIDIA NIM</span>
                    </div>

                    <div className="mt-1 space-y-1">
                      {AVAILABLE_MODELS.map((m) => {
                        const Icon = m.icon;
                        const isSelected = m.id === selectedModelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              onSelectModelId(m.id);
                              setIsModelMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold">{m.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {m.tag}
                                </span>
                              </div>
                              <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                                isSelected ? 'text-slate-200' : 'text-slate-500'
                              }`}>
                                {m.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Discussions History Button (Desktop) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Historique des discussions"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Historique</span>
            </motion.button>
          </div>

          {/* Center: Navigation Pill (Pilote / Projets) */}
          <nav className="flex items-center p-1 rounded-full bg-slate-100/80 border border-black/[0.04] shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="apple-desktop-nav-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-black/[0.04]"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Mémoire continue"
            >
              <Brain className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Mémoire</span>
            </motion.button>

            {/* Payment & Ordering Delegation Button */}
            {onOpenPaymentModal && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={onOpenPaymentModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold border transition-all cursor-pointer shadow-2xs ${
                  isPaymentLinked
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
                title="Paiement & Commandes autonomes (Carte bancaire)"
              >
                <CreditCard className={`w-3.5 h-3.5 ${isPaymentLinked ? 'text-amber-300' : 'text-slate-600'}`} />
                <span className="hidden lg:inline">{isPaymentLinked ? 'Paiement actif' : 'Paiement'}</span>
              </motion.button>
            )}

            {/* Geolocation Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onRequestLocation}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold border transition-all cursor-pointer shadow-2xs ${
                userLocation?.isAllowed
                  ? 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${userLocation?.isAllowed ? 'bg-emerald-500' : 'bg-slate-400'}`} />
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
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
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
                        <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl font-medium">
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
      {/* MOBILE TOP BAR (Pure Apple Cupertino iOS Navigation Bar)     */}
      {/* ============================================================ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 pt-safe px-3.5 pb-2.5 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between">
        {/* Left: Drawer / History Button & Brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-9 h-9 rounded-full bg-white/85 hover:bg-white active:bg-white active:scale-95 flex items-center justify-center text-slate-800 border border-white/80 transition-all cursor-pointer shadow-2xs"
            title="Historique des discussions"
          >
            <History className="w-4 h-4 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('chat')}
            className="flex items-center cursor-pointer active:opacity-75 transition-opacity"
          >
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt="Pilote 1"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-6 w-auto max-w-[72px] object-contain drop-shadow-2xs"
              />
            ) : (
              <span className="font-bold text-sm text-slate-900 tracking-tight">Pilote 1</span>
            )}
          </button>
        </div>

        {/* Center: Model Selector iOS Capsule Button */}
        <button
          type="button"
          onClick={() => setIsModelSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 active:bg-white border border-white/80 text-xs font-semibold text-slate-900 active:scale-95 transition-all cursor-pointer shadow-2xs max-w-[155px]"
        >
          <currentModel.icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className="truncate">{currentModel.name}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {/* Right: New Chat `+` & More Options `···` */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCreateNewChat}
            className="w-9 h-9 rounded-full bg-white/85 hover:bg-white active:bg-white active:scale-95 flex items-center justify-center text-slate-800 border border-white/80 transition-all cursor-pointer shadow-2xs"
            title="Nouvelle discussion"
          >
            <Plus className="w-4 h-4 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMoreMenuOpen(true)}
            className="relative w-9 h-9 rounded-full bg-white/85 hover:bg-white active:bg-white active:scale-95 flex items-center justify-center text-slate-800 border border-white/80 transition-all cursor-pointer shadow-2xs"
            title="Options & Outils"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-700" />
            {scheduledTasksCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#007AFF]" />
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE MODEL SELECTION iOS ACTION SHEET                      */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModelSheetOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModelSheetOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-up Cupertino Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-w-sm mx-auto p-3 pb-safe flex flex-col gap-2"
            >
              <div className="rounded-[20px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl overflow-hidden divide-y divide-black/[0.06]">
                <div className="py-2.5 px-4 text-center">
                  <div className="w-8 h-1 rounded-full bg-slate-300 mx-auto mb-2" />
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Modèle d'Intelligence
                  </p>
                </div>

                {AVAILABLE_MODELS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = m.id === selectedModelId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectModelId(m.id);
                        setIsModelSheetOpen(false);
                      }}
                      className={`w-full p-3.5 text-left flex items-center justify-between active:bg-slate-100 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{m.name}</span>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                              {m.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.desc}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#007AFF] stroke-[2.5] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsModelSheetOpen(false)}
                className="w-full py-3.5 rounded-[16px] bg-white text-sm font-semibold text-slate-900 shadow-md active:bg-slate-100 transition-colors text-center cursor-pointer"
              >
                Annuler
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MOBILE MORE MENU iOS ACTION SHEET (Options & Navigation)     */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isMobileMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMoreMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-up Cupertino Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-w-sm mx-auto p-3 pb-safe flex flex-col gap-2"
            >
              <div className="rounded-[20px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl overflow-hidden divide-y divide-black/[0.06]">
                <div className="py-2.5 px-4 text-center">
                  <div className="w-8 h-1 rounded-full bg-slate-300 mx-auto mb-2" />
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Options & Navigation
                  </p>
                </div>

                {/* iOS Segmented Navigation Switch (Pilote / Projets) */}
                <div className="p-3">
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('chat');
                        setIsMobileMoreMenuOpen(false);
                      }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Pilote (Chat)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('projects');
                        setIsMobileMoreMenuOpen(false);
                      }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentTab === 'projects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Projets</span>
                    </button>
                  </div>
                </div>

                {/* Geolocation */}
                <button
                  type="button"
                  onClick={() => {
                    onRequestLocation();
                    setIsMobileMoreMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Position actuelle</div>
                      <div className="text-[11px] text-slate-500">
                        {userLocation?.city || (userLocation?.isAllowed ? 'Position active' : 'Détecter la ville')}
                      </div>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${userLocation?.isAllowed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </button>

                {/* Google Workspace */}
                <button
                  type="button"
                  onClick={() => {
                    if (googleUser) {
                      onSignOutGoogle();
                    } else {
                      onSignInGoogle();
                    }
                    setIsMobileMoreMenuOpen(false);
                  }}
                  disabled={isConnectingGoogle}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      {googleUser ? (
                        googleUser.photoURL ? (
                          <img src={googleUser.photoURL} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {(googleUser.displayName || 'G')[0]}
                          </div>
                        )
                      ) : (
                        <Mail className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {googleUser ? (googleUser.displayName || googleUser.email) : 'Compte Google'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {googleUser ? 'Workspace synchronisé (Déconnecter)' : 'Gmail, Agenda & Drive'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Payment & Autonomous Ordering Delegation */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPaymentModal) onOpenPaymentModal();
                    setIsMobileMoreMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Paiement & Commandes</div>
                      <div className="text-[11px] text-slate-500">
                        {isPaymentLinked ? 'Carte active (Plafonds sécurisés)' : 'Déléguer carte & commander'}
                      </div>
                    </div>
                  </div>
                  {isPaymentLinked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-500/20">
                      Actif
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Scheduled Tasks */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenTasksModal();
                    setIsMobileMoreMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Routines quotidiennes</div>
                      <div className="text-[11px] text-slate-500">Tâches et rappels programmés</div>
                    </div>
                  </div>
                  {scheduledTasksCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                      {scheduledTasksCount}
                    </span>
                  )}
                </button>

                {/* Continuous Memory */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenMemoryModal();
                    setIsMobileMoreMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Mémoire continue</div>
                      <div className="text-[11px] text-slate-500">Préférences enregistrées</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Features & Guide */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenImportantModal();
                    setIsMobileMoreMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Guide & Fonctionnalités</div>
                      <div className="text-[11px] text-slate-500">Astuces et commandes</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMoreMenuOpen(false)}
                className="w-full py-3.5 rounded-[16px] bg-white text-sm font-semibold text-slate-900 shadow-md active:bg-slate-100 transition-colors text-center cursor-pointer"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
