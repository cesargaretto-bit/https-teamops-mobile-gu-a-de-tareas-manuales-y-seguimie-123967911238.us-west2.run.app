import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  TrendingUp, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  PieChart, 
  BarChart, 
  UserCheck, 
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Task, Collaborator, Category, Priority, ThemeConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface AdminTrackerDashboardProps {
  collaborators: Collaborator[];
  tasks: Task[];
  onOpenCreateTaskModal: () => void;
  themeConfig: ThemeConfig;
}

export const AdminTrackerDashboard: React.FC<AdminTrackerDashboardProps> = ({
  collaborators,
  tasks,
  onOpenCreateTaskModal,
  themeConfig
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const theme = getThemeClasses(themeConfig.primaryColor);

  // Overall Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const globalCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart Data: Status Distribution
  const pieData = [
    { name: 'Completadas', value: completedTasks, color: '#10b981' },
    { name: 'En Proceso', value: inProgressTasks, color: '#f59e0b' },
    { name: 'Pendientes', value: pendingTasks, color: '#3b82f6' },
    { name: 'Bloqueadas', value: blockedTasks, color: '#ef4444' }
  ];

  // Chart Data: Department Performance Comparison
  const deptPerformanceData = [
    { department: 'Mantenimiento', completadas: 38, objetivo: 40, tasa: 95 },
    { department: 'Calidad', completadas: 44, objetivo: 45, tasa: 98 },
    { department: 'Seguridad', completadas: 31, objetivo: 36, tasa: 86 },
    { department: 'Operaciones', completadas: 55, objetivo: 56, tasa: 98 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Panel Administrativo de Seguimiento
            </span>
            <span className="text-xs text-slate-400">Actualizado en tiempo real</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Monitoreo Operativo de Equipo & Avances
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Seguimiento de presencia en campo, rendimiento mensual y asignación directa de actividades.
          </p>
        </div>

        <button
          onClick={onOpenCreateTaskModal}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 ${theme.bg} ${theme.bgHover} shadow-md transition-all shrink-0`}
        >
          <Plus className="w-4 h-4" />
          <span>Asignar Nueva Tarea</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Tasa de Cumplimiento</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {globalCompletionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ↑ 3.2% vs. mes anterior
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Tareas Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedTasks} / {totalTasks}
          </div>
          <div className="text-[11px] text-slate-400">
            {inProgressTasks} en proceso actual
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Alertas / Bloqueadas</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {blockedTasks}
          </div>
          <div className="text-[11px] text-red-500 font-medium">
            {blockedTasks > 0 ? 'Requiere atención inmediata' : 'Sin bloqueos críticos'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Colaboradores Activos</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {collaborators.filter(c => c.activeStatus !== 'Desconectado').length} / {collaborators.length}
          </div>
          <div className="text-[11px] text-slate-400">
            3 en campo, 1 en pausa
          </div>
        </div>
      </div>

      {/* Collaborator Live Status Cards */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Estado del Personal en Campo
          </h3>
          <span className="text-xs text-slate-400">Sincronización en vivo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {collaborators.map(c => {
            const lastPerf = c.monthlyPerformance[c.monthlyPerformance.length - 1];

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={c.avatar} 
                    alt={c.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {c.department}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-200 dark:border-slate-700/60 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Estado:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      c.activeStatus === 'En Campo'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : c.activeStatus === 'En Pausa'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {c.activeStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 truncate">
                    <span className="flex items-center gap-1 shrink-0 text-slate-400">
                      <MapPin className="w-3 h-3" /> Ubicación:
                    </span>
                    <span className="font-semibold truncate">{c.locationName || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Cumplimiento Julio:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {lastPerf?.completionRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Status Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Distribución de Tareas del Día
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Department Compliance Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-500" />
            Rendimiento por Departamento (%)
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={deptPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="tasa" fill="#10b981" radius={[4, 4, 0, 0]} name="Tasa de Cumplimiento (%)" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Promedio de cumplimiento normativo y resolución de tareas programadas.
          </p>
        </div>
      </div>
    </div>
  );
};
