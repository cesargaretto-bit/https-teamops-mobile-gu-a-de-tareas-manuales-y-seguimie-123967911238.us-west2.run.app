import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BarChart3,
  UserCheck,
  TrendingUp,
  Timer,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Task, Collaborator, ThemeConfig } from '../types';
import { exportTasksToCSV, exportCollaboratorsToCSV, generatePDFReport, getThemeClasses } from '../utils/helpers';

interface ReportsAndExportsProps {
  collaborators: Collaborator[];
  tasks: Task[];
  themeConfig: ThemeConfig;
}

export const ReportsAndExports: React.FC<ReportsAndExportsProps> = ({
  collaborators,
  tasks,
  themeConfig
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const theme = getThemeClasses(themeConfig.primaryColor);

  // --- KPI Chart 1: Monthly compliance trend (team average completion rate per month) ---
  const monthsSeen = Array.from(
    new Set(collaborators.flatMap(c => c.monthlyPerformance.map(m => m.month)))
  ).sort();
  const complianceTrendData = monthsSeen.map(month => {
    const entries = collaborators
      .map(c => c.monthlyPerformance.find(m => m.month === month))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    const avgCompletion = entries.length
      ? Math.round((entries.reduce((sum, e) => sum + e.completionRate, 0) / entries.length) * 10) / 10
      : 0;
    const avgSopCompliance = entries.length
      ? Math.round((entries.reduce((sum, e) => sum + e.sopComplianceRate, 0) / entries.length) * 10) / 10
      : 0;
    return { month, 'Cumplimiento (%)': avgCompletion, 'Apego a SOP (%)': avgSopCompliance };
  });

  // --- KPI Chart 2: Time efficiency per collaborator (real vs. estimated minutes) ---
  // Only counts tasks with actual work time logged (actualMinutes > 0), which is
  // populated automatically once a collaborator sets a start/end time on a task.
  const efficiencyData = collaborators.map(c => {
    const theirTasks = tasks.filter(t => t.assignedUserId === c.id && t.actualMinutes > 0);
    const realMin = theirTasks.reduce((sum, t) => sum + t.actualMinutes, 0);
    const estMin = theirTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const efficiency = realMin > 0 ? Math.round((estMin / realMin) * 100) : 0;
    return {
      name: c.name.split(' ')[0],
      'Tiempo Real (min)': realMin,
      'Tiempo Estimado (min)': estMin,
      eficiencia: efficiency,
      tasksWithTime: theirTasks.length
    };
  }).filter(d => d.tasksWithTime > 0);

  // --- KPI Chart 3: Workload (carga horaria) — total minutes worked per collaborator across all logged tasks ---
  const workloadData = collaborators.map(c => {
    const totalMin = tasks
      .filter(t => t.assignedUserId === c.id && t.actualMinutes > 0)
      .reduce((sum, t) => sum + t.actualMinutes, 0);
    return { name: c.name.split(' ')[0], 'Horas Trabajadas': Math.round((totalMin / 60) * 10) / 10 };
  }).filter(d => d['Horas Trabajadas'] > 0);

  return (
    <div className="space-y-6">
      {/* Banner & Quick Action Buttons */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Reportes & Exportación
            </span>
            <span className="text-xs text-slate-400">Exportación Multiformato</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rendimiento Mensual & Exportación de Datos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Genera documentos oficiales PDF o exporta hojas de cálculo CSV para auditorías, análisis externo y evaluación de equipo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => generatePDFReport('Reporte Mensual de Rendimiento Operativo', collaborators, tasks)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 ${theme.bg} ${theme.bgHover} shadow-md transition-all`}
          >
            <FileText className="w-4 h-4" />
            <span>Generar Reporte PDF</span>
          </button>

          <button
            onClick={() => exportTasksToCSV(tasks)}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-600"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Tareas CSV</span>
          </button>

          <button
            onClick={() => exportCollaboratorsToCSV(collaborators)}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-600"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Exportar Equipo CSV</span>
          </button>
        </div>
      </div>

      {/* Month Selector & Summary Metric Cards */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Seleccionar Período de Reporte:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="2026-07">Julio 2026 (Actual)</option>
          <option value="2026-06">Junio 2026</option>
          <option value="2026-05">Mayo 2026</option>
        </select>
      </div>

      {/* KPI Charts: Compliance & Efficiency Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Compliance Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Tendencia de Cumplimiento y Apego a SOP (Promedio del Equipo)
          </h3>
          {complianceTrendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Cumplimiento (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Apego a SOP (%)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Aún no hay historial mensual suficiente para graficar la tendencia.</p>
          )}
        </div>

        {/* Chart 2: Time Efficiency per Collaborator */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-500" />
            Eficiencia de Tiempo (Real vs. Estimado)
          </h3>
          {efficiencyData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Tiempo Estimado (min)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tiempo Real (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Todavía no hay tareas con hora de inicio y fin registradas. Se completa automáticamente cuando un colaborador carga su horario en el detalle de la tarea.
            </p>
          )}
          <p className="text-[10px] text-slate-400">
            Eficiencia = tiempo estimado ÷ tiempo real. Por encima de 100% significa que se resolvió más rápido que lo planificado.
          </p>
        </div>

        {/* Chart 3: Workload (carga horaria) per Collaborator */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-500" />
            Carga Horaria por Colaborador (horas trabajadas)
          </h3>
          {workloadData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="Horas Trabajadas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Sin datos de horario registrados todavía.</p>
          )}
        </div>
      </div>

      {/* Collaborator Performance Detailed Cards Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            Desglose Individual de Rendimiento por Colaborador
          </h3>
          <span className="text-xs text-slate-400">Datos verificados E2EE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Colaborador</th>
                <th className="p-4">Departamento</th>
                <th className="p-4 text-center">Tareas Ejecutadas</th>
                <th className="p-4 text-center">Tasa Cumplimiento</th>
                <th className="p-4 text-center">Apegos a SOP</th>
                <th className="p-4 text-center">Tiempo Prom. (min)</th>
                <th className="p-4 text-center">Incidentes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
              {collaborators.map(collab => {
                const perf = collab.monthlyPerformance.find(m => m.month === selectedMonth) 
                  || collab.monthlyPerformance[collab.monthlyPerformance.length - 1];

                return (
                  <tr key={collab.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={collab.avatar} 
                          alt={collab.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{collab.name}</div>
                          <div className="text-[11px] text-slate-400">{collab.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-medium">
                      {collab.department}
                    </td>

                    <td className="p-4 text-center font-mono font-bold">
                      {perf ? `${perf.tasksCompleted} / ${perf.tasksTotal}` : 'N/A'}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold font-mono ${
                        perf && perf.completionRate >= 95
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : perf && perf.completionRate >= 85
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {perf ? `${perf.completionRate}%` : 'N/A'}
                      </span>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {perf ? `${perf.sopComplianceRate}%` : 'N/A'}
                    </td>

                    <td className="p-4 text-center font-mono">
                      {perf ? `${perf.avgExecutionTimeMin}m (meta ${perf.targetTimeMin}m)` : 'N/A'}
                    </td>

                    <td className="p-4 text-center font-bold">
                      {perf && perf.safetyIncidents === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">0 (Limpio)</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">{perf?.safetyIncidents} registrado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
