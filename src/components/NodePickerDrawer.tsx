import { useState } from 'react';
import * as Icons from 'lucide-react';
import { NODE_CATALOG } from '../constants/nodeCatalog';
import type { NodeDefinition } from '../types/workflow';

interface NodePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

interface CategoryCard {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  filterFn: (n: NodeDefinition) => boolean;
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'ai',
    name: 'AI',
    description: 'Build autonomous agents, summarize or search documents, etc.',
    iconName: 'Sparkles',
    color: '#0284C7',
    filterFn: (n) => n.category === 'ai' || n.type.includes('ai'),
  },
  {
    id: 'action',
    name: 'Action in an app',
    description: 'Do something in an app or service like GitHub, Discord, Slack or Database',
    iconName: 'Globe',
    color: '#4F46E5',
    filterFn: (n) => n.category === 'action' && !['code_node', 'split_batches_node'].includes(n.type),
  },
  {
    id: 'transform',
    name: 'Data transformation',
    description: 'Manipulate, filter, code or convert data payload',
    iconName: 'Edit3',
    color: '#059669',
    filterFn: (n) => ['code_node', 'filter_node', 'split_batches_node'].includes(n.type),
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'Branch, merge or loop execution flow',
    iconName: 'GitFork',
    color: '#D97706',
    filterFn: (n) => n.category === 'logic',
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Run code, execute HTTP requests, handle webhooks or databases',
    iconName: 'Cpu',
    color: '#2563EB',
    filterFn: (n) => ['http_request', 'code_node', 'postgres_node', 'mongodb_node', 'redis_node'].includes(n.type),
  },
  {
    id: 'trigger',
    name: 'Add another trigger',
    description: 'Triggers start your workflow. Workflows can have multiple triggers.',
    iconName: 'Zap',
    color: '#EA580C',
    filterFn: (n) => n.category === 'trigger',
  },
];

export const NodePickerDrawer = ({
  isOpen,
  onClose,
  onSelectNode,
}: NodePickerDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const catalogList = Object.values(NODE_CATALOG);

  const getFilteredNodes = () => {
    let list = catalogList;
    if (selectedCategory) {
      const card = CATEGORY_CARDS.find((c) => c.id === selectedCategory);
      if (card) list = list.filter(card.filterFn);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const activeNodes = getFilteredNodes();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="w-[420px] bg-white text-slate-800 h-full flex flex-col shadow-2xl border-l border-slate-200 animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">What happens next?</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add a node to extend your automation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/40">
          <div className="relative">
            <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-semibold shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* Breadcrumb / Active Category Reset */}
          {selectedCategory && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-2">
                <Icons.Filter className="w-3.5 h-3.5 text-blue-600" />
                Category: {CATEGORY_CARDS.find((c) => c.id === selectedCategory)?.name}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Show All Categories
              </button>
            </div>
          )}

          {/* Categories Cards Overview (when no search query and no specific category) */}
          {!searchQuery && !selectedCategory && (
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Explore Categories
              </span>
              {CATEGORY_CARDS.map((card) => {
                const IconComp = (Icons as any)[card.iconName] || Icons.Box;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCategory(card.id)}
                    className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-400 transition-all group flex items-start gap-3.5 cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div
                      className="p-2.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${card.color}15`, color: card.color }}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {card.name}
                        </h4>
                        <Icons.ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Node List Items */}
          <div className="space-y-2">
            {(searchQuery || selectedCategory) && (
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Available Nodes ({activeNodes.length})
              </span>
            )}

            {activeNodes.map((node) => {
              const IconComp = (Icons as any)[node.iconName] || Icons.Zap;
              return (
                <button
                  key={node.type}
                  onClick={() => {
                    onSelectNode(node.type);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-500 transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-xl border border-slate-200 shrink-0"
                      style={{ backgroundColor: `${node.color}15`, color: node.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors truncate">
                        {node.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {node.description}
                      </p>
                    </div>
                  </div>
                  <Icons.ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}

            {activeNodes.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Icons.SearchX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No nodes found matching search</p>
                <p className="text-[11px] text-slate-500 mt-1">Try another keyword or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
