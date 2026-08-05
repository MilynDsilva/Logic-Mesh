import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { SavedMesh } from './MeshManagerModal';
import { STARTER_TEMPLATES } from '../constants/templates';
import type { TemplateWorkflow } from '../types/workflow';

interface MeshDashboardViewProps {
  savedMeshes: SavedMesh[];
  onOpenMesh: (mesh: SavedMesh) => void;
  onOpenCreateModal: () => void;
  onDeleteMesh: (id: string) => void;
  onSelectTemplate: (template: TemplateWorkflow) => void;
}

export const MeshDashboardView: React.FC<MeshDashboardViewProps> = ({
  savedMeshes,
  onOpenMesh,
  onOpenCreateModal,
  onDeleteMesh,
  onSelectTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeshes = savedMeshes.filter((mesh) =>
    mesh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mesh.description && mesh.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      className="h-screen w-screen bg-[#0B0D14] text-gray-100 flex flex-col font-sans select-none overflow-y-auto custom-scrollbar"
      style={{ height: '100vh', width: '100vw', overflowY: 'auto' }}
    >
      {/* Top Flowaxon Navbar */}
      <header className="h-16 bg-[#141724] border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#FF5C49] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
            <Icons.Sparkles className="w-5.5 h-5.5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            Logic<span className="text-[#8B5CF6]">Mesh</span>
          </span>
          <span className="text-xs font-mono bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-2.5 py-0.5 rounded-full text-[#8B5CF6] font-semibold">
            Flowaxon AI Automation
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-lg shadow-[#8B5CF6]/25 hover:shadow-xl hover:from-[#9D72F8] hover:to-[#7577F3] transition-all active:scale-95 cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4 stroke-[3]" />
            Create Flowaxon Mesh
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto p-8 space-y-8 flex-1 pb-16">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171A28] via-[#1D2134] to-[#141724] border border-white/10 p-8 shadow-2xl flex items-center justify-between">
          <div className="space-y-3 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold">
              <Icons.Cpu className="w-3.5 h-3.5" />
              <span>AI-Powered Multi-Platform Orchestration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Flowaxon Automation Workflows
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Build, monitor, and scale visual automation pipelines integrating AI Agents, MongoDB, Webhooks, APIs, and SaaS apps.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 z-10">
            <div className="p-4 rounded-2xl bg-[#11131E]/90 border border-white/10 text-center min-w-[115px] shadow-inner">
              <div className="text-2xl font-extrabold text-[#8B5CF6] font-mono">{savedMeshes.length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Active Flows</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#11131E]/90 border border-white/10 text-center min-w-[115px] shadow-inner">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">99.8%</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Success Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#11131E]/90 border border-white/10 text-center min-w-[115px] shadow-inner">
              <div className="text-2xl font-extrabold text-[#06B6D4] font-mono">16</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Catalog Nodes</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flows by name or description..."
              className="w-full bg-[#171A28] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all font-medium"
            />
          </div>

          <span className="text-xs text-gray-400 font-mono">
            Showing {filteredMeshes.length} of {savedMeshes.length} Flows
          </span>
        </div>

        {/* Meshes Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Icons.FolderGit2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>All Automation Meshes ({filteredMeshes.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeshes.map((mesh) => (
              <div
                key={mesh.id}
                onClick={() => onOpenMesh(mesh)}
                className="group bg-[#171A28] hover:bg-[#1D2134] border border-white/10 hover:border-[#8B5CF6]/60 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6366F1]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
                      <Icons.Zap className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Active
                      </span>
                      {savedMeshes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMesh(mesh.id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
                          title="Delete Mesh"
                        >
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors truncate font-heading">
                      {mesh.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {mesh.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-semibold">{mesh.nodesCount || mesh.nodes?.length || 0} Steps</span>
                    <span>•</span>
                    <span>{mesh.edgesCount || mesh.edges?.length || 0} Connections</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    <span>Open Flow</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Mesh Card */}
            <div
              onClick={onOpenCreateModal}
              className="bg-[#171A28]/40 hover:bg-[#171A28] border-2 border-dashed border-white/10 hover:border-[#8B5CF6] rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[190px] group"
            >
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#8B5CF6]/20 text-gray-400 group-hover:text-[#8B5CF6] transition-all">
                <Icons.Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-200 group-hover:text-white">Create Blank Flow</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Start a new automation canvas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Starter Templates */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Icons.LayoutTemplate className="w-4 h-4 text-[#06B6D4]" />
            <span>Pre-Built Flowaxon Templates</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="p-4 rounded-xl bg-[#171A28] hover:bg-[#1D2134] border border-white/5 hover:border-[#06B6D4]/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-[#06B6D4] transition-colors font-heading">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/20 font-semibold">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
