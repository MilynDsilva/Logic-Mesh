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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Icons.FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">My Mesh Workflows & Projects</h3>
              <p className="text-[11px] text-gray-400">Switch between saved meshes or create a new automation pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateMesh();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5C49] hover:bg-[#FF453A] text-white shadow-md transition-all active:scale-95"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              New Mesh
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Meshes */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#0D0E12]">
          {savedMeshes.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              <Icons.FolderX className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              No saved meshes found. Click "+ New Mesh" to create one.
            </div>
          ) : (
            savedMeshes.map((mesh) => {
              const isActive = currentMeshId === mesh.id;

              return (
                <div
                  key={mesh.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                    isActive
                      ? 'bg-[#1A1D2B] border-[#FF5C49] shadow-lg ring-1 ring-[#FF5C49]/30'
                      : 'bg-[#161824] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-[#FF5C49]/20 text-[#FF5C49] border-[#FF5C49]/40' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                      <Icons.Zap className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{mesh.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active Workspace
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {mesh.description || 'No description provided.'}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-gray-400">
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
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5C49]/10 hover:bg-[#FF5C49] text-[#FF5C49] hover:text-white border border-[#FF5C49]/30 transition-all active:scale-95"
                      >
                        Open Mesh
                      </button>
                    )}

                    {savedMeshes.length > 1 && (
                      <button
                        onClick={() => onDeleteMesh(mesh.id)}
                        className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
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
