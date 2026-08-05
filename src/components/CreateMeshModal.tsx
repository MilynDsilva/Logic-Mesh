import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface CreateMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMesh: (name: string, description: string, startType: 'blank' | 'webhook' | 'schedule') => void;
}

export const CreateMeshModal: React.FC<CreateMeshModalProps> = ({
  isOpen,
  onClose,
  onCreateMesh,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startType, setStartType] = useState<'blank' | 'webhook' | 'schedule'>('blank');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMesh(name.trim(), description.trim(), startType);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Create New Mesh Workflow</h3>
              <p className="text-[11px] text-slate-500">Initialize a new visual automation canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Mesh Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Workflow 3 (or leave blank for auto-generated)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-2xs"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of what this mesh automates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Starter Trigger Node
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStartType('blank')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  startType === 'blank'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <Icons.PlayCircle className="w-4 h-4 text-blue-600 mb-1" />
                <div className="text-xs font-bold font-heading">Manual Trigger</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Click to run</div>
              </button>

              <button
                type="button"
                onClick={() => setStartType('webhook')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  startType === 'webhook'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <Icons.Webhook className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-xs font-bold font-heading">Webhook Trigger</div>
                <div className="text-[10px] text-slate-500 mt-0.5">HTTP POST listener</div>
              </button>

              <button
                type="button"
                onClick={() => setStartType('schedule')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  startType === 'schedule'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <Icons.Clock className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-bold font-heading">Cron Schedule</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Interval timer</div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Icons.Zap className="w-3.5 h-3.5 fill-white" />
              Create Mesh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

