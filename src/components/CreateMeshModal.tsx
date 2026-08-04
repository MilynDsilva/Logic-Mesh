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
    if (!name.trim()) return;
    onCreateMesh(name.trim(), description.trim(), startType);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF5C49]/20 text-[#FF5C49] border border-[#FF5C49]/30">
              <Icons.PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create New Mesh Workflow</h3>
              <p className="text-[11px] text-gray-400">Initialize a new visual automation canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#0D0E12]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-200">
              Mesh Name <span className="text-[#FF5C49]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Ingestion & Slack Alert Mesh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1A1D2B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-200">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of what this mesh automates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1D2B] border border-white/10 rounded-xl p-3 text-xs text-gray-300 placeholder-gray-400 focus:outline-none focus:border-[#FF5C49] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-200 block">
              Starter Trigger Node
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStartType('blank')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startType === 'blank'
                    ? 'bg-[#FF5C49]/10 border-[#FF5C49] text-white shadow-md'
                    : 'bg-[#161824] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <Icons.PlayCircle className="w-4 h-4 text-[#FF5C49] mb-1" />
                <div className="text-xs font-bold">Manual Trigger</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Click to run</div>
              </button>

              <button
                type="button"
                onClick={() => setStartType('webhook')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startType === 'webhook'
                    ? 'bg-[#FF5C49]/10 border-[#FF5C49] text-white shadow-md'
                    : 'bg-[#161824] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <Icons.Webhook className="w-4 h-4 text-indigo-400 mb-1" />
                <div className="text-xs font-bold">Webhook Trigger</div>
                <div className="text-[10px] text-gray-400 mt-0.5">HTTP POST listener</div>
              </button>

              <button
                type="button"
                onClick={() => setStartType('schedule')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startType === 'schedule'
                    ? 'bg-[#FF5C49]/10 border-[#FF5C49] text-white shadow-md'
                    : 'bg-[#161824] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <Icons.Clock className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold">Cron Schedule</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Interval timer</div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF5C49] hover:bg-[#FF453A] text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
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
