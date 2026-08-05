import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export interface ExecutionRecord {
  id: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  duration: string;
  triggerType: string;
  nodesExecuted: number;
}

interface ExecutionsListViewProps {
  onOpenLogsModal: () => void;
}

const INITIAL_EXECUTIONS: ExecutionRecord[] = [
  {
    id: 'exec-9821a4',
    workflowName: 'MongoDB Lead Ingestion & AI Classifier',
    status: 'success',
    startedAt: 'Today, 7:42 PM',
    duration: '320ms',
    triggerType: 'Webhook Trigger',
    nodesExecuted: 4,
  },
  {
    id: 'exec-8710b2',
    workflowName: 'Scheduled API Health Poller',
    status: 'success',
    startedAt: 'Today, 7:30 PM',
    duration: '185ms',
    triggerType: 'Cron Schedule',
    nodesExecuted: 3,
  },
  {
    id: 'exec-6549c8',
    workflowName: 'MongoDB Lead Ingestion & AI Classifier',
    status: 'failed',
    startedAt: 'Today, 6:15 PM',
    duration: '540ms',
    triggerType: 'Webhook Trigger',
    nodesExecuted: 2,
  },
  {
    id: 'exec-5412d1',
    workflowName: 'Scheduled API Health Poller',
    status: 'success',
    startedAt: 'Today, 6:00 PM',
    duration: '190ms',
    triggerType: 'Cron Schedule',
    nodesExecuted: 3,
  },
  {
    id: 'exec-4309e3',
    workflowName: 'Slack Event Dispatcher',
    status: 'success',
    startedAt: 'Yesterday, 11:20 PM',
    duration: '210ms',
    triggerType: 'Manual Run',
    nodesExecuted: 5,
  },
];

export const ExecutionsListView: React.FC<ExecutionsListViewProps> = ({ onOpenLogsModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredExecutions = INITIAL_EXECUTIONS.filter((item) => {
    const matchesSearch =
      item.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-6 select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Executions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs">
              {INITIAL_EXECUTIONS.length} Total Runs
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Monitor real-time workflow run histories, node outputs, and performance metrics.
          </p>
        </div>

        <button
          onClick={onOpenLogsModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Icons.Terminal className="w-4 h-4 text-slate-500" />
          <span>Live Terminal Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by workflow name or execution ID..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs font-medium transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'success'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'failed'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Executions Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-4">Workflow</th>
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExecutions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Status Badge */}
                  <td className="py-3.5 px-5">
                    {item.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Success
                      </span>
                    ) : item.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <Icons.XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Icons.Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        Running
                      </span>
                    )}
                  </td>

                  {/* Workflow Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.workflowName}
                  </td>

                  {/* Execution ID */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80">
                      {item.id}
                    </span>
                  </td>

                  {/* Started At */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.startedAt}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.duration}
                  </td>

                  {/* Trigger */}
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {item.triggerType}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={onOpenLogsModal}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Logs</span>
                      <Icons.ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
