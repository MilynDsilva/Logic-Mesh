import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { WorkflowExecutionLog, WorkflowExecutionLogStep } from '../types/workflow';

interface BottomLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  latestLog: WorkflowExecutionLog | null;
  onSelectNodeOnCanvas?: (nodeId: string) => void;
  onOpenFullHistory?: () => void;
}

export const BottomLogsPanel: React.FC<BottomLogsPanelProps> = ({
  isOpen,
  onClose,
  isExecuting,
  latestLog,
  onSelectNodeOnCanvas,
  onOpenFullHistory,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'raw'>('output');
  const [copied, setCopied] = useState(false);

  // Auto-select last executed step when a new step arrives
  useEffect(() => {
    if (latestLog?.steps && latestLog.steps.length > 0) {
      setSelectedStepIndex(latestLog.steps.length - 1);
    }
  }, [latestLog?.steps.length]);

  if (!isOpen) return null;

  const currentStep: WorkflowExecutionLogStep | undefined =
    latestLog?.steps && latestLog.steps[selectedStepIndex]
      ? latestLog.steps[selectedStepIndex]
      : latestLog?.steps?.[0];

  const handleCopyJSON = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (isExecuting) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Icons.Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
          <span>Executing Workflow...</span>
        </span>
      );
    }
    if (!latestLog) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <Icons.PlayCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Ready to Run</span>
        </span>
      );
    }
    if (latestLog.status === 'success') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Execution Successful ({latestLog.totalDurationMs}ms)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
        <Icons.AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        <span>Execution Failed ({latestLog.totalDurationMs}ms)</span>
      </span>
    );
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${
        isMinimized ? 'h-11' : isMaximized ? 'h-[460px]' : 'h-72'
      }`}
    >
      {/* Header Bar */}
      <div className="h-11 px-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70 select-none shrink-0">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {getStatusBadge()}

          {/* Quick Metrics */}
          {latestLog && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-slate-800 font-bold">{latestLog.steps.length}</strong> steps executed
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px]">ID: {latestLog.id}</span>
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          {onOpenFullHistory && (
            <button
              onClick={onOpenFullHistory}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer mr-1"
              title="Open Full Execution History Modal"
            >
              <Icons.History className="w-3.5 h-3.5" />
              <span>Full Log History</span>
            </button>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
          >
            {isMinimized ? <Icons.ChevronUp className="w-4 h-4" /> : <Icons.ChevronDown className="w-4 h-4" />}
          </button>

          {/* Maximize / Restore Toggle */}
          {!isMinimized && (
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
              title={isMaximized ? 'Restore Size' : 'Maximize Panel'}
            >
              {isMaximized ? <Icons.Minimize2 className="w-3.5 h-3.5" /> : <Icons.Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer ml-1"
            title="Close Panel"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Area (when expanded) */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Executed Node Step List (n8n Style) */}
          <div className="w-72 sm:w-80 border-r border-slate-200/80 bg-slate-50/40 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5 shrink-0 select-none">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Node Execution Trace</span>
              {isExecuting && (
                <span className="flex items-center gap-1 text-amber-600 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Live
                </span>
              )}
            </div>

            {!latestLog || latestLog.steps.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-500">
                <Icons.Terminal className="w-7 h-7 mx-auto mb-2 text-slate-400 opacity-60" />
                No execution steps logged yet. Click "Run Workflow" to execute.
              </div>
            ) : (
              latestLog.steps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                const isError = step.status === 'error';

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedStepIndex(idx);
                      if (onSelectNodeOnCanvas) onSelectNodeOnCanvas(step.nodeId);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-100/70'
                        : isError
                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-[11px] font-mono font-bold flex items-center justify-center text-slate-600 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 truncate font-heading">
                          {step.nodeName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {step.nodeType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-slate-500">
                        {step.executionTimeMs}ms
                      </span>
                      {isError ? (
                        <Icons.AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      ) : (
                        <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Node Input/Output Payload Inspector (100% Light Mode) */}
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-hidden border-l border-slate-200">
            {currentStep ? (
              <>
                {/* Node Inspector Bar */}
                <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between select-none shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
                      Step {selectedStepIndex + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 font-heading truncate">
                      {currentStep.nodeName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      ({currentStep.nodeType})
                    </span>
                  </div>

                  {/* Inspector Tabs (Output vs Input) */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setActiveTab('output')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeTab === 'output'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Output ($json)
                    </button>
                    <button
                      onClick={() => setActiveTab('input')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeTab === 'input'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Input Payload
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeTab === 'raw'
                          ? 'bg-slate-800 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Full Details
                    </button>
                  </div>
                </div>

                {/* Content Payload View */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative font-mono text-xs leading-relaxed bg-slate-50">
                  <button
                    onClick={() =>
                      handleCopyJSON(
                        activeTab === 'output'
                          ? currentStep.outputPayload
                          : activeTab === 'input'
                          ? currentStep.inputPayload
                          : currentStep
                      )
                    }
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] text-slate-700 font-sans font-semibold flex items-center gap-1 transition-all cursor-pointer border border-slate-300 shadow-2xs z-10"
                    title="Copy JSON"
                  >
                    {copied ? (
                      <>
                        <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Icons.Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>

                  {/* Error Banner if Step Failed */}
                  {currentStep.error && (
                    <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-sans text-xs flex items-start gap-2">
                      <Icons.AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-rose-900 block">Execution Error:</strong>
                        <span>{currentStep.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Formatted JSON */}
                  <pre className="text-slate-800 select-text font-semibold">
                    {JSON.stringify(
                      activeTab === 'output'
                        ? currentStep.outputPayload
                        : activeTab === 'input'
                        ? currentStep.inputPayload
                        : currentStep,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-sans">
                Select a step on the left to inspect JSON payloads.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
