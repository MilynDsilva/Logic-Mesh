# LogicMesh System Architecture

## Overview
**LogicMesh** is an open-source visual workflow automation platform designed to deliver n8n-tier execution capability, modular node pipelines, and real-time execution monitoring with a state-of-the-art UI/UX interface powered by **MongoDB** document storage.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 LogicMesh Frontend                              │
│                                                                                 │
│   ┌─────────────────────┐   ┌────────────────────────┐   ┌──────────────────┐   │
│   │ Node Library & Drag │   │ Visual Canvas (ReactFlow)│ │ Node Inspector   │   │
│   └──────────┬──────────┘   └───────────┬────────────┘   └────────┬─────────┘   │
│              │                          │                         │             │
│              └──────────────────────────┼─────────────────────────┘             │
│                                         ▼                                       │
│                           ┌───────────────────────────┐                         │
│                           │ State Management (Store)  │                         │
│                           └─────────────┬─────────────┘                         │
│                                         │                                       │
└─────────────────────────────────────────┼───────────────────────────────────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        LogicMesh Node Backend & MongoDB Core                    │
│                                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌───────────────┐  │
│  │ Expression Evaluator    │  │ DAG Engine & Resolver     │  │ MongoDB Store │  │
│  │ {{ $json.data.item }}   │  │ Topological Sort & Run    │  │ Mongoose Schema│ │
│  └────────────┬────────────┘  └─────────────┬─────────────┘  └───────┬───────┘  │
│               │                             │                        │          │
│               └─────────────────────────────┼────────────────────────┘          │
│                                             ▼                                   │
│                               ┌───────────────────────────┐                     │
│                               │ Node Execution Handlers   │                     │
│                               │ - Webhook Listener        │                     │
│                               │ - MongoDB (CRUD & Agg)    │                     │
│                               │ - AI (OpenAI / Gemini)    │                     │
│                               │ - HTTP / Slack / Email    │                     │
│                               └───────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Engine Core & DAG Execution
LogicMesh models workflows as Directed Acyclic Graphs (DAGs):
- **Nodes**: Represent Triggers (Start points), Databases (MongoDB Node), Actions (HTTP, Email, AI, Slack), or Control Flow (Switch, Filter, Merge, Split).
- **Edges**: Represent data dependency flow from source output handles to target input handles.
- **Topological Sorting**: The execution engine parses nodes into execution tiers. Independent nodes run concurrently, while dependent nodes wait for parent payload output.
- **Execution Context**:
  ```ts
  interface ExecutionContext {
    workflowId: string;
    executionId: string;
    mode: 'test' | 'trigger' | 'manual';
    nodeResults: Record<string, NodeOutput>;
    variables: Record<string, any>;
    startTime: number;
  }
  ```

---

## 2. MongoDB Document Schemas

Workflows, Execution History Logs, and User Credentials are saved as BSON documents in MongoDB:

```ts
// Workflows Collection Schema
interface WorkflowDocument {
  _id: ObjectId;
  name: string;
  isActive: boolean;
  nodes: Array<LogicMeshNode>;
  edges: Array<LogicMeshEdge>;
  createdAt: Date;
  updatedAt: Date;
}

// Execution Logs Collection Schema
interface ExecutionLogDocument {
  _id: ObjectId;
  workflowId: ObjectId;
  status: 'success' | 'error';
  totalDurationMs: number;
  startTime: Date;
  triggerType: string;
  steps: Array<{
    nodeId: string;
    nodeName: string;
    status: 'success' | 'error';
    executionTimeMs: number;
    inputPayload: Record<string, any>;
    outputPayload: Record<string, any>;
  }>;
}
```

---

## 3. Expression Engine Syntax
LogicMesh includes an in-memory dynamic expression evaluator supporting mustache syntax and JavaScript expressions:
- Syntax: `{{ $json.fieldName }}` or `{{ $node["HTTP Request"].json.data.user.email }}`
- Globals available:
  - `$json`: Output of the immediate predecessor node.
  - `$node["NodeName"]`: Access output payload of specific executed node.
  - `$env`: Environment variables (e.g. `$env.MONGODB_URI`, `$env.OPENAI_API_KEY`).
  - `$now`: ISO timestamp helper.
