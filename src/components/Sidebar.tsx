import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { NODE_CATALOG } from '../constants/nodeCatalog';

interface SidebarProps {
  onAddNode: (nodeType: string) => void;
  viewMode?: 'dashboard' | 'automations' | 'executions' | 'canvas';
  onNavigate?: (mode: 'dashboard' | 'automations' | 'executions' | 'canvas') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddNode,
  viewMode = 'canvas',
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'menu' | 'nodes'>('menu');

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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10 select-none shadow-xs shrink-0">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            {/* Flowaxon Brand Symbol */}
            <Icons.Flower2 className="w-4 h-4 text-white stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight font-heading">
            Flowaxon
          </span>
        </div>
        <button
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Sidebar layout"
        >
          <Icons.Sidebar className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative flex items-center">
          <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value && activeTab !== 'nodes') {
                setActiveTab('nodes');
              }
            }}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/60 text-[10px] font-mono text-slate-500 font-semibold pointer-events-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Tab Selector: Flowaxon Menu vs Node Library */}
      <div className="px-3 pt-2 flex items-center gap-1 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Navigation
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'nodes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Nodes</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
            {nodeTypesList.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
        {activeTab === 'menu' ? (
          <>
            {/* Section 1: Home */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Home
              </span>
              <nav className="space-y-0.5 pt-1">
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    viewMode === 'dashboard'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icons.LayoutDashboard className={`w-4 h-4 ${viewMode === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => onNavigate?.('automations')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    viewMode === 'automations' || viewMode === 'canvas'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icons.Zap className={`w-4 h-4 ${viewMode === 'automations' || viewMode === 'canvas' ? 'text-white' : 'text-slate-400'}`} />
                  <span>Automations</span>
                </button>
                <button
                  onClick={() => onNavigate?.('executions')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    viewMode === 'executions'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icons.Activity className={`w-4 h-4 ${viewMode === 'executions' ? 'text-white' : 'text-slate-400'}`} />
                  <span>Executions</span>
                </button>
              </nav>
            </div>

            {/* Section 2: Settings */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Settings
              </span>
              <nav className="space-y-0.5 pt-1">
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Icons.Calendar className="w-4 h-4 text-slate-400" />
                  <span>Schedule</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Icons.TrendingUp className="w-4 h-4 text-slate-400" />
                  <span>Log Activity</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Icons.UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Team Access</span>
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Icons.Bell className="w-4 h-4 text-slate-400" />
                  <span>Notifications</span>
                </button>
              </nav>
            </div>
          </>
        ) : (
          /* Node Catalog Tab */
          <div className="space-y-3">
            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {['all', 'trigger', 'ai', 'action', 'logic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Node Items */}
            <div className="space-y-1.5">
              {filteredNodes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
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
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2.5 group shadow-2xs hover:shadow-xs"
                    >
                      <div
                        className="p-1.5 rounded-lg border border-slate-200/60 shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: `${node.color}15`, color: node.color }}
                      >
                        <IconComp className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-800 group-hover:text-slate-900 truncate font-heading">
                            {node.name}
                          </h3>
                          <Icons.Plus className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {node.category}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Pro Plan Card */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 border border-indigo-100 relative overflow-hidden shadow-xs">
          <div className="flex items-start gap-2.5 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-xs">
              <Icons.Box className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 font-heading">
                Upgrade Pro Plan
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Unlock all features on Flowaxon
              </p>
            </div>
          </div>

          <button className="w-full mt-3 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer">
            Manage plan
          </button>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate font-heading">
              Fajar Alexander
            </h4>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              fajar@gmail.com
            </p>
          </div>
        </div>
        <Icons.ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 cursor-pointer hover:text-slate-600 transition-colors" />
      </div>
    </aside>
  );
};


