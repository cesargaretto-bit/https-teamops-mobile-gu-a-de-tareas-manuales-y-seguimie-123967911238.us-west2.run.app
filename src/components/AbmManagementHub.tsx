import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  Shield, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Check, 
  AlertTriangle, 
  Tag, 
  Layers, 
  Compass, 
  Briefcase, 
  Sparkles,
  ChevronRight,
  Database,
  Sliders,
  Flag
} from 'lucide-react';
import { 
  Country, 
  RoleDefinition, 
  DepartmentDefinition, 
  StatusDefinition, 
  LocationDefinition, 
  Collaborator, 
  Task, 
  ThemeConfig 
} from '../types';
import { CollaboratorsManager } from './CollaboratorsManager';
import { getThemeClasses } from '../utils/helpers';
import { COUNTRY_FLAG_PRESETS } from '../data/mockData';

interface AbmManagementHubProps {
  countries: Country[];
  roles: RoleDefinition[];
  departments: DepartmentDefinition[];
  statuses: StatusDefinition[];
  locations: LocationDefinition[];
  collaborators: Collaborator[];
  tasks: Task[];
  
  // Handlers for ABM Entities
  onAddCountry: (c: Omit<Country, 'id'>) => void;
  onUpdateCountry: (c: Country) => void;
  onDeleteCountry: (id: string) => void;

  onAddRole: (r: Omit<RoleDefinition, 'id'>) => void;
  onUpdateRole: (r: RoleDefinition) => void;
  onDeleteRole: (id: string) => void;

  onAddDepartment: (d: Omit<DepartmentDefinition, 'id'>) => void;
  onUpdateDepartment: (d: DepartmentDefinition) => void;
  onDeleteDepartment: (id: string) => void;

  onAddStatus: (s: Omit<StatusDefinition, 'id'>) => void;
  onUpdateStatus: (s: StatusDefinition) => void;
  onDeleteStatus: (id: string) => void;

  onAddLocation: (l: Omit<LocationDefinition, 'id'>) => void;
  onUpdateLocation: (l: LocationDefinition) => void;
  onDeleteLocation: (id: string) => void;

  // Handlers for Collaborators
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id' | 'monthlyPerformance'>) => void;
  onUpdateCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;

  themeConfig: ThemeConfig;
  initialSubTab?: 'collaborators' | 'countries' | 'roles' | 'departments' | 'statuses' | 'locations';
}

export const AbmManagementHub: React.FC<AbmManagementHubProps> = ({
  countries,
  roles,
  departments,
  statuses,
  locations,
  collaborators,
  tasks,
  onAddCountry,
  onUpdateCountry,
  onDeleteCountry,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddStatus,
  onUpdateStatus,
  onDeleteStatus,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator,
  themeConfig,
  initialSubTab = 'countries'
}) => {
  const theme = getThemeClasses(themeConfig.primaryColor);
  const [activeSubTab, setActiveSubTab] = useState<'collaborators' | 'countries' | 'roles' | 'departments' | 'statuses' | 'locations'>(initialSubTab);

  // Search & Filter state for simple tables
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for CRUD
  const [modalType, setModalType] = useState<'country' | 'role' | 'department' | 'status' | 'location' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string; name: string } | null>(null);

  // Form states
  const [countryForm, setCountryForm] = useState({ code: '', name: '', flagEmoji: '🌐', region: 'LATAM Sur', currency: 'USD', active: true, notes: '' });
  const [roleForm, setRoleForm] = useState({ code: '', title: '', description: '', accessLevel: 'Básico' as const, active: true });
  const [deptForm, setDeptForm] = useState({ code: '', name: '', managerName: '', headcount: 1, active: true });
  const [statusForm, setStatusForm] = useState({ key: '', label: '', color: '#3b82f6', category: 'En Proceso' as const, order: 1, active: true });
  const [locationForm, setLocationForm] = useState({ code: '', name: '', countryId: '', address: '', city: '', type: 'Planta Industrial' as const, active: true });

  // Reset form errors
  const [formError, setFormError] = useState('');

  // -------------------------
  // OPEN MODALS
  // -------------------------
  const openAddModal = (type: 'country' | 'role' | 'department' | 'status' | 'location') => {
    setModalType(type);
    setEditingItem(null);
    setFormError('');

    if (type === 'country') {
      setCountryForm({ code: '', name: '', flagEmoji: '🚩', region: 'LATAM Sur', currency: 'USD', active: true, notes: '' });
    } else if (type === 'role') {
      setRoleForm({ code: '', title: '', description: '', accessLevel: 'Básico', active: true });
    } else if (type === 'department') {
      setDeptForm({ code: '', name: '', managerName: '', headcount: 5, active: true });
    } else if (type === 'status') {
      setStatusForm({ key: '', label: '', color: '#10b981', category: 'En Proceso', order: (statuses.length + 1), active: true });
    } else if (type === 'location') {
      const defaultCountry = countries[0]?.id || '';
      setLocationForm({ code: '', name: '', countryId: defaultCountry, address: '', city: '', type: 'Planta Industrial', active: true });
    }
  };

  const openEditModal = (type: 'country' | 'role' | 'department' | 'status' | 'location', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormError('');

    if (type === 'country') {
      setCountryForm({ code: item.code, name: item.name, flagEmoji: item.flagEmoji, region: item.region, currency: item.currency, active: item.active, notes: item.notes || '' });
    } else if (type === 'role') {
      setRoleForm({ code: item.code, title: item.title, description: item.description, accessLevel: item.accessLevel, active: item.active });
    } else if (type === 'department') {
      setDeptForm({ code: item.code, name: item.name, managerName: item.managerName || '', headcount: item.headcount || 0, active: item.active });
    } else if (type === 'status') {
      setStatusForm({ key: item.key, label: item.label, color: item.color, category: item.category, order: item.order, active: item.active });
    } else if (type === 'location') {
      setLocationForm({ code: item.code, name: item.name, countryId: item.countryId, address: item.address, city: item.city, type: item.type, active: item.active });
    }
  };

  // -------------------------
  // SUBMIT HANDLERS
  // -------------------------
  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.name.trim() || !countryForm.code.trim()) {
      setFormError('Nombre y Código del país son requeridos');
      return;
    }
    if (editingItem) {
      onUpdateCountry({ ...editingItem, ...countryForm, code: countryForm.code.toUpperCase() });
    } else {
      onAddCountry({ ...countryForm, code: countryForm.code.toUpperCase() });
    }
    setModalType(null);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.title.trim() || !roleForm.code.trim()) {
      setFormError('Título y código del rol son requeridos');
      return;
    }
    if (editingItem) {
      onUpdateRole({ ...editingItem, ...roleForm, code: roleForm.code.toUpperCase() });
    } else {
      onAddRole({ ...roleForm, code: roleForm.code.toUpperCase() });
    }
    setModalType(null);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim() || !deptForm.code.trim()) {
      setFormError('Nombre y Código de departamento son requeridos');
      return;
    }
    if (editingItem) {
      onUpdateDepartment({ ...editingItem, ...deptForm, code: deptForm.code.toUpperCase() });
    } else {
      onAddDepartment({ ...deptForm, code: deptForm.code.toUpperCase() });
    }
    setModalType(null);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusForm.label.trim() || !statusForm.key.trim()) {
      setFormError('Etiqueta y clave del estado son requeridas');
      return;
    }
    if (editingItem) {
      onUpdateStatus({ ...editingItem, ...statusForm, key: statusForm.key.toLowerCase().replace(/\s+/g, '_') });
    } else {
      onAddStatus({ ...statusForm, key: statusForm.key.toLowerCase().replace(/\s+/g, '_') });
    }
    setModalType(null);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationForm.name.trim()) {
      setFormError('Nombre de ubicación requerido');
      return;
    }
    const targetCountry = countries.find(c => c.id === locationForm.countryId);
    const countryName = targetCountry ? targetCountry.name : 'No asignado';
    const countryFlag = targetCountry ? targetCountry.flagEmoji : '🌐';

    if (editingItem) {
      onUpdateLocation({ 
        ...editingItem, 
        ...locationForm, 
        countryName, 
        countryFlag, 
        code: locationForm.code.toUpperCase() 
      });
    } else {
      onAddLocation({ 
        ...locationForm, 
        countryName, 
        countryFlag, 
        code: locationForm.code.toUpperCase() 
      });
    }
    setModalType(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const { type, id } = deletingItem;

    if (type === 'country') onDeleteCountry(id);
    else if (type === 'role') onDeleteRole(id);
    else if (type === 'department') onDeleteDepartment(id);
    else if (type === 'status') onDeleteStatus(id);
    else if (type === 'location') onDeleteLocation(id);

    setDeletingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Centro Unificado de ABM & Tablas Maestras
              </span>
              <span className="text-xs text-slate-400">Parámetros Organizacionales</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-emerald-400" />
              Gestión de Maestros (ABM)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Administra la estructura de la empresa: Países de operación, Roles de colaboradores, Departamentos, Estados de workflow y Ubicaciones físicas de plantas.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 px-2 font-medium">Sub-módulos activos:</span>
            <span className="font-bold text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              6 Módulos
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Modules Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-1.5">
        {[
          { id: 'countries', label: 'Países de la Org.', icon: Globe, count: countries.length, color: 'text-blue-500' },
          { id: 'collaborators', label: 'Colaboradores', icon: Users, count: collaborators.length, color: 'text-emerald-500' },
          { id: 'roles', label: 'Roles Operativos', icon: Shield, count: roles.length, color: 'text-purple-500' },
          { id: 'departments', label: 'Departamentos', icon: Building2, count: departments.length, color: 'text-amber-500' },
          { id: 'statuses', label: 'Estados de Tareas', icon: Tag, count: statuses.length, color: 'text-rose-500' },
          { id: 'locations', label: 'Ubicaciones & Plantas', icon: MapPin, count: locations.length, color: 'text-teal-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : tab.color}`} />
              <span>{tab.label}</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 1: PAÍSES DE LA ORGANIZACIÓN */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'countries' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                ABM: Países de la Organización
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parametriza los países donde la empresa opera para agrupar tareas, colaboradores y estadísticas operacionales.
              </p>
            </div>

            <button
              onClick={() => openAddModal('country')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nuevo País</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar país por nombre, código ISO, región o moneda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries
              .filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.region.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((country) => {
                const linkedTasksCount = tasks.filter(t => t.countryId === country.id || t.countryName === country.name).length;
                const linkedCollabsCount = collaborators.filter(c => c.countryIds?.includes(country.id)).length;

                return (
                  <div 
                    key={country.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl leading-none">{country.flagEmoji || '🌐'}</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                              {country.name}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                {country.code}
                              </span>
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{country.region}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          country.active 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {country.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {/* Detail Pill */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Moneda Operativa:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{country.currency}</span>
                        </div>
                        {country.notes && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            {country.notes}
                          </div>
                        )}
                      </div>

                      {/* Linked Stats */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tareas Asociadas:
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{linkedTasksCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" /> Colaboradores:
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{linkedCollabsCount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => openEditModal('country', country)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setDeletingItem({ type: 'country', id: country.id, name: country.name })}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 transition-colors"
                        title="Eliminar país"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 2: COLABORADORES (Embedded Full Manager) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'collaborators' && (
        <div className="animate-in fade-in">
          <CollaboratorsManager
            collaborators={collaborators}
            tasks={tasks}
            onAddCollaborator={onAddCollaborator}
            onUpdateCollaborator={onUpdateCollaborator}
            onDeleteCollaborator={onDeleteCollaborator}
            themeConfig={themeConfig}
            countries={countries}
            roles={roles}
            departments={departments}
            locations={locations}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 3: ROLES OPERATIVOS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                ABM: Roles de Colaboradores
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define los perfiles de acceso y permisos operativos del personal de la plataforma.
              </p>
            </div>

            <button
              onClick={() => openAddModal('role')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nuevo Rol</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
                        {role.code}
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                        {role.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Nivel: {role.accessLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {role.description}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditModal('role', role)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setDeletingItem({ type: 'role', id: role.id, name: role.title })}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 4: DEPARTAMENTOS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                ABM: Departamentos de Planta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestiona las áreas funcionales de la organización y sus responsables directos.
              </p>
            </div>

            <button
              onClick={() => openAddModal('department')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Departamento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {dept.name}
                  </h4>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border">
                    {dept.code}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <div><strong>Líder / Responsable:</strong> {dept.managerName || 'Sin asignar'}</div>
                  <div><strong>Dotación (Personal):</strong> {dept.headcount || 0} integrantes</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => openEditModal('department', dept)}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingItem({ type: 'department', id: dept.id, name: dept.name })}
                    className="p-1 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 5: ESTADOS DE TAREAS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'statuses' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-500" />
                ABM: Estados de Tareas & Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza las fases del ciclo de vida de cada orden de trabajo.
              </p>
            </div>

            <button
              onClick={() => openAddModal('status')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Estado</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase font-extrabold text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Etiqueta de Estado</th>
                  <th className="py-3 px-4">Clave Código</th>
                  <th className="py-3 px-4">Categoría Workflow</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {statuses.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{st.order}</td>
                    <td className="py-3 px-4">
                      <span 
                        className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: st.color }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{st.key}</td>
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{st.category}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal('status', st)}
                          className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-600 dark:text-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'status', id: st.id, name: st.label })}
                          className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400"
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

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE 6: UBICACIONES Y PLANTAS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                ABM: Ubicaciones & Plantas Industriales
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registra los sitios físicos de ejecución operativa y asócialos a sus respectivos países.
              </p>
            </div>

            <button
              onClick={() => openAddModal('location')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Ubicación</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 font-mono">{loc.code}</span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {loc.name}
                      </h4>
                    </div>
                    <span className="text-xl">{loc.countryFlag || '🌐'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                    <div><strong>País:</strong> {loc.countryName}</div>
                    <div><strong>Ciudad:</strong> {loc.city}</div>
                    <div><strong>Dirección:</strong> {loc.address}</div>
                    <div><strong>Tipo:</strong> {loc.type}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditModal('location', loc)}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingItem({ type: 'location', id: loc.id, name: loc.name })}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GENERIC EDIT/CREATE MODALS */}
      {/* ------------------------------------------------------------- */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalType(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
              {editingItem ? `Modificar ${modalType}` : `Nuevo Registro de ${modalType}`}
            </h3>

            {formError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            {/* FORM PAÍS */}
            {modalType === 'country' && (
              <form onSubmit={handleSaveCountry} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Selector Visual de Bandera (opcional):
                  </label>
                  <select
                    value={COUNTRY_FLAG_PRESETS.some(p => p.code === countryForm.code) ? countryForm.code : ''}
                    onChange={(e) => {
                      const preset = COUNTRY_FLAG_PRESETS.find(p => p.code === e.target.value);
                      if (preset) {
                        setCountryForm(prev => ({
                          ...prev,
                          name: prev.name || preset.name,
                          code: preset.code,
                          flagEmoji: preset.flagEmoji
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Elegí un país para autocompletar código y bandera --</option>
                    {COUNTRY_FLAG_PRESETS.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.flagEmoji} {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                  {countryForm.flagEmoji && (
                    <p className="text-xs mt-1 flex items-center gap-1.5">
                      <span className="text-slate-400">Bandera actual:</span>
                      <span className="text-lg leading-none">{countryForm.flagEmoji}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Elegilo de la lista para completar automáticamente el código ISO y la bandera de abajo. Después podés editar cualquier campo a mano si lo necesitás.
                  </p>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Nombre del País:</label>
                  <input
                    type="text"
                    value={countryForm.name}
                    onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                    placeholder="Ej: Argentina"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Código ISO (2 letras):</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={countryForm.code}
                      onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value })}
                      placeholder="Ej: AR"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Bandera Emoji:</label>
                    <input
                      type="text"
                      value={countryForm.flagEmoji}
                      onChange={(e) => setCountryForm({ ...countryForm, flagEmoji: e.target.value })}
                      placeholder="🇦🇷"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Región:</label>
                    <input
                      type="text"
                      value={countryForm.region}
                      onChange={(e) => setCountryForm({ ...countryForm, region: e.target.value })}
                      placeholder="LATAM Sur"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Moneda:</label>
                    <input
                      type="text"
                      value={countryForm.currency}
                      onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value })}
                      placeholder="ARS"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Notas Adicionales:</label>
                  <textarea
                    rows={2}
                    value={countryForm.notes}
                    onChange={(e) => setCountryForm({ ...countryForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-500 font-extrabold text-slate-950 rounded-xl">Guardar País</button>
                </div>
              </form>
            )}

            {/* FORM ROL */}
            {modalType === 'role' && (
              <form onSubmit={handleSaveRole} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Título del Rol:</label>
                  <input
                    type="text"
                    value={roleForm.title}
                    onChange={(e) => setRoleForm({ ...roleForm, title: e.target.value })}
                    placeholder="Ej: Técnico de Mantenimiento"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Código Rol:</label>
                  <input
                    type="text"
                    value={roleForm.code}
                    onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                    placeholder="TECNICO"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Nivel de Acceso:</label>
                  <select
                    value={roleForm.accessLevel}
                    onChange={(e) => setRoleForm({ ...roleForm, accessLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                    <option value="Administrativo Total">Administrativo Total</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Descripción:</label>
                  <textarea
                    rows={2}
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-500 font-extrabold text-slate-950 rounded-xl">Guardar Rol</button>
                </div>
              </form>
            )}

            {/* FORM DEPARTAMENTO */}
            {modalType === 'department' && (
              <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Nombre del Departamento:</label>
                  <input
                    type="text"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="Ej: Aseguramiento de Calidad"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Código Dpto:</label>
                    <input
                      type="text"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      placeholder="CAL"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Dotación Estimada:</label>
                    <input
                      type="number"
                      value={deptForm.headcount}
                      onChange={(e) => setDeptForm({ ...deptForm, headcount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Líder / Supervisor Responsable:</label>
                  <input
                    type="text"
                    value={deptForm.managerName}
                    onChange={(e) => setDeptForm({ ...deptForm, managerName: e.target.value })}
                    placeholder="Ej: Lic. Ana Sofía Torres"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-500 font-extrabold text-slate-950 rounded-xl">Guardar Departamento</button>
                </div>
              </form>
            )}

            {/* FORM ESTADO */}
            {modalType === 'status' && (
              <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Etiqueta Visible:</label>
                  <input
                    type="text"
                    value={statusForm.label}
                    onChange={(e) => setStatusForm({ ...statusForm, label: e.target.value })}
                    placeholder="Ej: En Revisión"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Clave Código:</label>
                    <input
                      type="text"
                      value={statusForm.key}
                      onChange={(e) => setStatusForm({ ...statusForm, key: e.target.value })}
                      placeholder="in_review"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Color Badge (HEX):</label>
                    <input
                      type="color"
                      value={statusForm.color}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 border rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Categoría Workflow:</label>
                  <select
                    value={statusForm.category}
                    onChange={(e) => setStatusForm({ ...statusForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Inicial">Inicial</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Excepción">Excepción</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-500 font-extrabold text-slate-950 rounded-xl">Guardar Estado</button>
                </div>
              </form>
            )}

            {/* FORM UBICACIÓN */}
            {modalType === 'location' && (
              <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Nombre de la Ubicación / Planta:</label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    placeholder="Ej: Nave Industrial B3"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">País Asignado:</label>
                    <select
                      value={locationForm.countryId}
                      onChange={(e) => setLocationForm({ ...locationForm, countryId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    >
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Tipo de Instalación:</label>
                    <select
                      value={locationForm.type}
                      onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    >
                      <option value="Planta Industrial">Planta Industrial</option>
                      <option value="Centro Logístico">Centro Logístico</option>
                      <option value="Oficina Central">Oficina Central</option>
                      <option value="Almacén">Almacén</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Ciudad / Estado:</label>
                    <input
                      type="text"
                      value={locationForm.city}
                      onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Código Referencia:</label>
                    <input
                      type="text"
                      value={locationForm.code}
                      onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                      placeholder="NAV-B3"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Dirección Física:</label>
                  <input
                    type="text"
                    value={locationForm.address}
                    onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                    placeholder="Av. Industrial 4500"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-500 font-extrabold text-slate-950 rounded-xl">Guardar Ubicación</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                ¿Eliminar {deletingItem.name}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta acción removerá el registro del catálogo maestro.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
