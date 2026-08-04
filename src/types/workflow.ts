export type NodeCategory = 'trigger' | 'action' | 'logic' | 'ai' | 'utility';

export type ParameterType = 'string' | 'number' | 'boolean' | 'select' | 'json' | 'code' | 'expression';

export interface ParameterOption {
  label: string;
  value: string;
}

export interface NodeParameter {
  id: string;
  name: string;
  type: ParameterType;
  default?: any;
  placeholder?: string;
  description?: string;
  options?: ParameterOption[];
}

export interface NodeDefinition {
  type: string;
  name: string;
  category: NodeCategory;
  iconName: string;
  color: string;
  description: string;
  inputs: Array<{ id: string; name: string }>;
  outputs: Array<{ id: string; name: string }>;
  parameters: NodeParameter[];
  defaultParams: Record<string, any>;
  sampleOutput: Record<string, any>;
}

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'disabled';

export interface LogicNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string;
  category: NodeCategory;
  iconName: string;
  color: string;
  parameters: Record<string, any>;
  status?: ExecutionStatus;
  executionTimeMs?: number;
  lastOutput?: Record<string, any>;
  lastError?: string;
  disabled?: boolean;
}

export interface WorkflowExecutionLogStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'success' | 'error';
  executionTimeMs: number;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  error?: string;
  timestamp: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  status: 'success' | 'error';
  totalDurationMs: number;
  startTime: string;
  triggerType: string;
  steps: WorkflowExecutionLogStep[];
}

export interface TemplateWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
}
