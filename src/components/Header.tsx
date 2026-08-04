import React, { useRef, useState } from 'react';
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
  onOpenCreateMesh: () => void;
  onOpenMeshManager: () => void;
  onOpenNodePicker: () => void;
  onBackToDashboard: () => void;
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
  onOpenCreateMesh,
  onOpenMeshManager,
  onOpenNodePicker,
  onBackToDashboard,
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
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

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
    <header className="h-14 bg-[#12141C] border-b border-white/10 px-3 flex items-center justify-between gap-2 select-none z-20 shrink-0 whitespace-nowrap overflow-x-auto custom-scrollbar">
      {/* Left: Brand Logo, Dashboard Link & Editable Title */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer group"
          title="Return to Projects Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5C49] to-[#6366F1] flex items-center justify-center shadow-md shadow-[#FF5C49]/20 group-hover:scale-105 transition-transform shrink-0">
            <Icons.Zap className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-extrabold text-base tracking-tight text-white hidden sm:inline">
            Logic<span className="text-[#FF5C49]">Mesh</span>
          </span>
        </button>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10"
          title="Back to Projects Dashboard"
        >
          <Icons.ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Mesh Workflows Manager Dropdown Trigger */}
        <button
          onClick={onOpenMeshManager}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-[#161824] hover:bg-white/10 border border-white/10 text-gray-200 transition-all"
          title="Open Mesh Workflows Manager"
        >
          <Icons.FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">My Meshes</span>
          <Icons.ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {/* Quick Create New Mesh Button */}
        <button
          onClick={onOpenCreateMesh}
          className="p-1 rounded-lg bg-[#FF5C49]/10 hover:bg-[#FF5C49] text-[#FF5C49] hover:text-white border border-[#FF5C49]/30 transition-all"
          title="Create New Blank Mesh"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>

        {/* Editable Workflow Title */}
        <div className="flex items-center gap-1.5 group max-w-[200px] sm:max-w-[260px] truncate">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-gray-200 focus:text-white focus:bg-[#1A1D2B] focus:outline-none focus:ring-1 focus:ring-[#FF5C49] rounded px-1.5 py-0.5 transition-all border border-transparent hover:border-white/10 w-full truncate"
            placeholder="Workflow Name"
          />
        </div>

        {/* Active Toggle Switch */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-gray-800 text-gray-400 border-white/10'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
          <span>{isActive ? 'Active' : 'Draft'}</span>
        </button>
      </div>

      {/* Right: Actions, Compact Tools & Execute Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* n8n Center Node Picker Trigger Button */}
        <button
          onClick={onOpenNodePicker}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF5C49] hover:bg-[#FF453A] text-white shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Icons.Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Node</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#161824] border border-white/10 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            className={`p-1 rounded transition-all ${
              canUndo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-500 opacity-40 cursor-not-allowed'
            }`}
          >
            <Icons.Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            className={`p-1 rounded transition-all ${
              canRedo ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-500 opacity-40 cursor-not-allowed'
            }`}
          >
            <Icons.Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tools Dropdown for Templates, Executions, Vault, Secrets & Shortcuts */}
        <div className="relative">
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161824] hover:bg-white/10 border border-white/10 text-gray-200 transition-all"
          >
            <Icons.Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tools</span>
            <Icons.ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isToolsDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#161824] border border-white/10 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onOpenTemplates();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
              >
                <Icons.LayoutTemplate className="w-3.5 h-3.5 text-[#FF5C49]" />
                Starter Templates
              </button>
              <button
                onClick={() => {
                  onOpenLogs();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
              >
                <Icons.History className="w-3.5 h-3.5 text-indigo-400" />
                Execution Logs
              </button>
              <button
                onClick={() => {
                  onOpenVault();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
              >
                <Icons.ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                AES-256 Secret Vault
              </button>
              <button
                onClick={() => {
                  onOpenEnv();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
              >
                <Icons.KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Environment ($env)
              </button>
              <button
                onClick={() => {
                  onOpenShortcuts();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left border-t border-white/5 pt-2"
              >
                <Icons.Command className="w-3.5 h-3.5 text-gray-400" />
                Keyboard Hotkeys
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Quick Export & Import Icons */}
        <button
          onClick={onExport}
          title="Export Workflow JSON (Cmd+S)"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Workflow JSON"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <Icons.Upload className="w-3.5 h-3.5" />
        </button>

        {/* Primary Execute Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
            isExecuting
              ? 'bg-amber-600/50 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-[#FF5C49] to-[#FF453A] hover:from-[#FF6E5C] hover:to-[#FF564A] shadow-[#FF5C49]/25 hover:shadow-xl active:scale-95'
          }`}
        >
          {isExecuting ? (
            <>
              <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Icons.Play className="w-3.5 h-3.5 fill-white" />
              <span>Execute</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
