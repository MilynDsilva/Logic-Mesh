import React, { useRef } from 'react';
import * as Icons from 'lucide-react';

interface HeaderProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isExecuting: boolean;
  onExecute: () => void;
  onOpenTemplates: () => void;
  onOpenLogs: () => void;
  onOpenEnv: () => void;
  onOpenVault: () => void;
  onOpenShortcuts: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onImport: (jsonStr: string) => void;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  workflowName,
  setWorkflowName,
  isExecuting,
  onExecute,
  onOpenTemplates,
  onOpenLogs,
  onOpenEnv,
  onOpenVault,
  onOpenShortcuts,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onImport,
  isActive,
  setIsActive,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="h-14 bg-[#12141C] border-b border-white/10 px-4 flex items-center justify-between gap-4 select-none z-20">
      {/* Left: Brand Logo & Editable Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5C49] to-[#6366F1] flex items-center justify-center shadow-md shadow-[#FF5C49]/20">
            <Icons.Zap className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-white">
            Logic<span className="text-[#FF5C49]">Mesh</span>
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Editable Workflow Title */}
        <div className="flex items-center gap-2 group">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-200 focus:text-white focus:bg-[#1A1D2B] focus:outline-none focus:ring-1 focus:ring-[#FF5C49] rounded px-2 py-1 transition-all border border-transparent hover:border-white/10"
            placeholder="Workflow Name"
          />
          <Icons.Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Active Toggle Switch */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-gray-800 text-gray-400 border-white/10'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
            }`}
          />
          {isActive ? 'Active' : 'Draft'}
        </button>
      </div>

      {/* Right: Actions, Undo/Redo & Execute Button */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-[#161824] border border-white/10 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            className={`p-1.5 rounded transition-all ${
              canUndo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-400 opacity-40 cursor-not-allowed'
            }`}
          >
            <Icons.Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            className={`p-1.5 rounded transition-all ${
              canRedo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-400 opacity-40 cursor-not-allowed'
            }`}
          >
            <Icons.Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.LayoutTemplate className="w-3.5 h-3.5 text-[#FF5C49]" />
          Templates
        </button>

        <button
          onClick={onOpenLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.History className="w-3.5 h-3.5 text-indigo-400" />
          Executions
        </button>

        <button
          onClick={onOpenVault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Vault
        </button>

        <button
          onClick={onOpenEnv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.KeyRound className="w-3.5 h-3.5 text-cyan-400" />
          Secrets ($env)
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Command className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        <button
          onClick={onExport}
          title="Export Workflow JSON"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Workflow JSON"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>

        {/* Primary Execute Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg transition-all ${
            isExecuting
              ? 'bg-amber-600/50 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-[#FF5C49] to-[#FF453A] hover:from-[#FF6E5C] hover:to-[#FF564A] shadow-[#FF5C49]/25 hover:shadow-xl active:scale-95'
          }`}
        >
          {isExecuting ? (
            <>
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
              Running DAG...
            </>
          ) : (
            <>
              <Icons.Play className="w-4 h-4 fill-white" />
              Execute Workflow
            </>
          )}
        </button>
      </div>
    </header>
  );
};
