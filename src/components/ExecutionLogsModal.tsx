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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <Icons.History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Execution History & Logs</h3>
            <span className="text-xs text-gray-400 font-mono">({logs.length} runs)</span>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-gray-400 hover:text-rose-400 px-2.5 py-1 rounded hover:bg-white/5 transition-all"
              >
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Log List */}
          <div className="w-80 border-r border-white/10 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">
                <Icons.Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                No execution history yet.
                <br />
                Click "Execute Workflow" to run.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedLog?.id === log.id
                      ? 'bg-[#1A1D2B] border-[#FF5C49] shadow-md'
                      : 'bg-[#161824] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 text-[11px] font-mono font-semibold ${
                        log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Icons.AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {log.totalDurationMs}ms
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-300">
                    <span className="font-mono text-[10px] text-gray-400">{log.id}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Main Detail View */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0D0E12]">
            {selectedLog ? (
              <div className="space-y-6">
                {/* Summary Metadata Card */}
                <div className="p-4 rounded-xl bg-[#161824] border border-white/10 grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Run ID</span>
                    <p className="text-xs font-mono text-white font-semibold mt-0.5">{selectedLog.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Status</span>
                    <p className={`text-xs font-semibold mt-0.5 ${selectedLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedLog.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Duration</span>
                    <p className="text-xs font-mono text-white font-semibold mt-0.5">{selectedLog.totalDurationMs}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Trigger</span>
                    <p className="text-xs font-mono text-[#FF5C49] font-semibold mt-0.5">{selectedLog.triggerType}</p>
                  </div>
                </div>

                {/* Steps Trace Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Execution Steps ({selectedLog.steps.length})
                  </h4>

                  {selectedLog.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#161824] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-gray-300">
                            {idx + 1}
                          </span>
                          <h5 className="text-xs font-semibold text-white">{step.nodeName}</h5>
                          <span className="text-[10px] font-mono text-gray-400">({step.nodeType})</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400">{step.executionTimeMs}ms</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[10px] text-gray-400 font-mono block mb-1">Input Payload:</span>
                          <pre className="p-2.5 rounded-lg bg-[#1A1D2B] border border-white/5 text-[11px] font-mono text-gray-300 overflow-x-auto max-h-40">
                            {JSON.stringify(step.inputPayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400 font-mono block mb-1">Output Result:</span>
                          <pre className="p-2.5 rounded-lg bg-[#1A1D2B] border border-white/5 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                            {JSON.stringify(step.outputPayload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-gray-400">
                Select an execution run from the left panel to inspect step outputs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
