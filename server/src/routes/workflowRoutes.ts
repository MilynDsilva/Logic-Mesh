import { Router, Request, Response } from 'express';
import { WorkflowModel } from '../models/Workflow';
import { ExecutionLogModel } from '../models/ExecutionLog';
import { executeServerWorkflow } from '../engine/serverExecutor';

export const workflowRouter = Router();

// GET /api/workflows - List all workflows
workflowRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const workflows = await WorkflowModel.find().sort({ updatedAt: -1 });
    res.json({ success: true, count: workflows.length, data: workflows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workflows/:id - Get single workflow
workflowRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await WorkflowModel.findById(req.params.id);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, data: workflow });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/workflows - Create new workflow
workflowRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, nodes, edges, isActive, webhookPath } = req.body;
    const workflow = new WorkflowModel({
      name: name || 'Untitled Workflow',
      description,
      nodes: nodes || [],
      edges: edges || [],
      isActive: isActive !== undefined ? isActive : true,
      webhookPath,
    });
    await workflow.save();
    res.status(201).json({ success: true, data: workflow });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/workflows/:id - Update workflow
workflowRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await WorkflowModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, data: workflow });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/workflows/:id - Delete workflow
workflowRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await WorkflowModel.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/workflows/:id/execute - Trigger workflow DAG execution manually
workflowRouter.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const workflow = await WorkflowModel.findById(req.params.id);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

    const payload = req.body || {};
    const executionResult = await executeServerWorkflow(
      String(workflow._id),
      workflow.nodes as any,
      workflow.edges as any,
      payload
    );

    res.json({ success: true, data: executionResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workflows/:id/logs - Get execution logs for workflow
workflowRouter.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const logs = await ExecutionLogModel.find({ workflowId: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
