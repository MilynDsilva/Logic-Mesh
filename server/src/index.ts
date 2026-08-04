import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { workflowRouter } from './routes/workflowRoutes';
import { webhookRouter } from './routes/webhookRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'LogicMesh Automation Engine',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
  });
});

// API Routes
app.use('/api/workflows', workflowRouter);
app.use('/api/v1/webhooks', webhookRouter);

// Start server and connect to MongoDB
async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 LogicMesh Server running on http://localhost:${PORT}`);
    console.log(`📡 Webhook receiver ready on http://localhost:${PORT}/api/v1/webhooks/:path`);
  });
}

main().catch((err) => {
  console.error('Fatal server startup error:', err);
});
