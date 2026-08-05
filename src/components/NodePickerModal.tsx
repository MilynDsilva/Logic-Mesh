import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { NODE_CATALOG } from '../constants/nodeCatalog';

interface NodePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

export const NodePickerModal: React.FC<NodePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectNode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');

  if (!isOpen) return null;

  const nodeTypesList = Object.values(NODE_CATALOG);

  const filtered = nodeTypesList.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || node.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.Plus className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                Select Node from Library
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes by name or feature (e.g., MongoDB, Webhook, AI, Slack, GitHub)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-2xs"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'trigger', 'ai', 'action', 'logic'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 custom-scrollbar bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-xs text-slate-500">
              No nodes matching "{searchTerm}" found.
            </div>
          ) : (
            filtered.map((node) => {
              const IconComp = (Icons as any)[node.iconName] || Icons.Zap;

              return (
                <button
                  key={node.type}
                  onClick={() => {
                    onSelectNode(node.type);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left flex items-start gap-3 group shadow-2xs cursor-pointer"
                >
                  <div
                    className="p-2.5 rounded-xl border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${node.color}15`, color: node.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate font-heading">
                        {node.name}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        {node.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

