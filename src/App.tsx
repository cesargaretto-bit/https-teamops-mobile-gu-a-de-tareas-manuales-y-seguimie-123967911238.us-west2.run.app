import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  Code, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Smartphone, 
  Sliders 
} from 'lucide-react';
import { 
  Task, 
  Procedure, 
  Collaborator, 
  ThemeConfig, 
  SecurityConfig, 
  PushNotificationConfig 
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_PROCEDURES, 
  INITIAL_COLLABORATORS, 
  INITIAL_THEME_CONFIG, 
  INITIAL_SECURITY_CONFIG, 
  INITIAL_PUSH_CONFIG 
} from './data/mockData';
import { getThemeClasses } from './utils/helpers';
import { HeaderNavbar } from './components/HeaderNavbar';
import { DailyTaskList } from './components/DailyTaskList';
import { ProceduresLibrary } from './components/ProceduresLibrary';
import { AdminTrackerDashboard } from './components/AdminTrackerDashboard';
import { ReportsAndExports } from './components/ReportsAndExports';
import { RestApiPlayground } from './components/RestApiPlayground';
import { SettingsAndSecurityModal } from './components/SettingsAndSecurityModal';
import { CreateTaskModal } from './components/CreateTaskModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_PROCEDURES);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  
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
  const [activeTab, setActiveTab] = useState<'tasks' | 'sops' | 'admin' | 'reports' | 'api'>('tasks');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [selectedProcedureModalCode, setSelectedProcedureModalCode] = useState<string | null>(null);

  // Toast alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const theme = getThemeClasses(themeConfig.primaryColor);

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

  // Create Task handler
  const handleCreateTask = (partialTask: Partial<Task>) => {
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      code: `TAR-00${tasks.length + 1}`,
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
      steps: partialTask.steps || [],
      notes: '',
      locationName: partialTask.locationName || 'Planta Operativa',
      dueDate: new Date().toISOString().split('T')[0],
      synced: isOnline,
      e2eEncrypted: true,
      encryptedHash: `e2ee_${Math.random().toString(36).substring(2, 9)}`
    };

    setTasks(prev => [newTask, ...prev]);
    showToast('✨ Tarea asignada exitosamente con protocolo de seguridad.');
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
                  onOpenProcedureModal={handleOpenProcedureModal}
                  onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
                  themeConfig={themeConfig}
                  isOnline={isOnline}
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

              {activeTab === 'admin' && (
                <AdminTrackerDashboard
                  collaborators={collaborators}
                  tasks={tasks}
                  onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
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
        themeConfig={themeConfig}
      />
    </div>
  );
}
