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

  const filteredMeshes = savedMeshes.filter(
    (mesh) =>
      mesh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mesh.description && mesh.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 h-full bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
      {/* Main Body Content Container */}
      <div className="max-w-6xl w-full mx-auto space-y-8 pb-12">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/80 border border-slate-200/80 p-8 shadow-2xs flex items-center justify-between">
          <div className="space-y-3 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold">
              <Icons.Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>AI-Powered Multi-Platform Orchestration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Flowaxon Automation Workflows
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Build, monitor, and scale visual automation pipelines integrating AI Agents, MongoDB, Webhooks, APIs, and SaaS apps.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 z-10">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center min-w-[115px] shadow-2xs">
              <div className="text-2xl font-extrabold text-blue-600 font-mono">{savedMeshes.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5 font-heading">Active Flows</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center min-w-[115px] shadow-2xs">
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">99.8%</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5 font-heading">Success Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center min-w-[115px] shadow-2xs">
              <div className="text-2xl font-extrabold text-cyan-600 font-mono">16</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5 font-heading">Catalog Nodes</div>
            </div>
          </div>
        </div>

        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flows by name or description..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Icons.Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Flowaxon Mesh</span>
            </button>
            <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline-block">
              Showing {filteredMeshes.length} of {savedMeshes.length} Flows
            </span>
          </div>
        </div>

        {/* Meshes Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2 font-heading">
            <Icons.FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>All Automation Meshes ({filteredMeshes.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeshes.map((mesh) => (
              <div
                key={mesh.id}
                onClick={() => onOpenMesh(mesh)}
                className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 rounded-2xl p-5 shadow-2xs transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
                      <Icons.Zap className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          mesh.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : mesh.status === 'archived'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {mesh.status === 'published'
                          ? 'Active'
                          : mesh.status === 'archived'
                          ? 'Archived'
                          : 'Draft'}
                      </span>
                      {savedMeshes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMesh(mesh.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete Mesh"
                        >
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate font-heading">
                      {mesh.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-normal">
                      {mesh.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-semibold">{mesh.nodesCount || mesh.nodes?.length || 0} Steps</span>
                    <span>•</span>
                    <span>{mesh.edgesCount || mesh.edges?.length || 0} Connections</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    <span>Open Flow</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Mesh Card */}
            <div
              onClick={onOpenCreateModal}
              className="bg-white/60 hover:bg-white border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[190px] group shadow-2xs"
            >
              <div className="p-3 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-500 group-hover:text-slate-800 transition-all">
                <Icons.Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900 font-heading">Create Blank Flow</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Start a new automation canvas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Starter Templates */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2 font-heading">
            <Icons.LayoutTemplate className="w-4 h-4 text-cyan-600" />
            <span>Pre-Built Flowaxon Templates</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors font-heading">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 font-bold">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


