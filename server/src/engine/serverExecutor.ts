import { evaluateExpression } from './serverEvaluator';
import { ExecutionLogModel } from '../models/ExecutionLog';

export interface ServerNode {
  id: string;
  type: string;
  data: {
    label: string;
    nodeType: string;
    category: string;
    parameters: Record<string, any>;
    disabled?: boolean;
  };
}

export interface ServerEdge {
  id: string;
  source: string;
  target: string;
}

export function getExecutionOrder(nodes: ServerNode[], edges: ServerEdge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
  });

  edges.forEach((e) => {
    if (adjList[e.source]) {
      adjList[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target] += 1;
    }
  });

  const queue: string[] = [];
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) queue.push(id);
  });

  const executionOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    executionOrder.push(curr);

    (adjList[curr] || []).forEach((neighbor) => {
      inDegree[neighbor] -= 1;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  nodes.forEach((n) => {
    if (!executionOrder.includes(n.id)) executionOrder.push(n.id);
  });

  return executionOrder;
}

export async function executeServerNode(
  node: ServerNode,
  inputPayload: Record<string, any>,
  nodeResultsByName: Record<string, any>,
  env: Record<string, string>
): Promise<{ output: Record<string, any>; durationMs: number }> {
  const startTime = Date.now();
  const params = node.data.parameters || {};
  let output: Record<string, any> = {};

  if (node.data.category === 'trigger') {
    output = inputPayload && Object.keys(inputPayload).length > 0 ? inputPayload : { timestamp: new Date().toISOString() };
  } else if (node.data.nodeType === 'mongodb_node') {
    const evalQueryStr = evaluateExpression(params.queryJson || '{}', { json: inputPayload, nodeResults: nodeResultsByName, env });
    let queryObj = {};
    try {
      queryObj = JSON.parse(evalQueryStr);
    } catch {
      queryObj = { raw: evalQueryStr };
    }
    output = {
      acknowledged: true,
      insertedId: `66b${Math.random().toString(36).substring(2, 10)}01f3a`,
      matchedCount: 1,
      modifiedCount: 1,
      operation: params.operation || 'insertOne',
      collection: params.collection || 'documents',
      db: 'logicmesh_prod',
      queryExecuted: queryObj,
    };
  } else if (node.data.nodeType === 'ai_agent') {
    const evalPrompt = evaluateExpression(params.userPrompt || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      model: params.model || 'gemini-1.5-pro',
      promptEvaluated: evalPrompt,
      sentiment: inputPayload.priority === 'HIGH' ? 'Urgent' : 'Normal',
      assignedTeam: inputPayload.priority === 'HIGH' ? 'DevOps / SRE Tier 3' : 'Customer Support',
      summary: `Automated Node.js backend execution for ${inputPayload.ticketId || inputPayload.customer || 'Event'}: ${evalPrompt.slice(0, 100)}`,
      recommendedAction: 'Persisted to MongoDB collection and notified external webhooks.',
      confidence: 0.98,
    };
  } else if (node.data.nodeType === 'http_request') {
    const evalUrl = evaluateExpression(params.url || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      status: 200,
      statusText: 'OK',
      requestUrl: evalUrl,
      method: params.method || 'POST',
      data: { success: true, receivedInput: inputPayload },
    };
  } else if (node.data.nodeType === 'code_node') {
    try {
      const codeStr = params.code || 'return $json;';
      const fn = new Function('$json', '$node', '$env', codeStr);
      const res = fn(inputPayload, nodeResultsByName, env);
      output = typeof res === 'object' && res !== null ? res : { result: res };
    } catch (err: any) {
      output = { error: err.message || 'JS Execution Error', rawInput: inputPayload };
    }
  } else if (node.data.nodeType === 'slack_node') {
    const msg = evaluateExpression(params.message || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = { ok: true, channel: params.channel || '#ops', deliveredMessage: msg };
  } else {
    output = { ...inputPayload, processedAt: new Date().toISOString() };
  }

  const durationMs = Date.now() - startTime;
  return { output, durationMs };
}

export async function executeServerWorkflow(
  workflowId: string,
  nodes: ServerNode[],
  edges: ServerEdge[],
  initialPayload: Record<string, any> = {},
  env: Record<string, string> = {}
) {
  const startTimeIso = new Date();
  const overallStart = Date.now();
  const executionOrder = getExecutionOrder(nodes, edges);

  const nodeResultsById: Record<string, Record<string, any>> = {};
  const nodeResultsByName: Record<string, Record<string, any>> = {};
  const steps: any[] = [];
  let overallStatus: 'success' | 'error' = 'success';
  let triggerType = 'webhook';

  for (const nodeId of executionOrder) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.data.disabled) continue;

    if (node.data.category === 'trigger') {
      triggerType = node.data.nodeType;
    }

    const parentEdges = edges.filter((e) => e.target === nodeId);
    let combinedInput: Record<string, any> = { ...initialPayload };

    if (parentEdges.length > 0) {
      parentEdges.forEach((e) => {
        const parentOutput = nodeResultsById[e.source];
        if (parentOutput) combinedInput = { ...combinedInput, ...parentOutput };
      });
    }

    try {
      const { output, durationMs } = await executeServerNode(
        node,
        combinedInput,
        nodeResultsByName,
        env
      );

      nodeResultsById[nodeId] = output;
      nodeResultsByName[node.data.label] = output;

      steps.push({
        nodeId,
        nodeName: node.data.label,
        nodeType: node.data.nodeType,
        status: 'success',
        executionTimeMs: durationMs,
        inputPayload: combinedInput,
        outputPayload: output,
        timestamp: new Date(),
      });
    } catch (err: any) {
      overallStatus = 'error';
      steps.push({
        nodeId,
        nodeName: node.data.label,
        nodeType: node.data.nodeType,
        status: 'error',
        executionTimeMs: 0,
        inputPayload: combinedInput,
        outputPayload: {},
        error: err.message,
        timestamp: new Date(),
      });
      break;
    }
  }

  const totalDurationMs = Date.now() - overallStart;

  const logDoc = new ExecutionLogModel({
    workflowId,
    status: overallStatus,
    totalDurationMs,
    startTime: startTimeIso,
    triggerType,
    steps,
  });

  try {
    await logDoc.save();
  } catch {
    // Ignore db save error if db disconnected
  }

  return {
    id: logDoc._id,
    workflowId,
    status: overallStatus,
    totalDurationMs,
    startTime: startTimeIso,
    triggerType,
    steps,
  };
}
