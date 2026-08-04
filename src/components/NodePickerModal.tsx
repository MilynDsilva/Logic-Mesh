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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Search Input */}
        <div className="p-4 border-b border-white/10 bg-[#161824] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.Plus className="w-4 h-4 text-[#FF5C49]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Select Node from Library (n8n Picker)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes by name or feature (e.g., MongoDB, Webhook, AI, Slack, GitHub)..."
              className="w-full bg-[#1A1D2B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'trigger', 'ai', 'action', 'logic'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  category === cat
                    ? 'bg-[#FF5C49] text-white shadow-md'
                    : 'bg-[#1A1D2B] text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 custom-scrollbar bg-[#0D0E12]">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-xs text-gray-400">
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
                  className="p-3.5 rounded-xl bg-[#161824] border border-white/5 hover:border-[#FF5C49]/50 hover:bg-[#1A1D2B] transition-all text-left flex items-start gap-3 group"
                >
                  <div
                    className="p-2.5 rounded-xl border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${node.color}20`, color: node.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-100 group-hover:text-white truncate">
                        {node.name}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                        {node.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
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
