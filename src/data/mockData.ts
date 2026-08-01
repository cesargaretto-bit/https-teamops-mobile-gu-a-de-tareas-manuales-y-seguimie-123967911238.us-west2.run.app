import { Task, Procedure, Collaborator, PushNotificationConfig, SecurityConfig, ThemeConfig, ApiEndpoint, Country, RoleDefinition, DepartmentDefinition, StatusDefinition, LocationDefinition, CountryFlagPreset } from '../types';

// Preset catalog used by the visual flag selector in the ABM "Países" form:
// picking a country here auto-fills code, name and flag emoji.
export const COUNTRY_FLAG_PRESETS: CountryFlagPreset[] = [
  { code: 'AR', name: 'Argentina', flagEmoji: '🇦🇷' },
  { code: 'MX', name: 'México', flagEmoji: '🇲🇽' },
  { code: 'BR', name: 'Brasil', flagEmoji: '🇧🇷' },
  { code: 'CL', name: 'Chile', flagEmoji: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flagEmoji: '🇨🇴' },
  { code: 'PE', name: 'Perú', flagEmoji: '🇵🇪' },
  { code: 'UY', name: 'Uruguay', flagEmoji: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', flagEmoji: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', flagEmoji: '🇧🇴' },
  { code: 'EC', name: 'Ecuador', flagEmoji: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', flagEmoji: '🇻🇪' },
  { code: 'PA', name: 'Panamá', flagEmoji: '🇵🇦' },
  { code: 'CR', name: 'Costa Rica', flagEmoji: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', flagEmoji: '🇬🇹' },
  { code: 'DO', name: 'República Dominicana', flagEmoji: '🇩🇴' },
  { code: 'ES', name: 'España', flagEmoji: '🇪🇸' },
  { code: 'US', name: 'Estados Unidos', flagEmoji: '🇺🇸' },
  { code: 'CA', name: 'Canadá', flagEmoji: '🇨🇦' },
  { code: 'PT', name: 'Portugal', flagEmoji: '🇵🇹' },
  { code: 'FR', name: 'Francia', flagEmoji: '🇫🇷' },
  { code: 'DE', name: 'Alemania', flagEmoji: '🇩🇪' },
  { code: 'IT', name: 'Italia', flagEmoji: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', flagEmoji: '🇬🇧' }
];

export const INITIAL_COUNTRIES: Country[] = [
  { id: 'cnt-ar', code: 'AR', name: 'Argentina', flagEmoji: '🇦🇷', region: 'LATAM Sur', currency: 'ARS', active: true, notes: 'Planta Principal y Centro Logístico América del Sur' },
  { id: 'cnt-mx', code: 'MX', name: 'México', flagEmoji: '🇲🇽', region: 'LATAM Norte', currency: 'MXN', active: true, notes: 'Complejo Industrial Monterrey & Ciudad de México' },
  { id: 'cnt-br', code: 'BR', name: 'Brasil', flagEmoji: '🇧🇷', region: 'LATAM Sur', currency: 'BRL', active: true, notes: 'Hub Operativo São Paulo' },
  { id: 'cnt-cl', code: 'CL', name: 'Chile', flagEmoji: '🇨🇱', region: 'LATAM Sur', currency: 'CLP', active: true, notes: 'Oficina Regional Santiago' },
  { id: 'cnt-co', code: 'CO', name: 'Colombia', flagEmoji: '🇨🇴', region: 'LATAM Norte', currency: 'COP', active: true, notes: 'Sede Bogotá & Zona Franca' },
  { id: 'cnt-es', code: 'ES', name: 'España', flagEmoji: '🇪🇸', region: 'Europa', currency: 'EUR', active: true, notes: 'Operaciones UE & Almacén Madrid' },
  { id: 'cnt-us', code: 'US', name: 'Estados Unidos', flagEmoji: '🇺🇸', region: 'Norteamérica', currency: 'USD', active: true, notes: 'Houston Operations & Tech Support' }
];

export const INITIAL_ROLES: RoleDefinition[] = [
  { id: 'rol-1', code: 'COLAB', title: 'Técnico Colaborador de Campo', description: 'Ejecutor directo de tareas operativas y mantenimiento.', accessLevel: 'Básico', active: true },
  { id: 'rol-2', code: 'SUPERVISOR', title: 'Supervisor Operativo de Planta', description: 'Coordinador de turnos, asignación de tareas y revisión de SOPs.', accessLevel: 'Intermedio', active: true },
  { id: 'rol-3', code: 'ADMIN', title: 'Administrador General de Sistema', description: 'Acceso total a parametrización, reportes y gestión ABM.', accessLevel: 'Administrativo Total', active: true },
  { id: 'rol-4', code: 'AUDITOR', title: 'Auditor de Calidad y EHS', description: 'Verificador de normas de seguridad industrial e insumos.', accessLevel: 'Avanzado', active: true }
];

export const INITIAL_DEPARTMENTS: DepartmentDefinition[] = [
  { id: 'dep-1', code: 'MEC', name: 'Mantenimiento Mecánico', managerName: 'Eng. Roberto Gómez', headcount: 14, active: true },
  { id: 'dep-2', code: 'CAL', name: 'Aseguramiento de Calidad', managerName: 'Lic. Ana Sofía Torres', headcount: 8, active: true },
  { id: 'dep-3', code: 'SHI', name: 'Seguridad e Higiene Industrial', managerName: 'Lic. Carlos Mendoza', headcount: 6, active: true },
  { id: 'dep-4', code: 'OPS', name: 'Gestión Operativa de Planta', managerName: 'Ing. Mateo Silva', headcount: 22, active: true },
  { id: 'dep-5', code: 'LOG', name: 'Logística y Almacén', managerName: 'Dra. Elena Rostova', headcount: 10, active: true }
];

export const INITIAL_STATUSES: StatusDefinition[] = [
  { id: 'st-1', key: 'pending', label: 'Pendiente', color: '#f59e0b', category: 'Inicial', order: 1, active: true },
  { id: 'st-2', key: 'in_progress', label: 'En Progreso', color: '#3b82f6', category: 'En Proceso', order: 2, active: true },
  { id: 'st-3', key: 'completed', label: 'Completado', color: '#10b981', category: 'Finalizado', order: 3, active: true },
  { id: 'st-4', key: 'blocked', label: 'Bloqueado', color: '#ef4444', category: 'Excepción', order: 4, active: true }
];

export const INITIAL_LOCATIONS: LocationDefinition[] = [
  { id: 'loc-1', code: 'NAV-NORT', name: 'Nave Industrial Norte B3', countryId: 'cnt-ar', countryName: 'Argentina', countryFlag: '🇦🇷', address: 'Av. Industrial 4500, Sector A', city: 'Buenos Aires', type: 'Planta Industrial', active: true },
  { id: 'loc-2', code: 'CBA-BOMB', name: 'Cuarto de Bombas Principal', countryId: 'cnt-mx', countryName: 'México', countryFlag: '🇲🇽', address: 'Parque Industrial APODACA', city: 'Monterrey', type: 'Planta Industrial', active: true },
  { id: 'loc-3', code: 'CAM-FRIA', name: 'Cámara Fría #4 - Almacén', countryId: 'cnt-br', countryName: 'Brasil', countryFlag: '🇧🇷', address: 'Distrito Industrial 12', city: 'São Paulo', type: 'Almacén', active: true },
  { id: 'loc-4', code: 'ZON-EC01', name: 'Zona de Carga Ecológica', countryId: 'cnt-cl', countryName: 'Chile', countryFlag: '🇨🇱', address: 'Camino a Melipilla 8900', city: 'Santiago', type: 'Centro Logístico', active: true }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-101',
    code: 'TAR-001',
    title: 'Inspección de Seguridad & EPP Pre-Turno',
    description: 'Verificar estado del casco, arnés de seguridad, guantes dieléctricos y calzado industrial antes de iniciar jornada.',
    category: 'Seguridad',
    priority: 'Alta',
    status: 'in_progress',
    assignedUserId: 'usr-1',
    assignedUserName: 'Carlos Mendoza',
    procedureRefCode: 'SOP-01',
    procedureRefTitle: 'Protocolo de Seguridad y EPP',
    estimatedMinutes: 20,
    actualMinutes: 12,
    steps: [
      { id: 'stp-1', title: 'Revisión visual de costuras y arnés de caída', completed: true },
      { id: 'stp-2', title: 'Verificación de fecha de vencimiento de casco', completed: true },
      { id: 'stp-3', title: 'Comprobación de aislamiento en guantes dieléctricos', completed: false, notes: 'Falta prueba de aire' },
      { id: 'stp-4', title: 'Registro fotográfico de conformidad', completed: false }
    ],
    notes: 'Iniciando inspección en Área B3 - Línea de Ensamble 2.',
    locationName: 'Nave Industrial Norte B3',
    countryId: 'cnt-ar',
    countryName: 'Argentina',
    countryFlag: '🇦🇷',
    dueDate: new Date().toISOString().split('T')[0],
    periodicity: 'diaria',
    synced: true,
    e2eEncrypted: true,
    encryptedHash: 'e2ee_8a91f3b20c918a'
  },
  {
    id: 'tsk-102',
    code: 'TAR-002',
    title: 'Mantenimiento Preventivo de Bomba Hidráulica H-4',
    description: 'Revisión de nivel de aceite, cambio de filtro primario y medición de presión de operación en caliente.',
    category: 'Mantenimiento',
    priority: 'Alta',
    status: 'pending',
    assignedUserId: 'usr-1',
    assignedUserName: 'Carlos Mendoza',
    procedureRefCode: 'SOP-02',
    procedureRefTitle: 'Mantenimiento de Sistemas Hidráulicos',
    estimatedMinutes: 45,
    actualMinutes: 0,
    steps: [
      { id: 'stp-10', title: 'Aplicar bloqueo de energía LOTO en panel principal', completed: false },
      { id: 'stp-11', title: 'Drenado parcial de fluido y muestra para laboratorio', completed: false },
      { id: 'stp-12', title: 'Sustitución de cartucho filtrante de 10 micras', completed: false },
      { id: 'stp-13', title: 'Prueba de estanqueidad a 150 PSI', completed: false }
    ],
    notes: 'Herramientas requeridas: Llave dinamométrica y kit LOTO.',
    locationName: 'Cuarto de Bombas Principal - Nivel -1',
    countryId: 'cnt-mx',
    countryName: 'México',
    countryFlag: '🇲🇽',
    dueDate: new Date().toISOString().split('T')[0],
    periodicity: 'semanal',
    synced: true,
    e2eEncrypted: true,
    encryptedHash: 'e2ee_3c71a9e80f'
  },
  {
    id: 'tsk-103',
    code: 'TAR-003',
    title: 'Calibración de Sensores de Temperatura & Humedad',
    description: 'Verificación del rango de tolerancia (+/- 0.5°C) en cámaras de almacenamiento térmico de producto terminado.',
    category: 'Calidad',
    priority: 'Media',
    status: 'completed',
    assignedUserId: 'usr-2',
    assignedUserName: 'Ana Sofía Torres',
    procedureRefCode: 'SOP-03',
    procedureRefTitle: 'Calibración de Instrumentos Clave',
    estimatedMinutes: 30,
    actualMinutes: 28,
    steps: [
      { id: 'stp-20', title: 'Cotejo contra termómetro patrón certificado', completed: true },
      { id: 'stp-21', title: 'Ajuste de offset en transmisor 4-20mA', completed: true },
      { id: 'stp-22', title: 'Firma electrónica de etiqueta de calibración', completed: true }
    ],
    notes: 'Sensor ST-08 ajustado con éxito. Próxima calibración programada en 90 días.',
    locationName: 'Cámara Fría #4 - Almacén Central',
    dueDate: new Date().toISOString().split('T')[0],
    periodicity: 'mensual',
    completedAt: '2026-07-31 09:15',
    synced: true,
    e2eEncrypted: true,
    encryptedHash: 'e2ee_0f92a11b7'
  },
  {
    id: 'tsk-104',
    code: 'TAR-004',
    title: 'Auditoría de Limpieza y Control de Residuos Peligrosos',
    description: 'Verificar etiquetado de contenedores de aceite usado y solvencia de bandejas antiderrame.',
    category: 'Operaciones',
    priority: 'Baja',
    status: 'blocked',
    assignedUserId: 'usr-3',
    assignedUserName: 'Mateo Silva',
    procedureRefCode: 'SOP-04',
    procedureRefTitle: 'Gestión de Residuos e Impacto Ambiental',
    estimatedMinutes: 30,
    actualMinutes: 15,
    steps: [
      { id: 'stp-30', title: 'Revisión de bitácora de pesaje de tambores', completed: true },
      { id: 'stp-31', title: 'Verificación de precintos de seguridad', completed: false }
    ],
    notes: 'Bloqueado por falta de acceso al almacén temporal de residuos. Llaves en custodia de supervisión.',
    locationName: 'Zona de Acopio de Residuos P1',
    dueDate: new Date().toISOString().split('T')[0],
    periodicity: 'unica',
    synced: false,
    e2eEncrypted: true,
    encryptedHash: 'e2ee_Blocked_551a'
  },
  {
    id: 'tsk-105',
    code: 'TAR-005',
    title: 'Conteo Físico Cíclico de Repuestos de Alta Rotación',
    description: 'Inventario físico de rodamientos SKF, sellos mecánicos y bandas de transmisión en estantería A-2.',
    category: 'Inventario',
    priority: 'Media',
    status: 'pending',
    assignedUserId: 'usr-4',
    assignedUserName: 'Lucía Fernández',
    estimatedMinutes: 60,
    actualMinutes: 0,
    steps: [
      { id: 'stp-40', title: 'Escaneo de códigos QR de gavetas A-201 a A-215', completed: false },
      { id: 'stp-41', title: 'Conteo físico manual de discrepancias', completed: false },
      { id: 'stp-42', title: 'Cierre de lote en sistema ERP', completed: false }
    ],
    notes: 'Priorizar cotejo de código SKF 6204-2RSH.',
    locationName: 'Almacén de Repuestos - Pasillo A2',
    dueDate: new Date().toISOString().split('T')[0],
    synced: true,
    e2eEncrypted: true,
    encryptedHash: 'e2ee_9982ac104'
  }
];

export const INITIAL_PROCEDURES: Procedure[] = [
  {
    id: 'proc-1',
    code: 'SOP-01',
    title: 'Protocolo de Seguridad y Uso de EPP Industrial',
    category: 'Seguridad',
    version: 'v3.2',
    estimatedMinutes: 15,
    summary: 'Procedimiento obligatorio para la verificación, colocación y desinfección de Equipo de Protección Personal antes y después de cada turno operacional.',
    requiredSafetyEquipment: ['Casco dieléctrico ANSI Z89.1', 'Gafas de impacto', 'Guantes de nitrilo / cuero', 'Botas de casquillo dieléctrico', 'Arnés anti-caídas'],
    lastUpdated: '2026-06-15',
    isBookmarked: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Inspección Táctil y Visual del Arnés',
        instruction: 'Revise las costuras, hebillas de cierre de aluminio y el indicador de impacto. Si el indicador rojo está visible, saque el arnés de servicio de inmediato.',
        safetyWarning: 'Peligro de caída. No use equipo con quemaduras de soldadura o cortes superiores a 2mm.',
        requiredTool: 'Lupa de inspección / Bitácora'
      },
      {
        stepNumber: 2,
        title: 'Verificación de Calzado e Impacto',
        instruction: 'Asegure que las suelas estén libres de grasas o químicos corrosivos. Verifique la integridad del casquillo protector.',
        requiredTool: 'Cepillo de limpieza industrial'
      },
      {
        stepNumber: 3,
        title: 'Ajuste de Barboquejo e Impacto de Casco',
        instruction: 'Ajuste la suspensión tipo rache del casco hasta que quede firme sin causar presión excesiva en las sienes.',
        safetyWarning: 'Asegúrese de usar barboquejo si trabaja a más de 1.8 metros de altura.'
      }
    ]
  },
  {
    id: 'proc-2',
    code: 'SOP-02',
    title: 'Mantenimiento de Sistemas Hidráulicos y LOTO',
    category: 'Mantenimiento',
    version: 'v2.8',
    estimatedMinutes: 45,
    summary: 'Manual paso a paso para la despresurización segura, aislamiento LOTO de fuentes de energía y reemplazo de filtros en bombas hidráulicas de alta presión.',
    requiredSafetyEquipment: ['Careta de protección facial', 'Guantes resistentes a hidrocarburos', 'Delantal de PVC', 'Tapones auditivos 29dB'],
    lastUpdated: '2026-07-01',
    isBookmarked: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Aplicación del Bloqueo y Etiquetado LOTO',
        instruction: 'Desconecte el interruptor principal en el tablero eléctrico de control. Coloque su candado de seguridad con llave única y la tarjeta de peligro con su nombre.',
        safetyWarning: '¡ATENCIÓN! Verifique la ausencia de voltaje con un multímetro calibrado antes de retirar guardas.',
        requiredTool: 'Kit de Bloqueo LOTO / Pinza de seguridad / Candado'
      },
      {
        stepNumber: 2,
        title: 'Liberación de Presión Residual',
        instruction: 'Abra lentamente la válvula de purga manual hacia el recipiente de retorno hasta que el manómetro marque cero PSI.',
        safetyWarning: 'El aceite hidráulico caliente puede causar quemaduras graves o inyección subcutánea.',
        requiredTool: 'Llave ajustable de 12" / Recipiente estanco'
      },
      {
        stepNumber: 3,
        title: 'Sustitución de Filtros e Inspección',
        instruction: 'Desenrosque la carcasa del filtro. Limpie los sedimentos magnéticos del fondo del vaso y coloque el nuevo cartucho con junta torica de vitón lubricada.',
        requiredTool: 'Llave para filtros de cadena / Filtro sustituto OEM'
      }
    ]
  },
  {
    id: 'proc-3',
    code: 'SOP-03',
    title: 'Calibración de Instrumentación de Proceso y Temperatura',
    category: 'Calidad',
    version: 'v4.0',
    estimatedMinutes: 30,
    summary: 'Norma de calibración metrológica para transmisores de temperatura PT100 y termopares en áreas críticas de almacenamiento y producción.',
    requiredSafetyEquipment: ['Gafas de seguridad', 'Guantes térmicos'],
    lastUpdated: '2026-05-20',
    isBookmarked: false,
    steps: [
      {
        stepNumber: 1,
        title: 'Conexión del Calibrador Patrón',
        instruction: 'Desconecte los cables de señal de la bornera del sensor e instale los bordes de prueba del calibrador de procesos HART.',
        requiredTool: 'Calibrador de bucle Fluke 789 / Destornillador de precisión'
      },
      {
        stepNumber: 2,
        title: 'Inyección de Señales y Ajuste de Cero/Span',
        instruction: 'Inyecte valores equivalentes al 0%, 50% y 100% del rango del instrumento. Registre la desviación y aplique el trimer de cero en caso de error mayor a 0.2%.',
        requiredTool: 'Software de metrología móvil / Plantilla de registro'
      }
    ]
  },
  {
    id: 'proc-4',
    code: 'SOP-04',
    title: 'Gestión de Residuos e Impacto Ambiental',
    category: 'Operaciones',
    version: 'v1.5',
    estimatedMinutes: 25,
    summary: 'Guía operativa para la clasificación en origen, contención antiderrame y etiquetado normativo de residuos sólidos y líquidos peligrosos.',
    requiredSafetyEquipment: ['Guantes de nitrilo heavy duty', 'Botas de hule', 'Lentes de protección química'],
    lastUpdated: '2026-04-10',
    isBookmarked: false,
    steps: [
      {
        stepNumber: 1,
        title: 'Segregación por Código de Color',
        instruction: 'Separe trapos impregnados de solventes en tambores de color amarillo. Los aceites usados deben drenarse exclusivamente en tanques de doble pared.',
        safetyWarning: 'No mezcle solventes clorados con hidrocarburos ligeros.'
      },
      {
        stepNumber: 2,
        title: 'Etiquetado Nom-052 / CRETIB',
        instruction: 'Diligencie la etiqueta identificadora indicando fecha de generación, código de peligrosidad y nombre del responsable de turno.',
        requiredTool: 'Marcador permanente de grado industrial / Marcador térmico'
      }
    ]
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'usr-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    role: 'collaborator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: 'Mantenimiento Mecánico',
    activeStatus: 'En Campo',
    currentTaskTitle: 'Mantenimiento Preventivo de Bomba H-4',
    locationName: 'Cuarto de Bombas Nivel -1',
    countryIds: ['cnt-ar'],
    monthlyPerformance: [
      { month: '2026-05', tasksCompleted: 42, tasksTotal: 45, completionRate: 93.3, avgExecutionTimeMin: 32, targetTimeMin: 35, sopComplianceRate: 98, safetyIncidents: 0 },
      { month: '2026-06', tasksCompleted: 48, tasksTotal: 50, completionRate: 96.0, avgExecutionTimeMin: 30, targetTimeMin: 35, sopComplianceRate: 99, safetyIncidents: 0 },
      { month: '2026-07', tasksCompleted: 38, tasksTotal: 40, completionRate: 95.0, avgExecutionTimeMin: 29, targetTimeMin: 35, sopComplianceRate: 100, safetyIncidents: 0 }
    ]
  },
  {
    id: 'usr-2',
    name: 'Ana Sofía Torres',
    email: 'ana.torres@empresa.com',
    role: 'collaborator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    department: 'Aseguramiento de Calidad',
    activeStatus: 'En Campo',
    currentTaskTitle: 'Calibración de Sensores de Temperatura',
    locationName: 'Cámara Fría #4',
    countryIds: ['cnt-mx', 'cnt-br'],
    monthlyPerformance: [
      { month: '2026-05', tasksCompleted: 50, tasksTotal: 50, completionRate: 100.0, avgExecutionTimeMin: 24, targetTimeMin: 30, sopComplianceRate: 100, safetyIncidents: 0 },
      { month: '2026-06', tasksCompleted: 52, tasksTotal: 53, completionRate: 98.1, avgExecutionTimeMin: 23, targetTimeMin: 30, sopComplianceRate: 100, safetyIncidents: 0 },
      { month: '2026-07', tasksCompleted: 44, tasksTotal: 45, completionRate: 97.7, avgExecutionTimeMin: 22, targetTimeMin: 30, sopComplianceRate: 99, safetyIncidents: 0 }
    ]
  },
  {
    id: 'usr-3',
    name: 'Mateo Silva',
    email: 'mateo.silva@empresa.com',
    role: 'collaborator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    department: 'Seguridad e Higiene Industrial',
    activeStatus: 'En Pausa',
    currentTaskTitle: 'Auditoría de Limpieza y Residuos',
    locationName: 'Zona Acopio Residuos P1',
    countryIds: ['cnt-cl'],
    monthlyPerformance: [
      { month: '2026-05', tasksCompleted: 35, tasksTotal: 40, completionRate: 87.5, avgExecutionTimeMin: 38, targetTimeMin: 35, sopComplianceRate: 91, safetyIncidents: 1 },
      { month: '2026-06', tasksCompleted: 39, tasksTotal: 42, completionRate: 92.8, avgExecutionTimeMin: 34, targetTimeMin: 35, sopComplianceRate: 95, safetyIncidents: 0 },
      { month: '2026-07', tasksCompleted: 31, tasksTotal: 36, completionRate: 86.1, avgExecutionTimeMin: 36, targetTimeMin: 35, sopComplianceRate: 93, safetyIncidents: 0 }
    ]
  },
  {
    id: 'usr-4',
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@empresa.com',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    department: 'Gestión Operativa de Planta',
    activeStatus: 'En Campo',
    currentTaskTitle: 'Supervisión de Turno Matutino',
    locationName: 'Planta Principal - Nivel 1',
    countryIds: ['cnt-ar', 'cnt-co', 'cnt-es'],
    monthlyPerformance: [
      { month: '2026-05', tasksCompleted: 60, tasksTotal: 60, completionRate: 100.0, avgExecutionTimeMin: 20, targetTimeMin: 25, sopComplianceRate: 100, safetyIncidents: 0 },
      { month: '2026-06', tasksCompleted: 64, tasksTotal: 65, completionRate: 98.4, avgExecutionTimeMin: 19, targetTimeMin: 25, sopComplianceRate: 100, safetyIncidents: 0 },
      { month: '2026-07', tasksCompleted: 55, tasksTotal: 56, completionRate: 98.2, avgExecutionTimeMin: 18, targetTimeMin: 25, sopComplianceRate: 100, safetyIncidents: 0 }
    ]
  }
];

export const INITIAL_PUSH_CONFIG: PushNotificationConfig = {
  dailyReminderEnabled: true,
  dailyReminderTime: '07:30',
  highPriorityAlerts: true,
  procedureUpdatesAlert: true,
  soundEnabled: true,
  browserPermission: 'granted'
};

export const INITIAL_SECURITY_CONFIG: SecurityConfig = {
  e2eEncryptionEnabled: true,
  encryptionAlgorithm: 'AES-GCM-256 (Client-Side E2EE)',
  secretKeyFingerprint: 'SHA256: 9f8a:331b:77c4:ae90:128e:4d0f',
  twoFactorAuthEnabled: true,
  twoFactorVerified: true,
  twoFactorSecret: 'JBSWY3DPEHPK3PXP',
  lastSecurityAudit: '2026-07-30 18:22 UTC'
};

export const INITIAL_THEME_CONFIG: ThemeConfig = {
  primaryColor: 'emerald',
  mode: 'dark',
  compactView: false,
  simulatedMobileFrame: true
};

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/tasks',
    summary: 'Obtener lista de tareas diarias',
    description: 'Retorna las tareas asignadas filtradas por usuario, estado o fecha con metadatos cifrados E2EE.',
    sampleResponse: JSON.stringify({
      status: 'success',
      encrypted: true,
      data: [
        { id: 'tsk-101', code: 'TAR-001', title: 'Inspección de Seguridad & EPP Pre-Turno', priority: 'Alta', status: 'in_progress', assignedUserName: 'Carlos Mendoza' }
      ]
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/tasks',
    summary: 'Registrar o crear una nueva tarea operativa',
    description: 'Crea una tarea asignada a un colaborador con sus pasos requeridos y manual SOP vinculado.',
    sampleRequest: JSON.stringify({
      title: 'Verificación de Manómetros de Entrada',
      category: 'Mantenimiento',
      priority: 'Alta',
      assignedUserId: 'usr-1',
      estimatedMinutes: 25,
      procedureRefCode: 'SOP-02'
    }, null, 2),
    sampleResponse: JSON.stringify({
      status: 'created',
      taskId: 'tsk-106',
      code: 'TAR-006',
      createdAt: new Date().toISOString()
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/sync',
    summary: 'Sincronizar lote de cambios offline en tiempo real',
    description: 'Recibe cola de acciones registradas sin conexión (IndexedDB/Offline Queue) para unificar avances.',
    sampleRequest: JSON.stringify({
      queueItems: [
        { action: 'COMPLETE_TASK', entityId: 'tsk-102', timestamp: '2026-07-31T08:30:00Z', notes: 'Completado en modo offline' }
      ]
    }, null, 2),
    sampleResponse: JSON.stringify({
      status: 'synced',
      itemsProcessed: 1,
      serverTime: new Date().toISOString(),
      e2eVerificationHash: 'e2ee_valid_9918a'
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/procedures',
    summary: 'Consultar catálogo de Manuales y SOPs',
    description: 'Retorna la lista de procedimientos vigentes con alertas de seguridad y equipos de protección necesarios.',
    sampleResponse: JSON.stringify({
      status: 'success',
      totalProcedures: 4,
      procedures: [
        { code: 'SOP-01', title: 'Protocolo de Seguridad y Uso de EPP Industrial', version: 'v3.2' }
      ]
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/reports/monthly',
    summary: 'Generar reporte consolidado de rendimiento mensual',
    description: 'Obtiene tasa de cumplimiento, tiempos promedios de ejecución e incidentes por colaborador.',
    sampleResponse: JSON.stringify({
      status: 'success',
      month: '2026-07',
      totalTasksExecuted: 168,
      globalCompletionRate: 94.2,
      collaboratorsCount: 4
    }, null, 2)
  }
];
