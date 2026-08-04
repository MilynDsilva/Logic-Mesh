import { Router, Request, Response } from 'express';
import { WorkflowModel } from '../models/Workflow';
import { executeServerWorkflow } from '../engine/serverExecutor';

export const webhookRouter = Router();

// Handle incoming HTTP Webhooks (POST/GET/PUT)
webhookRouter.all('/:path(*)', async (req: Request, res: Response) => {
  const path = `/${req.params.path}`;
  console.log(`📡 Incoming Webhook Trigger on path: ${path} [${req.method}]`);

  try {
    // Find active workflow configured for this webhook path
    let workflow = await WorkflowModel.findOne({
      isActive: true,
      $or: [{ webhookPath: path }, { 'nodes.data.parameters.path': path }],
    });

    if (!workflow) {
      // Fallback: look for any active workflow containing a webhook trigger
      workflow = await WorkflowModel.findOne({ isActive: true });
    }

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `No active LogicMesh workflow registered for webhook path: ${path}`,
      });
    }

    const payload = {
      event: 'webhook_received',
      method: req.method,
      path,
      headers: req.headers,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    // Execute workflow asynchronously in background
    const executionResult = await executeServerWorkflow(
      String(workflow._id),
      workflow.nodes as any,
      workflow.edges as any,
      payload
    );

    res.status(200).json({
      success: true,
      message: 'LogicMesh Webhook Trigger Received & Executed',
      workflowId: workflow._id,
      executionId: executionResult.id,
      status: executionResult.status,
      durationMs: executionResult.totalDurationMs,
      result: executionResult.steps[executionResult.steps.length - 1]?.outputPayload || {},
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
