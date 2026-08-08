import React, { useRef, useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface HeaderProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  viewMode?: 'dashboard' | 'automations' | 'executions' | 'canvas';
  workflowStatus?: 'draft' | 'published' | 'archived';
  onTogglePublish?: () => void;
  onArchiveWorkflow?: () => void;
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
}

export const Header: React.FC<HeaderProps> = ({
  workflowName,
  setWorkflowName,
  viewMode = 'canvas',
  workflowStatus = 'draft',
  onTogglePublish,
  onArchiveWorkflow,
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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsToolsDropdownOpen(false);
      }
    };

    if (isToolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsDropdownOpen]);

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

  const getDisplayTitle = () => {
    if (viewMode === 'dashboard') return 'Dashboard';
    if (viewMode === 'automations') return 'Automations';
    if (viewMode === 'executions') return 'Executions';
    return workflowName;
  };

  const isPublished = workflowStatus === 'published';
  const isArchived = workflowStatus === 'archived';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 select-none z-20 shrink-0 shadow-2xs">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Left Navigation & Flowaxon Header Actions */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBackToDashboard}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
          title="Back to Dashboard"
        >
          <Icons.Home className="w-4 h-4" />
        </button>

        {/* Title / Workflow Selector */}
        <div className="flex items-center gap-1.5">
          {viewMode === 'canvas' ? (
            <>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-extrabold text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-slate-50 rounded-lg px-2 py-0.5 transition-all font-heading truncate max-w-[180px] sm:max-w-[260px]"
                placeholder="Workflow Name"
              />

              <button
                onClick={onOpenMeshManager}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Switch Workflow"
              >
                <Icons.ChevronDown className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-lg font-extrabold text-slate-900 px-2 py-0.5 font-heading truncate">
              {getDisplayTitle()}
            </span>
          )}
        </div>

        {/* Auto-Saved Indicator Pill */}
        {viewMode === 'canvas' && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-[11px] font-semibold text-slate-500">
            <Icons.CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto-saved</span>
          </div>
        )}

        {/* New Workflow Button */}
        <button
          onClick={onOpenCreateMesh}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200/80 shadow-2xs cursor-pointer"
        >
          <span>New workflow</span>
          <Icons.Plus className="w-3.5 h-3.5" />
        </button>

        {/* Publish / Unpublish Toggle Control */}
        {viewMode === 'canvas' && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              onClick={onTogglePublish}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isPublished
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : isArchived
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              title={isPublished ? 'Status: Active (Click to set Draft)' : 'Status: Draft (Click to Publish)'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPublished ? 'bg-white animate-pulse' : isArchived ? 'bg-amber-200' : 'bg-slate-400'
                }`}
              />
              <span>{isPublished ? 'Published' : isArchived ? 'Archived' : 'Publish'}</span>
            </button>

            {/* Archive Action Button */}
            {onArchiveWorkflow && !isArchived && (
              <button
                onClick={onArchiveWorkflow}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 text-slate-600 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                title="Archive Workflow"
              >
                <Icons.Archive className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Archive</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Undo / Redo buttons */}
        <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            className={`p-1 rounded-lg transition-all ${
              canUndo ? 'text-slate-700 hover:bg-white shadow-2xs' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Icons.Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            className={`p-1 rounded-lg transition-all ${
              canRedo ? 'text-slate-700 hover:bg-white shadow-2xs' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Icons.Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Run / Execute Workflow Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs shadow-blue-600/20 cursor-pointer ${
            isExecuting
              ? 'bg-amber-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isExecuting ? (
            <>
              <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Icons.Play className="w-3.5 h-3.5 fill-white" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Add Node Button */}
        <button
          onClick={onOpenNodePicker}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
          title="Add Node (⌘K)"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>

        {/* Tools Menu */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
            title="More Options & Tools"
          >
            <Icons.Wrench className="w-4 h-4" />
          </button>

          {isToolsDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onOpenTemplates();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left"
              >
                <Icons.LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
                Templates
              </button>
              <button
                onClick={() => {
                  onOpenLogs();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left"
              >
                <Icons.History className="w-3.5 h-3.5 text-cyan-500" />
                Execution Logs
              </button>
              <button
                onClick={() => {
                  onOpenVault();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left"
              >
                <Icons.ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                AES Vault
              </button>
              <button
                onClick={() => {
                  onOpenEnv();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left"
              >
                <Icons.KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                Environment ($env)
              </button>
              <button
                onClick={() => {
                  onExport();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left border-t border-slate-100 pt-2"
              >
                <Icons.Download className="w-3.5 h-3.5 text-slate-500" />
                Export JSON
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-left"
              >
                <Icons.Upload className="w-3.5 h-3.5 text-slate-500" />
                Import JSON
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
          title="Share Workflow"
        >
          <Icons.Share2 className="w-4 h-4" />
        </button>

        {/* Settings Icon Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
          title="Settings & Shortcuts"
        >
          <Icons.Settings className="w-4 h-4" />
        </button>

        {/* ✨ Try AI Button (Gradient Pill) */}
        <button
          onClick={onOpenNodePicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-gradient-to-r from-amber-100 via-pink-100 to-purple-200 hover:from-amber-200 hover:to-purple-300 border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <Icons.Sparkles className="w-3.5 h-3.5 text-slate-700" />
          <span>Try AI</span>
        </button>
      </div>
    </header>
  );
};

