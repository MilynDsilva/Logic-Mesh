import React, { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LogicNodeData } from '../types/workflow';
import { NODE_CATALOG } from '../constants/nodeCatalog';
import { evaluateExpression } from '../engine/evaluator';

interface NodeInspectorProps {
  selectedNode: Node<LogicNodeData> | null;
  onUpdateParameters: (nodeId: string, parameters: Record<string, any>) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onClose: () => void;
  nodeResults?: Record<string, any>;
  env?: Record<string, string>;
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
}) => {
  if (!selectedNode) return null;

  const catalogDef = NODE_CATALOG[selectedNode.data.nodeType];
  const [activeTab, setActiveTab] = useState<'params' | 'output' | 'expression'>('params');
  const [label, setLabel] = useState(selectedNode.data.label);
  const [parameters, setParameters] = useState<Record<string, any>>(
    selectedNode.data.parameters || catalogDef?.defaultParams || {}
  );
  const [testOutput, setTestOutput] = useState<Record<string, any> | null>(
    selectedNode.data.lastOutput || catalogDef?.sampleOutput || null
  );
  const [expressionInput, setExpressionInput] = useState('{{ $json.ticketId || $json.customer }}');

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

  const evaluatedExpressionResult = evaluateExpression(expressionInput, {
    json: testOutput || catalogDef?.sampleOutput || {},
    nodeResults,
    env,
  });

  const IconComp = (Icons as any)[selectedNode.data.iconName || catalogDef?.iconName || 'Zap'] || Icons.Zap;
  const nodeColor = selectedNode.data.color || catalogDef?.color || '#FF5C49';

  return (
    <aside className="w-96 bg-[#12141C] border-l border-white/10 flex flex-col h-[calc(100vh-3.5rem)] z-10 select-none shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2 rounded-lg border border-white/10 shrink-0"
            style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
          >
            <IconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:bg-[#1A1D2B] focus:ring-1 focus:ring-[#FF5C49] rounded px-1.5 py-0.5 border border-transparent hover:border-white/10 transition-all w-full truncate"
            />
            <p className="text-[11px] font-mono text-gray-400 truncate mt-0.5">
              {catalogDef?.name || selectedNode.data.nodeType}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#161824]">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'params'
              ? 'border-[#FF5C49] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'output'
              ? 'border-[#FF5C49] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          JSON Data
        </button>
        <button
          onClick={() => setActiveTab('expression')}
          className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'expression'
              ? 'border-[#FF5C49] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Expression Tester
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activeTab === 'params' && (
          <div className="space-y-4">
            {catalogDef?.parameters.map((param) => (
              <div key={param.id} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300 flex items-center justify-between">
                  <span>{param.name}</span>
                  {param.type === 'expression' && (
                    <span className="text-[10px] text-[#FF5C49] font-mono">Expression Syntax</span>
                  )}
                </label>

                {param.type === 'string' || param.type === 'expression' ? (
                  <input
                    type="text"
                    value={parameters[param.id] ?? ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 font-mono focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all"
                  />
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={parameters[param.id] ?? 0}
                    onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                    className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all"
                  />
                ) : param.type === 'select' ? (
                  <select
                    value={parameters[param.id] ?? param.default}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all"
                  >
                    {param.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : param.type === 'code' || param.type === 'json' ? (
                  <textarea
                    rows={6}
                    value={parameters[param.id] ?? ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all"
                  />
                ) : null}

                {param.description && (
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {param.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">
                Latest Execution Output
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {selectedNode.data.executionTimeMs ? `${selectedNode.data.executionTimeMs}ms` : 'Sample Output'}
              </span>
            </div>
            <pre className="bg-[#1A1D2B] border border-white/10 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-96 leading-relaxed">
              {JSON.stringify(testOutput || catalogDef?.sampleOutput, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'expression' && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-300">
              Expression Sandbox
            </label>
            <input
              type="text"
              value={expressionInput}
              onChange={(e) => setExpressionInput(e.target.value)}
              placeholder="e.g. {{ $json.user.email }}"
              className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#FF5C49]"
            />
            <div className="p-3 bg-[#1A1D2B] border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Evaluated Output Result:
              </span>
              <p className="text-xs font-mono text-amber-300 font-semibold break-all">
                {evaluatedExpressionResult}
              </p>
            </div>
            <div className="text-[11px] text-gray-400 space-y-1 pt-2 border-t border-white/5">
              <p className="font-semibold text-gray-300">Available variables:</p>
              <p>• <code className="text-[#FF5C49]">$json</code> - Current node output</p>
              <p>• <code className="text-indigo-400">$node["Node Name"].json</code> - Any previous step</p>
              <p>• <code className="text-cyan-400">$env.API_KEY</code> - Environment secret</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-[#161824] flex items-center justify-between gap-2">
        <button
          onClick={() => onDuplicateNode(selectedNode.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>

        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
        >
          <Icons.Trash2 className="w-3.5 h-3.5" />
          Delete Node
        </button>
      </div>
    </aside>
  );
};
