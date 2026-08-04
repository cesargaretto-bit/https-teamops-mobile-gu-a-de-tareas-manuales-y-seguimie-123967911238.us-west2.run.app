import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  FileText, 
  BookOpen, 
  Search, 
  Filter, 
  Lock, 
  Play, 
  Pause, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  Upload,
  ChevronDown,
  Globe,
  Trash2,
  Calendar,
  Repeat
} from 'lucide-react';
import { Task, Category, Priority, TaskStatus, ThemeConfig, Country, Collaborator } from '../types';
import { getThemeClasses, computeMinutesBetween } from '../utils/helpers';
import { TaskAgendaView } from './TaskAgendaView';

interface DailyTaskListProps {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
  onOpenProcedureModal: (code: string) => void;
  onOpenCreateTaskModal: () => void;
  themeConfig: ThemeConfig;
  isOnline: boolean;
  countries?: Country[];
  collaborators?: Collaborator[];
  onDeleteTask?: (taskId: string, deleteAllSeries?: boolean) => void;
  currentRole?: string;
  currentUser?: { role?: string; name?: string } | null;
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({
  tasks,
  onUpdateTask,
  onOpenProcedureModal,
  onOpenCreateTaskModal,
  themeConfig,
  isOnline,
  countries = [],
  collaborators = [],
  onDeleteTask,
  currentRole,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
  const [isCollaboratorFilterOpen, setIsCollaboratorFilterOpen] = useState(false);
  const [taskDisplayMode, setTaskDisplayMode] = useState<'cards' | 'list' | 'agenda'>('cards');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [uploadingProofForTaskId, setUploadingProofForTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const theme = getThemeClasses(themeConfig.primaryColor);

  const canDelete =
    currentRole === 'admin' ||
    currentRole === 'supervisor' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'supervisor';

  // Manager-level filter by collaborator: available to Admin, Supervisor and
  // any custom role named/coded "Gerente" (Manager) created in the Roles ABM.
  const roleLabel = `${currentRole || ''} ${currentUser?.role || ''}`.toLowerCase();
  const isManagerView =
    currentRole === 'admin' ||
    currentRole === 'supervisor' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'supervisor' ||
    roleLabel.includes('gerente') ||
    roleLabel.includes('manager');

  const toggleCollaboratorFilter = (collabId: string) => {
    setSelectedCollaboratorIds(prev =>
      prev.includes(collabId) ? prev.filter(id => id !== collabId) : [...prev, collabId]
    );
  };

  // Calculate matching recurring series count when setTaskToDelete is active
  const seriesTasksCount = React.useMemo(() => {
    if (!taskToDelete) return 1;
    if (taskToDelete.recurrenceSeriesId) {
      return tasks.filter(t => t.recurrenceSeriesId === taskToDelete.recurrenceSeriesId).length;
    }
    if (taskToDelete.periodicity && taskToDelete.periodicity !== 'unica') {
      return tasks.filter(t => t.title === taskToDelete.title && t.periodicity === taskToDelete.periodicity && t.assignedUserId === taskToDelete.assignedUserId).length;
    }
    return 1;
  }, [taskToDelete, tasks]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.countryName && task.countryName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    const selectedCountryObj = countries.find(c => c.id === selectedCountry);
    const matchesCountry = selectedCountry === 'all' || 
      task.countryId === selectedCountry || 
      task.countryName === selectedCountry ||
      (selectedCountryObj && (
        task.countryName?.toLowerCase() === selectedCountryObj.name.toLowerCase() ||
        task.countryName?.toLowerCase() === selectedCountryObj.code.toLowerCase() ||
        task.countryId === selectedCountryObj.id
      ));

    const matchesDateFrom = !dateFrom || (task.dueDate && task.dueDate >= dateFrom);
    const matchesDateTo = !dateTo || (task.dueDate && task.dueDate <= dateTo);

    const matchesCollaborator =
      selectedCollaboratorIds.length === 0 || selectedCollaboratorIds.includes(task.assignedUserId);

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesCountry && matchesDateFrom && matchesDateTo && matchesCollaborator;
  });

  // Handle Step Checkbox Toggle
  const handleToggleStep = (task: Task, stepId: string) => {
    const updatedSteps = task.steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );

    // Autonomous status: as soon as at least one step is checked the task
    // moves to "En Proceso", and once every step is checked it moves to
    // "Completada" — automatically, without needing a manual status change.
    // This also reverts cleanly if a step gets unchecked afterwards, except
    // for tasks a supervisor explicitly marked as "Bloqueada".
    const completedCount = updatedSteps.filter(s => s.completed).length;
    let newStatus = task.status;
    if (task.status !== 'blocked') {
      if (updatedSteps.length > 0 && completedCount === updatedSteps.length) {
        newStatus = 'completed';
      } else if (completedCount > 0) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'pending';
      }
    }

    const updatedTask: Task = {
      ...task,
      steps: updatedSteps,
      status: newStatus,
      synced: isOnline,
      completedAt: newStatus === 'completed' ? new Date().toLocaleString('es-ES') : task.completedAt
    };

    onUpdateTask(updatedTask);
    if (activeTaskDetail?.id === task.id) {
      setActiveTaskDetail(updatedTask);
    }
  };

  // Handle Status Direct Change
  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      synced: isOnline,
      completedAt: newStatus === 'completed' ? new Date().toLocaleString('es-ES') : task.completedAt
    };
    onUpdateTask(updatedTask);
    if (activeTaskDetail?.id === task.id) {
      setActiveTaskDetail(updatedTask);
    }
  };

  // Mock Photo Proof Upload Simulator
  const handleSimulatePhotoUpload = (task: Task, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedTask: Task = {
          ...task,
          proofImageUrl: reader.result as string,
          synced: isOnline
        };
        onUpdateTask(updatedTask);
        if (activeTaskDetail?.id === task.id) {
          setActiveTaskDetail(updatedTask);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Default placeholder photo
      const samplePhoto = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400';
      const updatedTask: Task = {
        ...task,
        proofImageUrl: samplePhoto,
        synced: isOnline
      };
      onUpdateTask(updatedTask);
      if (activeTaskDetail?.id === task.id) {
        setActiveTaskDetail(updatedTask);
      }
    }
  };

  // Start/End Time Tracking: when both times are set, actualMinutes is
  // recalculated automatically from the real elapsed time (used later for
  // productivity, efficiency & workload reports).
  const handleTimeRangeChange = (task: Task, field: 'startTime' | 'endTime', value: string) => {
    const updatedFields = { [field]: value } as Pick<Task, 'startTime' | 'endTime'>;
    const nextStartTime = field === 'startTime' ? value : task.startTime;
    const nextEndTime = field === 'endTime' ? value : task.endTime;
    const computedMinutes = computeMinutesBetween(nextStartTime, nextEndTime);

    const updatedTask: Task = {
      ...task,
      ...updatedFields,
      actualMinutes: computedMinutes !== null ? computedMinutes : task.actualMinutes,
      synced: isOnline
    };
    onUpdateTask(updatedTask);
    if (activeTaskDetail?.id === task.id) {
      setActiveTaskDetail(updatedTask);
    }
  };

  // Quick Time Increment
  const handleIncrementTime = (task: Task, mins: number) => {
    const updatedTask: Task = {
      ...task,
      actualMinutes: Math.max(0, task.actualMinutes + mins),
      synced: isOnline
    };
    onUpdateTask(updatedTask);
    if (activeTaskDetail?.id === task.id) {
      setActiveTaskDetail(updatedTask);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-500" />
            Modo de Visualización:
          </label>
          <select
            value={taskDisplayMode}
            onChange={(e) => setTaskDisplayMode(e.target.value as 'cards' | 'list' | 'agenda')}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="cards">🗂️ Tarjetas</option>
            <option value="list">📋 Lista</option>
            <option value="agenda">📅 Agenda</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">Modo Activo:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
            {taskDisplayMode === 'cards' ? '🗂️ Tarjetas' : taskDisplayMode === 'list' ? '📋 Lista' : '📅 Agenda Interactiva'}
          </span>
        </div>
      </div>

      {taskDisplayMode === 'agenda' ? (
        <TaskAgendaView
          tasks={filteredTasks}
          onUpdateTask={onUpdateTask}
          onSelectTaskDetail={(task) => setActiveTaskDetail(task)}
          onOpenCreateTaskModal={onOpenCreateTaskModal}
          themeConfig={themeConfig}
        />
      ) : (
        <>
          {/* Search & Filter Header */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tareas por código, título o colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={onOpenCreateTaskModal}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white ${theme.bg} ${theme.bgHover} shadow-sm transition-all`}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Estado:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'in_progress', label: 'En Proceso' },
            { id: 'completed', label: 'Completadas' },
            { id: 'blocked', label: 'Bloqueadas' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedStatus === st.id
                  ? `${theme.bg} text-white`
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {st.label}
            </button>
          ))}

          <span className="text-slate-500 dark:text-slate-400 font-medium ml-2 flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-500" /> País:
          </span>
          {[
            { id: 'all', label: 'Todos' },
            ...(countries.length > 0
              ? countries.map(c => ({
                  id: c.id,
                  label: `${c.flagEmoji || '🌐'} ${c.code || c.name}`
                }))
              : [
                  { id: 'cnt-ar', label: '🇦🇷 AR' },
                  { id: 'cnt-mx', label: '🇲🇽 MX' },
                  { id: 'cnt-br', label: '🇧🇷 BR' },
                  { id: 'cnt-cl', label: '🇨🇱 CL' },
                  { id: 'cnt-co', label: '🇨🇴 CO' },
                  { id: 'cnt-es', label: '🇪🇸 ES' }
                ])
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.id)}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold text-xs ${
                selectedCountry === c.id
                  ? `bg-blue-600 text-white shadow-sm`
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}

          <span className="text-slate-500 dark:text-slate-400 font-medium ml-2 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-500" /> Fecha:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Desde"
          />
          <span className="text-slate-400">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Hasta"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              title="Limpiar filtro de fechas"
            >
              ✕ Limpiar
            </button>
          )}

          {isManagerView && collaborators.length > 0 && (
            <div className="relative">
              <span className="text-slate-500 dark:text-slate-400 font-medium ml-2 mr-1 inline-flex items-center gap-1">
                👤 Colaborador:
              </span>
              <button
                onClick={() => setIsCollaboratorFilterOpen(o => !o)}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs border ${
                  selectedCollaboratorIds.length > 0
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {selectedCollaboratorIds.length === 0
                  ? 'Todos'
                  : `${selectedCollaboratorIds.length} seleccionado${selectedCollaboratorIds.length > 1 ? 's' : ''}`}
                {' '}▾
              </button>

              {isCollaboratorFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCollaboratorFilterOpen(false)} />
                  <div className="absolute z-20 mt-1 w-64 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 space-y-0.5">
                    <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Filtrar por colaborador</span>
                      {selectedCollaboratorIds.length > 0 && (
                        <button
                          onClick={() => setSelectedCollaboratorIds([])}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    {collaborators.map(c => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer text-xs text-slate-700 dark:text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollaboratorIds.includes(c.id)}
                          onChange={() => toggleCollaboratorFilter(c.id)}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <CheckCircle2 className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">No se encontraron tareas con los filtros aplicados.</p>
          <p className="text-xs text-slate-400 mt-1">Prueba cambiando el término de búsqueda o creando una nueva tarea.</p>
        </div>
      ) : taskDisplayMode === 'list' ? (
        /* Compact List / Table View */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-3 py-2 text-left font-bold">Código</th>
                <th className="px-3 py-2 text-left font-bold">Título</th>
                <th className="px-3 py-2 text-left font-bold">Estado</th>
                <th className="px-3 py-2 text-left font-bold">Prioridad</th>
                <th className="px-3 py-2 text-left font-bold">Asignado</th>
                <th className="px-3 py-2 text-left font-bold">País</th>
                <th className="px-3 py-2 text-left font-bold">Fecha</th>
                <th className="px-3 py-2 text-left font-bold">Avance</th>
                <th className="px-3 py-2 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredTasks.map(task => {
                const completedSteps = task.steps.filter(s => s.completed).length;
                const progressPercent = task.steps.length
                  ? Math.round((completedSteps / task.steps.length) * 100)
                  : task.status === 'completed' ? 100 : 0;

                return (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {task.code}
                    </td>
                    <td className="px-3 py-2 max-w-[220px]">
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">{task.title}</span>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border text-slate-800 dark:text-white focus:outline-none ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                            : task.status === 'in_progress'
                            ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-800 dark:text-amber-300'
                            : task.status === 'blocked'
                            ? 'bg-red-100 dark:bg-red-950 border-red-300 text-red-800 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Proceso</option>
                        <option value="completed">Completada</option>
                        <option value="blocked">Bloqueada</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                        task.priority === 'Alta'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          : task.priority === 'Media'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`} translate="no">
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      👤 {task.assignedUserName}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {task.countryFlag || '🌐'} {task.countryName || '-'}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {task.dueDate || 'Sin fecha'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2" translate="no">
                        <div className="w-16 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              progressPercent === 100 ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-red-500' : theme.bg
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveTaskDetail(task)}
                          className="px-2.5 py-1 rounded-md font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition-all text-[11px]"
                        >
                          Detalle
                        </button>
                        {canDelete && onDeleteTask && (
                          <button
                            onClick={() => setTaskToDelete(task)}
                            title="Eliminar tarea (Permiso de Supervisor / Admin)"
                            className="p-1.5 rounded-md bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Task List Grid (Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const completedSteps = task.steps.filter(s => s.completed).length;
            const progressPercent = task.steps.length 
              ? Math.round((completedSteps / task.steps.length) * 100) 
              : task.status === 'completed' ? 100 : 0;

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-4 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {task.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        task.priority === 'Alta'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          : task.priority === 'Media'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`} translate="no">
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2">
                        {task.category}
                      </span>
                    </div>

                    {/* Sync & Encryption Icons */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {task.synced ? (
                        <span title="Sincronizado con la nube" className="text-emerald-500">●</span>
                      ) : (
                        <span title="Guardado localmente (Offline)" className="text-amber-500 animate-pulse">● Offline</span>
                      )}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Cifrado E2EE AES-256" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  </div>

                  {/* Location & Assignee */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50 gap-1">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <span className="text-sm">{task.countryFlag || '🌐'}</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {task.countryName ? `${task.countryName} • ${task.locationName || 'Planta Operativa'}` : (task.locationName || 'Planta Operativa')}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      👤 {task.assignedUserName}
                    </span>
                  </div>

                  {/* Date & Periodicity Badge */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      Fecha: <strong className="font-mono">{task.dueDate || 'Sin fecha'}</strong>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Repeat className="w-3 h-3 text-indigo-500" />
                      {task.periodicity === 'diaria' ? '🔄 Diaria' : task.periodicity === 'semanal' ? '📅 Semanal' : task.periodicity === 'mensual' ? '🗓️ Mensual' : '⚡ Única'}
                    </span>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300" translate="no">
                      <span>Avance: {completedSteps}/{task.steps.length} pasos</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          progressPercent === 100 
                            ? 'bg-emerald-500' 
                            : task.status === 'blocked' 
                            ? 'bg-red-500' 
                            : theme.bg
                        }`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Step List (First 2 steps preview) */}
                  {task.steps.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {task.steps.slice(0, 3).map(step => (
                        <label
                          key={step.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-xs text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={() => handleToggleStep(task, step.id)}
                            className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span className={step.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                            {step.title}
                          </span>
                        </label>
                      ))}
                      {task.steps.length > 3 && (
                        <p className="text-[11px] text-slate-400 italic pl-6">
                          +{task.steps.length - 3} pasos adicionales en detalle...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Linked SOP Manual Reference */}
                  {task.procedureRefCode && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold">{task.procedureRefCode}:</span>
                        <span className="truncate max-w-[150px]">{task.procedureRefTitle}</span>
                      </div>
                      <button
                        onClick={() => onOpenProcedureModal(task.procedureRefCode!)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
                      >
                        Ver SOP <ChevronRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Controls & Time Tracker */}
                <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span translate="no">{task.actualMinutes}m / {task.estimatedMinutes}m</span>
                    <button
                      onClick={() => handleIncrementTime(task, 5)}
                      className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-sans text-[11px] font-bold notranslate"
                      title="Sumar 5 minutos trabajados"
                      translate="no"
                    >
                      +5m
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge / selector */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-md border text-slate-800 dark:text-white focus:outline-none ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-800 dark:text-amber-300'
                          : task.status === 'blocked'
                          ? 'bg-red-100 dark:bg-red-950 border-red-300 text-red-800 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Proceso</option>
                      <option value="completed">Completada</option>
                      <option value="blocked">Bloqueada</option>
                    </select>

                    <button
                      onClick={() => setActiveTaskDetail(task)}
                      className="px-2.5 py-1 rounded-md font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition-all text-xs"
                    >
                      Detalle
                    </button>

                    {canDelete && onDeleteTask && (
                      <button
                        onClick={() => setTaskToDelete(task)}
                        title="Eliminar tarea (Permiso de Supervisor / Admin)"
                        className="p-1.5 rounded-md bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Task Detail Modal Drawer */}
      {activeTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    {activeTaskDetail.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                    {activeTaskDetail.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    E2EE Hash: <code className="text-[10px]">{activeTaskDetail.encryptedHash}</code>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeTaskDetail.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Asignado a: <strong className="text-slate-700 dark:text-slate-200">{activeTaskDetail.assignedUserName}</strong> | Ubicación: <strong>{activeTaskDetail.locationName}</strong>
                </p>
              </div>

              <button
                onClick={() => setActiveTaskDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción de la Tarea</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  {activeTaskDetail.description}
                </p>
              </div>

              {/* Date & Periodicity Settings Panel in Detail */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Fecha de Programación:</label>
                  <input
                    type="date"
                    value={activeTaskDetail.dueDate || ''}
                    onChange={(e) => {
                      const updated: Task = { ...activeTaskDetail, dueDate: e.target.value, synced: isOnline };
                      onUpdateTask(updated);
                      setActiveTaskDetail(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Periodicidad de Repetición:</label>
                  <select
                    value={activeTaskDetail.periodicity || 'unica'}
                    onChange={(e) => {
                      const updated: Task = { ...activeTaskDetail, periodicity: e.target.value as any, synced: isOnline };
                      onUpdateTask(updated);
                      setActiveTaskDetail(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="unica">Única Ejecución</option>
                    <option value="diaria">🔄 Diaria</option>
                    <option value="semanal">📅 Semanal</option>
                    <option value="mensual">🗓️ Mensual</option>
                  </select>
                </div>
              </div>

              {/* Time Tracking Panel: start/end time -> auto-computed duration,
                  used to measure productivity, efficiency and workload per collaborator */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Registro de Horario de Ejecución
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Hora de Inicio:</label>
                    <input
                      type="time"
                      value={activeTaskDetail.startTime || ''}
                      onChange={(e) => handleTimeRangeChange(activeTaskDetail, 'startTime', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Hora de Fin:</label>
                    <input
                      type="time"
                      value={activeTaskDetail.endTime || ''}
                      onChange={(e) => handleTimeRangeChange(activeTaskDetail, 'endTime', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-semibold"
                    />
                  </div>
                </div>
                {activeTaskDetail.startTime && activeTaskDetail.endTime && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Duración registrada: <strong className="text-slate-700 dark:text-slate-200 font-mono">{activeTaskDetail.actualMinutes} min</strong> (vs. {activeTaskDetail.estimatedMinutes} min estimados)
                  </p>
                )}
              </div>

              {/* Linked SOP Manual if available */}
              {activeTaskDetail.procedureRefCode && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> Manual SOP Asociado: {activeTaskDetail.procedureRefCode}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {activeTaskDetail.procedureRefTitle}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const code = activeTaskDetail.procedureRefCode!;
                      setActiveTaskDetail(null);
                      onOpenProcedureModal(code);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${theme.bg} ${theme.bgHover}`}
                  >
                    Abrir Manual SOP
                  </button>
                </div>
              )}

              {/* Interactive Step List Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Guía Paso a Paso de Verificación ({activeTaskDetail.steps.filter(s => s.completed).length}/{activeTaskDetail.steps.length})
                </h4>
                <div className="space-y-2">
                  {activeTaskDetail.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border transition-all ${
                        step.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => handleToggleStep(activeTaskDetail, step.id)}
                          className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className={`text-sm font-semibold ${step.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            Paso {idx + 1}: {step.title}
                          </span>
                          {step.notes && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              ⚠️ Nota: {step.notes}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Evidence Upload Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidencia / Fotografía de Avance</h4>
                
                {activeTaskDetail.proofImageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img 
                      src={activeTaskDetail.proofImageUrl} 
                      alt="Evidencia cargada" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white text-slate-900 font-semibold rounded-lg text-xs hover:bg-slate-100">
                        Cambiar foto
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSimulatePhotoUpload(activeTaskDetail, e)} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/30">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Tomar foto o cargar comprobante</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Formatos JPG, PNG con timestamp automático</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleSimulatePhotoUpload(activeTaskDetail, e)} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Notes & Observaciones */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notas y Observaciones del Operador</h4>
                <textarea
                  value={activeTaskDetail.notes}
                  onChange={(e) => {
                    const updated = { ...activeTaskDetail, notes: e.target.value, synced: isOnline };
                    setActiveTaskDetail(updated);
                    onUpdateTask(updated);
                  }}
                  rows={2}
                  placeholder="Agregar comentarios o novedades sobre el trabajo realizado..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Estado: <strong className="uppercase text-slate-800 dark:text-white">{activeTaskDetail.status}</strong>
                </div>
                {canDelete && onDeleteTask && (
                  <button
                    onClick={() => {
                      setTaskToDelete(activeTaskDetail);
                      setActiveTaskDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar Tarea
                  </button>
                )}
              </div>
              <button
                onClick={() => setActiveTaskDetail(null)}
                className={`px-5 py-2 rounded-lg font-bold text-xs text-white ${theme.bg} ${theme.bgHover}`}
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-red-200 dark:border-red-900 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Confirmar eliminación de tarea?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acceso concedido por perfil de Supervisor / Admin.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p><strong>Código:</strong> {taskToDelete.code}</p>
              <p><strong>Título:</strong> {taskToDelete.title}</p>
              <p><strong>Asignado:</strong> {taskToDelete.assignedUserName}</p>
              <p><strong>Fecha Programada:</strong> {taskToDelete.dueDate}</p>
              <p><strong>Periodicidad:</strong> {taskToDelete.periodicity === 'diaria' ? '🔄 Diaria' : taskToDelete.periodicity === 'semanal' ? '📅 Semanal' : taskToDelete.periodicity === 'mensual' ? '🗓️ Mensual' : '⚡ Única'}</p>
            </div>

            {seriesTasksCount > 1 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <Repeat className="w-4 h-4 text-amber-500" />
                  <span>Serie Recurrente Detectada</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Esta tarea forma parte de una serie programada con <strong>{seriesTasksCount} repeticiones</strong> registradas en la agenda. Puedes optar por eliminar solo este evento o la serie completa.
                </p>
              </div>
            )}

            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ Las tareas eliminadas se removerán permanentemente de la sincronización y del calendario.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancelar
              </button>

              {seriesTasksCount > 1 ? (
                <>
                  <button
                    onClick={() => {
                      if (onDeleteTask) {
                        onDeleteTask(taskToDelete.id, false);
                      }
                      setTaskToDelete(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 transition-colors"
                  >
                    Eliminar Solo Esta
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteTask) {
                        onDeleteTask(taskToDelete.id, true);
                      }
                      setTaskToDelete(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                  >
                    Eliminar Serie Completa ({seriesTasksCount})
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onDeleteTask) {
                      onDeleteTask(taskToDelete.id, false);
                    }
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                >
                  Sí, Eliminar Tarea
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
