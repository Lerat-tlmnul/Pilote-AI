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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  restaurants?: Restaurant[];
  emailAction?: EmailAction;
  appointmentAction?: AppointmentAction;
  taskAction?: GoogleTaskAction;
  driveAction?: GoogleDriveAction;
  scheduledTaskAction?: ScheduledTaskAction;
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

export interface UserProfileData {
  userId: string;
  email?: string | null;
  displayName?: string | null;
  memories: MemoryItem[];
  conversations: Conversation[];
  activeConversationId: string;
  scheduledTasks?: ScheduledTask[];
}
