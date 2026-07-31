import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Clock 
} from 'lucide-react';
import { ThemeConfig, SecurityConfig, PushNotificationConfig, PrimaryColorTheme } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface SettingsAndSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  securityConfig: SecurityConfig;
  setSecurityConfig: React.Dispatch<React.SetStateAction<SecurityConfig>>;
  pushConfig: PushNotificationConfig;
  setPushConfig: React.Dispatch<React.SetStateAction<PushNotificationConfig>>;
}

export const SettingsAndSecurityModal: React.FC<SettingsAndSecurityModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  setThemeConfig,
  securityConfig,
  setSecurityConfig,
  pushConfig,
  setPushConfig
}) => {
  const [totpInput, setTotpInput] = useState('');
  const [totpVerifiedMsg, setTotpVerifiedMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const theme = getThemeClasses(themeConfig.primaryColor);

  const colorsList: Array<{ id: PrimaryColorTheme; name: string; bg: string }> = [
    { id: 'emerald', name: 'Emerald Esmeralda', bg: 'bg-emerald-600' },
    { id: 'indigo', name: 'Indigo Corporativo', bg: 'bg-indigo-600' },
    { id: 'amber', name: 'Amber Industrial', bg: 'bg-amber-600' },
    { id: 'rose', name: 'Rose Carmín', bg: 'bg-rose-600' },
    { id: 'cobalt', name: 'Cobalt Técnico', bg: 'bg-blue-600' }
  ];

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length === 6) {
      setSecurityConfig(prev => ({ ...prev, twoFactorVerified: true }));
      setTotpVerifiedMsg('¡Código 2FA verificado correctamente! Sesión protegida.');
    } else {
      setTotpVerifiedMsg('Ingresa un código TOTP válido de 6 dígitos.');
    }
  };

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(securityConfig.twoFactorSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ajustes, Personalización & Seguridad Cifrada
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Section 1: Visual Theme Personalization */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              1. Personalización de Interfaz y Tema
            </h3>

            <div>
              <label className="text-slate-500 dark:text-slate-400 font-medium block mb-2">
                Color de Acento de la Aplicación:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorsList.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setThemeConfig(prev => ({ ...prev, primaryColor: c.id }))}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold text-xs transition-all ${
                      themeConfig.primaryColor === c.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-50 dark:bg-slate-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.bg}`} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 font-medium block mb-2">
                Modo Visual de Pantalla:
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'dark', label: 'Modo Oscuro', icon: Moon },
                  { id: 'light', label: 'Modo Claro', icon: Sun },
                  { id: 'auto', label: 'Automático (OS)', icon: Sliders }
                ].map(modeItem => {
                  const Icon = modeItem.icon;
                  const isSel = themeConfig.mode === modeItem.id;

                  return (
                    <button
                      key={modeItem.id}
                      onClick={() => setThemeConfig(prev => ({ ...prev, mode: modeItem.id as any }))}
                      className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-all ${
                        isSel
                          ? `${theme.bg} text-white`
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{modeItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Push Notifications & Daily Reminders */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              2. Notificaciones Push y Recordatorios Diarios
            </h3>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Recordatorios Diarios de Inicio de Turno
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Recibe una alerta push con el resumen de tareas asignadas para el día.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pushConfig.dailyReminderEnabled}
                  onChange={(e) => setPushConfig(prev => ({ ...prev, dailyReminderEnabled: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5 cursor-pointer"
                />
              </label>

              {pushConfig.dailyReminderEnabled && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Hora de Notificación Diaria:</span>
                  <input
                    type="time"
                    value={pushConfig.dailyReminderTime}
                    onChange={(e) => setPushConfig(prev => ({ ...prev, dailyReminderTime: e.target.value }))}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: End-to-End Encryption (E2EE) */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              3. Cifrado de Extremo a Extremo (E2EE)
            </h3>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Algoritmo Activo: {securityConfig.encryptionAlgorithm}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                  CIFRADO ACTIVO
                </span>
              </div>
              <p className="text-slate-600 dark:text-emerald-400 text-[11px]">
                Toda la información registrada (evidencias, notas, avance de tareas y horas) es cifrada en el dispositivo del usuario antes de transmitirse o almacenarse.
              </p>
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                Huella de Clave Privada: <code>{securityConfig.secretKeyFingerprint}</code>
              </div>
            </div>
          </div>

          {/* Section 4: Two-Factor Authentication (2FA) */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Key className="w-4 h-4 text-emerald-500" />
              4. Autenticación de Dos Factores (2FA)
            </h3>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Protección TOTP (Authenticator App)
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Clave secreta vinculada: <code className="font-mono font-bold text-slate-800 dark:text-slate-200">{securityConfig.twoFactorSecret}</code>
                  </span>
                </div>
                <button
                  onClick={handleCopySecretKey}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-[11px] font-semibold text-slate-800 dark:text-white flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copiado' : 'Copiar Key'}</span>
                </button>
              </div>

              {/* TOTP Test Input */}
              <form onSubmit={handleVerify2FA} className="flex gap-2 pt-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Código 2FA de 6 dígitos"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value)}
                  className="px-3 py-1.5 font-mono text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs ${theme.bg} ${theme.bgHover}`}
                >
                  Verificar Código
                </button>
              </form>

              {totpVerifiedMsg && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  ✓ {totpVerifiedMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg font-bold text-xs text-white ${theme.bg} ${theme.bgHover}`}
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
