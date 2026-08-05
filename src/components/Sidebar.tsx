import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { NODE_CATALOG } from '../constants/nodeCatalog';

interface SidebarProps {
  onAddNode: (nodeType: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const nodeTypesList = Object.values(NODE_CATALOG);

  const filteredNodes = nodeTypesList.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || node.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/logicmesh-node', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 bg-[#141724] border-r border-white/10 flex flex-col h-[calc(100vh-3.5rem)] z-10 select-none shadow-2xl shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-[#181B2B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider font-heading">
              Node Library
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-[#8B5CF6]/15 text-[#8B5CF6] px-2 py-0.5 rounded border border-[#8B5CF6]/30 font-bold">
            {filteredNodes.length} Available
          </span>
        </div>

        <div className="relative">
          <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes (e.g. Webhook, AI, Mongo)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1F2334] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'trigger', 'ai', 'action', 'logic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-md'
                  : 'bg-[#1F2334] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#11131E]">
        {filteredNodes.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 italic">
            No matching nodes found.
          </div>
        ) : (
          filteredNodes.map((node) => {
            const IconComp = (Icons as any)[node.iconName] || Icons.Zap;

            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                onClick={() => onAddNode(node.type)}
                className="p-3 rounded-xl bg-[#1D2132] hover:bg-[#23283B] border border-white/5 hover:border-[#8B5CF6]/50 transition-all cursor-grab active:cursor-grabbing flex items-start gap-3 group shadow-sm hover:shadow-md"
              >
                <div
                  className="p-2 rounded-lg border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${node.color}20`, color: node.color }}
                >
                  <IconComp className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-200 group-hover:text-white truncate font-heading">
                      {node.name}
                    </h3>
                    <Icons.Plus className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-[#8B5CF6]" />
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drag & Drop Hint Footer */}
      <div className="p-3 bg-[#181B2B] border-t border-white/10 text-center text-[10px] font-mono text-gray-400 flex items-center justify-center gap-1.5">
        <Icons.Move className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span>Drag node onto canvas or click to add</span>
      </div>
    </aside>
  );
};
