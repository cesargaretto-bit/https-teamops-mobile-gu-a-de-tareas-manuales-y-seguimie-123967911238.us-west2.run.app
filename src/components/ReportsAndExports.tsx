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
  Gauge,
  Users
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

type Granularity = 'day' | 'week' | 'month' | 'accumulated';

// ISO-8601 week key, e.g. "2026-W31"
function getIsoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return 'Sin fecha';
  const target = new Date(d.getTime());
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-S${String(weekNo).padStart(2, '0')}`;
}

export const ReportsAndExports: React.FC<ReportsAndExportsProps> = ({
  collaborators,
  tasks,
  themeConfig
}) => {
  // Current month, computed live so the period selector always includes
  // "this month" going forward without needing manual updates each month.
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const MONTH_LABELS: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril', '05': 'Mayo', '06': 'Junio',
    '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  const formatMonthLabel = (monthKey: string) => {
    const [year, monthNum] = monthKey.split('-');
    const label = `${MONTH_LABELS[monthNum] || monthNum} ${year}`;
    return monthKey === currentMonthKey ? `${label} (Actual)` : label;
  };

  const theme = getThemeClasses(themeConfig.primaryColor);

  // --- Period selector: now supports multi-selection of months ---
  const monthsSeen = Array.from(
    new Set([
      ...collaborators.flatMap(c => c.monthlyPerformance.map(m => m.month)),
      ...tasks.map(t => (t.dueDate || '').slice(0, 7)).filter(Boolean),
      currentMonthKey
    ])
  ).sort();
  const availableMonths = [...monthsSeen].sort().reverse();

  const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonthKey]);
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>('month');

  const togglePeriod = (monthKey: string) => {
    setSelectedMonths(prev =>
      prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey]
    );
  };
  const effectiveMonths = selectedMonths.length > 0 ? selectedMonths : availableMonths;

  // --- User (collaborator) multi-select filter, shared across every chart & table below ---
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const toggleUserFilter = (id: string) => {
    setSelectedUserIds(prev => (prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]));
  };
  const filteredCollaborators = selectedUserIds.length > 0
    ? collaborators.filter(c => selectedUserIds.includes(c.id))
    : collaborators;
  const filteredTasksByUser = selectedUserIds.length > 0
    ? tasks.filter(t => selectedUserIds.includes(t.assignedUserId))
    : tasks;

  // --- KPI Chart: Team Compliance (tasks completed vs. total), computed directly
  // from tasks so it can be broken down by day, week, current month or
  // accumulated across the selected periods — not just monthly averages. ---
  const tasksInSelectedPeriods = filteredTasksByUser.filter(t =>
    effectiveMonths.includes((t.dueDate || '').slice(0, 7))
  );

  const buildComplianceBuckets = (): { key: string; 'Cumplimiento (%)': number; total: number }[] => {
    if (granularity === 'accumulated') {
      const total = tasksInSelectedPeriods.length;
      const completed = tasksInSelectedPeriods.filter(t => t.status === 'completed').length;
      return [{
        key: effectiveMonths.length > 1 ? `${effectiveMonths.length} períodos acumulados` : formatMonthLabel(effectiveMonths[0] || currentMonthKey),
        'Cumplimiento (%)': total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
        total
      }];
    }

    const bucketFn = (t: Task) => {
      if (granularity === 'day') return t.dueDate || 'Sin fecha';
      if (granularity === 'week') return getIsoWeekKey(t.dueDate || '');
      return (t.dueDate || '').slice(0, 7);
    };

    const tally: Record<string, { total: number; completed: number }> = {};
    tasksInSelectedPeriods.forEach(t => {
      const key = bucketFn(t);
      if (!tally[key]) tally[key] = { total: 0, completed: 0 };
      tally[key].total += 1;
      if (t.status === 'completed') tally[key].completed += 1;
    });

    return Object.entries(tally)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({
        key: granularity === 'month' ? formatMonthLabel(key) : key,
        'Cumplimiento (%)': v.total > 0 ? Math.round((v.completed / v.total) * 1000) / 10 : 0,
        total: v.total
      }));
  };
  const teamComplianceData = buildComplianceBuckets();

  // --- Monthly compliance trend (team average completion rate per month) ---
  // Always includes the current month plus every month present in the
  // collaborators' recorded history, so it keeps updating automatically
  // period after period instead of needing hardcoded month options.
  const complianceTrendData = monthsSeen.map(month => {
    const entries = filteredCollaborators
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

  // --- Time efficiency per collaborator (real vs. estimated minutes) ---
  // Only counts tasks with actual work time logged (actualMinutes > 0), which is
  // populated automatically once a collaborator sets a start/end time on a task.
  const efficiencyData = filteredCollaborators.map(c => {
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

  // --- Workload (carga horaria) — total minutes worked per collaborator across all logged tasks ---
  const workloadData = filteredCollaborators.map(c => {
    const totalMin = tasks
      .filter(t => t.assignedUserId === c.id && t.actualMinutes > 0)
      .reduce((sum, t) => sum + t.actualMinutes, 0);
    return { name: c.name.split(' ')[0], 'Horas Trabajadas': Math.round((totalMin / 60) * 10) / 10 };
  }).filter(d => d['Horas Trabajadas'] > 0);

  // Aggregated performance for the collaborator table across every selected month
  const getAggregatedPerf = (collab: Collaborator) => {
    const entries = effectiveMonths
      .map(m => collab.monthlyPerformance.find(p => p.month === m))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (entries.length === 0) {
      return collab.monthlyPerformance[collab.monthlyPerformance.length - 1] || null;
    }
    const tasksCompleted = entries.reduce((sum, e) => sum + e.tasksCompleted, 0);
    const tasksTotal = entries.reduce((sum, e) => sum + e.tasksTotal, 0);
    return {
      tasksCompleted,
      tasksTotal,
      completionRate: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 1000) / 10 : 0,
      avgExecutionTimeMin: Math.round(entries.reduce((sum, e) => sum + e.avgExecutionTimeMin, 0) / entries.length),
      targetTimeMin: Math.round(entries.reduce((sum, e) => sum + e.targetTimeMin, 0) / entries.length),
      sopComplianceRate: Math.round((entries.reduce((sum, e) => sum + e.sopComplianceRate, 0) / entries.length) * 10) / 10,
      safetyIncidents: entries.reduce((sum, e) => sum + e.safetyIncidents, 0)
    };
  };

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
            onClick={() => generatePDFReport('Reporte Mensual de Rendimiento Operativo', filteredCollaborators, tasks)}
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

      {/* Filters: Period (multi-select) + Granularity + User (multi-select) */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Período(s):</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsPeriodFilterOpen(o => !o)}
            className={`px-3 py-1.5 rounded-lg font-bold border ${
              selectedMonths.length > 0
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {selectedMonths.length === 0
              ? 'Todos los períodos'
              : selectedMonths.length === 1
              ? formatMonthLabel(selectedMonths[0])
              : `${selectedMonths.length} períodos seleccionados`}
            {' '}▾
          </button>
          {isPeriodFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsPeriodFilterOpen(false)} />
              <div className="absolute z-20 mt-1 w-56 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 space-y-0.5">
                <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Elegir períodos</span>
                  {selectedMonths.length > 0 && (
                    <button onClick={() => setSelectedMonths([])} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      Limpiar
                    </button>
                  )}
                </div>
                {availableMonths.map(monthKey => (
                  <label key={monthKey} className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedMonths.includes(monthKey)}
                      onChange={() => togglePeriod(monthKey)}
                      className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{formatMonthLabel(monthKey)}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {([
            { id: 'day', label: 'Día' },
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mes Actual' },
            { id: 'accumulated', label: 'Meses Acumulados' }
          ] as { id: Granularity; label: string }[]).map(g => (
            <button
              key={g.id}
              onClick={() => setGranularity(g.id)}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                granularity === g.id
                  ? `${theme.bg} text-white shadow-sm`
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium ml-auto">
          <Users className="w-4 h-4 text-blue-500" />
          <span>Usuario(s):</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsUserFilterOpen(o => !o)}
            className={`px-3 py-1.5 rounded-lg font-bold border ${
              selectedUserIds.length > 0
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {selectedUserIds.length === 0 ? 'Todos' : `${selectedUserIds.length} seleccionado${selectedUserIds.length > 1 ? 's' : ''}`}
            {' '}▾
          </button>
          {isUserFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsUserFilterOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-64 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 space-y-0.5">
                <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Filtrar por usuario</span>
                  {selectedUserIds.length > 0 && (
                    <button onClick={() => setSelectedUserIds([])} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Limpiar
                    </button>
                  )}
                </div>
                {collaborators.map(c => (
                  <label key={c.id} className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(c.id)}
                      onChange={() => toggleUserFilter(c.id)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Charts: Compliance & Efficiency Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Team Compliance (Cumplimiento de Tareas del Equipo) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Cumplimiento de Tareas del Equipo
          </h3>
          {teamComplianceData.length > 0 && teamComplianceData.some(d => d.total > 0) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={teamComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="key" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="Cumplimiento (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No hay tareas registradas para el período y usuarios seleccionados.</p>
          )}
          <p className="text-[10px] text-slate-400">
            Cumplimiento = tareas completadas ÷ tareas totales del período. Usá los filtros de arriba para elegir período(s), granularidad (día/semana/mes/acumulado) y colaboradores.
          </p>
        </div>

        {/* Chart: Time Efficiency per Collaborator */}
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

        {/* Chart: Workload (carga horaria) per Collaborator */}
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
              {filteredCollaborators.map(collab => {
                const perf = getAggregatedPerf(collab);

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

      {/* Chart: Monthly Compliance Trend — placed at the end of the view, as requested */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
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
    </div>
  );
};
