# LogicMesh System Architecture

## Overview
**LogicMesh** is an open-source visual workflow automation platform designed to deliver n8n-tier execution capability, modular node pipelines, and real-time execution monitoring with a state-of-the-art UI/UX interface.

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
│                               LogicMesh Execution Core                          │
│                                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌───────────────┐  │
│  │ Expression Evaluator    │  │ DAG Engine & Resolver     │  │ Data Pipeline │  │
│  │ {{ $json.data.item }}   │  │ Topological Sort & Run    │  │ Payload Passing│  │
│  └────────────┬────────────┘  └─────────────┬─────────────┘  └───────┬───────┘  │
│               │                             │                        │          │
│               └─────────────────────────────┼────────────────────────┘          │
│                                             ▼                                   │
│                               ┌───────────────────────────┐                     │
│                               │ Node Execution Handlers   │                     │
│                               │ - HTTP / Webhook          │                     │
│                               │ - AI (OpenAI / Gemini)    │                     │
│                               │ - Code (JS Evaluator)     │                     │
│                               │ - Logic (Filter/Switch)   │                     │
│                               └───────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Engine Core & DAG Execution
LogicMesh models workflows as Directed Acyclic Graphs (DAGs):
- **Nodes**: Represent Triggers (Start points), Actions (HTTP, Email, AI, DB), or Control Flow (Switch, Filter, Merge, Split).
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

## 2. Expression Engine Syntax
LogicMesh includes an in-memory dynamic expression evaluator supporting mustache syntax and JavaScript expressions:
- Syntax: `{{ $json.fieldName }}` or `{{ $node["HTTP Request"].json.data.user.email }}`
- Globals available:
  - `$json`: Output of the immediate predecessor node.
  - `$node["NodeName"]`: Access output payload of specific executed node.
  - `$env`: Environment variables (API keys, webhook secrets).
  - `$now`: ISO timestamp helper.
  - `$run`: Execution metadata (`executionId`, `mode`).

---

## 3. Node Specification Architecture
Every node in LogicMesh implements a strict descriptor schema:

```ts
interface LogicNodeDescriptor {
  type: string;
  name: string;
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'utility';
  icon: string;
  color: string;
  description: string;
  inputs: Array<{ id: string; name: string; type: string }>;
  outputs: Array<{ id: string; name: string; type: string }>;
  parameters: Array<NodeParameter>;
  execute: (inputs: Record<string, any>, params: Record<string, any>, context: ExecutionContext) => Promise<Record<string, any>>;
}
```

---

## 4. Real-time Visual Execution Feedback
When a workflow is executed:
1. **Queued state**: Node glow changes to idle ring.
2. **Executing state**: Node displays spinning status badge; canvas edge pulses with animated gradient stroke.
3. **Success state**: Checkmark badge renders with execution time (e.g. `45ms`), output data becomes inspectable in the right panel.
4. **Error state**: Red warning badge renders with error details and diagnostic trace.

---

## 5. Storage & Portability
- **JSON Format**: Workflows are serialized as standardized JSON specs.
- **Import / Export**: Full compatibility for cloning, versioning, and sharing workflows.
- **Templates**: Built-in template repository for fast-starting complex automation workflows.
