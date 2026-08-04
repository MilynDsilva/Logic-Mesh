import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { NODE_CATALOG } from '../constants/nodeCatalog';

interface SidebarProps {
  onAddNode: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Nodes', icon: 'Grid' },
    { id: 'trigger', label: 'Triggers', icon: 'Zap' },
    { id: 'ai', label: 'AI & LLM', icon: 'Sparkles' },
    { id: 'action', label: 'Actions', icon: 'Cpu' },
    { id: 'logic', label: 'Logic', icon: 'GitFork' },
  ];

  const nodeTypesList = Object.values(NODE_CATALOG);

  const filteredNodes = nodeTypesList.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/logicmesh-node', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#12141C] border-r border-white/10 flex flex-col items-center py-4 gap-4 z-10 transition-all">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          title="Expand Node Library"
        >
          <Icons.ChevronRight className="w-5 h-5" />
        </button>
        <div className="h-px w-6 bg-white/10" />
        {categories.slice(1).map((cat) => {
          const Icon = (Icons as any)[cat.icon] || Icons.Circle;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setIsCollapsed(false);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-[#FF5C49] hover:bg-white/5 transition-all"
              title={cat.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-[#12141C] border-r border-white/10 flex flex-col h-[calc(100vh-3.5rem)] z-10 select-none transition-all">
      {/* Header & Collapse */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.PlusCircle className="w-4 h-4 text-[#FF5C49]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Node Library
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          title="Collapse Panel"
        >
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes... (e.g. Webhook, AI, Slack)"
            className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#FF5C49] text-white shadow-sm'
                  : 'bg-[#1A1D2B] text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredNodes.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            <Icons.SearchX className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
            No matching nodes found.
          </div>
        ) : (
          filteredNodes.map((node) => {
            const IconComp = (Icons as any)[node.iconName] || Icons.Zap;
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => handleDragStart(e, node.type)}
                onClick={() => onAddNode(node.type)}
                className="group relative rounded-xl bg-[#161824] border border-white/5 p-3 hover:border-white/20 hover:bg-[#1A1D2B] hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="p-2 rounded-lg flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${node.color}20`, color: node.color }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  {/* Title & Desc */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                        {node.name}
                      </h4>
                      <Icons.Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5C49] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-white/5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">
                    {node.category}
                  </span>
                  <span className="text-[9px] text-gray-400">Drag to canvas</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
