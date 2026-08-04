import type { Node, Edge } from '@xyflow/react';
import { NODE_CATALOG } from '../constants/nodeCatalog';
import { evaluateExpression } from './evaluator';
import type { WorkflowExecutionLog, WorkflowExecutionLogStep, LogicNodeData } from '../types/workflow';

export interface ExecuteWorkflowOptions {
  nodes: Node<LogicNodeData>[];
  edges: Edge[];
  env?: Record<string, string>;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: Record<string, any>, durationMs: number) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onEdgeActive?: (edgeId: string) => void;
}

/**
 * Topologically sorts DAG nodes for execution order.
 * Triggers are execution roots (in-degree 0).
 */
export function getExecutionOrder(nodes: Node<LogicNodeData>[], edges: Edge[]): string[] {
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
  // Push all nodes with in-degree 0 (triggers or start nodes)
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  });

  const executionOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    executionOrder.push(curr);

    (adjList[curr] || []).forEach((neighbor) => {
      inDegree[neighbor] -= 1;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Fallback if disconnected nodes exist
  nodes.forEach((n) => {
    if (!executionOrder.includes(n.id)) {
      executionOrder.push(n.id);
    }
  });

  return executionOrder;
}

/**
 * Executes a single node given its input payload and evaluated parameters.
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

  // Simulated execution delay for visual delight & realism (250ms - 500ms)
  await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));

  let output: Record<string, any> = {};

  if (node.data.category === 'trigger') {
    if (node.data.nodeType === 'manual_trigger' && params.testPayload) {
      try {
        output = JSON.parse(params.testPayload);
      } catch {
        output = catalogDef?.sampleOutput || { manualTrigger: true };
      }
    } else {
      output = catalogDef?.sampleOutput || { timestamp: new Date().toISOString() };
    }
  } else if (node.data.nodeType === 'ai_agent') {
    const userPromptEval = evaluateExpression(params.userPrompt || '', {
      json: inputPayload,
      nodeResults: nodeResultsByName,
      env,
    });
    output = {
      model: params.model || 'gemini-1.5-pro',
      promptEvaluated: userPromptEval,
      sentiment: inputPayload.priority === 'HIGH' ? 'Urgent' : 'Normal',
      assignedTeam: inputPayload.priority === 'HIGH' ? 'DevOps / SRE Tier 3' : 'Customer Support',
      summary: `Automated analysis for ${inputPayload.ticketId || inputPayload.customer || 'Event'}: ${userPromptEval.slice(0, 100)}...`,
      recommendedAction: 'Created escalation ticket and dispatched Slack & Email notifications.',
      confidence: 0.96,
    };
  } else if (node.data.nodeType === 'http_request') {
    const evaluatedUrl = evaluateExpression(params.url || '', {
      json: inputPayload,
      nodeResults: nodeResultsByName,
      env,
    });
    output = {
      status: 200,
      statusText: 'OK',
      requestUrl: evaluatedUrl,
      method: params.method || 'POST',
      data: {
        success: true,
        transactionId: `tx_${Math.random().toString(36).substring(2, 9)}`,
        receivedInput: inputPayload,
      },
    };
  } else if (node.data.nodeType === 'code_node') {
    try {
      const codeStr = params.code || 'return $json;';
      const fn = new Function('$json', '$node', '$env', codeStr);
      const res = fn(inputPayload, nodeResultsByName, env);
      output = typeof res === 'object' && res !== null ? res : { result: res };
    } catch (err: any) {
      output = {
        error: err.message || 'Error executing JS code node',
        rawInput: inputPayload,
      };
    }
  } else if (node.data.nodeType === 'slack_node') {
    const evalMessage = evaluateExpression(params.message || '', {
      json: inputPayload,
      nodeResults: nodeResultsByName,
      env,
    });
    output = {
      ok: true,
      channel: params.channel || '#ops-alerts',
      deliveredMessage: evalMessage,
      timestamp: new Date().toISOString(),
    };
  } else if (node.data.nodeType === 'email_node') {
    const evalTo = evaluateExpression(params.toEmail || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const evalSub = evaluateExpression(params.subject || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    output = {
      deliveredTo: evalTo,
      subject: evalSub,
      status: 'SENT',
      messageId: `<lm-msg-${Math.floor(Math.random() * 100000)}@logicmesh.io>`,
    };
  } else if (node.data.nodeType === 'if_switch') {
    const leftVal = evaluateExpression(params.field || '', { json: inputPayload, nodeResults: nodeResultsByName, env });
    const rightVal = params.rightValue || '';
    const isMatch = params.operator === 'equals' ? leftVal === rightVal : true;
    output = {
      branchMatched: isMatch ? 'true' : 'false',
      leftValue: leftVal,
      rightValue: rightVal,
      payload: inputPayload,
    };
  } else {
    output = catalogDef?.sampleOutput || { ...inputPayload, processed: true };
  }

  const durationMs = Math.round(performance.now() - startTime);
  return { output, durationMs };
}

/**
 * Runs complete workflow execution pipeline.
 */
export async function executeWorkflow(
  workflowId: string,
  options: ExecuteWorkflowOptions
): Promise<WorkflowExecutionLog> {
  const { nodes, edges, env = {}, onNodeStart, onNodeComplete, onNodeError, onEdgeActive } = options;

  const startTimeIso = new Date().toISOString();
  const overallStart = performance.now();
  const executionOrder = getExecutionOrder(nodes, edges);

  const nodeResultsById: Record<string, Record<string, any>> = {};
  const nodeResultsByName: Record<string, Record<string, any>> = {};
  const steps: WorkflowExecutionLogStep[] = [];

  let overallStatus: 'success' | 'error' = 'success';
  let triggerType = 'manual';

  for (const nodeId of executionOrder) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.data.disabled) continue;

    if (node.data.category === 'trigger') {
      triggerType = node.data.nodeType;
    }

    // Determine input payload: gather outputs from direct parents
    const parentEdges = edges.filter((e) => e.target === nodeId);
    let combinedInput: Record<string, any> = {};

    if (parentEdges.length > 0) {
      parentEdges.forEach((e) => {
        if (onEdgeActive) onEdgeActive(e.id);
        const parentOutput = nodeResultsById[e.source];
        if (parentOutput) {
          combinedInput = { ...combinedInput, ...parentOutput };
        }
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

      if (onNodeComplete) onNodeComplete(nodeId, output, durationMs);

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
    } catch (err: any) {
      overallStatus = 'error';
      const errMsg = err.message || 'Execution error';
      if (onNodeError) onNodeError(nodeId, errMsg);

      steps.push({
        nodeId,
        nodeName: node.data.label,
        nodeType: node.data.nodeType,
        status: 'error',
        executionTimeMs: 0,
        inputPayload: combinedInput,
        outputPayload: {},
        error: errMsg,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  const totalDurationMs = Math.round(performance.now() - overallStart);

  return {
    id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    workflowId,
    status: overallStatus,
    totalDurationMs,
    startTime: startTimeIso,
    triggerType,
    steps,
  };
}
