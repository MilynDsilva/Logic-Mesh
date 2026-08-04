import React, { useState, useCallback, useMemo, useRef } from 'react';
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

import { NODE_CATALOG } from './constants/nodeCatalog';
import { STARTER_TEMPLATES } from './constants/templates';
import { executeWorkflow } from './engine/executor';
import type { LogicNodeData, WorkflowExecutionLog, TemplateWorkflow } from './types/workflow';

const initialNodes: Node<LogicNodeData>[] = STARTER_TEMPLATES[0].nodes;
const initialEdges: Edge[] = STARTER_TEMPLATES[0].edges;

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LogicNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('MongoDB Lead Ingestion & AI Classifier');
  const [isActive, setIsActive] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

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

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
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

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [reactFlowInstance, setNodes]
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

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
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
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleDuplicateNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const newNode: Node<LogicNodeData> = {
      ...target,
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
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

  const handleExportJSON = () => {
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
  };

  const handleImportJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.nodes && parsed.edges) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        if (parsed.name) setWorkflowName(parsed.name);
        setSelectedNodeId(null);
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
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0D0E12] overflow-hidden select-none">
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
        onExport={handleExportJSON}
        onImport={handleImportJSON}
        isActive={isActive}
        setIsActive={setIsActive}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Node Library */}
        <Sidebar onAddNode={handleAddNodeFromSidebar} />

        {/* Center Canvas */}
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
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
        />
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
    </div>
  );
}
