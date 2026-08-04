import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LogicNodeData } from '../types/workflow';
import { NODE_CATALOG } from '../constants/nodeCatalog';

export type CustomNodeProps = NodeProps<Node<LogicNodeData>>;

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const catalogDef = NODE_CATALOG[data.nodeType];
  const color = data.color || catalogDef?.color || '#6366F1';
  const iconName = data.iconName || catalogDef?.iconName || 'Zap';

  // Dynamic Lucide Icon mapping
  const IconComponent = (Icons as any)[iconName] || Icons.Zap;

  const isTrigger = data.category === 'trigger';
  const isSwitch = data.nodeType === 'if_switch';

  return (
    <div
      className={`relative group rounded-xl bg-[#161922] border transition-all duration-200 shadow-lg min-w-[240px] max-w-[300px] ${
        selected
          ? 'border-[#FF5C49] shadow-[0_0_20px_rgba(255,92,73,0.35)] ring-1 ring-[#FF5C49]'
          : 'border-white/10 hover:border-white/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Category Top Colored Stripe */}
      <div
        className="h-1.5 w-full rounded-t-xl"
        style={{ backgroundColor: color }}
      />

      {/* Input Handle (Left) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-3.5 !h-3.5 !bg-[#1E2230] !border-2 !border-[#6366F1] hover:!bg-[#6366F1] hover:scale-125 transition-all !-left-2"
        />
      )}

      {/* Node Main Body */}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div
              className="p-2 rounded-lg flex items-center justify-center border border-white/10 shrink-0 shadow-inner"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Label & Type */}
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold text-gray-100 truncate leading-tight">
                {data.label}
              </h4>
              <p className="text-[11px] font-mono text-gray-400 truncate mt-0.5">
                {catalogDef?.name || data.nodeType}
              </p>
            </div>
          </div>

          {/* Execution Status Pill */}
          {data.status && data.status !== 'idle' && (
            <div className="shrink-0">
              {data.status === 'running' && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full animate-pulse">
                  <Icons.Loader2 className="w-3 h-3 animate-spin" />
                  Running
                </span>
              )}
              {data.status === 'success' && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  <Icons.CheckCircle2 className="w-3 h-3" />
                  {data.executionTimeMs != null ? `${data.executionTimeMs}ms` : 'Done'}
                </span>
              )}
              {data.status === 'error' && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
                  <Icons.AlertCircle className="w-3 h-3" />
                  Error
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Parameter Summary Preview */}
        {data.parameters && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="truncate max-w-[170px] font-mono text-[10px] text-gray-400">
              {data.nodeType === 'webhook_trigger' && (data.parameters.path || '/v1/webhook')}
              {data.nodeType === 'schedule_trigger' && (data.parameters.cronExpression || 'Cron')}
              {data.nodeType === 'ai_agent' && (data.parameters.model || 'Gemini Pro')}
              {data.nodeType === 'http_request' && `${data.parameters.method || 'POST'} API`}
              {data.nodeType === 'slack_node' && (data.parameters.channel || '#slack')}
              {data.nodeType === 'email_node' && 'SMTP Delivery'}
              {data.nodeType === 'code_node' && 'JS Transformation'}
              {data.nodeType === 'manual_trigger' && 'Click To Execute'}
              {data.nodeType === 'if_switch' && 'Branch Logic'}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              {data.category}
            </span>
          </div>
        )}
      </div>

      {/* Output Handles (Right) */}
      {!isSwitch ? (
        <Handle
          type="source"
          position={Position.Right}
          id="main"
          className="!w-3.5 !h-3.5 !bg-[#1E2230] !border-2 !border-[#FF5C49] hover:!bg-[#FF5C49] hover:scale-125 transition-all !-right-2"
        />
      ) : (
        <>
          {/* Dual handles for Switch node: True & False */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%' }}
            className="!w-3.5 !h-3.5 !bg-[#1E2230] !border-2 !border-emerald-500 hover:!bg-emerald-500 hover:scale-125 transition-all !-right-2"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%' }}
            className="!w-3.5 !h-3.5 !bg-[#1E2230] !border-2 !border-rose-500 hover:!bg-rose-500 hover:scale-125 transition-all !-right-2"
          />
        </>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
