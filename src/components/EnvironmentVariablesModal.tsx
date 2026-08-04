import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface EnvironmentVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  envVars: Record<string, string>;
  onSaveEnvVars: (vars: Record<string, string>) => void;
}

export const EnvironmentVariablesModal: React.FC<EnvironmentVariablesModalProps> = ({
  isOpen,
  onClose,
  envVars,
  onSaveEnvVars,
}) => {
  const [varsList, setVarsList] = useState<Array<{ key: string; value: string }>>(
    Object.entries(envVars).map(([key, value]) => ({ key, value }))
  );

  if (!isOpen) return null;

  const handleAddRow = () => {
    setVarsList([...varsList, { key: '', value: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = varsList.filter((_, i) => i !== index);
    setVarsList(updated);
  };

  const handleSave = () => {
    const obj: Record<string, string> = {};
    varsList.forEach((item) => {
      if (item.key.trim()) {
        obj[item.key.trim()] = item.value;
      }
    });
    onSaveEnvVars(obj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <Icons.KeyRound className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Environment Secrets ($env)</h3>
              <p className="text-[11px] text-gray-400">Configure global key-value pairs accessible via <code className="text-cyan-400">$env.KEY</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0D0E12]">
          {varsList.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="VARIABLE_NAME"
                value={item.key}
                onChange={(e) => {
                  const updated = [...varsList];
                  updated[idx].key = e.target.value;
                  setVarsList(updated);
                }}
                className="flex-1 bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="Secret Value"
                value={item.value}
                onChange={(e) => {
                  const updated = [...varsList];
                  updated[idx].value = e.target.value;
                  setVarsList(updated);
                }}
                className="flex-1 bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleRemoveRow(idx)}
                className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="w-full py-2 border border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl text-xs font-medium text-gray-300 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <Icons.Plus className="w-4 h-4" />
            Add Secret Variable
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#161824] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all"
          >
            Save Secrets
          </button>
        </div>
      </div>
    </div>
  );
};
