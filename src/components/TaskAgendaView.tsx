import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Repeat, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Layers,
  ListFilter
} from 'lucide-react';
import { Task, TaskStatus, ThemeConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface TaskAgendaViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSelectTaskDetail: (task: Task) => void;
  onOpenCreateTaskModal: () => void;
  themeConfig: ThemeConfig;
}

export const TaskAgendaView: React.FC<TaskAgendaViewProps> = ({
  tasks,
  onUpdateTask,
  onSelectTaskDetail,
  onOpenCreateTaskModal,
  themeConfig
}) => {
  const theme = getThemeClasses(themeConfig.primaryColor);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
      setSelectedDayDate(prevDay.toISOString().split('T')[0]);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
      setSelectedDayDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today.toISOString().split('T')[0]);
  };

  // Month Calendar Days Generator
  const getDaysInMonth = (y: number, m: number) => {
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(y, m, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const d = new Date(y, m - 1, pDay);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayNumber: pDay,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dStr === todayStr
      });
    }

    // Next month padding to fill grid to 35 or 42
    const remainingSlots = (42 - days.length) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(y, m + 1, i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  // Week Calendar Days Generator
  const getDaysInWeek = (date: Date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay(); // First day is Sunday
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.setDate(first + i));
      const dStr = next.toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNumber: next.getDate(),
        dayName: next.toLocaleDateString('es-ES', { weekday: 'short' }),
        isToday: dStr === todayStr
      });
    }
    return days;
  };

  // Helpers to get tasks by date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const selectedDayTasks = getTasksForDate(selectedDayDate);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title & Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize flex items-center gap-2">
              <span>Agenda de Tareas</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {tasks.length} programadas
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestión visual por calendario, programación de periodicidad y turnos operacionales.
            </p>
          </div>
        </div>

        {/* Date Navigator & View Mode Switches */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Month / Week / Day Switch */}
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              Semana
            </button>
            <button
              onClick={() => {
                setViewMode('day');
                setSelectedDayDate(new Date().toISOString().split('T')[0]);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              Día
            </button>
          </div>

          {/* Today Button & Nav Arrow */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Hoy
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white min-w-[120px] text-center capitalize font-mono">
              {monthName}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenCreateTaskModal}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white ${theme.bg} ${theme.bgHover} shadow-sm transition-all ml-auto`}
          >
            <Plus className="w-4 h-4" />
            <span>Crear Tarea</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-700/60 bg-slate-100 dark:bg-slate-900/40">
            {getDaysInMonth(year, month).map((dayObj, idx) => {
              const dayTasks = getTasksForDate(dayObj.dateStr);
              const isSelected = selectedDayDate === dayObj.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayDate(dayObj.dateStr)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-all cursor-pointer ${
                    dayObj.isCurrentMonth
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'bg-slate-50/70 dark:bg-slate-900/20 text-slate-400 dark:text-slate-600'
                  } ${
                    dayObj.isToday
                      ? 'ring-2 ring-emerald-500 ring-inset font-bold'
                      : ''
                  } ${
                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                        dayObj.isToday
                          ? 'bg-emerald-500 text-white'
                          : isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayObj.dayNumber}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Badges Preview inside cell */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTaskDetail(task);
                        }}
                        className={`text-[11px] p-1 rounded font-semibold truncate flex items-center gap-1 border transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                            : task.status === 'blocked'
                            ? 'bg-red-100/80 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-blue-200 dark:border-slate-600'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                        <span className="truncate">{task.code}: {task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-bold pl-1">
                        + {dayTasks.length - 2} más
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-right text-slate-400 font-mono">
                    {dayObj.dateStr.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {getDaysInWeek(currentDate).map((dayObj, idx) => {
            const dayTasks = getTasksForDate(dayObj.dateStr);
            const isSelected = selectedDayDate === dayObj.dateStr;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayDate(dayObj.dateStr)}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-3 flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                  dayObj.isToday ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'
                } ${isSelected ? 'shadow-md bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block">{dayObj.dayName}</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{dayObj.dayNumber}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dayTasks.length ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    {dayTasks.length} tareas
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {dayTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-4">Sin tareas</p>
                  ) : (
                    dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTaskDetail(t);
                        }}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{t.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            {t.periodicity === 'diaria' ? '🔄' : t.periodicity === 'semanal' ? '📅' : t.periodicity === 'mensual' ? '🗓️' : '⚡'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">{t.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">👤 {t.assignedUserName}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY / SELECTED DAY DETAILS PANEL */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detalle de Agenda para el día: <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedDayDate}</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
            {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'tarea asignada' : 'tareas asignadas'}
          </span>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No hay tareas programadas específicamente para el {selectedDayDate}.
            </p>
            <button
              onClick={onOpenCreateTaskModal}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Programar Tarea para Este Día
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTaskDetail(task)}
                className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all shadow-sm space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {task.code}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                    task.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : task.status === 'blocked'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {task.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {task.assignedUserName}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    <Repeat className="w-3.5 h-3.5" />
                    {task.periodicity === 'diaria' ? 'Diaria' : task.periodicity === 'semanal' ? 'Semanal' : task.periodicity === 'mensual' ? 'Mensual' : 'Única'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
