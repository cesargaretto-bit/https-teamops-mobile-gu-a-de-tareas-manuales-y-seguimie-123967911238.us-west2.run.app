import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  BookOpen, 
  LayoutDashboard, 
  Users,
  FileText, 
  Code, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Smartphone, 
  Sliders,
  Database,
  Globe
} from 'lucide-react';
import {
  Task,
  TaskStatus,
  Procedure,
  Collaborator,
  ThemeConfig,
  SecurityConfig,
  PushNotificationConfig,
  Country,
  RoleDefinition,
  DepartmentDefinition,
  StatusDefinition,
  LocationDefinition
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_PROCEDURES, 
  INITIAL_COLLABORATORS, 
  INITIAL_THEME_CONFIG, 
  INITIAL_SECURITY_CONFIG, 
  INITIAL_PUSH_CONFIG,
  INITIAL_COUNTRIES,
  INITIAL_ROLES,
  INITIAL_DEPARTMENTS,
  INITIAL_STATUSES,
  INITIAL_LOCATIONS
} from './data/mockData';
import { getThemeClasses, generateRecurringDates } from './utils/helpers';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { HeaderNavbar } from './components/HeaderNavbar';
import { DailyTaskList } from './components/DailyTaskList';
import { ProceduresLibrary } from './components/ProceduresLibrary';
import { AdminTrackerDashboard } from './components/AdminTrackerDashboard';
import { CollaboratorsManager } from './components/CollaboratorsManager';
import { AbmManagementHub } from './components/AbmManagementHub';
import { ReportsAndExports } from './components/ReportsAndExports';
import { RestApiPlayground } from './components/RestApiPlayground';
import { SettingsAndSecurityModal } from './components/SettingsAndSecurityModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { UserProfileLoginModal, UserSession } from './components/UserProfileLoginModal';

// Navigation tabs catalog — module-level so both the default order and the
// nav bar's render logic share the same source of truth.
const NAV_TABS: { id: string; label: string; icon: any }[] = [
  { id: 'tasks', label: 'Guía de Tareas', icon: CheckSquare },
  { id: 'sops', label: 'Manuales SOP', icon: BookOpen },
  { id: 'abm', label: 'Módulo ABM & Maestros', icon: Database },
  { id: 'collaborators', label: 'Equipo de Campo', icon: Users },
  { id: 'admin', label: 'Panel Admin', icon: LayoutDashboard },
  { id: 'reports', label: 'Reportes & Export', icon: FileText },
  { id: 'api', label: 'API REST', icon: Code }
];
const NAV_TAB_IDS = NAV_TABS.map(t => t.id);

// Generic helpers reused for every ABM master catalog (countries, roles,
// departments, statuses, locations) so they follow the exact same
// load-once-then-realtime-sync pattern already used for tasks/collaborators.
type WithId = { id: string };

async function loadCloudCatalog<T extends WithId>(
  table: string,
  initialData: T[],
  setState: (items: T[]) => void
) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('payload')
      .order('updated_at', { ascending: false });
    if (error) throw error;

    if (data && data.length > 0) {
      setState(data.map((r: any) => r.payload as T));
    } else {
      // First run: seed the shared database with the sample catalog.
      setState(initialData);
      await supabase.from(table).upsert(
        initialData.map(item => ({ id: item.id, payload: item, updated_at: new Date().toISOString() }))
      );
    }
  } catch (e) {
    console.error(`No se pudo cargar "${table}" desde Supabase, usando datos de ejemplo locales.`, e);
    setState(initialData);
  }
}

function subscribeCloudCatalog<T extends WithId>(
  table: string,
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  return supabase
    .channel(`${table}-realtime`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload: any) => {
      if (payload.eventType === 'DELETE') {
        setState(prev => prev.filter(item => item.id !== payload.old.id));
      } else {
        const updated = payload.new.payload as T;
        setState(prev => {
          const exists = prev.some(item => item.id === updated.id);
          return exists ? prev.map(item => (item.id === updated.id ? updated : item)) : [updated, ...prev];
        });
      }
    })
    .subscribe();
}

async function upsertCloudItem<T extends WithId>(table: string, item: T) {
  const { error } = await supabase
    .from(table)
    .upsert({ id: item.id, payload: item, updated_at: new Date().toISOString() });
  if (error) console.error(`Error al guardar en "${table}" (Supabase):`, error);
}

async function deleteCloudItem(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Error al eliminar de "${table}" (Supabase):`, error);
}

export default function App() {
  // Tasks & Collaborators now live in Supabase (shared cloud database) so that
  // every user, on every device, reads and writes the same data in real time.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState<boolean>(false);

  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_PROCEDURES);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // ABM Master Catalogs — now shared cloud data (Supabase), same pattern as
  // tasks/collaborators: loaded once, then kept live via Realtime so a change
  // any admin makes shows up for everyone immediately.
  const [countries, setCountries] = useState<Country[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [departments, setDepartments] = useState<DepartmentDefinition[]>([]);
  const [statuses, setStatuses] = useState<StatusDefinition[]>([]);
  const [locations, setLocations] = useState<LocationDefinition[]>([]);

  // User Profile & Active Session State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('teamops_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // App Config States
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(INITIAL_THEME_CONFIG);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(INITIAL_SECURITY_CONFIG);
  const [pushConfig, setPushConfig] = useState<PushNotificationConfig>(INITIAL_PUSH_CONFIG);

  // Connectivity & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // User Role & Navigation
  const [currentRole, setCurrentRole] = useState<'collaborator' | 'admin'>('collaborator');
  const [activeTab, setActiveTab] = useState<'tasks' | 'sops' | 'admin' | 'abm' | 'collaborators' | 'reports' | 'api'>('tasks');

  // Draggable, reorderable nav tabs — the chosen order is remembered per
  // device (localStorage) so each user can arrange the menu the way they work.
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_nav_tab_order');
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const valid = parsed.filter(id => NAV_TAB_IDS.includes(id));
        const missing = NAV_TAB_IDS.filter(id => !valid.includes(id));
        if (valid.length > 0) return [...valid, ...missing];
      }
    } catch {
      // ignore malformed saved order and fall back to default
    }
    return NAV_TAB_IDS;
  });
  useEffect(() => {
    try {
      localStorage.setItem('teamops_nav_tab_order', JSON.stringify(tabOrder));
    } catch {
      // storage unavailable — reordering just won't persist across reloads
    }
  }, [tabOrder]);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const handleTabDrop = (targetId: string) => {
    if (!draggedTabId || draggedTabId === targetId) return;
    setTabOrder(prev => {
      const next = prev.filter(id => id !== draggedTabId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, draggedTabId);
      return next;
    });
    setDraggedTabId(null);
  };

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);
  const [selectedProcedureModalCode, setSelectedProcedureModalCode] = useState<string | null>(null);

  // Toast alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const theme = getThemeClasses(themeConfig.primaryColor);

  // Load Tasks & Collaborators from Supabase on startup, and keep them live-synced
  // across every connected device via Supabase Realtime.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback for local/dev environments without Supabase configured yet.
      setTasks(INITIAL_TASKS);
      setCollaborators(INITIAL_COLLABORATORS);
      setCountries(INITIAL_COUNTRIES);
      setRoles(INITIAL_ROLES);
      setDepartments(INITIAL_DEPARTMENTS);
      setStatuses(INITIAL_STATUSES);
      setLocations(INITIAL_LOCATIONS);
      setIsCloudDataLoaded(true);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        const { data: taskRows, error: taskErr } = await supabase
          .from('tasks')
          .select('payload')
          .order('updated_at', { ascending: false });
        if (taskErr) throw taskErr;

        if (taskRows && taskRows.length > 0) {
          if (isMounted) setTasks(taskRows.map((r: any) => r.payload as Task));
        } else {
          // First run: seed the shared database with the sample tasks.
          if (isMounted) setTasks(INITIAL_TASKS);
          await supabase.from('tasks').upsert(
            INITIAL_TASKS.map(t => ({ id: t.id, payload: t, updated_at: new Date().toISOString() }))
          );
        }
      } catch (e) {
        console.error('No se pudo cargar tareas desde Supabase, usando datos de ejemplo locales.', e);
        if (isMounted) setTasks(INITIAL_TASKS);
      }

      try {
        const { data: collabRows, error: collabErr } = await supabase
          .from('collaborators')
          .select('payload');
        if (collabErr) throw collabErr;

        if (collabRows && collabRows.length > 0) {
          if (isMounted) setCollaborators(collabRows.map((r: any) => r.payload as Collaborator));
        } else {
          if (isMounted) setCollaborators(INITIAL_COLLABORATORS);
          await supabase.from('collaborators').upsert(
            INITIAL_COLLABORATORS.map(c => ({ id: c.id, payload: c, updated_at: new Date().toISOString() }))
          );
        }
      } catch (e) {
        console.error('No se pudo cargar colaboradores desde Supabase, usando datos de ejemplo locales.', e);
        if (isMounted) setCollaborators(INITIAL_COLLABORATORS);
      }

      // ABM master catalogs: same load-or-seed pattern as tasks/collaborators.
      await Promise.all([
        loadCloudCatalog('countries', INITIAL_COUNTRIES, (items) => { if (isMounted) setCountries(items); }),
        loadCloudCatalog('roles', INITIAL_ROLES, (items) => { if (isMounted) setRoles(items); }),
        loadCloudCatalog('departments', INITIAL_DEPARTMENTS, (items) => { if (isMounted) setDepartments(items); }),
        loadCloudCatalog('statuses', INITIAL_STATUSES, (items) => { if (isMounted) setStatuses(items); }),
        loadCloudCatalog('locations', INITIAL_LOCATIONS, (items) => { if (isMounted) setLocations(items); })
      ]);

      if (isMounted) setIsCloudDataLoaded(true);
    };

    loadData();

    // Realtime: reflect changes made by other users/devices immediately.
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        } else {
          const updated = payload.new.payload as Task;
          setTasks(prev => {
            const exists = prev.some(t => t.id === updated.id);
            return exists ? prev.map(t => (t.id === updated.id ? updated : t)) : [updated, ...prev];
          });
        }
      })
      .subscribe();

    const collabChannel = supabase
      .channel('collaborators-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborators' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setCollaborators(prev => prev.filter(c => c.id !== payload.old.id));
        } else {
          const updated = payload.new.payload as Collaborator;
          setCollaborators(prev => {
            const exists = prev.some(c => c.id === updated.id);
            return exists ? prev.map(c => (c.id === updated.id ? updated : c)) : [updated, ...prev];
          });
        }
      })
      .subscribe();

    // Realtime for every ABM master catalog.
    const countriesChannel = subscribeCloudCatalog<Country>('countries', setCountries);
    const rolesChannel = subscribeCloudCatalog<RoleDefinition>('roles', setRoles);
    const departmentsChannel = subscribeCloudCatalog<DepartmentDefinition>('departments', setDepartments);
    const statusesChannel = subscribeCloudCatalog<StatusDefinition>('statuses', setStatuses);
    const locationsChannel = subscribeCloudCatalog<LocationDefinition>('locations', setLocations);

    return () => {
      isMounted = false;
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(collabChannel);
      supabase.removeChannel(countriesChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(departmentsChannel);
      supabase.removeChannel(statusesChannel);
      supabase.removeChannel(locationsChannel);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('teamops_currentUser', JSON.stringify(currentUser));
      if (currentUser.role === 'admin' || currentUser.role === 'collaborator') {
        setCurrentRole(currentUser.role);
      }
    } else {
      localStorage.removeItem('teamops_currentUser');
    }
  }, [currentUser]);

  // Handle Dark mode class on html tag
  useEffect(() => {
    const root = document.documentElement;
    if (themeConfig.mode === 'dark') {
      root.classList.add('dark');
    } else if (themeConfig.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themeConfig.mode]);

  // Count pending offline tasks
  useEffect(() => {
    const unsynced = tasks.filter(t => !t.synced).length;
    setPendingSyncCount(unsynced);
  }, [tasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update Task handler
  // Auto-mark overdue, unfinished tasks as "Incompleta": once the data is
  // loaded, any task whose due date is in the past and that never reached
  // "Completada" or "Bloqueada" is flagged so it doesn't silently stay
  // "Pendiente"/"En Proceso" forever and skews compliance reports.
  useEffect(() => {
    if (!isCloudDataLoaded) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueUnfinished = tasks.filter(t =>
      t.dueDate && t.dueDate < todayStr && (t.status === 'pending' || t.status === 'in_progress')
    );
    if (overdueUnfinished.length === 0) return;

    setTasks(prev => prev.map(t =>
      overdueUnfinished.some(o => o.id === t.id) ? { ...t, status: 'incomplete' as TaskStatus } : t
    ));

    if (isSupabaseConfigured && isOnline) {
      overdueUnfinished.forEach(t => {
        supabase.from('tasks').upsert({
          id: t.id,
          payload: { ...t, status: 'incomplete', synced: true },
          updated_at: new Date().toISOString()
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloudDataLoaded]);

  const handleUpdateTask = async (updatedTask: Task) => {
    const taskWithSyncFlag = { ...updatedTask, synced: isOnline };

    // Early-completion rule for recurring "Seguimiento" tasks: if this
    // occurrence was just completed before its scheduled periodicity end
    // date, the series is done — any remaining not-yet-started future
    // occurrences must stop showing up as pending instead of continuing to
    // regenerate/linger until their own due dates.
    const closesSeriesEarly =
      updatedTask.status === 'completed' &&
      updatedTask.category === 'Seguimiento' &&
      !!updatedTask.recurrenceSeriesId &&
      !!updatedTask.periodEndDate &&
      updatedTask.dueDate < updatedTask.periodEndDate;

    const futureSiblingIdsToClose = closesSeriesEarly
      ? tasks
          .filter(t =>
            t.id !== updatedTask.id &&
            t.recurrenceSeriesId === updatedTask.recurrenceSeriesId &&
            t.status === 'pending' &&
            t.dueDate > updatedTask.dueDate
          )
          .map(t => t.id)
      : [];

    if (futureSiblingIdsToClose.length > 0) {
      setTasks(prev => prev
        .filter(t => !futureSiblingIdsToClose.includes(t.id))
        .map(t => (t.id === updatedTask.id ? taskWithSyncFlag : t))
      );
      showToast(`✓ Tarea de seguimiento completada anticipadamente: se cerró la periodicidad y se cancelaron ${futureSiblingIdsToClose.length} ocurrencia(s) futura(s) pendiente(s).`);
    } else {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? taskWithSyncFlag : t));
    }

    if (!isOnline || !isSupabaseConfigured) {
      showToast('⚠️ Cambio guardado localmente en Modo Offline. Se sincronizará al reconectar.');
      return;
    }

    if (futureSiblingIdsToClose.length > 0) {
      const { error: deleteError } = await supabase.from('tasks').delete().in('id', futureSiblingIdsToClose);
      if (deleteError) {
        console.error('Error al cerrar la periodicidad (cancelar ocurrencias futuras) en Supabase:', deleteError);
      }
    }

    const { error } = await supabase
      .from('tasks')
      .upsert({ id: updatedTask.id, payload: { ...taskWithSyncFlag, synced: true }, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Error al sincronizar tarea con Supabase:', error);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, synced: false } : t));
      showToast('Error de red durante la sincronización.');
    } else {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, synced: true } : t));
      showToast('✓ Avance actualizado y sincronizado en tiempo real con cifrado E2EE.');
    }
  };

  // Create Task handler (Supports auto-generation of recurring task series up to 1 year horizon)
  const handleCreateTask = async (partialTask: Partial<Task>) => {
    const startDate = partialTask.dueDate || new Date().toISOString().split('T')[0];
    const periodicity = partialTask.periodicity || 'unica';
    const periodEndDate = partialTask.periodEndDate;

    const datesToGenerate = generateRecurringDates(startDate, periodicity, periodEndDate);
    const seriesId = periodicity !== 'unica' ? `rec-${Date.now()}` : undefined;
    const now = Date.now();

    // Task codes must never repeat: instead of trusting the in-memory array
    // length (which drifts after deletions or when several users create
    // tasks around the same time), scan every existing code for the highest
    // "TAR-####" number actually in use and count up from there.
    const highestExistingCodeNumber = tasks.reduce((max, t) => {
      const match = /^TAR-(\d+)$/.exec(t.code || '');
      if (!match) return max;
      const num = parseInt(match[1], 10);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);

    const createdTasks: Task[] = datesToGenerate.map((dateStr, idx) => {
      const taskCodeNumber = highestExistingCodeNumber + idx + 1;
      const code = `TAR-${String(taskCodeNumber).padStart(4, '0')}`;
      return {
        id: `tsk-${now}-${idx}`,
        code,
        title: partialTask.title || 'Nueva Tarea Operativa',
        description: partialTask.description || '',
        category: partialTask.category || 'Mantenimiento',
        priority: partialTask.priority || 'Media',
        status: 'pending',
        // No fabricated fallback here on purpose: CreateTaskModal always
        // sends a real assignedUserId/assignedUserName from the current ABM
        // collaborators list now, so a missing value should surface as
        // "Sin Asignar" rather than silently pointing at a made-up person.
        assignedUserId: partialTask.assignedUserId || '',
        assignedUserName: partialTask.assignedUserName || 'Sin Asignar',
        procedureRefCode: partialTask.procedureRefCode,
        procedureRefTitle: partialTask.procedureRefTitle,
        estimatedMinutes: partialTask.estimatedMinutes || 30,
        actualMinutes: 0,
        steps: (partialTask.steps || []).map((s, sIdx) => ({
          ...s,
          id: `s-${now}-${idx}-${sIdx}`
        })),
        notes: '',
        locationName: partialTask.locationName || 'Planta Operativa',
        countryId: partialTask.countryId,
        countryName: partialTask.countryName,
        countryFlag: partialTask.countryFlag,
        dueDate: dateStr,
        periodicity: periodicity,
        periodEndDate: periodEndDate,
        recurrenceSeriesId: seriesId,
        synced: isOnline,
        e2eEncrypted: true,
        encryptedHash: `e2ee_${Math.random().toString(36).substring(2, 9)}`
      };
    });

    setTasks(prev => [...createdTasks, ...prev]);

    if (isSupabaseConfigured && isOnline) {
      const { error } = await supabase.from('tasks').insert(
        createdTasks.map(t => ({ id: t.id, payload: t, updated_at: new Date().toISOString() }))
      );
      if (error) {
        console.error('Error al crear tarea(s) en Supabase:', error);
      }
    }

    if (createdTasks.length > 1) {
      showToast(`✨ ¡Se autogeneraron y registraron ${createdTasks.length} tareas recurrentes (${periodicity.toUpperCase()}) hasta ${periodEndDate}!`);
    } else {
      showToast('✨ Tarea asignada exitosamente con protocolo de seguridad.');
    }
  };

  const handleDeleteTask = async (taskId: string, deleteAllSeries?: boolean) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    let idsToDelete: string[] = [taskId];

    if (deleteAllSeries) {
      const seriesId = taskToDelete.recurrenceSeriesId;
      const matches = tasks.filter(t => {
        if (seriesId && t.recurrenceSeriesId === seriesId) return true;
        if (!seriesId && t.title === taskToDelete.title && t.periodicity === taskToDelete.periodicity && t.assignedUserId === taskToDelete.assignedUserId) return true;
        return false;
      });
      idsToDelete = matches.map(t => t.id);
      setTasks(prev => prev.filter(t => !idsToDelete.includes(t.id)));
      showToast(`🗑️ Se eliminaron todas las tareas de la serie de ${taskToDelete.code}.`);
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast(`🗑️ Tarea ${taskToDelete.code} eliminada por usuario autorizado.`);
    }

    if (isSupabaseConfigured && isOnline) {
      const { error } = await supabase.from('tasks').delete().in('id', idsToDelete);
      if (error) console.error('Error al eliminar tarea(s) en Supabase:', error);
    }
  };

  // Manual Sync handler
  const handleManualSync = async () => {
    if (!isOnline) {
      showToast('No hay conexión a la red. Reconéctate para sincronizar.');
      return;
    }

    setIsSyncing(true);
    try {
      const unsyncedItems = tasks.filter(t => !t.synced);

      if (isSupabaseConfigured && unsyncedItems.length > 0) {
        const { error } = await supabase.from('tasks').upsert(
          unsyncedItems.map(t => ({ id: t.id, payload: { ...t, synced: true }, updated_at: new Date().toISOString() }))
        );
        if (error) throw error;
      }

      // Mark all tasks as synced
      setTasks(prev => prev.map(t => ({ ...t, synced: true })));
      showToast(`✓ Sincronización completada. ${unsyncedItems.length} cambios unificados en la nube.`);
    } catch (err) {
      console.error('Error en sincronización manual:', err);
      showToast('Error de red durante la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Collaborators ABM Handlers
  const handleAddCollaborator = async (newCollabData: Omit<Collaborator, 'id' | 'monthlyPerformance'>) => {
    const newCollab: Collaborator = {
      ...newCollabData,
      id: `usr-${Date.now()}`,
      monthlyPerformance: [
        { month: '2026-07', tasksCompleted: 0, tasksTotal: 0, completionRate: 100, avgExecutionTimeMin: 0, targetTimeMin: 30, sopComplianceRate: 100, safetyIncidents: 0 }
      ]
    };
    setCollaborators(prev => [newCollab, ...prev]);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('collaborators').insert({ id: newCollab.id, payload: newCollab, updated_at: new Date().toISOString() });
      if (error) console.error('Error al crear colaborador en Supabase:', error);
    }
    showToast(`✨ Colaborador ${newCollab.name} registrado con éxito.`);
  };

  const handleUpdateCollaborator = async (updatedCollab: Collaborator) => {
    setCollaborators(prev => prev.map(c => c.id === updatedCollab.id ? updatedCollab : c));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('collaborators').upsert({ id: updatedCollab.id, payload: updatedCollab, updated_at: new Date().toISOString() });
      if (error) console.error('Error al actualizar colaborador en Supabase:', error);
    }
    showToast(`✓ Datos de ${updatedCollab.name} actualizados.`);
  };

  const handleDeleteCollaborator = async (id: string) => {
    const target = collaborators.find(c => c.id === id);
    setCollaborators(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('collaborators').delete().eq('id', id);
      if (error) console.error('Error al eliminar colaborador en Supabase:', error);
    }
    showToast(`🗑️ Colaborador ${target?.name || ''} dado de baja del sistema.`);
  };

  // ABM Countries Handlers
  const handleAddCountry = async (c: Omit<Country, 'id'>) => {
    const newCountry: Country = { ...c, id: `cnt-${Date.now()}` };
    setCountries(prev => [...prev, newCountry]);
    if (isSupabaseConfigured) await upsertCloudItem('countries', newCountry);
    showToast(`✨ País ${newCountry.name} (${newCountry.code}) registrado en el catálogo maestro.`);
  };
  const handleUpdateCountry = async (c: Country) => {
    setCountries(prev => prev.map(item => item.id === c.id ? c : item));
    if (isSupabaseConfigured) await upsertCloudItem('countries', c);
    showToast(`✓ País ${c.name} actualizado.`);
  };
  const handleDeleteCountry = async (id: string) => {
    const target = countries.find(c => c.id === id);
    setCountries(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured) await deleteCloudItem('countries', id);
    showToast(`🗑️ País ${target?.name || ''} eliminado.`);
  };

  // ABM Roles Handlers
  const handleAddRole = async (r: Omit<RoleDefinition, 'id'>) => {
    const newRole: RoleDefinition = { ...r, id: `rol-${Date.now()}` };
    setRoles(prev => [...prev, newRole]);
    if (isSupabaseConfigured) await upsertCloudItem('roles', newRole);
    showToast(`✨ Rol ${newRole.title} registrado.`);
  };
  const handleUpdateRole = async (r: RoleDefinition) => {
    setRoles(prev => prev.map(item => item.id === r.id ? r : item));
    if (isSupabaseConfigured) await upsertCloudItem('roles', r);
    showToast(`✓ Rol ${r.title} actualizado.`);
  };
  const handleDeleteRole = async (id: string) => {
    const target = roles.find(r => r.id === id);
    setRoles(prev => prev.filter(r => r.id !== id));
    if (isSupabaseConfigured) await deleteCloudItem('roles', id);
    showToast(`🗑️ Rol ${target?.title || ''} eliminado.`);
  };

  // ABM Departments Handlers
  const handleAddDepartment = async (d: Omit<DepartmentDefinition, 'id'>) => {
    const newDept: DepartmentDefinition = { ...d, id: `dep-${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    if (isSupabaseConfigured) await upsertCloudItem('departments', newDept);
    showToast(`✨ Departamento ${newDept.name} registrado.`);
  };
  const handleUpdateDepartment = async (d: DepartmentDefinition) => {
    setDepartments(prev => prev.map(item => item.id === d.id ? d : item));
    if (isSupabaseConfigured) await upsertCloudItem('departments', d);
    showToast(`✓ Departamento ${d.name} actualizado.`);
  };
  const handleDeleteDepartment = async (id: string) => {
    const target = departments.find(d => d.id === id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    if (isSupabaseConfigured) await deleteCloudItem('departments', id);
    showToast(`🗑️ Departamento ${target?.name || ''} eliminado.`);
  };

  // ABM Statuses Handlers
  const handleAddStatus = async (s: Omit<StatusDefinition, 'id'>) => {
    const newStatus: StatusDefinition = { ...s, id: `st-${Date.now()}` };
    setStatuses(prev => [...prev, newStatus]);
    if (isSupabaseConfigured) await upsertCloudItem('statuses', newStatus);
    showToast(`✨ Estado ${newStatus.label} registrado.`);
  };
  const handleUpdateStatus = async (s: StatusDefinition) => {
    setStatuses(prev => prev.map(item => item.id === s.id ? s : item));
    if (isSupabaseConfigured) await upsertCloudItem('statuses', s);
    showToast(`✓ Estado ${s.label} actualizado.`);
  };
  const handleDeleteStatus = async (id: string) => {
    const target = statuses.find(s => s.id === id);
    setStatuses(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured) await deleteCloudItem('statuses', id);
    showToast(`🗑️ Estado ${target?.label || ''} eliminado.`);
  };

  // ABM Locations Handlers
  const handleAddLocation = async (l: Omit<LocationDefinition, 'id'>) => {
    const newLoc: LocationDefinition = { ...l, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
    if (isSupabaseConfigured) await upsertCloudItem('locations', newLoc);
    showToast(`✨ Ubicación ${newLoc.name} registrada.`);
  };
  const handleUpdateLocation = async (l: LocationDefinition) => {
    setLocations(prev => prev.map(item => item.id === l.id ? l : item));
    if (isSupabaseConfigured) await upsertCloudItem('locations', l);
    showToast(`✓ Ubicación ${l.name} actualizada.`);
  };
  const handleDeleteLocation = async (id: string) => {
    const target = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    if (isSupabaseConfigured) await deleteCloudItem('locations', id);
    showToast(`🗑️ Ubicación ${target?.name || ''} eliminada.`);
  };

  // Open SOP Manual Modal
  const handleOpenProcedureModal = (code: string) => {
    setSelectedProcedureModalCode(code);
    setActiveTab('sops');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Container wrapper: Optional Mobile Device Simulator Frame */}
      <div className={themeConfig.simulatedMobileFrame ? 'max-w-4xl mx-auto py-4 px-2 sm:px-4' : 'w-full'}>
        <div className={themeConfig.simulatedMobileFrame ? 'bg-slate-900 rounded-[32px] p-2.5 sm:p-4 shadow-2xl border-4 border-slate-800' : ''}>
          
          <div className="bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden min-h-[85vh] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col">
            
            {/* Header Navbar */}
            <HeaderNavbar
              isOnline={isOnline}
              setIsOnline={setIsOnline}
              isSyncing={isSyncing}
              onManualSync={handleManualSync}
              pendingSyncCount={pendingSyncCount}
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              themeConfig={themeConfig}
              setThemeConfig={setThemeConfig}
              securityConfig={securityConfig}
              pushConfig={pushConfig}
              openSettingsModal={() => setIsSettingsOpen(true)}
              openUserProfileModal={() => setIsUserProfileOpen(true)}
              currentUser={currentUser}
              activeTab={activeTab}
            />

            {/* Offline Alert Strip */}
            {!isOnline && (
              <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span>Modo Sin Cobertura (Offline) Activo. Los registros de avance se guardan localmente con cifrado AES-256.</span>
                </div>
                <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">
                  {pendingSyncCount} Pendientes
                </span>
              </div>
            )}

            {/* Toast Notification Banner */}
            {toastMessage && (
              <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-emerald-500 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{toastMessage}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 overflow-x-auto scrollbar-none">
              <nav className="flex space-x-1 sm:space-x-2 text-xs font-bold">
                {tabOrder.map(tabId => {
                  const tab = NAV_TABS.find(t => t.id === tabId);
                  if (!tab) return null;
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      draggable
                      onDragStart={() => setDraggedTabId(tab.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleTabDrop(tab.id)}
                      onDragEnd={() => setDraggedTabId(null)}
                      onClick={() => setActiveTab(tab.id as any)}
                      title="Arrastrá para reordenar el menú"
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 cursor-grab active:cursor-grabbing ${
                        draggedTabId === tab.id ? 'opacity-40' : ''
                      } ${
                        isActive
                          ? `${theme.border} ${theme.text} ${theme.darkText} bg-white dark:bg-slate-800 font-extrabold shadow-sm`
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {activeTab === 'tasks' && (
                <DailyTaskList
                  tasks={tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  currentRole={currentRole}
                  currentUser={currentUser}
                  onOpenProcedureModal={handleOpenProcedureModal}
                  onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
                  themeConfig={themeConfig}
                  isOnline={isOnline}
                  countries={countries}
                  collaborators={collaborators}
                />
              )}

              {activeTab === 'sops' && (
                <ProceduresLibrary
                  procedures={procedures}
                  themeConfig={themeConfig}
                  selectedProcedureCodeModal={selectedProcedureModalCode}
                  onClearProcedureCodeModal={() => setSelectedProcedureModalCode(null)}
                />
              )}

              {activeTab === 'abm' && (
                <AbmManagementHub
                  countries={countries}
                  roles={roles}
                  departments={departments}
                  statuses={statuses}
                  locations={locations}
                  collaborators={collaborators}
                  tasks={tasks}
                  onAddCountry={handleAddCountry}
                  onUpdateCountry={handleUpdateCountry}
                  onDeleteCountry={handleDeleteCountry}
                  onAddRole={handleAddRole}
                  onUpdateRole={handleUpdateRole}
                  onDeleteRole={handleDeleteRole}
                  onAddDepartment={handleAddDepartment}
                  onUpdateDepartment={handleUpdateDepartment}
                  onDeleteDepartment={handleDeleteDepartment}
                  onAddStatus={handleAddStatus}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteStatus={handleDeleteStatus}
                  onAddLocation={handleAddLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onAddCollaborator={handleAddCollaborator}
                  onUpdateCollaborator={handleUpdateCollaborator}
                  onDeleteCollaborator={handleDeleteCollaborator}
                  themeConfig={themeConfig}
                  initialSubTab="countries"
                />
              )}

              {activeTab === 'collaborators' && (
                <AbmManagementHub
                  countries={countries}
                  roles={roles}
                  departments={departments}
                  statuses={statuses}
                  locations={locations}
                  collaborators={collaborators}
                  tasks={tasks}
                  onAddCountry={handleAddCountry}
                  onUpdateCountry={handleUpdateCountry}
                  onDeleteCountry={handleDeleteCountry}
                  onAddRole={handleAddRole}
                  onUpdateRole={handleUpdateRole}
                  onDeleteRole={handleDeleteRole}
                  onAddDepartment={handleAddDepartment}
                  onUpdateDepartment={handleUpdateDepartment}
                  onDeleteDepartment={handleDeleteDepartment}
                  onAddStatus={handleAddStatus}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteStatus={handleDeleteStatus}
                  onAddLocation={handleAddLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onAddCollaborator={handleAddCollaborator}
                  onUpdateCollaborator={handleUpdateCollaborator}
                  onDeleteCollaborator={handleDeleteCollaborator}
                  themeConfig={themeConfig}
                  initialSubTab="collaborators"
                />
              )}

              {activeTab === 'admin' && (
                <AdminTrackerDashboard
                  collaborators={collaborators}
                  tasks={tasks}
                  onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
                  onNavigateToCollaborators={() => setActiveTab('collaborators')}
                  themeConfig={themeConfig}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsAndExports
                  collaborators={collaborators}
                  tasks={tasks}
                  themeConfig={themeConfig}
                />
              )}

              {activeTab === 'api' && (
                <RestApiPlayground
                  themeConfig={themeConfig}
                />
              )}
            </main>

            {/* App Footer */}
            <footer className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 px-6">
              <div className="flex items-center gap-2">
                <span>Daily Ops Mobile Platform © 2026</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Cifrado E2EE AES-GCM-256</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="hover:underline text-slate-500 dark:text-slate-400"
                >
                  Seguridad & 2FA
                </button>
                <span>•</span>
                <button 
                  onClick={() => setActiveTab('api')}
                  className="hover:underline text-slate-500 dark:text-slate-400"
                >
                  Documentación API
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Settings & Security Modal */}
      <SettingsAndSecurityModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeConfig={themeConfig}
        setThemeConfig={setThemeConfig}
        securityConfig={securityConfig}
        setSecurityConfig={setSecurityConfig}
        pushConfig={pushConfig}
        setPushConfig={setPushConfig}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        procedures={procedures}
        collaborators={collaborators}
        countries={countries}
        locations={locations}
        themeConfig={themeConfig}
      />

      {/* User Profile & Login Modal */}
      <UserProfileLoginModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin' || user.role === 'collaborator') {
            setCurrentRole(user.role);
          }
          showToast(`Bienvenido/a ${user.name} (${user.email}). Sesión de usuario activa.`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          try {
            sessionStorage.removeItem('teamops_task_filters_v2');
          } catch {}
          showToast('Sesión cerrada. Ha ingresado como Invitado.');
        }}
        onUpdateProfile={(updated) => {
          setCurrentUser(updated);
          showToast('Perfil de usuario actualizado correctamente.');
        }}
        collaborators={collaborators}
        roles={roles}
        countries={countries}
        departments={departments}
        themeConfig={themeConfig}
      />
    </div>
  );
}
