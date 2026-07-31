import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Shield, 
  Activity, 
  X, 
  Grid, 
  List, 
  BarChart2, 
  AlertTriangle,
  Award,
  Briefcase,
  Check,
  UserCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Collaborator, Task, ThemeConfig, Country, RoleDefinition, DepartmentDefinition, LocationDefinition } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface CollaboratorsManagerProps {
  collaborators: Collaborator[];
  tasks: Task[];
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id' | 'monthlyPerformance'>) => void;
  onUpdateCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  themeConfig: ThemeConfig;
  countries?: Country[];
  roles?: RoleDefinition[];
  departments?: DepartmentDefinition[];
  locations?: LocationDefinition[];
}

export const CollaboratorsManager: React.FC<CollaboratorsManagerProps> = ({
  collaborators,
  tasks,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator,
  themeConfig,
  countries = [],
  roles = [],
  departments = [],
  locations = []
}) => {
  const theme = getThemeClasses(themeConfig.primaryColor);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [deletingCollaborator, setDeletingCollaborator] = useState<Collaborator | null>(null);
  const [viewingPerformanceCollab, setViewingPerformanceCollab] = useState<Collaborator | null>(null);

  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'collaborator' as 'collaborator' | 'admin' | 'supervisor',
    department: 'Mantenimiento Mecánico',
    activeStatus: 'En Campo' as 'En Campo' | 'En Pausa' | 'Desconectado',
    avatar: '',
    locationName: 'Planta Principal',
    countryId: ''
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Departments list for filter & form
  const departmentsList = departments.length > 0 
    ? departments.map(d => d.name)
    : [
        'Mantenimiento Mecánico',
        'Aseguramiento de Calidad',
        'Seguridad e Higiene Industrial',
        'Gestión Operativa de Planta',
        'Logística y Almacén'
      ];

  // Default avatars for quick selection
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
  ];

  // Filter logic
  const filteredCollaborators = collaborators.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.locationName && c.locationName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'all' || c.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || c.activeStatus === selectedStatus;
    const matchesRole = selectedRole === 'all' || c.role === selectedRole;

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  // KPI Calculations
  const totalCount = collaborators.length;
  const inFieldCount = collaborators.filter(c => c.activeStatus === 'En Campo').length;
  const inPauseCount = collaborators.filter(c => c.activeStatus === 'En Pausa').length;
  const supervisorsCount = collaborators.filter(c => c.role === 'supervisor' || c.role === 'admin').length;

  // Form Handlers
  const openCreateModal = () => {
    setEditingCollaborator(null);
    const defaultDept = (departments && departments.length > 0) ? departments[0].name : 'Mantenimiento Mecánico';
    const defaultLocation = (locations && locations.length > 0) ? locations[0].name : 'Planta Principal';
    const defaultCountry = (countries && countries.length > 0) ? countries[0].id : '';

    setFormData({
      name: '',
      email: '',
      role: 'collaborator',
      department: defaultDept,
      activeStatus: 'En Campo',
      avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      locationName: defaultLocation,
      countryId: defaultCountry
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (collab: Collaborator) => {
    setEditingCollaborator(collab);
    setFormData({
      name: collab.name,
      email: collab.email,
      role: collab.role,
      department: collab.department,
      activeStatus: collab.activeStatus,
      avatar: collab.avatar || defaultAvatars[0],
      locationName: collab.locationName || 'Planta Principal',
      countryId: collab.countryId || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Correo electrónico inválido';
    if (!formData.department.trim()) errors.department = 'El departamento es obligatorio';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedCountryObj = countries?.find(c => c.id === formData.countryId);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      activeStatus: formData.activeStatus,
      avatar: formData.avatar,
      locationName: formData.locationName.trim(),
      countryId: selectedCountryObj?.id || formData.countryId,
      countryName: selectedCountryObj?.name,
      countryFlag: selectedCountryObj?.flagEmoji
    };

    if (editingCollaborator) {
      // Modificación (Update)
      onUpdateCollaborator({
        ...editingCollaborator,
        ...payload
      });
    } else {
      // Alta (Create)
      onAddCollaborator(payload);
    }

    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingCollaborator) {
      onDeleteCollaborator(deletingCollaborator.id);
      setDeletingCollaborator(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'En Campo':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'En Pausa':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick ABM Actions */}
      <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Gestión de Personal (ABM)
              </span>
              <span className="text-xs text-slate-400">Control de Alta, Baja & Modificación</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-400" />
              Directorio y Control de Colaboradores
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Administra altas de nuevo personal, actualizaciones de roles y departamentos, bajas del sistema y monitoreo histórico de rendimiento operacional.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs text-slate-950 flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all shrink-0 active:scale-95`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Total Colaboradores</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-400">Registrados en la plataforma</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>En Campo (Activos)</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {inFieldCount}
          </div>
          <p className="text-[11px] text-emerald-500 font-medium">Ejecutando tareas hoy</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>En Pausa / Descanso</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            {inPauseCount}
          </div>
          <p className="text-[11px] text-amber-500 font-medium">Disponibles próximamente</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Líderes / Supervisores</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {supervisorsCount}
          </div>
          <p className="text-[11px] text-purple-400 font-medium">Coordinación operacional</p>
        </div>
      </div>

      {/* Search & Filtering Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, departamento o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los Dptos</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="En Campo">En Campo</option>
              <option value="En Pausa">En Pausa</option>
              <option value="Desconectado">Desconectado</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los Roles</option>
              <option value="collaborator">Colaborador</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista en Tarjetas"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista en Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCollaborators.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No se encontraron colaboradores
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Ajusta los filtros de búsqueda o agrega un nuevo colaborador al sistema con el botón superior.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Colaborador</span>
          </button>
        </div>
      )}

      {/* Grid Cards View */}
      {viewMode === 'grid' && filteredCollaborators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollaborators.map(c => {
            const assignedTask = tasks.find(t => t.assignedUserId === c.id && t.status !== 'completed');
            const lastPerf = c.monthlyPerformance && c.monthlyPerformance.length > 0 
              ? c.monthlyPerformance[c.monthlyPerformance.length - 1] 
              : null;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={c.avatar || defaultAvatars[0]}
                          alt={c.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 transition-colors"
                        />
                        <span 
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            c.activeStatus === 'En Campo' 
                              ? 'bg-emerald-500' 
                              : c.activeStatus === 'En Pausa' 
                              ? 'bg-amber-500' 
                              : 'bg-slate-400'
                          }`} 
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {c.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{c.email}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 uppercase tracking-wider ${getRoleBadgeClass(c.role)}`}>
                      {c.role === 'admin' ? 'Admin' : c.role === 'supervisor' ? 'Supervisor' : 'Colaborador'}
                    </span>
                  </div>

                  {/* Department & Status Details */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Departamento:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Estado Campo:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(c.activeStatus)}`}>
                        {c.activeStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Ubicación:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {c.locationName || 'Nave Principal'}
                      </span>
                    </div>
                  </div>

                  {/* Task & Performance quick stat */}
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Tarea Actual:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {assignedTask ? assignedTask.title : c.currentTaskTitle || 'Sin asignación activa'}
                      </span>
                    </div>

                    {lastPerf && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Cumplimiento Mensual:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{lastPerf.completionRate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ABM Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setViewingPerformanceCollab(c)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Métricas</span>
                  </button>

                  <button
                    onClick={() => openEditModal(c)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-all"
                    title="Editar datos del colaborador"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingCollaborator(c)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 transition-all"
                    title="Dar de baja o eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredCollaborators.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Colaborador</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Estado Campo</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4 text-center">Acciones ABM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredCollaborators.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar || defaultAvatars[0]}
                          alt={c.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {c.department}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleBadgeClass(c.role)}`}>
                        {c.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(c.activeStatus)}`}>
                        {c.activeStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {c.locationName || 'Nave Principal'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingPerformanceCollab(c)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          title="Ver desempeño"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-600 dark:text-slate-300"
                          title="Editar colaborador"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCollaborator(c)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Create / Edit Form Modal (Alta y Modificación) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                {editingCollaborator ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editingCollaborator ? 'Modificar Datos de Colaborador' : 'Alta de Nuevo Colaborador'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingCollaborator ? 'Actualiza la información laboral del usuario.' : 'Completa los campos para registrarlo en la plataforma.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Fotografía de Perfil / Avatar:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {defaultAvatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar ${idx}`}
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        formData.avatar === url 
                          ? 'border-emerald-500 scale-110 shadow-md' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Roberto Gómez"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {formErrors.name && <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico Institucional:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@empresa.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {formErrors.email && <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              {/* Role & Department Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol Operativo:
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {roles && roles.length > 0 ? (
                      roles.map(r => {
                        const val = r.code.toLowerCase() === 'admin' ? 'admin' : r.code.toLowerCase() === 'supervisor' ? 'supervisor' : r.code.toLowerCase() === 'collaborator' || r.code.toLowerCase() === 'colab' ? 'collaborator' : r.title;
                        return (
                          <option key={r.id} value={val}>
                            {r.title} ({r.code})
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value="collaborator">Colaborador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Administrador</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento:
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado Presencial:
                  </label>
                  <select
                    value={formData.activeStatus}
                    onChange={(e) => setFormData({ ...formData, activeStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="En Campo">En Campo</option>
                    <option value="En Pausa">En Pausa</option>
                    <option value="Desconectado">Desconectado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ubicación / Planta Asignada:
                  </label>
                  {locations && locations.length > 0 ? (
                    <select
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.name}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="Ej: Nave Industrial B3"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  País de la Organización:
                </label>
                <select
                  value={formData.countryId}
                  onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- Sin País Asignado --</option>
                  {countries && countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flagEmoji || '🌐'} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  {editingCollaborator ? 'Guardar Cambios' : 'Registrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal (Baja) */}
      {deletingCollaborator && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                ¿Dar de baja a {deletingCollaborator.name}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta acción removerá a <strong className="text-slate-800 dark:text-slate-200">{deletingCollaborator.email}</strong> de la nómina activa de colaboradores en campo.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              💡 Las tareas asignadas a este usuario conservarán su historial registrado de ejecuciones para auditorías.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCollaborator(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
              >
                Sí, Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Viewing Performance Metrics Modal */}
      {viewingPerformanceCollab && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setViewingPerformanceCollab(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={viewingPerformanceCollab.avatar || defaultAvatars[0]}
                alt={viewingPerformanceCollab.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Histórico de Rendimiento: {viewingPerformanceCollab.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewingPerformanceCollab.department} • {viewingPerformanceCollab.email}
                </p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Tasa de Cumplimiento Mensual (%)
              </h4>
              <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={viewingPerformanceCollab.monthlyPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Cumplimiento %" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resumen de Indicadores Clave (KPIs):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {viewingPerformanceCollab.monthlyPerformance?.map((m) => (
                  <div key={m.month} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{m.month}</div>
                    <div className="text-[11px] text-slate-500">Tareas: {m.tasksCompleted} / {m.tasksTotal}</div>
                    <div className="text-[11px] text-slate-500">SOPs Cumplidos: {m.sopComplianceRate}%</div>
                    <div className="text-[11px] text-slate-500">Tiempo Prom: {m.avgExecutionTimeMin} min</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPerformanceCollab(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
