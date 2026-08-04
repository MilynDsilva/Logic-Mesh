import { Schema, model, Document } from 'mongoose';

export interface IWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
}

export interface IWorkflow extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  webhookPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    nodes: { type: Schema.Types.Mixed, required: true, default: [] },
    edges: { type: Schema.Types.Mixed, required: true, default: [] },
    webhookPath: { type: String, index: true },
  },
  { timestamps: true }
);

export const WorkflowModel = model<IWorkflow>('Workflow', WorkflowSchema);
