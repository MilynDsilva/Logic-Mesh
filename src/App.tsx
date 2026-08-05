import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import confetti from 'canvas-confetti';

import { CustomNode } from './components/CustomNode';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExecutionLogsModal } from './components/ExecutionLogsModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { EnvironmentVariablesModal } from './components/EnvironmentVariablesModal';
import { CredentialVaultModal, type VaultCredentialItem } from './components/CredentialVaultModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CreateMeshModal } from './components/CreateMeshModal';
import { MeshManagerModal, type SavedMesh } from './components/MeshManagerModal';
import { NodePickerDrawer } from './components/NodePickerDrawer';
import { NodeConfigModal } from './components/NodeConfigModal';
import { MeshDashboardView } from './components/MeshDashboardView';
import { AutomationsListView } from './components/AutomationsListView';
import { ExecutionsListView } from './components/ExecutionsListView';
import { BottomLogsPanel } from './components/BottomLogsPanel';
import { useUndoRedo } from './hooks/useUndoRedo';

import { NODE_CATALOG } from './constants/nodeCatalog';
import { STARTER_TEMPLATES } from './constants/templates';
import { executeWorkflow } from './engine/executor';
import type { LogicNodeData, WorkflowExecutionLog, TemplateWorkflow } from './types/workflow';

const initialNodes: Node<LogicNodeData>[] = STARTER_TEMPLATES[0].nodes;
const initialEdges: Edge[] = STARTER_TEMPLATES[0].edges;

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'automations' | 'executions' | 'canvas'>('dashboard');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LogicNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('MongoDB Lead Ingestion & AI Classifier');
  const [currentMeshId, setCurrentMeshId] = useState('mesh_default_1');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [isBottomLogsOpen, setIsBottomLogsOpen] = useState(false);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCreateMeshOpen, setIsCreateMeshOpen] = useState(false);
  const [isMeshManagerOpen, setIsMeshManagerOpen] = useState(false);
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const [isNodeConfigModalOpen, setIsNodeConfigModalOpen] = useState(false);

  // Saved Meshes List with LocalStorage Auto-Save
  const [savedMeshes, setSavedMeshes] = useState<SavedMesh[]>(() => {
    const local = localStorage.getItem('logicmesh_saved_workflows');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to load saved workflows', e);
      }
    }
    return [
      {
        id: 'mesh_default_1',
        name: 'MongoDB Lead Ingestion & AI Classifier',
        description: 'Webhook listener ingesting documents into MongoDB with AI classification.',
        updatedAt: 'Recently',
        nodesCount: initialNodes.length,
        edgesCount: initialEdges.length,
        nodes: initialNodes,
        edges: initialEdges,
        status: 'published',
      },
      {
        id: 'mesh_default_2',
        name: '⏱️ Scheduled API Health Poller',
        description: 'Recurring cron poller for production endpoints.',
        updatedAt: '1 hr ago',
        nodesCount: STARTER_TEMPLATES[2].nodes.length,
        edgesCount: STARTER_TEMPLATES[2].edges.length,
        nodes: STARTER_TEMPLATES[2].nodes,
        edges: STARTER_TEMPLATES[2].edges,
        status: 'draft',
      },
    ];
  });

  // Sync to LocalStorage whenever savedMeshes changes
  useEffect(() => {
    localStorage.setItem('logicmesh_saved_workflows', JSON.stringify(savedMeshes));
  }, [savedMeshes]);

  // Real-time Auto-Save: sync current canvas state into savedMeshes
  useEffect(() => {
    if (!currentMeshId) return;
    setSavedMeshes((prev) => {
      const existing = prev.find((m) => m.id === currentMeshId);
      const updatedMesh: SavedMesh = {
        id: currentMeshId,
        name: workflowName || 'Untitled Workflow',
        description: existing?.description || 'Auto-saved workflow',
        updatedAt: 'Just now',
        nodesCount: nodes.length,
        edgesCount: edges.length,
        nodes,
        edges,
        status: existing?.status || 'draft',
      };
      if (existing) {
        return prev.map((m) => (m.id === currentMeshId ? updatedMesh : m));
      } else {
        return [updatedMesh, ...prev];
      }
    });
  }, [nodes, edges, workflowName, currentMeshId]);

  const currentWorkflow = savedMeshes.find((m) => m.id === currentMeshId);
  const currentWorkflowStatus = currentWorkflow?.status || 'draft';

  const handleTogglePublishCurrent = () => {
    const nextStatus = currentWorkflowStatus === 'published' ? 'draft' : 'published';
    setSavedMeshes((prev) =>
      prev.map((m) => (m.id === currentMeshId ? { ...m, status: nextStatus } : m))
    );
  };

  const handleTogglePublishMesh = (id: string, published: boolean) => {
    setSavedMeshes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: published ? 'published' : 'draft' } : m))
    );
  };

  const handleArchiveCurrent = () => {
    setSavedMeshes((prev) =>
      prev.map((m) => (m.id === currentMeshId ? { ...m, status: 'archived' } : m))
    );
  };

  const handleArchiveMesh = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedMeshes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const isArch = m.status === 'archived';
          return { ...m, status: isArch ? 'draft' : 'archived' };
        }
        return m;
      })
    );
  };

  // Canvas Undo / Redo Hook
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo({ nodes, edges });

  const [envVars, setEnvVars] = useState<Record<string, string>>({
    MONGODB_URI: 'mongodb+srv://admin:secret@cluster0.mongodb.net/logicmesh_db?retryWrites=true&w=majority',
    OPENAI_API_KEY: 'sk-proj-logicmesh-demo-9921',
    SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/T00/B00/X00',
  });

  const [vaultCredentials, setVaultCredentials] = useState<VaultCredentialItem[]>([
    {
      id: 'cred-1',
      name: 'Production MongoDB Atlas Cluster',
      type: 'mongodb',
      maskedValue: 'mongodb+srv://admin...cluster0',
      encrypted: 'enc_9921_mongodb_uri',
    },
    {
      id: 'cred-2',
      name: 'OpenAI GPT-4o API Key',
      type: 'openai',
      maskedValue: 'sk-proj...9921',
      encrypted: 'enc_8812_openai_key',
    },
  ]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ customNode: CustomNode as any }), []);

  const handleUndoAction = () => {
    const previous = undo();
    if (previous) {
      setNodes(previous.nodes as any);
      setEdges(previous.edges);
    }
  };

  const handleRedoAction = () => {
    const next = redo();
    if (next) {
      setNodes(next.nodes as any);
      setEdges(next.edges);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const nextEds = addEdge({ ...params, animated: false }, eds);
        takeSnapshot({ nodes, edges: nextEds });
        return nextEds;
      });
    },
    [setEdges, takeSnapshot, nodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/logicmesh-node');
      if (!type || !NODE_CATALOG[type] || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const catalogDef = NODE_CATALOG[type];
      const newNode: Node<LogicNodeData> = {
        id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'customNode',
        position,
        data: {
          label: catalogDef.name,
          nodeType: catalogDef.type,
          category: catalogDef.category,
          iconName: catalogDef.iconName,
          color: catalogDef.color,
          parameters: { ...catalogDef.defaultParams },
          status: 'idle',
        },
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setSelectedNodeId(newNode.id);
      takeSnapshot({ nodes: updatedNodes, edges });
    },
    [reactFlowInstance, setNodes, nodes, edges, takeSnapshot]
  );

  const handleAddNodeFromSidebar = (nodeType: string) => {
    const catalogDef = NODE_CATALOG[nodeType];
    if (!catalogDef) return;

    const newNode: Node<LogicNodeData> = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'customNode',
      position: {
        x: 350 + Math.random() * 80,
        y: 200 + Math.random() * 80,
      },
      data: {
        label: catalogDef.name,
        nodeType: catalogDef.type,
        category: catalogDef.category,
        iconName: catalogDef.iconName,
        color: catalogDef.color,
        parameters: { ...catalogDef.defaultParams },
        status: 'idle',
      },
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setSelectedNodeId(newNode.id);
    takeSnapshot({ nodes: updatedNodes, edges });
  };

  // Create New Mesh Workflow
  const handleCreateNewMesh = (name: string, description: string, startType: 'blank' | 'webhook' | 'schedule') => {
    let finalName = name.trim();
    if (!finalName) {
      let maxNum = 0;
      savedMeshes.forEach((m) => {
        const match = m.name.match(/^Workflow\s+(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      finalName = `Workflow ${maxNum + 1}`;
    }

    const triggerNodeType =
      startType === 'webhook'
        ? 'webhook_trigger'
        : startType === 'schedule'
        ? 'schedule_trigger'
        : 'manual_trigger';

    const triggerCatalog = NODE_CATALOG[triggerNodeType];

    const initialTriggerNode: Node<LogicNodeData> = {
      id: `node_${Date.now()}_start`,
      type: 'customNode',
      position: { x: 250, y: 220 },
      data: {
        label: triggerCatalog.name,
        nodeType: triggerCatalog.type,
        category: triggerCatalog.category,
        iconName: triggerCatalog.iconName,
        color: triggerCatalog.color,
        parameters: { ...triggerCatalog.defaultParams },
        status: 'idle',
      },
    };

    const newMeshId = `mesh_${Date.now()}`;
    const newMesh: SavedMesh = {
      id: newMeshId,
      name: finalName,
      description: description || 'Custom automation workflow',
      updatedAt: 'Just now',
      nodesCount: 1,
      edgesCount: 0,
      nodes: [initialTriggerNode],
      edges: [],
      status: 'draft',
    };

    setSavedMeshes((prev) => [newMesh, ...prev]);
    setCurrentMeshId(newMeshId);
    setWorkflowName(finalName);
    setNodes([initialTriggerNode]);
    setEdges([]);
    setSelectedNodeId(initialTriggerNode.id);
    takeSnapshot({ nodes: [initialTriggerNode], edges: [] });
    setViewMode('canvas');
  };

  const handleSelectMesh = (mesh: SavedMesh) => {
    setCurrentMeshId(mesh.id);
    setWorkflowName(mesh.name);
    setNodes(mesh.nodes);
    setEdges(mesh.edges);
    setSelectedNodeId(null);
    takeSnapshot({ nodes: mesh.nodes, edges: mesh.edges });
    setViewMode('canvas');
  };

  const handleDeleteMesh = (id: string) => {
    setSavedMeshes((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateParameters = (nodeId: string, parameters: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, parameters } } : n))
    );
  };

  const handleUpdateLabel = (nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    takeSnapshot({ nodes: updatedNodes, edges: updatedEdges });
  };

  const handleDuplicateNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const newNode: Node<LogicNodeData> = {
      ...target,
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setSelectedNodeId(newNode.id);
    takeSnapshot({ nodes: updatedNodes, edges });
  };

  const handleExecuteWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setIsBottomLogsOpen(true);

    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle', executionTimeMs: undefined } }))
    );
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));

    const executionLog = await executeWorkflow('wf_main', {
      nodes,
      edges,
      env: envVars,
      onNodeStart: (nodeId) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n
          )
        );
      },
      onEdgeActive: (edgeId) => {
        setEdges((eds) =>
          eds.map((e) => (e.id === edgeId ? { ...e, animated: true } : e))
        );
      },
      onNodeComplete: (nodeId, output, durationMs) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    executionTimeMs: durationMs,
                    lastOutput: output,
                  },
                }
              : n
          )
        );
      },
      onNodeError: (nodeId, errorMsg) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'error',
                    lastError: errorMsg,
                  },
                }
              : n
          )
        );
      },
    });

    setLogs((prev) => [executionLog, ...prev]);
    setIsExecuting(false);

    if (executionLog.status === 'success') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#FF5C49', '#6366F1'],
      });
    }
  };

  const handleExportJSON = useCallback(() => {
    const workflowData = {
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.toLowerCase().replace(/\s+/g, '_')}_workflow.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [workflowName, nodes, edges]);

  const handleImportJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.nodes && parsed.edges) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        if (parsed.name) setWorkflowName(parsed.name);
        setSelectedNodeId(null);
        takeSnapshot({ nodes: parsed.nodes, edges: parsed.edges });
        setViewMode('canvas');
      }
    } catch {
      alert('Invalid LogicMesh workflow JSON file format.');
    }
  };

  const handleSelectTemplate = (template: TemplateWorkflow) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setSelectedNodeId(null);
    takeSnapshot({ nodes: template.nodes, edges: template.edges });
    setViewMode('canvas');
  };

  // Global Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedoAction();
        else handleUndoAction();
      } else if (isCmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        handleExecuteWorkflow();
      } else if (isCmdOrCtrl && e.key === 's') {
        e.preventDefault();
        handleExportJSON();
      } else if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        setIsNodePickerOpen(true);
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setIsTemplatesOpen(false);
        setIsLogsOpen(false);
        setIsEnvOpen(false);
        setIsVaultOpen(false);
        setIsShortcutsOpen(false);
        setIsCreateMeshOpen(false);
        setIsMeshManagerOpen(false);
        setIsNodePickerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndoAction, handleRedoAction, handleExecuteWorkflow, handleExportJSON]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <>
      <div
        className="flex flex-col w-screen h-screen bg-slate-50 overflow-hidden select-none"
        style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top Header Navigation */}
        <Header
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          viewMode={viewMode}
          workflowStatus={currentWorkflowStatus}
          onTogglePublish={handleTogglePublishCurrent}
          onArchiveWorkflow={handleArchiveCurrent}
          isExecuting={isExecuting}
          onExecute={handleExecuteWorkflow}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenEnv={() => setIsEnvOpen(true)}
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenCreateMesh={() => setIsCreateMeshOpen(true)}
          onOpenMeshManager={() => setIsMeshManagerOpen(true)}
          onOpenNodePicker={() => setIsNodePickerOpen(true)}
          onBackToDashboard={() => setViewMode('dashboard')}
          onUndo={handleUndoAction}
          onRedo={handleRedoAction}
          canUndo={canUndo}
          canRedo={canRedo}
          onExport={handleExportJSON}
          onImport={handleImportJSON}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex overflow-hidden relative" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Left Sidebar: Navigation & Node Library */}
          <Sidebar
            onAddNode={handleAddNodeFromSidebar}
            viewMode={viewMode}
            onNavigate={(mode) => setViewMode(mode)}
          />

          {/* View Switcher: Dashboard, Automations List, Executions List, or Interactive Canvas */}
          {viewMode === 'dashboard' ? (
            <MeshDashboardView
              savedMeshes={savedMeshes}
              onOpenMesh={handleSelectMesh}
              onOpenCreateModal={() => setIsCreateMeshOpen(true)}
              onDeleteMesh={handleDeleteMesh}
              onSelectTemplate={handleSelectTemplate}
            />
          ) : viewMode === 'automations' ? (
            <AutomationsListView
              savedMeshes={savedMeshes}
              onOpenMesh={handleSelectMesh}
              onOpenCreateModal={() => setIsCreateMeshOpen(true)}
              onDeleteMesh={handleDeleteMesh}
              onTogglePublish={handleTogglePublishMesh}
              onArchiveMesh={handleArchiveMesh}
            />
          ) : viewMode === 'executions' ? (
            <ExecutionsListView onOpenLogsModal={() => setIsLogsOpen(true)} />
          ) : (
            <>
              {/* Center Canvas */}
              <div className="flex-1 h-full relative bg-slate-50" style={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
                <ReactFlow
                  nodes={nodes as any}
                  edges={edges}
                  onNodesChange={onNodesChange as any}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onNodeDoubleClick={(_, node) => {
                    setSelectedNodeId(node.id);
                    setIsNodeConfigModalOpen(true);
                  }}
                  onPaneClick={onPaneClick}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: { stroke: '#94A3B8', strokeWidth: 2 },
                  }}
                >
                  <Background color="#CBD5E1" gap={24} size={1.2} variant={BackgroundVariant.Dots} />
                  
                  {/* Floating Bottom Toolbar (Flowaxon Canvas Tools) */}
                  <Panel position="bottom-center" className="mb-6">
                    <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-2xl shadow-lg backdrop-blur-md">
                      <button
                        className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                        title="Select (V)"
                      >
                        <Icons.MousePointer2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Frame (F)"
                      >
                        <Icons.Frame className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Text (T)"
                      >
                        <Icons.Type className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Draw (P)"
                      >
                        <Icons.Pencil className="w-4 h-4" />
                      </button>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      <button
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Layers"
                      >
                        <Icons.Layers className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Comment (C)"
                      >
                        <Icons.MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </Panel>

                  <Controls position="bottom-left" showInteractive={false} className="!bg-white !border-slate-200 !shadow-xs !rounded-2xl" />
                  <MiniMap
                    position="bottom-right"
                    nodeColor={(node: any) => node.data?.color || '#3B82F6'}
                    maskColor="rgba(241, 245, 249, 0.7)"
                    className="!bg-white !border-slate-200 !shadow-xs !rounded-2xl overflow-hidden"
                  />

                  {/* n8n-Style Top-Right Canvas Controls (Add Node +, Zoom In/Out, Logs) */}
                  <Panel position="top-right" className="m-4 flex items-center gap-2">
                    {/* Add Component (+) Button */}
                    <button
                      onClick={() => setIsNodePickerOpen(true)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title="Add Node / Component (+)"
                    >
                      <Icons.Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Zoom In/Out & Fit Controls */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
                      <button
                        onClick={() => reactFlowInstance?.zoomIn()}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        title="Zoom In (+)"
                      >
                        <Icons.Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reactFlowInstance?.zoomOut()}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        title="Zoom Out (-)"
                      >
                        <Icons.Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reactFlowInstance?.fitView({ padding: 0.2 })}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        title="Fit View"
                      >
                        <Icons.Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setIsBottomLogsOpen((prev) => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                        isBottomLogsOpen
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Toggle Execution Logs Panel"
                    >
                      <Icons.Terminal className="w-3.5 h-3.5" />
                      <span>Logs</span>
                      {logs.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                          {logs.length}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{nodes.length} Nodes</span>
                      <span className="text-slate-300">•</span>
                      <span>{edges.length} Connections</span>
                    </div>
                  </Panel>
                </ReactFlow>

                {/* n8n-Style Bottom Docked Execution Logs Panel */}
                <BottomLogsPanel
                  isOpen={isBottomLogsOpen}
                  onClose={() => setIsBottomLogsOpen(false)}
                  isExecuting={isExecuting}
                  latestLog={logs[0] || null}
                  onSelectNodeOnCanvas={(nodeId) => setSelectedNodeId(nodeId)}
                  onOpenFullHistory={() => setIsLogsOpen(true)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExecutionLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />

      <TemplateGalleryModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <EnvironmentVariablesModal
        isOpen={isEnvOpen}
        onClose={() => setIsEnvOpen(false)}
        envVars={envVars}
        onSaveEnvVars={setEnvVars}
      />

      <CredentialVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        credentials={vaultCredentials}
        onAddCredential={(cred) => setVaultCredentials([...vaultCredentials, cred])}
        onDeleteCredential={(id) => setVaultCredentials(vaultCredentials.filter((c) => c.id !== id))}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CreateMeshModal
        isOpen={isCreateMeshOpen}
        onClose={() => setIsCreateMeshOpen(false)}
        onCreateMesh={handleCreateNewMesh}
      />

      <MeshManagerModal
        isOpen={isMeshManagerOpen}
        onClose={() => setIsMeshManagerOpen(false)}
        savedMeshes={savedMeshes}
        currentMeshId={currentMeshId}
        onSelectMesh={handleSelectMesh}
        onDeleteMesh={handleDeleteMesh}
        onOpenCreateMesh={() => setIsCreateMeshOpen(true)}
      />

      <NodePickerDrawer
        isOpen={isNodePickerOpen}
        onClose={() => setIsNodePickerOpen(false)}
        onSelectNode={handleAddNodeFromSidebar}
      />

      <NodeConfigModal
        isOpen={isNodeConfigModalOpen}
        onClose={() => setIsNodeConfigModalOpen(false)}
        selectedNode={selectedNode}
        allNodes={nodes}
        onUpdateParameters={handleUpdateParameters}
        onUpdateLabel={handleUpdateLabel}
        onDeleteNode={handleDeleteNode}
        onDuplicateNode={handleDuplicateNode}
        env={envVars}
      />
    </>
  );
}
