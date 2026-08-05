import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { SavedMesh } from './MeshManagerModal';

interface AutomationsListViewProps {
  savedMeshes: SavedMesh[];
  onOpenMesh: (mesh: SavedMesh) => void;
  onOpenCreateModal: () => void;
  onDeleteMesh: (id: string, e: React.MouseEvent) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onArchiveMesh?: (id: string, e: React.MouseEvent) => void;
}

export const AutomationsListView: React.FC<AutomationsListViewProps> = ({
  savedMeshes,
  onOpenMesh,
  onOpenCreateModal,
  onDeleteMesh,
  onTogglePublish,
  onArchiveMesh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const filteredMeshes = savedMeshes.filter((mesh) => {
    const matchesSearch =
      mesh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mesh.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const status = mesh.status || 'draft';
    const matchesFilter =
      filterStatus === 'all'
        ? status !== 'archived'
        : filterStatus === 'published'
        ? status === 'published'
        : filterStatus === 'draft'
        ? status === 'draft'
        : status === 'archived';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-6 select-none">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Automations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs">
              {savedMeshes.length} Workflows
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Manage, publish, and inspect all automated visual pipelines.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workflows by name or description..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs font-medium transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs shrink-0 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({savedMeshes.filter((m) => m.status !== 'archived').length})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'published'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Published ({savedMeshes.filter((m) => m.status === 'published').length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'draft'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Draft ({savedMeshes.filter((m) => !m.status || m.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'archived'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Archived ({savedMeshes.filter((m) => m.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Workflows n8n-Style Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {filteredMeshes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Icons.ZapOff className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No workflows found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? `No workflows match "${searchTerm}". Try adjusting your search query.`
                : 'Get started by creating your first automation workflow.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-5">Workflow Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMeshes.map((mesh) => {
                  const status = mesh.status || 'draft';
                  const isPublished = status === 'published';
                  const isArchived = status === 'archived';

                  return (
                    <tr
                      key={mesh.id}
                      onClick={() => onOpenMesh(mesh)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Name & Description */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <Icons.Zap className="w-4 h-4 fill-current" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                              {mesh.name}
                            </div>
                            {mesh.description && (
                              <div className="text-slate-500 text-xs truncate max-w-md font-medium mt-0.5">
                                {mesh.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Switch & Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePublish?.(mesh.id, !isPublished);
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isPublished ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={isPublished ? 'Status: Active (Click to set Draft)' : 'Status: Draft (Click to Publish)'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isPublished ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isArchived
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </>
                            ) : isArchived ? (
                              'Archived'
                            ) : (
                              'Draft'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Steps & Connections */}
                      <td className="py-4 px-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{mesh.nodesCount} steps</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{mesh.edgesCount} connections</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {mesh.updatedAt || 'Recently'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenMesh(mesh);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                            title="Open Canvas Editor"
                          >
                            <span>Open</span>
                            <Icons.ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive Action */}
                          {onArchiveMesh && (
                            <button
                              onClick={(e) => onArchiveMesh(mesh.id, e)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                              title={isArchived ? 'Restore Workflow' : 'Archive Workflow'}
                            >
                              <Icons.Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={(e) => onDeleteMesh(mesh.id, e)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete Workflow"
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
