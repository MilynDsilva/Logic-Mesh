import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LogicNodeData } from '../types/workflow';

export const CustomNode = memo(({ data, selected }: NodeProps & { data: LogicNodeData }) => {
  const IconComponent = (Icons as any)[data.iconName] || Icons.Zap;

  const getStatusBadge = () => {
    switch (data.status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs animate-pulse">
            <Icons.Loader2 className="w-3 h-3 animate-spin text-amber-500" />
            <span>Executing...</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
            <Icons.CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{data.executionTimeMs ? `${data.executionTimeMs}ms` : 'Success'}</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
            <Icons.AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const nodeColor = data.color || '#3B82F6';

  // Render Completed Tasks summary pill node if requested
  if (data.nodeType === 'completed_summary' || data.label?.includes('Completed tasks')) {
    return (
      <div
        className={`relative group bg-emerald-500 text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md border border-emerald-400 transition-all ${
          selected ? 'ring-2 ring-emerald-300 ring-offset-2 scale-105' : 'hover:bg-emerald-600'
        }`}
      >
        <Handle type="target" position={Position.Top} id="completed-target-top" className="!bg-emerald-600 !border-white" />
        <Handle type="target" position={Position.Left} id="completed-target-left" className="!bg-emerald-600 !border-white" />
        <Icons.CheckCircle2 className="w-4 h-4 text-white" />
        <span className="text-xs font-bold font-heading">{data.label || '7 Completed tasks'}</span>
        <Handle type="source" position={Position.Bottom} id="completed-source-bottom" className="!bg-emerald-600 !border-white" />
        <Handle type="source" position={Position.Right} id="completed-source-right" className="!bg-emerald-600 !border-white" />
      </div>
    );
  }

  // Render Question Choice Card if nodeType is question
  if (data.nodeType === 'question' || data.label?.includes('How are task being added')) {
    return (
      <div
        className={`relative group min-w-[250px] max-w-[290px] bg-white rounded-2xl border transition-all duration-200 shadow-sm p-4 ${
          selected
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <Handle type="target" position={Position.Top} id="q-target-top" className="!bg-slate-300 !border-white" />
        
        <p className="text-xs font-semibold text-slate-700 leading-snug mb-3">
          {data.label || 'How are task being added to this project?'}
        </p>

        <div className="space-y-2">
          <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/80 text-xs font-bold text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer">
            <span>Manually</span>
            <Icons.ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/80 text-xs font-bold text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer">
            <span>Use Template</span>
            <Icons.ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} id="q-source-bottom" className="!bg-blue-500 !border-white" />
        <Handle type="source" position={Position.Right} id="q-source-right" className="!bg-blue-500 !border-white" />
      </div>
    );
  }

  // Standard Flowaxon Node Card
  return (
    <div
      className={`relative group min-w-[200px] max-w-[260px] bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
        selected
          ? 'border-blue-500 ring-3 ring-blue-100 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Input Handles */}
      {data.category !== 'trigger' && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="target-left"
            className="!w-2.5 !h-2.5 !bg-white !border-2 !border-slate-400 hover:!border-blue-500"
          />
          <Handle
            type="target"
            position={Position.Top}
            id="target-top"
            className="!w-2.5 !h-2.5 !bg-white !border-2 !border-slate-400 hover:!border-blue-500"
          />
        </>
      )}

      {/* Main Card Body */}
      <div className="p-3 select-none flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2 rounded-xl border border-slate-100 shrink-0 shadow-2xs"
            style={{ backgroundColor: `${nodeColor}12`, color: nodeColor }}
          >
            <IconComponent className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 truncate font-heading group-hover:text-slate-900">
              {data.label}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
              {data.category || 'automation'}
            </p>
          </div>
        </div>

        {/* Status Pill Badge */}
        {data.status && data.status !== 'idle' && (
          <div className="shrink-0">{getStatusBadge()}</div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-slate-400 hover:!border-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-slate-400 hover:!border-blue-500"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

