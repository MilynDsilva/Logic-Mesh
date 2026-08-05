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
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
            <Icons.Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            <span>Executing...</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
            <Icons.CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{data.executionTimeMs ? `${data.executionTimeMs}ms` : 'Success'}</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm">
            <Icons.AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const nodeColor = data.color || '#FF5C49';

  return (
    <div
      className={`relative group min-w-[240px] max-w-[280px] bg-[#1C1F2B]/95 backdrop-blur-md rounded-2xl border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-[#FF5C49] ring-2 ring-[#FF5C49]/40 shadow-2xl shadow-[#FF5C49]/20 -translate-y-0.5'
          : 'border-white/10 hover:border-white/25 hover:shadow-2xl'
      }`}
    >
      {/* Top Category Accent Line */}
      <div
        className="h-1 w-full rounded-t-2xl transition-all"
        style={{ backgroundColor: nodeColor, boxShadow: selected ? `0 0 12px ${nodeColor}` : 'none' }}
      />

      {/* Main Node Body */}
      <div className="p-3.5 space-y-3 select-none">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-xl border border-white/10 shrink-0 shadow-inner transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${nodeColor}18`, color: nodeColor }}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-100 truncate font-heading tracking-tight group-hover:text-white">
                {data.label}
              </h3>
              <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5">
                n8n-base.{data.nodeType || 'node'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Pill Badge */}
        {data.status && data.status !== 'idle' && (
          <div className="pt-1 border-t border-white/5 flex items-center justify-between">
            {getStatusBadge()}
          </div>
        )}
      </div>

      {/* Target Input Handle (Left) */}
      {data.category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          id="target-left"
          className="!w-3 !h-3 !bg-[#1D202A] !border-2 !border-[#FF5C49] hover:!bg-[#FF5C49]"
        />
      )}

      {/* Source Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!w-3 !h-3 !bg-[#1D202A] !border-2 !border-[#FF5C49] hover:!bg-[#FF5C49]"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
