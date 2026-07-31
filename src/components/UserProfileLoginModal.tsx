import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  LogOut, 
  X, 
  Sparkles, 
  Building2, 
  MapPin, 
  Globe, 
  Key, 
  ChevronRight,
  Shield,
  Activity,
  Sliders,
  Check
} from 'lucide-react';
import { Collaborator, RoleDefinition, Country, DepartmentDefinition, ThemeConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'collaborator' | 'admin' | 'supervisor';
  avatar: string;
  department: string;
  locationName?: string;
  countryName?: string;
  countryFlag?: string;
  activeStatus?: 'En Campo' | 'En Pausa' | 'Desconectado';
}

interface UserProfileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onLogin: (user: UserSession) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: UserSession) => void;
  collaborators: Collaborator[];
  roles: RoleDefinition[];
  countries: Country[];
  departments: DepartmentDefinition[];
  themeConfig: ThemeConfig;
}

export const UserProfileLoginModal: React.FC<UserProfileLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  collaborators,
  roles,
  countries,
  departments,
  themeConfig
}) => {
  if (!isOpen) return null;

  const theme = getThemeClasses(themeConfig.primaryColor);

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [selectedCollabId, setSelectedCollabId] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Tab within modal if logged in: 'profile' | 'permissions'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'permissions'>('profile');

  // Editable fields when logged in
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editDepartment, setEditDepartment] = useState(currentUser?.department || '');
  const [editStatus, setEditStatus] = useState(currentUser?.activeStatus || 'En Campo');

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginError('Por favor, ingrese un correo electrónico válido');
      return;
    }

    // Check if matching collaborator exists
    const matched = collaborators.find(c => c.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (matched) {
      onLogin({
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        avatar: matched.avatar,
        department: matched.department,
        locationName: matched.locationName,
        countryName: matched.countryName,
        countryFlag: matched.countryFlag,
        activeStatus: matched.activeStatus
      });
      onClose();
    } else {
      // Create new session user dynamically
      const isDomainAdmin = emailInput.includes('admin') || emailInput.includes('garetto') || emailInput.includes('manager');
      const newUser: UserSession = {
        id: `usr-${Date.now()}`,
        name: emailInput.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
        email: emailInput.trim(),
        role: isDomainAdmin ? 'admin' : 'collaborator',
        avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
        department: departments[0]?.name || 'Gestión Operativa',
        locationName: 'Planta Principal',
        countryName: countries[0]?.name || 'Argentina',
        countryFlag: countries[0]?.flagEmoji || '🇦🇷',
        activeStatus: 'En Campo'
      };
      onLogin(newUser);
      onClose();
    }
  };

  const handleQuickCollabSelect = (collab: Collaborator) => {
    onLogin({
      id: collab.id,
      name: collab.name,
      email: collab.email,
      role: collab.role,
      avatar: collab.avatar,
      department: collab.department,
      locationName: collab.locationName,
      countryName: collab.countryName,
      countryFlag: collab.countryFlag,
      activeStatus: collab.activeStatus
    });
    onClose();
  };

  const handleSaveProfileEdit = () => {
    if (!currentUser) return;
    const updated: UserSession = {
      ...currentUser,
      name: editName,
      department: editDepartment,
      activeStatus: editStatus as any
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme.bg} text-white shadow-sm`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentUser ? 'Perfil de Usuario y Autenticación' : 'Acceso a TeamOps - Iniciar Sesión'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser ? `Sesión activa: ${currentUser.email}` : 'Ingrese su email o seleccione un perfil corporativo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {currentUser ? (
            /* LOGGED IN USER VIEW */
            <div className="space-y-5">
              {/* User Avatar & Badge Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {currentUser.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        currentUser.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300' 
                          : currentUser.role === 'supervisor'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      }`}>
                        {currentUser.role === 'admin' ? '⚡ Administrador' : currentUser.role === 'supervisor' ? '👁️ Supervisor' : '🛠️ Colaborador'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      <span>{currentUser.countryFlag || '🌐'} {currentUser.countryName || 'Global'}</span>
                      <span>•</span>
                      <span>{currentUser.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    currentUser.activeStatus === 'En Campo' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    ● {currentUser.activeStatus || 'En Campo'}
                  </span>
                </div>
              </div>

              {/* Subtabs: Perfil vs Permisos */}
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-4">
                <button
                  onClick={() => setActiveSubTab('profile')}
                  className={`pb-2 font-bold text-xs transition-colors border-b-2 ${
                    activeSubTab === 'profile'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Información de Perfil
                </button>
                <button
                  onClick={() => setActiveSubTab('permissions')}
                  className={`pb-2 font-bold text-xs transition-colors border-b-2 ${
                    activeSubTab === 'permissions'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Nivel de Permisos y Matriz ABM
                </button>
              </div>

              {activeSubTab === 'profile' ? (
                <div className="space-y-4">
                  {!isEditing ? (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Detalles de la Cuenta</span>
                        <button
                          onClick={() => {
                            setEditName(currentUser.name);
                            setEditDepartment(currentUser.department);
                            setEditStatus(currentUser.activeStatus || 'En Campo');
                            setIsEditing(true);
                          }}
                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          Editar Datos
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Nombre Completo</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Correo Electrónico</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Departamento Asignado</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ubicación Base</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.locationName || 'Planta Operativa'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-3 border border-emerald-500/30">
                      <h4 className="font-bold text-slate-900 dark:text-white">Modificar mi Perfil</h4>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Departamento</label>
                        <select
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                        >
                          {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Estado Operativo</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                        >
                          <option value="En Campo">En Campo</option>
                          <option value="En Pausa">En Pausa</option>
                          <option value="Desconectado">Desconectado</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveProfileEdit}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Switch account demo list */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      Cambiar de Usuario (Acceso Rápido Demo):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {collaborators.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleQuickCollabSelect(c)}
                          className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                            c.email === currentUser.email
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                          <div className="truncate">
                            <div className="font-bold text-[11px] truncate">{c.name}</div>
                            <div className="text-[9px] text-slate-400 truncate">{c.email} • {c.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* PERMISSIONS MATRIX */
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Permisos del Rol: {currentUser.role.toUpperCase()}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Los permisos son administrados centralizadamente mediante el catálogo ABM de Roles.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Acceso a Módulo ABM (Gestión de Catálogos Maestros)', allowed: currentUser.role === 'admin' },
                      { name: 'Alta, Edición y Eliminar Tareas Operativas', allowed: currentUser.role === 'admin' || currentUser.role === 'supervisor' },
                      { name: 'Completar Tareas y Subir Firma / Evidencia', allowed: true },
                      { name: 'Exportación de Reportes PDF/Excel/CSV', allowed: currentUser.role === 'admin' || currentUser.role === 'supervisor' },
                      { name: 'Consumo y Testeo de API REST JSON', allowed: currentUser.role === 'admin' },
                      { name: 'Cambiar Configuración de Seguridad y Cifrado E2EE', allowed: currentUser.role === 'admin' }
                    ].map((perm, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{perm.name}</span>
                        {perm.allowed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Permitido
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                            Restringido
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 font-bold rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  Aceptar
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN FORM VIEW (WHEN NO CURRENT USER OR GUEST) */
            <div className="space-y-5">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-500" /> Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo: cesar.garetto@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Si el mail ya está registrado en el ABM, ingresará automáticamente con su rol asignado.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Contraseña / Token de Acceso
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl text-xs font-medium">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Ingresar a la Plataforma</span>
                </button>
              </form>

              {/* Quick Select demo profiles */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  O Seleccione un Perfil de Prueba (Acceso Directo ABM):
                </span>
                <div className="space-y-2">
                  {collaborators.map(collab => (
                    <button
                      key={collab.id}
                      onClick={() => handleQuickCollabSelect(collab)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={collab.avatar} alt={collab.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{collab.name}</div>
                          <div className="text-[10px] text-slate-500">{collab.email} • {collab.department}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        collab.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {collab.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
