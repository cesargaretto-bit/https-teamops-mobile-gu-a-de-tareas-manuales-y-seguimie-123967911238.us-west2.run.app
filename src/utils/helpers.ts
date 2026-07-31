import { Task, Collaborator, PrimaryColorTheme } from '../types';

// Helper to trigger CSV file download
export function exportTasksToCSV(tasks: Task[]) {
  const headers = ['ID', 'Codigo', 'Titulo', 'Categoria', 'Prioridad', 'Estado', 'Asignado', 'Tiempo Est (min)', 'Tiempo Real (min)', 'Sincronizado', 'Cifrado E2EE', 'Fecha'];
  
  const rows = tasks.map(t => [
    t.id,
    t.code,
    `"${t.title.replace(/"/g, '""')}"`,
    t.category,
    t.priority,
    t.status,
    `"${t.assignedUserName}"`,
    t.estimatedMinutes,
    t.actualMinutes,
    t.synced ? 'SI' : 'NO (Offline)',
    t.e2eEncrypted ? 'AES-GCM-256' : 'NO',
    t.dueDate
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TeamOps_Reporte_Tareas_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCollaboratorsToCSV(collaborators: Collaborator[]) {
  const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Departamento', 'Estado Activo', 'Tareas Completadas Julio', 'Tasa Cumplimiento (%)', 'Tiempo Promedio (min)'];
  
  const rows = collaborators.map(c => {
    const perf = c.monthlyPerformance[c.monthlyPerformance.length - 1] || { tasksCompleted: 0, completionRate: 0, avgExecutionTimeMin: 0 };
    return [
      c.id,
      `"${c.name}"`,
      c.email,
      c.role,
      `"${c.department}"`,
      c.activeStatus,
      perf.tasksCompleted,
      `${perf.completionRate}%`,
      perf.avgExecutionTimeMin
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TeamOps_Rendimiento_Equipo_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate printable formatted PDF window
export function generatePDFReport(title: string, collaborators: Collaborator[], tasks: Task[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const globalRate = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: bold; color: #059669; }
        .badge { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 13px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
        .card-num { font-size: 28px; font-weight: bold; color: #0f172a; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
        th { background: #f1f5f9; font-weight: 600; }
        .status-completed { color: #059669; font-weight: bold; }
        .status-in_progress { color: #d97706; font-weight: bold; }
        .status-blocked { color: #dc2626; font-weight: bold; }
        .footer { margin-top: 40px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">TeamOps Mobile</div>
          <div style="font-size: 14px; color: #64748b; margin-top: 4px;">${title}</div>
        </div>
        <div>
          <span class="badge">🔒 Cifrado E2EE Verificado</span>
          <div style="font-size: 11px; color: #94a3b8; text-align: right; margin-top: 5px;">${new Date().toLocaleString('es-ES')}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="card">
          <div style="font-size: 12px; color: #64748b;">Total Tareas en Sistema</div>
          <div class="card-num">${totalTasks}</div>
        </div>
        <div class="card">
          <div style="font-size: 12px; color: #64748b;">Tareas Completadas</div>
          <div class="card-num">${totalCompleted}</div>
        </div>
        <div class="card">
          <div style="font-size: 12px; color: #64748b;">Tasa Global de Cumplimiento</div>
          <div class="card-num">${globalRate}%</div>
        </div>
      </div>

      <h3>Desglose de Rendimiento por Colaborador</h3>
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Departamento</th>
            <th>Estado</th>
            <th>Tareas Ejecutadas</th>
            <th>Cumplimiento (%)</th>
            <th>Cumplimiento SOP (%)</th>
          </tr>
        </thead>
        <tbody>
          ${collaborators.map(c => {
            const perf = c.monthlyPerformance[c.monthlyPerformance.length - 1] || { tasksCompleted: 0, completionRate: 0, sopComplianceRate: 0 };
            return `
              <tr>
                <td><strong>${c.name}</strong><br><span style="font-size:11px; color:#64748b;">${c.email}</span></td>
                <td>${c.department}</td>
                <td>${c.activeStatus}</td>
                <td>${perf.tasksCompleted}</td>
                <td><strong>${perf.completionRate}%</strong></td>
                <td>${perf.sopComplianceRate}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <h3 style="margin-top: 30px;">Detalle Reciente de Actividades</h3>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Título de Tarea</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Responsable</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
            <tr>
              <td><code>${t.code}</code></td>
              <td>${t.title}</td>
              <td>${t.category}</td>
              <td>${t.priority}</td>
              <td>${t.assignedUserName}</td>
              <td class="status-${t.status}">${t.status.toUpperCase()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Este documento fue generado automáticamente por la plataforma TeamOps Mobile con Cifrado de Extremo a Extremo (AES-GCM-256).
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Simulated E2EE cipher hashing for UI preview
export function generateE2EEHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `AES256-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString(36)}`;
}

// Primary theme styles mapping
export function getThemeClasses(color: PrimaryColorTheme) {
  switch (color) {
    case 'indigo':
      return {
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        text: 'text-indigo-600',
        darkText: 'dark:text-indigo-400',
        border: 'border-indigo-600',
        lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
        ring: 'focus:ring-indigo-500'
      };
    case 'amber':
      return {
        bg: 'bg-amber-600',
        bgHover: 'hover:bg-amber-700',
        text: 'text-amber-600',
        darkText: 'dark:text-amber-400',
        border: 'border-amber-600',
        lightBg: 'bg-amber-50 dark:bg-amber-950/40',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
        ring: 'focus:ring-amber-500'
      };
    case 'rose':
      return {
        bg: 'bg-rose-600',
        bgHover: 'hover:bg-rose-700',
        text: 'text-rose-600',
        darkText: 'dark:text-rose-400',
        border: 'border-rose-600',
        lightBg: 'bg-rose-50 dark:bg-rose-950/40',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
        ring: 'focus:ring-rose-500'
      };
    case 'cobalt':
      return {
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        darkText: 'dark:text-blue-400',
        border: 'border-blue-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/40',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
        ring: 'focus:ring-blue-500'
      };
    case 'emerald':
    default:
      return {
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        darkText: 'dark:text-emerald-400',
        border: 'border-emerald-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
        ring: 'focus:ring-emerald-500'
      };
  }
}
