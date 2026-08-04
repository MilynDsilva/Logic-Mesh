import type { TemplateWorkflow } from '../types/workflow';

export const STARTER_TEMPLATES: TemplateWorkflow[] = [
  {
    id: 'ai-incident-dispatcher',
    name: '🤖 AI Incident Dispatcher & Slack Escalation',
    description: 'Triggered by incoming Webhooks or Manual tickets. Passes problem description to AI LLM Node to evaluate severity, generate team assignment, and post alerts to Slack and Email.',
    category: 'AI & Operations',
    nodes: [
      {
        id: 'node-1',
        type: 'customNode',
        position: { x: 100, y: 220 },
        data: {
          label: 'Webhook Trigger',
          nodeType: 'webhook_trigger',
          category: 'trigger',
          iconName: 'Webhook',
          color: '#FF5C49',
          parameters: {
            path: '/v1/webhook/incoming-incident',
            httpMethod: 'POST',
            authSecret: 'lm_sec_9921',
          },
          status: 'idle',
        },
      },
      {
        id: 'node-2',
        type: 'customNode',
        position: { x: 420, y: 220 },
        data: {
          label: 'AI Prompt / LLM Node',
          nodeType: 'ai_agent',
          category: 'ai',
          iconName: 'Sparkles',
          color: '#06B6D4',
          parameters: {
            model: 'gemini-1.5-pro',
            systemPrompt: 'You are an AI Incident Responder. Classify urgency and assign responsible engineering team in JSON format.',
            userPrompt: 'Incident ID: {{ $json.ticketId }}\nCustomer: {{ $json.customer }}\nIssue: {{ $json.subject }}\nPriority: {{ $json.priority }}',
            temperature: 0.2,
          },
          status: 'idle',
        },
      },
      {
        id: 'node-3',
        type: 'customNode',
        position: { x: 740, y: 120 },
        data: {
          label: 'Slack Notifier',
          nodeType: 'slack_node',
          category: 'action',
          iconName: 'MessageSquare',
          color: '#4A154B',
          parameters: {
            channel: '#sre-alerts',
            message: '🚨 *New Urgent Incident*: {{ $json.ticketId }}\n*Customer*: {{ $json.customer }}\n*AI Summary*: {{ $node["AI Prompt / LLM Node"].json.summary }}\n*Assigned Team*: {{ $node["AI Prompt / LLM Node"].json.assignedTeam }}',
          },
          status: 'idle',
        },
      },
      {
        id: 'node-4',
        type: 'customNode',
        position: { x: 740, y: 340 },
        data: {
          label: 'Email SMTP Sender',
          nodeType: 'email_node',
          category: 'action',
          iconName: 'Mail',
          color: '#6366F1',
          parameters: {
            toEmail: 'oncall-team@company.com',
            subject: 'Escalation Alert: {{ $json.ticketId }}',
            bodyHtml: '<h3>LogicMesh Automated Alert</h3><p>Incident summary: {{ $node["AI Prompt / LLM Node"].json.summary }}</p>',
          },
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: false },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: false },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: false },
    ],
  },
  {
    id: 'scheduled-api-poller',
    name: '⏱️ Scheduled API Health Poller & DB Sync',
    description: 'Runs every 15 minutes to poll server status endpoint via HTTP Request, formats payload using JS Code Node, and routes urgent failures via If / Switch branch.',
    category: 'Monitoring',
    nodes: [
      {
        id: 'node-1',
        type: 'customNode',
        position: { x: 100, y: 220 },
        data: {
          label: 'Cron Schedule',
          nodeType: 'schedule_trigger',
          category: 'trigger',
          iconName: 'Clock',
          color: '#FF5C49',
          parameters: {
            cronExpression: '*/15 * * * *',
            timezone: 'UTC',
          },
          status: 'idle',
        },
      },
      {
        id: 'node-2',
        type: 'customNode',
        position: { x: 400, y: 220 },
        data: {
          label: 'HTTP Request',
          nodeType: 'http_request',
          category: 'action',
          iconName: 'Globe',
          color: '#6366F1',
          parameters: {
            method: 'GET',
            url: 'https://api.logicmesh.io/health',
            headers: '{\n  "Accept": "application/json"\n}',
            body: '',
          },
          status: 'idle',
        },
      },
      {
        id: 'node-3',
        type: 'customNode',
        position: { x: 700, y: 220 },
        data: {
          label: 'JavaScript Code',
          nodeType: 'code_node',
          category: 'action',
          iconName: 'Code2',
          color: '#6366F1',
          parameters: {
            code: 'const response = $json;\nreturn {\n  isHealthy: response.status === 200,\n  checkedAt: new Date().toISOString(),\n  raw: response\n};',
          },
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: false },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: false },
    ],
  },
];
