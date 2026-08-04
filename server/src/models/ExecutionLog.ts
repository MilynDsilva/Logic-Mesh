import { Schema, model, Document } from 'mongoose';

export interface IExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'success' | 'error';
  executionTimeMs: number;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  error?: string;
  timestamp: Date;
}

export interface IExecutionLog extends Document {
  workflowId: string;
  status: 'success' | 'error';
  totalDurationMs: number;
  startTime: Date;
  triggerType: string;
  steps: IExecutionStep[];
}

const ExecutionLogSchema = new Schema<IExecutionLog>(
  {
    workflowId: { type: String, required: true, index: true },
    status: { type: String, enum: ['success', 'error'], required: true },
    totalDurationMs: { type: Number, required: true },
    startTime: { type: Date, default: Date.now },
    triggerType: { type: String, default: 'manual' },
    steps: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export const ExecutionLogModel = model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);
