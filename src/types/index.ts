export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  previewUrl?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  address: string;
  rating: number;
  priceRange: string;
  description: string;
  highlight: string;
  lat: number;
  lng: number;
  image?: string;
}

export interface EmailAction {
  id?: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'ready' | 'sent';
  autoSent?: boolean;
  sentAt?: number;
}

export interface AppointmentAction {
  id?: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  attendees: string[];
  notes?: string;
  status?: 'scheduled';
}

export interface GoogleTaskAction {
  id?: string;
  title: string;
  notes?: string;
  dueDate?: string;
  status: 'created' | 'completed';
  autoCreated?: boolean;
}

export interface GoogleDriveAction {
  id?: string;
  title: string;
  content: string;
  mimeType?: string;
  fileUrl?: string;
  autoCreated?: boolean;
}

export interface ScheduledTaskExecution {
  id: string;
  timestamp: number;
  status: 'success' | 'failed';
  resultSummary: string;
}

export interface ScheduledTask {
  id: string;
  instruction: string;
  frequency: 'daily' | 'morning' | 'evening' | 'hourly' | 'weekly' | 'custom';
  timeOfDay?: string; // e.g. "08:30" or "18:00"
  targetWorkspace: 'auto' | 'gmail' | 'calendar' | 'tasks' | 'drive';
  enabled: boolean;
  createdAt: number;
  lastRunAt?: number;
  nextRunAt?: number;
  executionHistory: ScheduledTaskExecution[];
}

export interface ScheduledTaskAction {
  id?: string;
  instruction: string;
  frequency: ScheduledTask['frequency'];
  timeOfDay?: string;
  targetWorkspace?: ScheduledTask['targetWorkspace'];
  status: 'created';
}

export type PiloteModelId = 'flash' | 'mini' | 'large';

export interface AutonomousOrderAction {
  id?: string;
  service: string;
  category: 'repas' | 'transport' | 'achat' | 'courses';
  description: string;
  items?: string[];
  amount: number;
  currency: string;
  status: 'pending_approval' | 'confirmed' | 'cancelled';
  cardLast4?: string;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  warningMessage?: string;
  autoExecuted?: boolean;
}

export interface StudentRevisionAction {
  id?: string;
  title: string;
  subject: string;
  summary: string;
  blocksCount: number;
  sheetId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  userNotes?: string; // Notes/thought added by the user to the reasoning process
  modelUsed?: string;
  attachments?: Attachment[];
  restaurants?: Restaurant[];
  emailAction?: EmailAction;
  appointmentAction?: AppointmentAction;
  taskAction?: GoogleTaskAction;
  driveAction?: GoogleDriveAction;
  scheduledTaskAction?: ScheduledTaskAction;
  orderAction?: AutonomousOrderAction;
  revisionAction?: StudentRevisionAction;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueDate: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  progress: number;
  status: 'en_cours' | 'planifie' | 'termine';
  deadline: string;
  budget?: string;
  team: string[];
  milestones: Milestone[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  accuracy?: number;
  isAllowed: boolean;
}

export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  summary?: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'contact' | 'projet' | 'fait';
  content: string;
  createdAt: number;
}

export interface ConnectedServiceAccount {
  id: string;
  name: string;
  category: 'food' | 'transport' | 'shopping' | 'groceries';
  logoColor?: string;
  connected: boolean;
  accountEmail?: string;
  lastConnectedAt?: number;
}

export interface PaymentMethodConfig {
  isLinked: boolean;
  cardBrand?: 'visa' | 'mastercard' | 'cb' | 'amex';
  cardHolder?: string;
  last4?: string;
  expiryDate?: string;
  maxAmountPerOrder: number; // e.g. 50
  dailyLimit: number; // e.g. 150
  requireExplicitConfirmation: boolean;
  allowAutonomousOrdering: boolean;
  connectedServices: ConnectedServiceAccount[];
  hasAcceptedWarning: boolean;
  updatedAt?: number;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  mastered?: boolean;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export type RevisionBlockType = 'markdown' | 'code' | 'text' | 'flashcards' | 'quiz';

export interface RevisionBlock {
  id: string;
  type: RevisionBlockType;
  title?: string;
  content: string; // for markdown, code, and text (freeform notes)
  language?: string; // for code block: 'python', 'javascript', 'typescript', 'cpp', 'sql', 'html', etc.
  flashcards?: FlashcardItem[];
  quiz?: QuizQuestionItem[];
}

export interface RevisionSheet {
  id: string;
  title: string;
  subject: string; // e.g. "Mathématiques", "Informatique", "Droit", "Médecine", "Histoire", "Langues"
  description?: string;
  sourceType: 'text' | 'image' | 'prompt' | 'manual';
  sourcePreview?: string;
  tags: string[];
  blocks: RevisionBlock[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfileData {
  userId: string;
  email?: string | null;
  displayName?: string | null;
  memories: MemoryItem[];
  conversations: Conversation[];
  activeConversationId: string;
  scheduledTasks?: ScheduledTask[];
  paymentConfig?: PaymentMethodConfig;
  revisionSheets?: RevisionSheet[];
}

