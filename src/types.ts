export type Priority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type Category = 'Mantenimiento' | 'Seguridad' | 'Operaciones' | 'Calidad' | 'Inventario' | 'Logística';

export interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  assignedUserId: string;
  assignedUserName: string;
  procedureRefCode?: string;
  procedureRefTitle?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  steps: TaskStep[];
  notes: string;
  proofImageUrl?: string;
  proofSignatureUrl?: string;
  locationName?: string;
  dueDate: string;
  completedAt?: string;
  synced: boolean;
  e2eEncrypted: boolean;
  encryptedHash?: string;
}

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  instruction: string;
  safetyWarning?: string;
  requiredTool?: string;
  imageUrl?: string;
}

export interface Procedure {
  id: string;
  code: string;
  title: string;
  category: Category;
  version: string;
  estimatedMinutes: number;
  summary: string;
  steps: ProcedureStep[];
  requiredSafetyEquipment: string[];
  lastUpdated: string;
  isBookmarked?: boolean;
}

export interface MonthlyPerformance {
  month: string; // e.g., '2026-07'
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number; // percentage 0-100
  avgExecutionTimeMin: number;
  targetTimeMin: number;
  sopComplianceRate: number; // percentage 0-100
  safetyIncidents: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'collaborator' | 'admin' | 'supervisor';
  avatar: string;
  department: string;
  activeStatus: 'En Campo' | 'En Pausa' | 'Desconectado';
  currentTaskTitle?: string;
  locationName?: string;
  monthlyPerformance: MonthlyPerformance[];
}

export interface SyncLogItem {
  id: string;
  action: 'UPDATE_TASK' | 'COMPLETE_TASK' | 'ADD_NOTE' | 'PROOF_UPLOAD';
  entityId: string;
  payloadSummary: string;
  timestamp: string;
  status: 'PENDING_OFFLINE' | 'SYNCED' | 'FAILED';
  encryptedPayload: string;
}

export interface PushNotificationConfig {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // e.g. '08:00'
  highPriorityAlerts: boolean;
  procedureUpdatesAlert: boolean;
  soundEnabled: boolean;
  browserPermission: 'default' | 'granted' | 'denied';
}

export interface SecurityConfig {
  e2eEncryptionEnabled: boolean;
  encryptionAlgorithm: string; // e.g. 'AES-GCM-256'
  secretKeyFingerprint: string;
  twoFactorAuthEnabled: boolean;
  twoFactorVerified: boolean;
  twoFactorSecret: string;
  lastSecurityAudit: string;
}

export type PrimaryColorTheme = 'emerald' | 'indigo' | 'amber' | 'rose' | 'cobalt';
export type DisplayMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  primaryColor: PrimaryColorTheme;
  mode: DisplayMode;
  compactView: boolean;
  simulatedMobileFrame: boolean;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  sampleRequest?: string;
  sampleResponse: string;
}
