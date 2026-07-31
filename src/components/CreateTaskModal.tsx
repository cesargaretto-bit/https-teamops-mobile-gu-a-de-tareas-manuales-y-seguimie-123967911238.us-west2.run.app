import React, { useState } from 'react';
import { Plus, X, ListPlus, Shield, Wrench, Clock, MapPin, Globe, Calendar, Repeat } from 'lucide-react';
import { Task, Category, Priority, Procedure, Collaborator, ThemeConfig, Country, LocationDefinition, TaskPeriodicity } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  procedures: Procedure[];
  collaborators: Collaborator[];
  countries?: Country[];
  locations?: LocationDefinition[];
  themeConfig: ThemeConfig;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  procedures,
  collaborators,
  countries = [],
  locations = [],
  themeConfig
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Mantenimiento');
  const [priority, setPriority] = useState<Priority>('Media');
  const [assignedUserId, setAssignedUserId] = useState(collaborators[0]?.id || 'usr-1');
  const [procedureRefCode, setProcedureRefCode] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [locationName, setLocationName] = useState('Planta Principal - Nivel 1');
  const [countryId, setCountryId] = useState<string>(countries[0]?.id || 'cnt-ar');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periodicity, setPeriodicity] = useState<TaskPeriodicity>('unica');
  const [periodEndDate, setPeriodEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [stepsInput, setStepsInput] = useState<string>('Paso 1: Inspección de seguridad\nPaso 2: Ejecución según procedimiento\nPaso 3: Verificación de calidad');

  // Max horizon: 1 year from current date
  const max1YearDate = React.useMemo(() => {
    const d = new Date(dueDate || new Date());
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }, [dueDate]);

  // Estimate number of tasks to generate
  const estimatedCount = React.useMemo(() => {
    if (periodicity === 'unica' || !periodEndDate) return 1;
    const start = new Date(dueDate + 'T00:00:00');
    const end = new Date(periodEndDate + 'T23:59:59');
    if (end < start) return 1;

    let count = 0;
    let curr = new Date(start);
    const maxHorizon = new Date(start);
    maxHorizon.setFullYear(maxHorizon.getFullYear() + 1);
    const effEnd = end > maxHorizon ? maxHorizon : end;

    while (curr <= effEnd && count < 365) {
      count++;
      if (periodicity === 'diaria') {
        curr.setDate(curr.getDate() + 1);
      } else if (periodicity === 'semanal') {
        curr.setDate(curr.getDate() + 7);
      } else if (periodicity === 'mensual') {
        curr.setMonth(curr.getMonth() + 1);
      } else {
        break;
      }
    }
    return count;
  }, [dueDate, periodicity, periodEndDate]);

  if (!isOpen) return null;

  const theme = getThemeClasses(themeConfig.primaryColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedCollab = collaborators.find(c => c.id === assignedUserId);
    const selectedSop = procedures.find(p => p.code === procedureRefCode);
    const selectedCountry = countries.find(c => c.id === countryId);

    const stepsArray = stepsInput
      .split('\n')
      .filter(s => s.trim())
      .map((s, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        title: s.trim(),
        completed: false
      }));

    onCreateTask({
      title,
      description,
      category,
      priority,
      assignedUserId,
      assignedUserName: assignedCollab?.name || 'Carlos Mendoza',
      procedureRefCode: selectedSop?.code || undefined,
      procedureRefTitle: selectedSop?.title || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      locationName,
      countryId: selectedCountry?.id || 'cnt-ar',
      countryName: selectedCountry?.name || 'Argentina',
      countryFlag: selectedCountry?.flagEmoji || '🇦🇷',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      periodicity: periodicity,
      periodEndDate: periodicity !== 'unica' ? periodEndDate : undefined,
      steps: stepsArray.length > 0 ? stepsArray : [{ id: 's1', title: 'Verificación inicial', completed: false }]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Asignar Nueva Tarea Operativa
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Calibración de Manómetros de Entrada"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Descripción / Instrucciones Específicas
            </label>
            <textarea
              rows={2}
              placeholder="Detalles importantes para el operador..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Calidad">Calidad</option>
                <option value="Inventario">Inventario</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Colaborador Asignado
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Manual SOP Asociado
              </label>
              <select
                value={procedureRefCode}
                onChange={(e) => setProcedureRefCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">-- Sin Manual Vincular --</option>
                {procedures.map(p => (
                  <option key={p.id} value={p.code}>{p.code}: {p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Periodicity Section */}
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Programación Temporal & Recurrencia</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Horizonte máx: 1 Año
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Fecha Inicial de Ejecución
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setDueDate(newStart);
                    if (periodEndDate < newStart) {
                      setPeriodEndDate(newStart);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Periodicidad de Tarea
                </label>
                <select
                  value={periodicity}
                  onChange={(e) => setPeriodicity(e.target.value as TaskPeriodicity)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="unica">Puntual / Única Ejecución</option>
                  <option value="diaria">🔄 Diaria (Cada jornada)</option>
                  <option value="semanal">📅 Semanal (Cada 7 días)</option>
                  <option value="mensual">🗓️ Mensual (Cada 30 días)</option>
                </select>
              </div>
            </div>

            {/* Selection of Period Validity / Expiry horizon when periodic */}
            {periodicity !== 'unica' && (
              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-emerald-500" />
                    Vigencia del Período Recurrente:
                  </label>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    {estimatedCount} {estimatedCount === 1 ? 'tarea' : 'tareas a registrar'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Fecha Fin de Vigencia (Hasta):
                    </span>
                    <input
                      type="date"
                      min={dueDate}
                      max={max1YearDate}
                      value={periodEndDate}
                      onChange={(e) => setPeriodEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Accesos Rápidos de Período:
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(dueDate + 'T00:00:00');
                          d.setMonth(d.getMonth() + 1);
                          setPeriodEndDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-1.5 py-1 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-[10px] font-bold text-slate-700 dark:text-slate-200 rounded transition-all"
                      >
                        1Mes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(dueDate + 'T00:00:00');
                          d.setMonth(d.getMonth() + 3);
                          setPeriodEndDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-1.5 py-1 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-[10px] font-bold text-slate-700 dark:text-slate-200 rounded transition-all"
                      >
                        3Meses
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(dueDate + 'T00:00:00');
                          d.setMonth(d.getMonth() + 6);
                          setPeriodEndDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-1.5 py-1 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-[10px] font-bold text-slate-700 dark:text-slate-200 rounded transition-all"
                      >
                        6Meses
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodEndDate(max1YearDate);
                        }}
                        className="px-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded transition-all"
                      >
                        1Año
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                  <span>⚡ <strong>Autogeneración:</strong> Se registrarán automáticamente <strong>{estimatedCount}</strong> tareas con periodicidad {periodicity}.</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                País de la Organización
              </label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold"
              >
                {countries.length > 0 ? (
                  countries.map(c => (
                    <option key={c.id} value={c.id}>{c.flagEmoji} {c.name} ({c.code})</option>
                  ))
                ) : (
                  <>
                    <option value="cnt-ar">🇦🇷 Argentina</option>
                    <option value="cnt-mx">🇲🇽 México</option>
                    <option value="cnt-br">🇧🇷 Brasil</option>
                    <option value="cnt-cl">🇨🇱 Chile</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tiempo Estimado (Minutos)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Ubicación / Planta
            </label>
            {locations && locations.length > 0 ? (
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.name}>{l.name} ({l.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Pasos del Checklist (Un paso por línea)
            </label>
            <textarea
              rows={3}
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-800 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-xs text-white ${theme.bg} ${theme.bgHover}`}
            >
              Crear & Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
