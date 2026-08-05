export type Priority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'incomplete';
export type Category = 'Mantenimiento' | 'Seguridad' | 'Operaciones' | 'Calidad' | 'Inventario' | 'Logística' | 'Seguimiento';
export type TaskPeriodicity = 'unica' | 'diaria' | 'semanal' | 'mensual';

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
  /** Time of day (HH:MM, 24h) when the collaborator started executing the task. */
  startTime?: string;
  /** Time of day (HH:MM, 24h) when the collaborator finished executing the task. */
  endTime?: string;
  steps: TaskStep[];
  notes: string;
  proofImageUrl?: string;
  proofSignatureUrl?: string;
  locationName?: string;
  countryId?: string;
  countryName?: string;
  countryFlag?: string;
  dueDate: string;
  periodicity?: TaskPeriodicity;
  periodEndDate?: string;
  recurrenceSeriesId?: string;
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
  /** IDs of every Country (see Country.id) this collaborator is authorized to operate in. */
  countryIds: string[];
  monthlyPerformance: MonthlyPerformance[];
}

export interface CountryFlagPreset {
  code: string;
  name: string;
  flagEmoji: string;
}

export interface Country {
  id: string;
  code: string; // e.g. 'AR', 'MX', 'BR', 'CL', 'CO', 'ES', 'US'
  name: string; // e.g. 'Argentina', 'México', 'Brasil', 'Chile', 'Colombia', 'España', 'Estados Unidos'
  flagEmoji: string; // e.g. 🇦🇷, 🇲🇽, 🇧🇷, 🇨🇱, 🇨🇴, 🇪🇸, 🇺🇸
  region: string; // e.g. 'LATAM Sur', 'LATAM Norte', 'Europa', 'Norteamérica'
  currency: string; // e.g. 'ARS', 'MXN', 'BRL', 'CLP', 'COP', 'EUR', 'USD'
  active: boolean;
  notes?: string;
}

export interface RoleDefinition {
  id: string;
  code: string; // e.g. 'ADMIN', 'SUPERVISOR', 'COLAB', 'AUDITOR', 'TECNICO'
  title: string;
  description: string;
  accessLevel: 'Básico' | 'Intermedio' | 'Avanzado' | 'Administrativo Total';
  active: boolean;
}

export interface DepartmentDefinition {
  id: string;
  code: string; // e.g. 'MEC', 'CAL', 'SHI', 'LOG', 'OPS'
  name: string;
  managerName?: string;
  headcount?: number;
  active: boolean;
}

export interface StatusDefinition {
  id: string;
  key: string; // e.g. 'pending', 'in_progress', 'completed', 'blocked'
  label: string;
  color: string; // hex or tailwind badge class
  category: 'Inicial' | 'En Proceso' | 'Finalizado' | 'Excepción';
  order: number;
  active: boolean;
}

export interface LocationDefinition {
  id: string;
  code: string;
  name: string;
  countryId: string;
  countryName: string;
  countryFlag?: string;
  address: string;
  city: string;
  type: 'Planta Industrial' | 'Centro Logístico' | 'Oficina Central' | 'Almacén';
  active: boolean;
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
