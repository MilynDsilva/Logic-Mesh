import React from 'react';
import * as Icons from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + E', description: 'Execute Active Workflow DAG' },
    { key: '⌘ / Ctrl + Z', description: 'Undo Last Canvas Edit' },
    { key: '⌘ / Ctrl + ⇧ + Z', description: 'Redo Canvas Edit' },
    { key: '⌘ / Ctrl + S', description: 'Export Workflow JSON File' },
    { key: 'Delete / Backspace', description: 'Remove Selected Canvas Node' },
    { key: 'Esc', description: 'Close Inspector & Modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.Command className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">Keyboard Shortcuts & Commands</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2.5 bg-slate-50/50">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
            >
              <span className="text-slate-700 font-medium">{sc.description}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono border border-slate-200 font-bold text-[11px] shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
