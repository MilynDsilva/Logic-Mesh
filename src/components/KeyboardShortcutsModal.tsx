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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <Icons.Command className="w-5 h-5 text-[#FF5C49]" />
            <h3 className="text-sm font-bold text-white">Keyboard Shortcuts & Commands</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 bg-[#0D0E12]">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#161824] border border-white/5 text-xs"
            >
              <span className="text-gray-300 font-medium">{sc.description}</span>
              <kbd className="px-2 py-1 rounded bg-[#1A1D2B] text-amber-300 font-mono border border-white/10 font-semibold text-[11px]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
