import React, { useState } from 'react';
import { Plus, X, ListPlus, Shield, Wrench, Clock, MapPin } from 'lucide-react';
import { Task, Category, Priority, Procedure, Collaborator, ThemeConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  procedures: Procedure[];
  collaborators: Collaborator[];
  themeConfig: ThemeConfig;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  procedures,
  collaborators,
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
  const [stepsInput, setStepsInput] = useState<string>('Paso 1: Inspección de seguridad\nPaso 2: Ejecución según procedimiento\nPaso 3: Verificación de calidad');

  if (!isOpen) return null;

  const theme = getThemeClasses(themeConfig.primaryColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedCollab = collaborators.find(c => c.id === assignedUserId);
    const selectedSop = procedures.find(p => p.code === procedureRefCode);

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

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ubicación de Trabajo
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
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
