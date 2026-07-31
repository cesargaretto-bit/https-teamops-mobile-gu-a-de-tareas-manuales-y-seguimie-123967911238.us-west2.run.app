import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Palette, 
  Lock, 
  UserCheck, 
  Bell, 
  Sliders,
  User,
  LogIn
} from 'lucide-react';
import { ThemeConfig, SecurityConfig, PushNotificationConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';
import { UserSession } from './UserProfileLoginModal';

interface HeaderNavbarProps {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  pendingSyncCount: number;
  currentRole: 'collaborator' | 'admin';
  setCurrentRole: (role: 'collaborator' | 'admin') => void;
  themeConfig: ThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  securityConfig: SecurityConfig;
  pushConfig: PushNotificationConfig;
  openSettingsModal: () => void;
  openUserProfileModal: () => void;
  currentUser: UserSession | null;
  activeTab: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  isOnline,
  setIsOnline,
  isSyncing,
  onManualSync,
  pendingSyncCount,
  currentRole,
  setCurrentRole,
  themeConfig,
  setThemeConfig,
  securityConfig,
  openSettingsModal,
  openUserProfileModal,
  currentUser
}) => {
  const theme = getThemeClasses(themeConfig.primaryColor);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${theme.bg} text-white flex items-center justify-center font-bold text-xl shadow-md transition-transform hover:scale-105`}>
            TO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-none">
                TeamOps <span className={`${theme.text} text-xs sm:text-sm font-semibold`}>Mobile</span>
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" />
                E2EE AES-256
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Guía Operativa, Manuales y Seguimiento en Tiempo Real
            </p>
          </div>
        </div>

        {/* Center Controls: Sync Status & Online Toggle */}
        <div className="flex items-center gap-2">
          {/* Online / Offline Switcher button */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={isOnline ? 'Simular cambio a Modo Sin Cobertura (Offline)' : 'Conectar a Red en Tiempo Real'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">En Línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Modo Offline</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            onClick={onManualSync}
            disabled={isSyncing || (!isOnline && pendingSyncCount === 0)}
            title="Sincronizar cambios guardados localmente"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
              isSyncing ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden md:inline">Sincronizar</span>
            {pendingSyncCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white font-bold rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                {pendingSyncCount}
              </span>
            )}
          </button>

          {/* Device Frame Toggle */}
          <button
            onClick={() => setThemeConfig(prev => ({ ...prev, simulatedMobileFrame: !prev.simulatedMobileFrame }))}
            title="Alternar vista de pantalla completa o marco de celular"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {themeConfig.simulatedMobileFrame ? (
              <Smartphone className="w-4 h-4 text-emerald-500" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right Controls: User Profile Button, Role Selector & Settings Modal */}
        <div className="flex items-center gap-2">
          {/* User Profile / Login button */}
          <button
            onClick={openUserProfileModal}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            title={currentUser ? `Perfil de ${currentUser.name} (${currentUser.email})` : 'Iniciar sesión por email'}
          >
            {currentUser ? (
              <>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                />
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[100px]">
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline">
                  Login Mail
                </span>
              </>
            )}
          </button>

          {/* Role selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setCurrentRole('collaborator')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                currentRole === 'collaborator'
                  ? `${theme.bg} text-white shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Colaborador
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                currentRole === 'admin'
                  ? `${theme.bg} text-white shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Settings & Personalization */}
          <button
            onClick={openSettingsModal}
            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative`}
            title="Ajustes de Tema, Notificaciones Push y Cifrado E2EE"
          >
            <Sliders className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
