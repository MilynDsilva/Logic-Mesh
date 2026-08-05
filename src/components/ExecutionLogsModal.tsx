import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { WorkflowExecutionLog } from '../types/workflow';

interface ExecutionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WorkflowExecutionLog[];
  onClearLogs: () => void;
}

export const ExecutionLogsModal: React.FC<ExecutionLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [selectedLog, setSelectedLog] = useState<WorkflowExecutionLog | null>(
    logs[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Execution History & Logs</h3>
              <p className="text-[11px] text-slate-500 font-mono">({logs.length} total runs logged)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 font-semibold transition-all cursor-pointer"
              >
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Log List */}
          <div className="w-80 border-r border-slate-200 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50/30">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                <Icons.Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                No execution history yet.
                <br />
                Click "Execute Workflow" to run.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    selectedLog?.id === log.id
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
                        log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Icons.AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {log.totalDurationMs}ms
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-mono text-[10px] text-slate-400 font-medium">{log.id}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(log.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Main Detail View */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50">
            {selectedLog ? (
              <div className="space-y-6">
                {/* Summary Metadata Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-4 gap-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Run ID</span>
                    <p className="text-xs font-mono text-slate-900 font-bold mt-0.5">{selectedLog.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Status</span>
                    <p className={`text-xs font-bold mt-0.5 ${selectedLog.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedLog.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Duration</span>
                    <p className="text-xs font-mono text-slate-900 font-bold mt-0.5">{selectedLog.totalDurationMs}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Trigger</span>
                    <p className="text-xs font-mono text-blue-600 font-bold mt-0.5">{selectedLog.triggerType}</p>
                  </div>
                </div>

                {/* Steps Trace Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                    Execution Steps ({selectedLog.steps.length})
                  </h4>

                  {selectedLog.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center text-slate-700">
                            {idx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 font-heading">{step.nodeName}</h5>
                          <span className="text-[10px] font-mono text-slate-400">({step.nodeType})</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">{step.executionTimeMs}ms</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">Input Payload:</span>
                          <pre className="p-2.5 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-40">
                            {JSON.stringify(step.inputPayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold block mb-1">Output Result:</span>
                          <pre className="p-2.5 rounded-xl bg-slate-900 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                            {JSON.stringify(step.outputPayload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-slate-500">
                Select an execution run from the left panel to inspect step outputs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

