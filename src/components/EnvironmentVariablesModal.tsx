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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Environment Secrets ($env)</h3>
              <p className="text-[11px] text-slate-500">Configure global key-value pairs accessible via <code className="text-blue-600 font-mono font-semibold">$env.KEY</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
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
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-blue-700 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
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
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
              />
              <button
                onClick={() => handleRemoveRow(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Icons.Plus className="w-4 h-4" />
            Add Secret Variable
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Save Secrets
          </button>
        </div>
      </div>
    </div>
  );
};

