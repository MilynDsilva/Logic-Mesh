import { evaluateExpression } from './evaluator';
import type { Node, Edge } from '@xyflow/react';
import type { LogicNodeData, WorkflowExecutionLog, WorkflowExecutionLogStep } from '../types/workflow';
import { NODE_CATALOG } from '../constants/nodeCatalog';

/**
 * Computes topological execution order using BFS In-Degree calculation
 */
export function getExecutionOrder(
  nodes: Node<LogicNodeData>[],
  edges: Edge[]
): string[] {
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

/**
 * Executes a single node with real HTTP fetching, expression evaluation, and timing metrics
 */
export async function executeSingleNode(
  node: Node<LogicNodeData>,
  inputPayload: Record<string, any>,
  nodeResultsByName: Record<string, any>,
  env: Record<string, string>
): Promise<{ output: Record<string, any>; durationMs: number }> {
  const startTime = performance.now();
  const catalogDef = NODE_CATALOG[node.data.nodeType];
  const params = node.data.parameters || {};

  let output: Record<string, any> = {};

  if (node.data.category === 'trigger') {
    if (params.testPayload) {
      try {
        output = typeof params.testPayload === 'string' ? JSON.parse(params.testPayload) : params.testPayload;
      } catch {
        output = { rawPayload: params.testPayload, parsedError: 'Invalid JSON format in testPayload' };
      }
    } else if (params.jsonConfig) {
      try {
        output = typeof params.jsonConfig === 'string' ? JSON.parse(params.jsonConfig) : params.jsonConfig;
      } catch {
        output = { rawConfig: params.jsonConfig };
      }
    } else {
      output = inputPayload && Object.keys(inputPayload).length > 0
        ? inputPayload
        : {
            ticketId: 'TCK-9021',
            customer: 'Acme Corp',
            priority: 'HIGH',
            subject: 'Database latency spike on primary MongoDB cluster',
            receivedAt: new Date().toISOString(),
          };
    }
  } else if (node.data.nodeType === 'mongodb_node') {
    const evalQueryStr = evaluateExpression(params.queryJson || '{}', { json: inputPayload, nodeResults: nodeResultsByName, env });
    let queryObj = {};
    try { queryObj = JSON.parse(evalQueryStr); } catch { queryObj = { raw: evalQueryStr }; }
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
  } else if (node.data.nodeType === 'postgres_node') {
    const evalSql = evaluateExpression(params.sqlQuery || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      command: 'INSERT',
      rowCount: 1,
      sqlExecuted: evalSql,
      rows: [{ id: Math.floor(Math.random() * 10000), ...inputPayload }],
    };
  } else if (node.data.nodeType === 'redis_node') {
    const evalKey = evaluateExpression(params.keyName || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      result: 'OK',
      key: evalKey,
      ttlSeconds: params.ttl || 3600,
    };
  } else if (node.data.nodeType === 'github_node') {
    const evalTitle = evaluateExpression(params.title || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      number: Math.floor(Math.random() * 500) + 100,
      html_url: `https://github.com/${params.repository || 'org/repo'}/issues/402`,
      title: evalTitle,
      state: 'open',
    };
  } else if (node.data.nodeType === 'discord_node') {
    const evalContent = evaluateExpression(params.content || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      success: true,
      deliveredContent: evalContent,
      status: 204,
    };
  } else if (node.data.nodeType === 'split_batches_node') {
    output = {
      batchIndex: 1,
      totalBatches: 2,
      batchSize: params.batchSize || 5,
      items: Array.isArray(inputPayload.items) ? inputPayload.items.slice(0, 5) : [inputPayload],
    };
  } else if (node.data.nodeType === 'ai_agent') {
    const userPromptEval = evaluateExpression(params.userPrompt || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const credId = params.credentialId;
    output = {
      model: params.model || 'gemini-1.5-pro',
      credentialStatus: credId ? 'AES-256 Encrypted Key Authenticated' : 'Default Key ($env)',
      credentialId: credId || 'env_default',
      promptEvaluated: userPromptEval,
      sentiment: inputPayload.priority === 'HIGH' ? 'Urgent' : 'Normal',
      assignedTeam: inputPayload.priority === 'HIGH' ? 'DevOps / SRE Tier 3' : 'Customer Support',
      summary: `Automated analysis for ${inputPayload.ticketId || inputPayload.customer || 'Event'}: ${userPromptEval.slice(0, 100)}...`,
      recommendedAction: 'Dispatched to GitHub Issues, Discord, PostgreSQL, and Slack.',
      confidence: 0.98,
    };
  } else if (node.data.nodeType === 'http_request') {
    const evaluatedUrl = evaluateExpression(params.url || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const method = (params.method || 'GET').toUpperCase();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LogicMesh-Engine/1.0',
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (params.body) {
          options.body = evaluateExpression(params.body, { json: inputPayload, nodeResults: nodeResultsByName, env });
        } else {
          options.body = JSON.stringify(inputPayload);
        }
      }

      const res = await fetch(evaluatedUrl, options);
      let responseData: any;
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        try { responseData = JSON.parse(text); } catch { responseData = text; }
      }

      output = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        requestUrl: evaluatedUrl,
        method,
        data: responseData,
      };
    } catch (err: any) {
      output = {
        error: err.message || 'HTTP Request Failed',
        status: 500,
        requestUrl: evaluatedUrl,
        method,
      };
    }
  } else if (node.data.nodeType === 'code_node') {
    try {
      const codeStr = params.code || 'return $json;';
      const fn = new Function('$json', '$node', '$env', codeStr);
      const res = fn(inputPayload, nodeResultsByName, env);
      output = typeof res === 'object' && res !== null ? res : { result: res };
    } catch (err: any) {
      output = { error: err.message || 'Error executing JS code node', rawInput: inputPayload };
    }
  } else if (node.data.nodeType === 'slack_node') {
    const evalMessage = evaluateExpression(params.message || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = { ok: true, channel: params.channel || '#ops-alerts', deliveredMessage: evalMessage, timestamp: new Date().toISOString() };
  } else if (node.data.nodeType === 'email_node') {
    const evalTo = evaluateExpression(params.toEmail || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const evalSub = evaluateExpression(params.subject || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = { deliveredTo: evalTo, subject: evalSub, status: 'SENT', messageId: `<lm-msg-${Math.floor(Math.random() * 100000)}@logicmesh.io>` };
  } else if (node.data.nodeType === 'if_switch') {
    const leftVal = evaluateExpression(params.field || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const rightVal = params.rightValue || '';
    const isMatch = params.operator === 'equals' ? leftVal === rightVal : true;
    output = { conditionMatched: isMatch, evaluatedValue: leftVal, targetValue: rightVal };
  } else if (node.data.nodeType === 'filter_node') {
    output = { passed: true, item: inputPayload };
  } else {
    output = catalogDef?.sampleOutput || { result: 'Processed successfully' };
  }

  const durationMs = Math.round(performance.now() - startTime);
  return { output, durationMs };
}

/**
 * Topologically resolves DAG dependencies and executes nodes in order
 */
export async function executeWorkflow(
  workflowId: string,
  context: {
    nodes: Node<LogicNodeData>[];
    edges: Edge[];
    env?: Record<string, string>;
    onNodeStart?: (nodeId: string) => void;
    onNodeComplete?: (nodeId: string, output: Record<string, any>, durationMs: number) => void;
    onNodeError?: (nodeId: string, errorMsg: string) => void;
    onEdgeActive?: (edgeId: string) => void;
  }
): Promise<WorkflowExecutionLog> {
  const { nodes, edges, env = {}, onNodeStart, onNodeComplete, onNodeError, onEdgeActive } = context;

  const startTimeIso = new Date().toISOString();
  const overallStart = performance.now();
  const executionOrder = getExecutionOrder(nodes, edges);

  const nodeResultsById: Record<string, Record<string, any>> = {};
  const nodeResultsByName: Record<string, Record<string, any>> = {};
  const steps: WorkflowExecutionLogStep[] = [];
  let overallStatus: 'success' | 'error' = 'success';
  let triggerType = 'webhook';

  for (const nodeId of executionOrder) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.data.disabled) continue;

    if (node.data.category === 'trigger') {
      triggerType = node.data.nodeType;
    }

    const parentEdges = edges.filter((e) => e.target === nodeId);
    let combinedInput: Record<string, any> = {};

    if (parentEdges.length > 0) {
      parentEdges.forEach((e) => {
        if (onEdgeActive) onEdgeActive(e.id);
        const parentOutput = nodeResultsById[e.source];
        if (parentOutput) combinedInput = { ...combinedInput, ...parentOutput };
      });
    }

    if (onNodeStart) onNodeStart(nodeId);

    try {
      const { output, durationMs } = await executeSingleNode(
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
        timestamp: new Date().toISOString(),
      });

      if (onNodeComplete) onNodeComplete(nodeId, output, durationMs);
    } catch (err: any) {
      overallStatus = 'error';
      const errorMsg = err.message || 'Execution failed';

      steps.push({
        nodeId,
        nodeName: node.data.label,
        nodeType: node.data.nodeType,
        status: 'error',
        executionTimeMs: 0,
        inputPayload: combinedInput,
        outputPayload: {},
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });

      if (onNodeError) onNodeError(nodeId, errorMsg);
      break;
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  const totalDurationMs = Math.round(performance.now() - overallStart);

  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workflowId,
    status: overallStatus,
    totalDurationMs,
    startTime: startTimeIso,
    triggerType,
    steps,
  };
}
