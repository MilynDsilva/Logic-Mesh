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
    <div className="min-h-screen w-screen bg-[#0D0E12] text-gray-100 flex flex-col font-sans select-none overflow-y-auto custom-scrollbar">
      {/* Top Navbar */}
      <header className="h-16 bg-[#12141C] border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5C49] to-[#6366F1] flex items-center justify-center shadow-md shadow-[#FF5C49]/20">
            <Icons.Zap className="w-5.5 h-5.5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            Logic<span className="text-[#FF5C49]">Mesh</span>
          </span>
          <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-gray-400">
            Projects Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5C49] to-[#FF453A] text-white shadow-lg shadow-[#FF5C49]/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4 stroke-[3]" />
            Create New Mesh
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto p-8 space-y-8 flex-1">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#161824] via-[#1A1D2B] to-[#12141C] border border-white/10 p-8 shadow-2xl flex items-center justify-between">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5C49]/10 border border-[#FF5C49]/20 text-[#FF5C49] text-xs font-semibold">
              <Icons.Sparkles className="w-3.5 h-3.5" />
              <span>n8n-Tier Automation Platform</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">
              Your Automation Meshes & Workflows
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Design, orchestrate, and deploy visual workflow pipelines connecting MongoDB, AI LLMs, APIs, and Webhooks.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 z-10">
            <div className="p-4 rounded-2xl bg-[#12141C]/80 border border-white/10 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold text-[#FF5C49] font-mono">{savedMeshes.length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Total Meshes</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C]/80 border border-white/10 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">16</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Catalog Nodes</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meshes by name or description..."
              className="w-full bg-[#161824] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FF5C49] focus:ring-1 focus:ring-[#FF5C49] transition-all font-medium"
            />
          </div>

          <span className="text-xs text-gray-400 font-mono">
            Showing {filteredMeshes.length} of {savedMeshes.length} Meshes
          </span>
        </div>

        {/* Meshes Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Icons.FolderGit2 className="w-4 h-4 text-[#FF5C49]" />
            <span>All Saved Meshes ({filteredMeshes.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeshes.map((mesh) => (
              <div
                key={mesh.id}
                onClick={() => onOpenMesh(mesh)}
                className="group bg-[#161824] hover:bg-[#1A1D2B] border border-white/10 hover:border-[#FF5C49]/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF5C49]/20 to-[#6366F1]/20 text-[#FF5C49] border border-[#FF5C49]/30 group-hover:scale-105 transition-transform">
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
                    <h3 className="text-sm font-bold text-white group-hover:text-[#FF5C49] transition-colors truncate">
                      {mesh.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {mesh.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-semibold">{mesh.nodesCount || mesh.nodes?.length || 0} Nodes</span>
                    <span>•</span>
                    <span>{mesh.edgesCount || mesh.edges?.length || 0} Edges</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF5C49] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    <span>Open Canvas</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Mesh Card */}
            <div
              onClick={onOpenCreateModal}
              className="bg-[#161824]/40 hover:bg-[#161824] border-2 border-dashed border-white/10 hover:border-[#FF5C49] rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[190px] group"
            >
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#FF5C49]/20 text-gray-400 group-hover:text-[#FF5C49] transition-all">
                <Icons.Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-200 group-hover:text-white">Create Blank Mesh</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Start a new automation workflow canvas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Starter Templates */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Icons.LayoutTemplate className="w-4 h-4 text-indigo-400" />
            <span>Or Quick Start from Starter Templates</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="p-4 rounded-xl bg-[#161824] hover:bg-[#1A1D2B] border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
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
