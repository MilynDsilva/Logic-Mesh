import { useState } from 'react';
import type { Node } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LogicNodeData } from '../types/workflow';
import { NODE_CATALOG } from '../constants/nodeCatalog';
import { executeSingleNode } from '../engine/executor';
import { CredentialSelector } from './CredentialSelector';
import type { VaultCredentialItem } from './CredentialVaultModal';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node<LogicNodeData> | null;
  allNodes: Node<LogicNodeData>[];
  onUpdateParameters: (nodeId: string, parameters: Record<string, any>) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  env: Record<string, string>;
  credentials: VaultCredentialItem[];
  onOpenVault: () => void;
  onAddCredential: (cred: VaultCredentialItem) => void;
}

export const NodeConfigModal = ({
  isOpen,
  onClose,
  selectedNode,
  allNodes,
  onUpdateParameters,
  onUpdateLabel,
  onDeleteNode,
  onDuplicateNode,
  env,
  credentials = [],
  onOpenVault,
  onAddCredential,
}: NodeConfigModalProps) => {
  const [centerTab, setCenterTab] = useState<'parameters' | 'settings'>('parameters');
  const [inputViewMode, setInputViewMode] = useState<'json' | 'table'>('json');
  const [outputViewMode, setOutputViewMode] = useState<'json' | 'table'>('json');
  const [isExecutingStep, setIsExecutingStep] = useState(false);
  const [stepOutput, setStepOutput] = useState<Record<string, any> | null>(null);

  if (!isOpen || !selectedNode) return null;

  const catalogDef = NODE_CATALOG[selectedNode.data.nodeType];
  const parameters = selectedNode.data.parameters || catalogDef?.defaultParams || {};
  const IconComp = (Icons as any)[selectedNode.data.iconName || catalogDef?.iconName || 'Zap'] || Icons.Zap;
  const nodeColor = selectedNode.data.color || catalogDef?.color || '#3B82F6';

  // Find predecessor nodes to calculate input payload
  const predecessorNodes = allNodes.filter((n) => n.id !== selectedNode.id);
  const selectedPredecessor = predecessorNodes[0] || null;
  const inputPayload = selectedPredecessor?.data.lastOutput || catalogDef?.sampleOutput || {
    ticketId: 'TCK-9021',
    customer: 'Acme Corp',
    priority: 'HIGH',
    subject: 'Database sync failure on production cluster',
  };

  const currentOutput = stepOutput || selectedNode.data.lastOutput || catalogDef?.sampleOutput || {
    result: 'Success',
  };

  const handleParamChange = (paramId: string, value: any) => {
    const updated = { ...parameters, [paramId]: value };
    onUpdateParameters(selectedNode.id, updated);
  };

  const handleExecuteSingleStep = async () => {
    setIsExecutingStep(true);
    try {
      const nodeResultsByName: Record<string, any> = {};
      allNodes.forEach((n) => {
        if (n.data.lastOutput) nodeResultsByName[n.data.label] = n.data.lastOutput;
      });

      const { output } = await executeSingleNode(
        { ...selectedNode, data: { ...selectedNode.data, parameters } },
        inputPayload,
        nodeResultsByName,
        env
      );

      setStepOutput(output);
    } catch (err: any) {
      setStepOutput({ error: err.message || 'Execution error' });
    } finally {
      setIsExecutingStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 sm:p-6 animate-fade-in select-none">
      <div
        className="w-full max-w-7xl h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-2xl border border-slate-200 shrink-0 shadow-xs"
              style={{ backgroundColor: `${nodeColor}15`, color: nodeColor }}
            >
              <IconComp className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex items-center gap-2">
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => onUpdateLabel(selectedNode.id, e.target.value)}
                className="bg-transparent text-base font-bold text-slate-900 focus:outline-none focus:bg-white px-2 py-1 rounded-xl transition-all font-heading truncate border border-transparent focus:border-slate-300 shadow-2xs focus:shadow-xs"
              />
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-lg border border-slate-300/60">
                {selectedNode.data.nodeType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onDuplicateNode && (
              <button
                onClick={() => onDuplicateNode(selectedNode.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                title="Duplicate Node"
              >
                <Icons.Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Duplicate</span>
              </button>
            )}

            {onDeleteNode && (
              <button
                onClick={() => {
                  onDeleteNode(selectedNode.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200/80"
                title="Delete Node"
              >
                <Icons.Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={handleExecuteSingleStep}
              disabled={isExecutingStep}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Icons.Play className={`w-3.5 h-3.5 fill-current ${isExecutingStep ? 'animate-spin' : ''}`} />
              <span>{isExecutingStep ? 'Executing...' : 'Execute step'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer ml-1"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Column Body Layout */}
        <div className="flex-1 grid grid-cols-12 divide-x divide-slate-200 overflow-hidden bg-slate-50/50">
          {/* COLUMN 1: INPUT (3 cols) */}
          <div className="col-span-3 flex flex-col h-full bg-slate-50/70">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Icons.ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
                INPUT
              </span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setInputViewMode('json')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                    inputViewMode === 'json' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setInputViewMode('table')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                    inputViewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            <div className="p-3 border-b border-slate-200 bg-white/60">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">Predecessor Node</span>
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <Icons.Box className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{selectedPredecessor ? selectedPredecessor.data.label : 'Workflow Trigger Payload'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed border-t border-slate-200/80">
              {inputViewMode === 'json' ? (
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(inputPayload, null, 2)}</pre>
              ) : (
                <div className="space-y-2 font-sans">
                  {Object.entries(inputPayload).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white rounded-xl border border-slate-200 flex justify-between gap-2 shadow-2xs">
                      <span className="font-bold text-slate-800 text-[11px] font-mono">{k}</span>
                      <span className="text-[11px] text-slate-600 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: PARAMETERS & SETTINGS (6 cols) */}
          <div className="col-span-6 flex flex-col h-full bg-white">
            {/* Center Tabs */}
            <div className="px-5 py-2.5 border-b border-slate-200 flex items-center gap-6 bg-slate-50/50">
              <button
                onClick={() => setCenterTab('parameters')}
                className={`text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
                  centerTab === 'parameters'
                    ? 'border-orange-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Parameters
              </button>
              <button
                onClick={() => setCenterTab('settings')}
                className={`text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
                  centerTab === 'settings'
                    ? 'border-orange-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Center Controls Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {centerTab === 'parameters' ? (
                <div className="space-y-4">
                  {['ai_agent', 'http_request', 'mongodb_node', 'postgres_node', 'github_node', 'discord_node', 'redis_node'].includes(
                    selectedNode.data.nodeType
                  ) && (
                    <CredentialSelector
                      nodeType={selectedNode.data.nodeType}
                      selectedCredentialId={parameters.credentialId}
                      onSelectCredential={(credId) => handleParamChange('credentialId', credId)}
                      credentials={credentials}
                      onOpenVault={onOpenVault}
                      onAddCredential={onAddCredential}
                    />
                  )}

                  {catalogDef?.parameters
                    .filter((param) => param.id !== 'credentialId')
                    .map((param) => (
                    <div key={param.id} className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{param.name}</span>
                        {param.type === 'expression' && (
                          <span className="text-[10px] text-orange-700 font-mono font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            Mustache Expression
                          </span>
                        )}
                      </label>

                      {param.type === 'string' || param.type === 'expression' ? (
                        <input
                          type="text"
                          value={parameters[param.id] ?? ''}
                          onChange={(e) => handleParamChange(param.id, e.target.value)}
                          placeholder={param.placeholder}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs font-semibold"
                        />
                      ) : param.type === 'number' ? (
                        <input
                          type="number"
                          value={parameters[param.id] ?? 0}
                          onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-2xs font-mono font-semibold"
                        />
                      ) : param.type === 'select' ? (
                        <select
                          value={parameters[param.id] ?? param.default}
                          onChange={(e) => handleParamChange(param.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-2xs"
                        >
                          {param.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : param.type === 'code' || param.type === 'json' ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const val = parameters[param.id] ?? '';
                                if (!val && param.type === 'json') return null;
                                try {
                                  JSON.parse(val);
                                  return (
                                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                      <Icons.Check className="w-3 h-3" />
                                      <span>Valid JSON</span>
                                    </span>
                                  );
                                } catch (err: any) {
                                  return (
                                    <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1" title={err.message}>
                                      <Icons.AlertTriangle className="w-3 h-3" />
                                      <span>Syntax Error</span>
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const val = parameters[param.id] ?? '';
                                  try {
                                    const formatted = JSON.stringify(JSON.parse(val), null, 2);
                                    handleParamChange(param.id, formatted);
                                  } catch (e) {}
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-all cursor-pointer"
                                title="Prettify & Format JSON"
                              >
                                Format JSON
                              </button>
                              <button
                                type="button"
                                onClick={() => handleParamChange(param.id, param.default)}
                                className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-all cursor-pointer"
                                title="Reset to default parameter value"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={8}
                            value={parameters[param.id] ?? ''}
                            onChange={(e) => handleParamChange(param.id, e.target.value)}
                            placeholder={param.placeholder || '{\n  "key": "value"\n}'}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs leading-relaxed custom-scrollbar font-semibold min-h-[150px]"
                          />
                        </div>
                      ) : null}

                      {param.description && (
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {param.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">Execution Error Behavior</h4>
                    <select className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-700 shadow-2xs">
                      <option>Stop Workflow Execution</option>
                      <option>Continue Workflow on Error</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* n8n Expressions Tip Banner */}
            <div className="p-3.5 border-t border-slate-200 bg-orange-50 text-[11px] text-orange-900 font-medium flex items-center gap-2">
              <Icons.Info className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Type <code className="bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-mono font-bold border border-orange-200">$json</code> or <code className="bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-mono font-bold border border-orange-200">$node["NodeName"]</code> for dynamic variable expressions.
              </span>
            </div>
          </div>

          {/* COLUMN 3: OUTPUT (3 cols) */}
          <div className="col-span-3 flex flex-col h-full bg-slate-50/70">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Icons.ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                OUTPUT
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ 1 item
                </span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setOutputViewMode('json')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      outputViewMode === 'json' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setOutputViewMode('table')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      outputViewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed border-t border-slate-200/80">
              {outputViewMode === 'json' ? (
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(currentOutput, null, 2)}</pre>
              ) : (
                <div className="space-y-2 font-sans">
                  {Object.entries(currentOutput).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white rounded-xl border border-slate-200 flex justify-between gap-2 shadow-2xs">
                      <span className="font-bold text-slate-800 text-[11px] font-mono">{k}</span>
                      <span className="text-[11px] text-slate-600 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
