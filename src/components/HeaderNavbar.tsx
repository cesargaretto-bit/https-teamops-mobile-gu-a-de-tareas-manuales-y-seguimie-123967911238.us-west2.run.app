import React, { useState, useEffect, useRef } from 'react';
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
  LogIn,
  Upload,
  X
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

  // Company logo: uploaded once and remembered on this device/browser, shown
  // on the right side of the header so each customer can brand the app.
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('teamops_company_logo');
      if (saved) setCompanyLogo(saved);
    } catch {
      // storage unavailable — logo just won't persist across reloads
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCompanyLogo(dataUrl);
      try {
        localStorage.setItem('teamops_company_logo', dataUrl);
      } catch {
        // storage unavailable — logo just won't persist across reloads
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    try {
      localStorage.removeItem('teamops_company_logo');
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2 ${
        themeConfig.simulatedMobileFrame ? '' : 'flex-wrap'
      }`}>
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${theme.bg} text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md transition-transform hover:scale-105 shrink-0`}>
            TO
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-lg tracking-tight leading-none whitespace-nowrap">
                Daily Ops <span className={`${theme.text} text-xs sm:text-sm font-semibold`}>Mobile</span>
              </h1>
              {!themeConfig.simulatedMobileFrame && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  E2EE AES-256
                </span>
              )}
            </div>
            {!themeConfig.simulatedMobileFrame && (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                Guía Operativa, Manuales y Seguimiento en Tiempo Real
              </p>
            )}
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
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                {!themeConfig.simulatedMobileFrame && <span className="hidden sm:inline">En Línea</span>}
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {!themeConfig.simulatedMobileFrame && <span>Modo Offline</span>}
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
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
            {!themeConfig.simulatedMobileFrame && <span className="hidden md:inline">Sincronizar</span>}
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
              <Smartphone className="w-4 h-4 text-blue-500" />
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
                  className="w-6 h-6 rounded-full object-cover border border-blue-500"
                />
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[100px]">
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-blue-500" />
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
              title="Colaborador"
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                currentRole === 'collaborator'
                  ? `${theme.bg} text-white shadow-sm`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {themeConfig.simulatedMobileFrame ? 'Colab.' : 'Colaborador'}
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

          {/* Company Logo (uploaded once, remembered on this device) */}
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          {companyLogo ? (
            <div className="relative group">
              <button
                onClick={() => logoFileInputRef.current?.click()}
                title="Cambiar logo de la compañía"
                className="flex items-center justify-center h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <img src={companyLogo} alt="Logo de la compañía" className="h-6 max-w-[96px] object-contain" />
              </button>
              <button
                onClick={handleRemoveLogo}
                title="Quitar logo"
                className="hidden group-hover:flex absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center shadow"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoFileInputRef.current?.click()}
              title="Cargar logo de la compañía"
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all text-xs font-medium shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              {!themeConfig.simulatedMobileFrame && <span className="hidden sm:inline">Logo</span>}
            </button>
          )}

          {/* Settings & Personalization */}
          <button
            onClick={openSettingsModal}
            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative`}
            title="Ajustes de Tema, Notificaciones Push y Cifrado E2EE"
          >
            <Sliders className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
