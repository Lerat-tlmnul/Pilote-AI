import { PaymentMethodConfig, ConnectedServiceAccount } from '../types';

const PAYMENT_STORAGE_KEY = 'pilote_payment_delegation_v1';

export const DEFAULT_CONNECTED_SERVICES: ConnectedServiceAccount[] = [
  {
    id: 'ubereats',
    name: 'Uber Eats',
    category: 'food',
    logoColor: 'bg-emerald-600',
    connected: false,
    accountEmail: '',
  },
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    category: 'food',
    logoColor: 'bg-teal-500',
    connected: false,
    accountEmail: '',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'shopping',
    logoColor: 'bg-amber-600',
    connected: false,
    accountEmail: '',
  },
  {
    id: 'sncf',
    name: 'SNCF Connect',
    category: 'transport',
    logoColor: 'bg-blue-600',
    connected: false,
    accountEmail: '',
  },
  {
    id: 'carrefour',
    name: 'Carrefour Courses',
    category: 'groceries',
    logoColor: 'bg-sky-600',
    connected: false,
    accountEmail: '',
  },
  {
    id: 'fnac',
    name: 'Fnac / Darty',
    category: 'shopping',
    logoColor: 'bg-amber-500',
    connected: false,
    accountEmail: '',
  },
];

export const DEFAULT_PAYMENT_CONFIG: PaymentMethodConfig = {
  isLinked: false,
  cardBrand: 'visa',
  cardHolder: '',
  last4: '',
  expiryDate: '',
  maxAmountPerOrder: 45, // 45€ par commande par défaut
  dailyLimit: 120, // 120€ par jour par défaut
  requireExplicitConfirmation: true, // Protection stricte : validation requise
  allowAutonomousOrdering: false, // Inactif par défaut pour la sécurité
  connectedServices: DEFAULT_CONNECTED_SERVICES,
  hasAcceptedWarning: false,
};

export function loadPaymentConfig(): PaymentMethodConfig {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PAYMENT_CONFIG,
        ...parsed,
        connectedServices: Array.isArray(parsed.connectedServices)
          ? parsed.connectedServices
          : DEFAULT_CONNECTED_SERVICES,
      };
    }
  } catch (e) {
    console.warn('Failed to load payment config', e);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export function savePaymentConfig(config: PaymentMethodConfig): void {
  try {
    localStorage.setItem(
      PAYMENT_STORAGE_KEY,
      JSON.stringify({
        ...config,
        updatedAt: Date.now(),
      })
    );
  } catch (e) {
    console.error('Failed to save payment config', e);
  }
}
