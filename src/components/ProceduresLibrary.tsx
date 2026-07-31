import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ShieldAlert, 
  Wrench, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  AlertOctagon,
  Clock
} from 'lucide-react';
import { Procedure, Category, ThemeConfig } from '../types';
import { getThemeClasses } from '../utils/helpers';

interface ProceduresLibraryProps {
  procedures: Procedure[];
  themeConfig: ThemeConfig;
  selectedProcedureCodeModal?: string | null;
  onClearProcedureCodeModal?: () => void;
}

export const ProceduresLibrary: React.FC<ProceduresLibraryProps> = ({
  procedures,
  themeConfig,
  selectedProcedureCodeModal,
  onClearProcedureCodeModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProcedure, setActiveProcedure] = useState<Procedure | null>(
    selectedProcedureCodeModal 
      ? procedures.find(p => p.code === selectedProcedureCodeModal) || procedures[0]
      : procedures[0] || null
  );

  // Gemini AI Assistant Chat State
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: '¡Hola! Soy tu Asistente AI de Procedimientos y Seguridad Industrial. ¿Tienes alguna duda sobre pasos de operación, EPP requerido o qué hacer ante un imprevisto?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const theme = getThemeClasses(themeConfig.primaryColor);

  // Filter procedures
  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = 
      proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || proc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle Ask Gemini AI
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isLoadingAi) return;

    const userText = aiQuery.trim();
    setAiQuery('');

    const newUserMsg = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, newUserMsg]);
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/gemini/sop-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userText,
          procedureContext: activeProcedure ? { code: activeProcedure.code, title: activeProcedure.title, steps: activeProcedure.steps } : null
        })
      });

      const data = await response.json();
      if (data.answer) {
        setAiMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: data.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setAiMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: data.error || 'Ocurrió un inconveniente al consultar el asistente. Intenta de nuevo.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error de conexión con el servidor de IA Gemini. Verifica tu red.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700/80 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            Biblioteca de Manuales SOP Vigentes
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Manuales de Procedimientos Internos & Seguridad
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Consulta los instructivos estandarizados paso a paso, equipos de protección requeridos (EPP) y resuelve dudas operativas en tiempo real con inteligencia artificial.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Procedure Selector, Right Procedure Viewer & Gemini AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar manual por código o palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs pt-1">
              {['all', 'Seguridad', 'Mantenimiento', 'Calidad', 'Operaciones'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedCategory === cat
                      ? `${theme.bg} text-white`
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Procedures List Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProcedures.map(proc => {
              const isSelected = activeProcedure?.id === proc.id;

              return (
                <div
                  key={proc.id}
                  onClick={() => setActiveProcedure(proc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                      {proc.code}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold">
                      {proc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono ml-auto">
                      {proc.version}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {proc.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {proc.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{proc.estimatedMinutes} mins
                    </span>
                    <span>Actualizado: {proc.lastUpdated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Procedure Inspector & AI Assistant (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeProcedure ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Manual Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      {activeProcedure.code}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {activeProcedure.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Versión: {activeProcedure.version}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Norma Vigente
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeProcedure.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {activeProcedure.summary}
                </p>

                {/* EPP Safety Equipment Required Badges */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Equipo de Protección Personal Requerido (EPP)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProcedure.requiredSafetyEquipment.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium"
                      >
                        ✓ {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step by Step Instructions */}
              <div className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Instructivo Paso a Paso
                </h3>

                <div className="space-y-4">
                  {activeProcedure.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                          Paso {step.stepNumber}
                        </span>
                        {step.requiredTool && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Wrench className="w-3 h-3 text-slate-400" />
                            {step.requiredTool}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {step.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {step.instruction}
                      </p>

                      {step.safetyWarning && (
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-medium flex items-start gap-2">
                          <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{step.safetyWarning}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
              Selecciona un procedimiento de la izquierda para visualizar el manual completo.
            </div>
          )}

          {/* Gemini AI Procedure Assistant Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${theme.bg} text-white`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Asistente AI de Procedimientos (Gemini 3.6 Flash)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aclaraciones operativas en campo, solución de problemas y dudas de EPP en tiempo real.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Box History */}
            <div className="space-y-3 max-h-60 overflow-y-auto p-1 text-xs">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? `${theme.bg} text-white font-medium rounded-tr-none`
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] opacity-70 mt-1 text-right">{msg.time}</div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoadingAi && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Consultando norma y manuales con Gemini AI...</span>
                </div>
              )}
            </div>

            {/* AI Form Input */}
            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: ¿Qué EPP necesito si detecto una fuga de aceite?"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isLoadingAi || !aiQuery.trim()}
                className={`px-4 py-2 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 ${theme.bg} ${theme.bgHover} disabled:opacity-50`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
