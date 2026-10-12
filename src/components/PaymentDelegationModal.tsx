import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Trash2, 
  Plus, 
  Sparkles,
  ShoppingBag,
  Utensils,
  Train,
  Check,
  Info,
  DollarSign
} from 'lucide-react';
import { PaymentMethodConfig, ConnectedServiceAccount } from '../types';

interface PaymentDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PaymentMethodConfig;
  onSaveConfig: (updated: PaymentMethodConfig) => void;
}

export const PaymentDelegationModal: React.FC<PaymentDelegationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<PaymentMethodConfig>(config);
  
  // Card input temporary form
  const [cardNumber, setCardNumber] = useState(config.last4 ? `•••• •••• •••• ${config.last4}` : '');
  const [cardHolder, setCardHolder] = useState(config.cardHolder || '');
  const [expiry, setExpiry] = useState(config.expiryDate || '');
  const [cvc, setCvc] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'cb' | 'amex'>(config.cardBrand || 'visa');
  const [isEditingCard, setIsEditingCard] = useState(!config.isLinked);

  // Connecting service modal state
  const [connectingServiceId, setConnectingServiceId] = useState<string | null>(null);
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');

  // Warning acknowledgment
  const [hasAcknowledged, setHasAcknowledged] = useState(config.hasAcceptedWarning);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    let formatted = '';
    for (let i = 0; i < cleaned.length; i += 4) {
      formatted += cleaned.substring(i, i + 4) + ' ';
    }
    setCardNumber(formatted.trim());

    if (cleaned.startsWith('4')) setCardBrand('visa');
    else if (cleaned.startsWith('5')) setCardBrand('mastercard');
    else if (cleaned.startsWith('3')) setCardBrand('amex');
    else setCardBrand('cb');
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = cardNumber.replace(/\D/g, '');
    if (rawNumber.length < 12 && !formData.last4) {
      setErrorMessage("Veuillez saisir un numéro de carte valide à 16 chiffres.");
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage("Veuillez renseigner le nom du titulaire de la carte.");
      return;
    }

    const last4Digits = rawNumber.slice(-4) || formData.last4 || '4242';

    const updated: PaymentMethodConfig = {
      ...formData,
      isLinked: true,
      cardBrand,
      cardHolder: cardHolder.trim(),
      last4: last4Digits,
      expiryDate: expiry.trim() || '12/28',
      allowAutonomousOrdering: true,
      hasAcceptedWarning: hasAcknowledged,
    };

    setFormData(updated);
    setIsEditingCard(false);
    setErrorMessage(null);
  };

  const handleRemoveCard = () => {
    if (confirm("Voulez-vous supprimer votre carte bancaire ? Pilote 1 ne pourra plus passer de commande à votre place.")) {
      const updated: PaymentMethodConfig = {
        ...formData,
        isLinked: false,
        last4: '',
        cardHolder: '',
        expiryDate: '',
        allowAutonomousOrdering: false,
      };
      setFormData(updated);
      setCardNumber('');
      setCardHolder('');
      setExpiry('');
      setCvc('');
      setIsEditingCard(true);
    }
  };

  const handleConnectService = (serviceId: string) => {
    if (!serviceAccountEmail.trim()) {
      setErrorMessage("Veuillez renseigner l'adresse email de votre compte marchand.");
      return;
    }

    const updatedServices = formData.connectedServices.map(s => 
      s.id === serviceId 
        ? { ...s, connected: true, accountEmail: serviceAccountEmail.trim(), lastConnectedAt: Date.now() }
        : s
    );

    setFormData({ ...formData, connectedServices: updatedServices });
    setConnectingServiceId(null);
    setServiceAccountEmail('');
    setErrorMessage(null);
  };

  const handleDisconnectService = (serviceId: string) => {
    const updatedServices = formData.connectedServices.map(s => 
      s.id === serviceId 
        ? { ...s, connected: false, accountEmail: undefined }
        : s
    );
    setFormData({ ...formData, connectedServices: updatedServices });
  };

  const handleFinalSubmit = () => {
    if (formData.isLinked && !hasAcknowledged) {
      setErrorMessage("Vous devez obligatoirement cocher la prise de connaissance des avertissements financiers avant d'activer la délégation.");
      return;
    }

    const finalConfig: PaymentMethodConfig = {
      ...formData,
      hasAcceptedWarning: hasAcknowledged,
      updatedAt: Date.now(),
    };

    onSaveConfig(finalConfig);
    setShowSaveFeedback(true);
    setTimeout(() => {
      setShowSaveFeedback(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[28px] bg-white shadow-2xl border border-white/80 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Paiement & Commandes Autonomes
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  Délégation Sécurisée
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autorisez Pilote 1 à commander et régler vos prestations à votre place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          
          {/* ============================================================ */}
          {/* CRITICAL SAFETY WARNING BANNER (ATTENTION / VIGILANCE)       */}
          {/* ============================================================ */}
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wide flex items-center gap-2">
                  <span>⚠️ Avertissement de Vigilance Financière</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 uppercase">
                    Important
                  </span>
                </h3>
                <p className="text-xs leading-relaxed text-rose-900 font-medium">
                  En connectant votre carte bancaire, <strong>vous déléguez à Pilote 1 la capacité d'engager des dépenses financières réelles</strong> en passant des commandes auprès de marchands tiers (Uber Eats, Amazon, SNCF, etc.).
                </p>
                <div className="pt-2 border-t border-rose-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-rose-950 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    <span>Définissez des plafonds stricts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    <span>Confirmation préalable active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    <span>Révocable à tout moment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 1: CARTE BANCAIRE SÉCURISÉE                          */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                <span>1. Moyen de Paiement Dédié</span>
              </h4>
              {formData.isLinked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Carte enregistrée</span>
                </span>
              )}
            </div>

            {/* Virtual Card Preview when linked */}
            {formData.isLinked && !isEditingCard ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-white p-5 shadow-lg border border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded-md bg-amber-400/30 border border-amber-300/40 flex items-center justify-center">
                      <div className="w-5 h-3.5 border-t border-b border-amber-200/50 rounded-xs" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
                      Pilote Pay · Débit Autonome
                    </span>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                    {formData.cardBrand?.toUpperCase() || 'VISA'}
                  </span>
                </div>

                <div className="my-2">
                  <span className="font-mono text-base sm:text-lg tracking-[0.25em] font-medium text-slate-100">
                    •••• •••• •••• {formData.last4}
                  </span>
                </div>

                <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Titulaire</span>
                    <span className="font-semibold text-slate-200">{formData.cardHolder || 'Client Pilote'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Expire</span>
                    <span className="font-mono font-semibold text-slate-200">{formData.expiryDate || '12/28'}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditingCard(true)}
                    className="text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors cursor-pointer"
                  >
                    Modifier la carte
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCard}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Délier la carte</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Card Form */
              <form onSubmit={handleSaveCard} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Numéro de carte bancaire *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4532 •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
                      {cardBrand}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nom complet sur la carte *
                    </label>
                    <input
                      type="text"
                      placeholder="ex. Alexandre Dumas"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Expiration (MM/AA) *
                    </label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chiffrement AES-256 tokenisé</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {formData.isLinked && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCard(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Enregistrer cette carte
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: PLAFONDS & CONTRÔLE DE SÉCURITÉ                   */}
          {/* ============================================================ */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>2. Plafonds Financiers & Garde-Fous Stricts</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Max per order */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900">Plafond par commande</label>
                  <span className="font-extrabold text-sm text-slate-900 tabular-nums">
                    {formData.maxAmountPerOrder} €
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Toute commande supérieure à ce montant sera systématiquement bloquée.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[25, 45, 75, 100, 150].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, maxAmountPerOrder: amt })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.maxAmountPerOrder === amt
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {amt} €
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily limit */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900">Plafond quotidien cumulé</label>
                  <span className="font-extrabold text-sm text-slate-900 tabular-nums">
                    {formData.dailyLimit} €
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Montant total maximum d'achats autorisés sur 24 heures.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[80, 120, 200, 300, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyLimit: amt })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.dailyLimit === amt
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {amt} €
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apple Toggle: Explicit confirmation requirement */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Confirmation préalable avant chaque paiement</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                    Fortement recommandé
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Pilote vous présente un récapitulatif avec le montant précis et attend votre validation formelle avant de débiter votre carte.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  requireExplicitConfirmation: !formData.requireExplicitConfirmation,
                })}
                className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  formData.requireExplicitConfirmation ? 'bg-[#34C759]' : 'bg-slate-300'
                }`}
              >
                <motion.div
                  className="w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75"
                  animate={{ left: formData.requireExplicitConfirmation ? '24px' : '3px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: COMPTES MARCHANDS CONNECTÉS                      */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
                <span>3. Comptes Marchands Connectés pour Commander</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {formData.connectedServices.filter(s => s.connected).length} connectés
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {formData.connectedServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    service.connected 
                      ? 'bg-emerald-50/50 border-emerald-500/20' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl ${service.logoColor || 'bg-slate-800'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                      {service.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {service.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {service.connected ? (service.accountEmail || 'Compte actif') : 'Non connecté'}
                      </div>
                    </div>
                  </div>

                  {service.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectService(service.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Déconnecter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConnectingServiceId(service.id);
                        setServiceAccountEmail('');
                      }}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                    >
                      Connecter
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Modal to Connect Service */}
            <AnimatePresence>
              {connectingServiceId && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-3 p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-md flex flex-col gap-2.5"
                >
                  <div className="font-bold text-xs text-slate-900">
                    Associer votre compte {formData.connectedServices.find(s => s.id === connectingServiceId)?.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="votre-email@compte.com"
                      value={serviceAccountEmail}
                      onChange={(e) => setServiceAccountEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleConnectService(connectingServiceId)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectingServiceId(null)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: ATTESTATION ET CONSENTEMENT OBLIGATOIRE           */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-900 leading-relaxed select-none">
                J'ai lu et compris les avertissements financiers. J'autorise formellement Pilote 1 à passer des commandes en mon nom selon les plafonds configurés, et je conserve la faculté de révoquer cet accès à tout instant.
              </span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement sécurisé et contrôlé</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={showSaveFeedback}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {showSaveFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistré avec succès !</span>
                </>
              ) : (
                <span>Sauvegarder les paramètres</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
