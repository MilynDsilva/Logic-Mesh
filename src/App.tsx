import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
import { NodeInspector } from './components/NodeInspector';
import { ExecutionLogsModal } from './components/ExecutionLogsModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { EnvironmentVariablesModal } from './components/EnvironmentVariablesModal';
import { CredentialVaultModal, type VaultCredentialItem } from './components/CredentialVaultModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CreateMeshModal } from './components/CreateMeshModal';
import { MeshManagerModal, type SavedMesh } from './components/MeshManagerModal';
import { NodePickerModal } from './components/NodePickerModal';
import { MeshDashboardView } from './components/MeshDashboardView';
import { useUndoRedo } from './hooks/useUndoRedo';

import { NODE_CATALOG } from './constants/nodeCatalog';
import { STARTER_TEMPLATES } from './constants/templates';
import { executeWorkflow } from './engine/executor';
import type { LogicNodeData, WorkflowExecutionLog, TemplateWorkflow } from './types/workflow';

const initialNodes: Node<LogicNodeData>[] = STARTER_TEMPLATES[0].nodes;
const initialEdges: Edge[] = STARTER_TEMPLATES[0].edges;

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'canvas'>('dashboard');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LogicNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('MongoDB Lead Ingestion & AI Classifier');
  const [currentMeshId, setCurrentMeshId] = useState('mesh_default_1');
  const [isActive, setIsActive] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCreateMeshOpen, setIsCreateMeshOpen] = useState(false);
  const [isMeshManagerOpen, setIsMeshManagerOpen] = useState(false);
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);

  // Saved Meshes List
  const [savedMeshes, setSavedMeshes] = useState<SavedMesh[]>([
    {
      id: 'mesh_default_1',
      name: 'MongoDB Lead Ingestion & AI Classifier',
      description: 'Webhook listener ingesting documents into MongoDB with AI classification.',
      updatedAt: new Date().toISOString(),
      nodesCount: initialNodes.length,
      edgesCount: initialEdges.length,
      nodes: initialNodes,
      edges: initialEdges,
    },
    {
      id: 'mesh_default_2',
      name: '⏱️ Scheduled API Health Poller',
      description: 'Recurring cron poller for production endpoints.',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      nodesCount: STARTER_TEMPLATES[2].nodes.length,
      edgesCount: STARTER_TEMPLATES[2].edges.length,
      nodes: STARTER_TEMPLATES[2].nodes,
      edges: STARTER_TEMPLATES[2].edges,
    },
  ]);

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
      name,
      description,
      updatedAt: new Date().toISOString(),
      nodesCount: 1,
      edgesCount: 0,
      nodes: [initialTriggerNode],
      edges: [],
    };

    setSavedMeshes((prev) => [newMesh, ...prev]);
    setCurrentMeshId(newMeshId);
    setWorkflowName(name);
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
      {viewMode === 'dashboard' ? (
        <MeshDashboardView
          savedMeshes={savedMeshes}
          onOpenMesh={handleSelectMesh}
          onOpenCreateModal={() => setIsCreateMeshOpen(true)}
          onDeleteMesh={handleDeleteMesh}
          onSelectTemplate={handleSelectTemplate}
        />
      ) : (
        <div
          className="flex flex-col w-screen h-screen bg-[#0D0E12] overflow-hidden select-none"
          style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Top Header Navigation */}
          <Header
            workflowName={workflowName}
            setWorkflowName={setWorkflowName}
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
            isActive={isActive}
            setIsActive={setIsActive}
          />

          {/* Main Workspace Area */}
          <div className="flex-1 flex overflow-hidden relative" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {/* Left Sidebar: Node Library */}
            <Sidebar onAddNode={handleAddNodeFromSidebar} />

            {/* Center Canvas */}
            <div className="flex-1 h-full relative" style={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes as any}
                edges={edges}
                onNodesChange={onNodesChange as any}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  style: { stroke: '#4B5563', strokeWidth: 2 },
                }}
              >
                <Background color="#1A1D26" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls position="bottom-left" showInteractive={false} />
                <MiniMap
                  position="bottom-right"
                  nodeColor={(node: any) => node.data?.color || '#FF5C49'}
                  maskColor="rgba(13, 14, 18, 0.7)"
                />

                {/* Quick Status Floating Badge */}
                <Panel position="top-right" className="m-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161824]/90 border border-white/10 backdrop-blur-md shadow-lg text-xs font-medium text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>{nodes.length} Nodes</span>
                    <span className="text-gray-400">•</span>
                    <span>{edges.length} Connections</span>
                  </div>
                </Panel>
              </ReactFlow>
            </div>

            {/* Right Sidebar: Node Inspector */}
            <NodeInspector
              selectedNode={selectedNode}
              onUpdateParameters={handleUpdateParameters}
              onUpdateLabel={handleUpdateLabel}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onClose={() => setSelectedNodeId(null)}
              env={envVars}
              isExecuting={isExecuting}
            />
          </div>
        </div>
      )}

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

      <NodePickerModal
        isOpen={isNodePickerOpen}
        onClose={() => setIsNodePickerOpen(false)}
        onSelectNode={handleAddNodeFromSidebar}
      />
    </>
  );
}
