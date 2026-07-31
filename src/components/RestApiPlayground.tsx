import React, { useState } from 'react';
import { 
  Code, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  Globe, 
  Lock 
} from 'lucide-react';
import { ApiEndpoint, ThemeConfig } from '../types';
import { API_ENDPOINTS } from '../data/mockData';
import { getThemeClasses } from '../utils/helpers';

interface RestApiPlaygroundProps {
  themeConfig: ThemeConfig;
}

export const RestApiPlayground: React.FC<RestApiPlaygroundProps> = ({ themeConfig }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [bearerToken, setBearerToken] = useState<string>('teamops_sec_tok_9918a23b_e2ee');
  const [customRequestBody, setCustomRequestBody] = useState<string>(selectedEndpoint.sampleRequest || '');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const theme = getThemeClasses(themeConfig.primaryColor);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setCustomRequestBody(ep.sampleRequest || '');
    setApiResponse(null);
  };

  // Test API endpoint live
  const handleExecuteApi = async () => {
    setIsLoadingApi(true);
    setApiResponse(null);

    try {
      let options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        }
      };

      if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
        options.body = customRequestBody || '{}';
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json();

      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: 'Error al ejecutar endpoint', details: err.message }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Generate copyable cURL string
  const generateCurl = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://app.teamops.com${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer ${bearerToken}" \\\n  -H "Content-Type: application/json"`;
    if ((selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && customRequestBody) {
      curl += ` \\\n  -d '${customRequestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Documentación de Integración
          </span>
          <span className="text-xs text-slate-400 font-mono">API REST v1.2</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          API REST Documentada & Playground Interactivo
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Integra la plataforma TeamOps con ERPs de terceros, sistemas de nómina, BI y tableros externos mediante endpoints RESTful seguros cifrados con E2EE.
        </p>
      </div>

      {/* Main Grid: Endpoints list & Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Endpoints Disponibles ({API_ENDPOINTS.length})
          </h3>

          <div className="space-y-2">
            {API_ENDPOINTS.map((ep, index) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;

              return (
                <div
                  key={index}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : ep.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : ep.method === 'PUT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white truncate">
                      {ep.path}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {ep.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Endpoint Inspector & Tester (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
            {/* Endpoint Inspector Title */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {selectedEndpoint.path}
                </code>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">Auth: Bearer Token</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedEndpoint.description}
            </p>

            {/* Authorization Token Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-500" /> Token de Autorización Bearer
              </label>
              <input
                type="text"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Request Body Input if POST/PUT */}
            {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cuerpo de la Petición (JSON Request Body)
                </label>
                <textarea
                  value={customRequestBody}
                  onChange={(e) => setCustomRequestBody(e.target.value)}
                  rows={4}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* cURL Code Snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" /> Comando cURL Equivalente
                </label>
                <button
                  onClick={handleCopyCurl}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? '¡Copiado!' : 'Copiar cURL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {generateCurl()}
              </pre>
            </div>

            {/* Execute Request Button */}
            <div className="pt-2">
              <button
                onClick={handleExecuteApi}
                disabled={isLoadingApi}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 ${theme.bg} ${theme.bgHover} shadow-md transition-all`}
              >
                <Play className={`w-4 h-4 ${isLoadingApi ? 'animate-spin' : ''}`} />
                <span>{isLoadingApi ? 'Ejecutando Petición API...' : 'Probar Endpoint en Tiempo Real'}</span>
              </button>
            </div>

            {/* Response Output Console */}
            {apiResponse && (
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Respuesta del Servidor (HTTP 200 OK)
                </label>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
