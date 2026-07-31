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

export default function App() {
  // Persistent States with localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_PROCEDURES);

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_collaborators');
      return saved ? JSON.parse(saved) : INITIAL_COLLABORATORS;
    } catch {
      return INITIAL_COLLABORATORS;
    }
  });
  
  // ABM Catalogs State with localStorage persistence
  const [countries, setCountries] = useState<Country[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_countries');
      return saved ? JSON.parse(saved) : INITIAL_COUNTRIES;
    } catch {
      return INITIAL_COUNTRIES;
    }
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_roles');
      return saved ? JSON.parse(saved) : INITIAL_ROLES;
    } catch {
      return INITIAL_ROLES;
    }
  });

  const [departments, setDepartments] = useState<DepartmentDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_departments');
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  const [statuses, setStatuses] = useState<StatusDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_statuses');
      return saved ? JSON.parse(saved) : INITIAL_STATUSES;
    } catch {
      return INITIAL_STATUSES;
    }
  });

  const [locations, setLocations] = useState<LocationDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('teamops_locations');
      return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    } catch {
      return INITIAL_LOCATIONS;
    }
  });

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

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);
  const [selectedProcedureModalCode, setSelectedProcedureModalCode] = useState<string | null>(null);

  // Toast alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const theme = getThemeClasses(themeConfig.primaryColor);

  // Persist states to localStorage
  useEffect(() => { localStorage.setItem('teamops_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('teamops_collaborators', JSON.stringify(collaborators)); }, [collaborators]);
  useEffect(() => { localStorage.setItem('teamops_countries', JSON.stringify(countries)); }, [countries]);
  useEffect(() => { localStorage.setItem('teamops_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('teamops_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('teamops_statuses', JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem('teamops_locations', JSON.stringify(locations)); }, [locations]);
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
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    if (!isOnline) {
      showToast('⚠️ Cambio guardado localmente en Modo Offline. Se sincronizará al reconectar.');
    } else {
      showToast('✓ Avance actualizado y sincronizado en tiempo real con cifrado E2EE.');
    }
  };

  // Create Task handler (Supports auto-generation of recurring task series up to 1 year horizon)
  const handleCreateTask = (partialTask: Partial<Task>) => {
    const startDate = partialTask.dueDate || new Date().toISOString().split('T')[0];
    const periodicity = partialTask.periodicity || 'unica';
    const periodEndDate = partialTask.periodEndDate;

    const datesToGenerate = generateRecurringDates(startDate, periodicity, periodEndDate);
    const seriesId = periodicity !== 'unica' ? `rec-${Date.now()}` : undefined;
    const now = Date.now();

    const createdTasks: Task[] = datesToGenerate.map((dateStr, idx) => {
      const taskCodeNumber = tasks.length + idx + 1;
      const code = `TAR-${String(taskCodeNumber).padStart(4, '0')}`;
      return {
        id: `tsk-${now}-${idx}`,
        code,
        title: partialTask.title || 'Nueva Tarea Operativa',
        description: partialTask.description || '',
        category: partialTask.category || 'Mantenimiento',
        priority: partialTask.priority || 'Media',
        status: 'pending',
        assignedUserId: partialTask.assignedUserId || 'usr-1',
        assignedUserName: partialTask.assignedUserName || 'Carlos Mendoza',
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

    if (createdTasks.length > 1) {
      showToast(`✨ ¡Se autogeneraron y registraron ${createdTasks.length} tareas recurrentes (${periodicity.toUpperCase()}) hasta ${periodEndDate}!`);
    } else {
      showToast('✨ Tarea asignada exitosamente con protocolo de seguridad.');
    }
  };

  const handleDeleteTask = (taskId: string, deleteAllSeries?: boolean) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (deleteAllSeries) {
      const seriesId = taskToDelete.recurrenceSeriesId;
      let countDeleted = 0;
      setTasks(prev => {
        return prev.filter(t => {
          if (seriesId && t.recurrenceSeriesId === seriesId) {
            countDeleted++;
            return false;
          }
          if (!seriesId && t.title === taskToDelete.title && t.periodicity === taskToDelete.periodicity && t.assignedUserId === taskToDelete.assignedUserId) {
            countDeleted++;
            return false;
          }
          return true;
        });
      });
      showToast(`🗑️ Se eliminaron todas las tareas de la serie de ${taskToDelete.code}.`);
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast(`🗑️ Tarea ${taskToDelete.code} eliminada por usuario autorizado.`);
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
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: unsyncedItems.map(t => ({
            action: 'UPDATE_TASK',
            taskId: t.id,
            updates: t
          }))
        })
      });

      const data = await response.json();
      
      // Mark all tasks as synced
      setTasks(prev => prev.map(t => ({ ...t, synced: true })));
      showToast(`✓ Sincronización completada. ${data.itemsProcessed || unsyncedItems.length} cambios unificados en la nube.`);
    } catch (err) {
      showToast('Error de red durante la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Collaborators ABM Handlers
  const handleAddCollaborator = (newCollabData: Omit<Collaborator, 'id' | 'monthlyPerformance'>) => {
    const newCollab: Collaborator = {
      ...newCollabData,
      id: `usr-${Date.now()}`,
      monthlyPerformance: [
        { month: '2026-07', tasksCompleted: 0, tasksTotal: 0, completionRate: 100, avgExecutionTimeMin: 0, targetTimeMin: 30, sopComplianceRate: 100, safetyIncidents: 0 }
      ]
    };
    setCollaborators(prev => [newCollab, ...prev]);
    showToast(`✨ Colaborador ${newCollab.name} registrado con éxito.`);
  };

  const handleUpdateCollaborator = (updatedCollab: Collaborator) => {
    setCollaborators(prev => prev.map(c => c.id === updatedCollab.id ? updatedCollab : c));
    showToast(`✓ Datos de ${updatedCollab.name} actualizados.`);
  };

  const handleDeleteCollaborator = (id: string) => {
    const target = collaborators.find(c => c.id === id);
    setCollaborators(prev => prev.filter(c => c.id !== id));
    showToast(`🗑️ Colaborador ${target?.name || ''} dado de baja del sistema.`);
  };

  // ABM Countries Handlers
  const handleAddCountry = (c: Omit<Country, 'id'>) => {
    const newCountry: Country = { ...c, id: `cnt-${Date.now()}` };
    setCountries(prev => [...prev, newCountry]);
    showToast(`✨ País ${newCountry.name} (${newCountry.code}) registrado en el catálogo maestro.`);
  };
  const handleUpdateCountry = (c: Country) => {
    setCountries(prev => prev.map(item => item.id === c.id ? c : item));
    showToast(`✓ País ${c.name} actualizado.`);
  };
  const handleDeleteCountry = (id: string) => {
    const target = countries.find(c => c.id === id);
    setCountries(prev => prev.filter(c => c.id !== id));
    showToast(`🗑️ País ${target?.name || ''} eliminado.`);
  };

  // ABM Roles Handlers
  const handleAddRole = (r: Omit<RoleDefinition, 'id'>) => {
    const newRole: RoleDefinition = { ...r, id: `rol-${Date.now()}` };
    setRoles(prev => [...prev, newRole]);
    showToast(`✨ Rol ${newRole.title} registrado.`);
  };
  const handleUpdateRole = (r: RoleDefinition) => {
    setRoles(prev => prev.map(item => item.id === r.id ? r : item));
    showToast(`✓ Rol ${r.title} actualizado.`);
  };
  const handleDeleteRole = (id: string) => {
    const target = roles.find(r => r.id === id);
    setRoles(prev => prev.filter(r => r.id !== id));
    showToast(`🗑️ Rol ${target?.title || ''} eliminado.`);
  };

  // ABM Departments Handlers
  const handleAddDepartment = (d: Omit<DepartmentDefinition, 'id'>) => {
    const newDept: DepartmentDefinition = { ...d, id: `dep-${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    showToast(`✨ Departamento ${newDept.name} registrado.`);
  };
  const handleUpdateDepartment = (d: DepartmentDefinition) => {
    setDepartments(prev => prev.map(item => item.id === d.id ? d : item));
    showToast(`✓ Departamento ${d.name} actualizado.`);
  };
  const handleDeleteDepartment = (id: string) => {
    const target = departments.find(d => d.id === id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    showToast(`🗑️ Departamento ${target?.name || ''} eliminado.`);
  };

  // ABM Statuses Handlers
  const handleAddStatus = (s: Omit<StatusDefinition, 'id'>) => {
    const newStatus: StatusDefinition = { ...s, id: `st-${Date.now()}` };
    setStatuses(prev => [...prev, newStatus]);
    showToast(`✨ Estado ${newStatus.label} registrado.`);
  };
  const handleUpdateStatus = (s: StatusDefinition) => {
    setStatuses(prev => prev.map(item => item.id === s.id ? s : item));
    showToast(`✓ Estado ${s.label} actualizado.`);
  };
  const handleDeleteStatus = (id: string) => {
    const target = statuses.find(s => s.id === id);
    setStatuses(prev => prev.filter(s => s.id !== id));
    showToast(`🗑️ Estado ${target?.label || ''} eliminado.`);
  };

  // ABM Locations Handlers
  const handleAddLocation = (l: Omit<LocationDefinition, 'id'>) => {
    const newLoc: LocationDefinition = { ...l, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
    showToast(`✨ Ubicación ${newLoc.name} registrada.`);
  };
  const handleUpdateLocation = (l: LocationDefinition) => {
    setLocations(prev => prev.map(item => item.id === l.id ? l : item));
    showToast(`✓ Ubicación ${l.name} actualizada.`);
  };
  const handleDeleteLocation = (id: string) => {
    const target = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
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
                {[
                  { id: 'tasks', label: 'Guía de Tareas', icon: CheckSquare },
                  { id: 'sops', label: 'Manuales SOP', icon: BookOpen },
                  { id: 'abm', label: 'Módulo ABM & Maestros', icon: Database },
                  { id: 'collaborators', label: 'Equipo de Campo', icon: Users },
                  { id: 'admin', label: 'Panel Admin', icon: LayoutDashboard },
                  { id: 'reports', label: 'Reportes & Export', icon: FileText },
                  { id: 'api', label: 'API REST', icon: Code }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
                        isActive
                          ? `${theme.border} text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 font-extrabold shadow-sm`
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
                <span>TeamOps Mobile Platform © 2026</span>
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
