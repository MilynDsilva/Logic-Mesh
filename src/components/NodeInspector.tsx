import React, { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LogicNodeData } from '../types/workflow';
import { NODE_CATALOG } from '../constants/nodeCatalog';
import { evaluateExpression } from '../engine/evaluator';
import { ExpressionPicker } from './ExpressionPicker';
import { CredentialSelector } from './CredentialSelector';
import type { VaultCredentialItem } from './CredentialVaultModal';

interface NodeInspectorProps {
  selectedNode: Node<LogicNodeData> | null;
  onUpdateParameters: (nodeId: string, parameters: Record<string, any>) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onClose: () => void;
  nodeResults?: Record<string, any>;
  env?: Record<string, string>;
  isExecuting?: boolean;
  credentials?: VaultCredentialItem[];
  onOpenVault?: () => void;
  onAddCredential?: (cred: VaultCredentialItem) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  onUpdateParameters,
  onUpdateLabel,
  onDeleteNode,
  onDuplicateNode,
  onClose,
  nodeResults = {},
  env = {},
  isExecuting = false,
  credentials = [],
  onOpenVault = () => {},
  onAddCredential = () => {},
}) => {
  if (!selectedNode) return null;

  const catalogDef = NODE_CATALOG[selectedNode.data.nodeType];
  const [activeTab, setActiveTab] = useState<'setup' | 'integration' | 'testing'>('setup');
  const [label, setLabel] = useState(selectedNode.data.label);
  const [parameters, setParameters] = useState<Record<string, any>>(
    selectedNode.data.parameters || catalogDef?.defaultParams || {}
  );
  const [testOutput, setTestOutput] = useState<Record<string, any> | null>(
    selectedNode.data.lastOutput || catalogDef?.sampleOutput || null
  );
  const [expressionInput, setExpressionInput] = useState('{{ $json.ticketId || $json.customer }}');
  const [activeParamId, setActiveParamId] = useState<string | null>(null);

  const isNodeRunning = selectedNode.data.status === 'running' || isExecuting;

  useEffect(() => {
    setLabel(selectedNode.data.label);
    setParameters(selectedNode.data.parameters || catalogDef?.defaultParams || {});
    setTestOutput(selectedNode.data.lastOutput || catalogDef?.sampleOutput || null);
  }, [selectedNode]);

  const handleParamChange = (paramId: string, value: any) => {
    const updated = { ...parameters, [paramId]: value };
    setParameters(updated);
    onUpdateParameters(selectedNode.id, updated);
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onUpdateLabel(selectedNode.id, newLabel);
  };

  const handleInsertVariable = (exprStr: string) => {
    if (activeTab === 'testing') {
      setExpressionInput((prev) => `${prev} ${exprStr}`);
    } else if (activeParamId) {
      const currVal = parameters[activeParamId] ?? '';
      handleParamChange(activeParamId, `${currVal} ${exprStr}`.trim());
    }
  };

  const evaluatedExpressionResult = evaluateExpression(expressionInput, {
    json: testOutput || catalogDef?.sampleOutput || {},
    nodeResults,
    env,
  });

  const IconComp = (Icons as any)[selectedNode.data.iconName || catalogDef?.iconName || 'Zap'] || Icons.Zap;
  const nodeColor = selectedNode.data.color || catalogDef?.color || '#3B82F6';

  return (
    <aside className="w-96 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-3.5rem)] z-10 select-none shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2 rounded-xl border border-slate-200 shrink-0 shadow-2xs"
            style={{ backgroundColor: `${nodeColor}15`, color: nodeColor }}
          >
            <IconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-0.5 border border-transparent hover:border-slate-300 transition-all w-full truncate font-heading"
            />
            <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5 px-2">
              {catalogDef?.name || selectedNode.data.nodeType}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>

      {/* Flowaxon Inspector Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'setup'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Icons.CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Setup</span>
        </button>
        <button
          onClick={() => setActiveTab('integration')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'integration'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Icons.Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>Integration</span>
        </button>
        <button
          onClick={() => setActiveTab('testing')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'testing'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Icons.RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isNodeRunning ? 'animate-spin' : ''}`} />
          <span>Testing</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
        {/* Setup Tab (Parameters & Logic Configuration) */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            {/* Error Notification Alert Banner (Flowaxon Style) */}
            {selectedNode.data.status === 'error' && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 shadow-2xs">
                <Icons.AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block">Authentication or Execution Error</span>
                  <span>Please check parameter bindings and credentials.</span>
                </div>
              </div>
            )}

            {/* Credential / API Key Selector (n8n Style) */}
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

            {/* Click-to-Insert Variable Picker */}
            <ExpressionPicker
              sampleJson={testOutput || catalogDef?.sampleOutput || {}}
              onSelectVariable={handleInsertVariable}
            />

            {catalogDef?.parameters
              .filter((param) => param.id !== 'credentialId')
              .map((param) => (
              <div key={param.id} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{param.name}</span>
                  {param.type === 'expression' && (
                    <span className="text-[10px] text-blue-600 font-mono font-medium">
                      Mustache Expr
                    </span>
                  )}
                </label>

                {param.type === 'string' || param.type === 'expression' ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={parameters[param.id] ?? ''}
                      onFocus={() => setActiveParamId(param.id)}
                      onChange={(e) => handleParamChange(param.id, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={parameters[param.id] ?? 0}
                    onFocus={() => setActiveParamId(param.id)}
                    onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                  />
                ) : param.type === 'select' ? (
                  <select
                    value={parameters[param.id] ?? param.default}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs font-semibold"
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
                      rows={6}
                      value={parameters[param.id] ?? ''}
                      onFocus={() => setActiveParamId(param.id)}
                      onChange={(e) => handleParamChange(param.id, e.target.value)}
                      placeholder={param.placeholder || '{ "key": "value" }'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs leading-relaxed custom-scrollbar font-semibold"
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
        )}

        {/* Integration Tab (Live Credentials & API Bindings) */}
        {activeTab === 'integration' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Icons.Globe className="w-4 h-4 text-blue-600" />
                <span>Endpoint Connection</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Configure HTTP headers, OAuth tokens, and environment secrets for this node step.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Environment Secret ($env)</label>
                <input
                  type="text"
                  placeholder="e.g. $env.DATABASE_URL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headers / Query Parameters</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Insert data"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                  <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">
                    <Icons.Plus className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 flex items-center gap-1">
                  <Icons.Plus className="w-3.5 h-3.5" />
                  <span>Add value</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab (JSON Payload & Expression Evaluator) */}
        {activeTab === 'testing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {isNodeRunning && <Icons.Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                <span>Latest Output JSON</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {isNodeRunning
                  ? 'Executing...'
                  : selectedNode.data.executionTimeMs
                  ? `${selectedNode.data.executionTimeMs}ms`
                  : '200 OK'}
              </span>
            </div>

            {isNodeRunning ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 min-h-[180px]">
                <Icons.Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                <span className="text-xs font-bold text-slate-700">Executing Node Step...</span>
              </div>
            ) : (
              <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-72 leading-relaxed shadow-inner">
                {JSON.stringify(testOutput || catalogDef?.sampleOutput, null, 2)}
              </pre>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Test Expression Evaluation
              </label>
              <input
                type="text"
                value={expressionInput}
                onChange={(e) => setExpressionInput(e.target.value)}
                placeholder="e.g. {{ $json.user.email }}"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  Evaluated Result:
                </span>
                <p className="text-xs font-mono text-blue-700 font-bold break-all">
                  {evaluatedExpressionResult}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <button
          onClick={() => onDuplicateNode(selectedNode.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/80 border border-slate-200 bg-white shadow-2xs transition-all"
        >
          <Icons.Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>Duplicate</span>
        </button>

        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100/80 border border-rose-200 bg-rose-50/50 transition-all"
        >
          <Icons.Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
};

