import React from 'react';
import * as Icons from 'lucide-react';

export interface SavedMesh {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  nodesCount: number;
  edgesCount: number;
  nodes: any[];
  edges: any[];
  status?: 'draft' | 'published' | 'archived';
}

interface MeshManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMeshes: SavedMesh[];
  currentMeshId: string;
  onSelectMesh: (mesh: SavedMesh) => void;
  onDeleteMesh: (id: string) => void;
  onOpenCreateMesh: () => void;
}

export const MeshManagerModal: React.FC<MeshManagerModalProps> = ({
  isOpen,
  onClose,
  savedMeshes,
  currentMeshId,
  onSelectMesh,
  onDeleteMesh,
  onOpenCreateMesh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Icons.FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">My Mesh Workflows & Projects</h3>
              <p className="text-[11px] text-slate-500">Switch between saved meshes or create a new automation pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateMesh();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              New Mesh
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Meshes */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          {savedMeshes.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              <Icons.FolderX className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              No saved meshes found. Click "+ New Mesh" to create one.
            </div>
          ) : (
            savedMeshes.map((mesh) => {
              const isActive = currentMeshId === mesh.id;

              return (
                <div
                  key={mesh.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group shadow-2xs ${
                    isActive
                      ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <Icons.Zap className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate font-heading">{mesh.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active Workspace
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {mesh.description || 'No description provided.'}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400 font-medium">
                        <span>{mesh.nodesCount || mesh.nodes.length} Nodes</span>
                        <span>•</span>
                        <span>{mesh.edgesCount || mesh.edges.length} Connections</span>
                        <span>•</span>
                        <span>Updated {new Date(mesh.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => {
                          onSelectMesh(mesh);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all active:scale-95 cursor-pointer"
                      >
                        Open Mesh
                      </button>
                    )}

                    {savedMeshes.length > 1 && (
                      <button
                        onClick={() => onDeleteMesh(mesh.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                        title="Delete Mesh"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

