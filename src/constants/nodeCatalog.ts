import type { NodeDefinition } from '../types/workflow';

export const NODE_CATALOG: Record<string, NodeDefinition> = {
  // --- TRIGGERS ---
  webhook_trigger: {
    type: 'webhook_trigger',
    name: 'Webhook Trigger',
    category: 'trigger',
    iconName: 'Webhook',
    color: '#FF5C49', // n8n signature coral
    description: 'Triggers workflow execution via incoming HTTP GET/POST webhooks',
    inputs: [],
    outputs: [{ id: 'main', name: 'Payload' }],
    parameters: [
      {
        id: 'path',
        name: 'Webhook Path',
        type: 'string',
        default: '/v1/webhook/incoming-event',
        placeholder: '/v1/webhook/my-event',
        description: 'Endpoint URI path for webhook trigger',
      },
      {
        id: 'httpMethod',
        name: 'HTTP Method',
        type: 'select',
        default: 'POST',
        options: [
          { label: 'POST', value: 'POST' },
          { label: 'GET', value: 'GET' },
          { label: 'PUT', value: 'PUT' },
        ],
      },
      {
        id: 'authSecret',
        name: 'Header Secret Token',
        type: 'string',
        default: 'lm_secret_key_8892',
        placeholder: 'Secret token for x-logicmesh-secret header',
      },
    ],
    defaultParams: {
      path: '/v1/webhook/customer-signup',
      httpMethod: 'POST',
      authSecret: 'lm_sec_9921',
    },
    sampleOutput: {
      event: 'user_signup',
      timestamp: '2026-08-04T13:30:00Z',
      user: {
        id: 'usr_8819',
        name: 'Alex Vance',
        email: 'alex.vance@example.com',
        plan: 'enterprise',
      },
      metadata: {
        ip: '192.168.1.1',
        country: 'US',
      },
    },
  },

  schedule_trigger: {
    type: 'schedule_trigger',
    name: 'Cron Schedule',
    category: 'trigger',
    iconName: 'Clock',
    color: '#FF5C49',
    description: 'Triggers execution on recurring cron schedule or interval',
    inputs: [],
    outputs: [{ id: 'main', name: 'Trigger Event' }],
    parameters: [
      {
        id: 'cronExpression',
        name: 'Cron Expression',
        type: 'string',
        default: '*/5 * * * *',
        placeholder: '*/5 * * * *',
        description: 'Standard 5-field cron syntax (e.g. every 5 mins)',
      },
      {
        id: 'timezone',
        name: 'Timezone',
        type: 'select',
        default: 'UTC',
        options: [
          { label: 'UTC', value: 'UTC' },
          { label: 'America/New_York', value: 'America/New_York' },
          { label: 'Europe/London', value: 'Europe/London' },
          { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
        ],
      },
    ],
    defaultParams: {
      cronExpression: '*/15 * * * *',
      timezone: 'UTC',
    },
    sampleOutput: {
      triggeredAt: '2026-08-04T13:30:00.000Z',
      cron: '*/15 * * * *',
      executionCycle: 42,
    },
  },

  manual_trigger: {
    type: 'manual_trigger',
    name: 'Manual Trigger',
    category: 'trigger',
    iconName: 'PlayCircle',
    color: '#FF5C49',
    description: 'Manually starts execution when Test or Run Workflow is clicked',
    inputs: [],
    outputs: [{ id: 'main', name: 'Initial Payload' }],
    parameters: [
      {
        id: 'testPayload',
        name: 'Test JSON Payload',
        type: 'json',
        default: JSON.stringify(
          {
            ticketId: 'TCK-9021',
            customer: 'Acme Corp',
            priority: 'HIGH',
            subject: 'Database sync failure on production cluster',
          },
          null,
          2
        ),
      },
    ],
    defaultParams: {
      testPayload: JSON.stringify(
        {
          ticketId: 'TCK-9021',
          customer: 'Acme Corp',
          priority: 'HIGH',
          subject: 'Database sync failure on production cluster',
        },
        null,
        2
      ),
    },
    sampleOutput: {
      ticketId: 'TCK-9021',
      customer: 'Acme Corp',
      priority: 'HIGH',
      subject: 'Database sync failure on production cluster',
    },
  },

  // --- DATABASE & ACTIONS ---
  mongodb_node: {
    type: 'mongodb_node',
    name: 'MongoDB Database',
    category: 'action',
    iconName: 'Database',
    color: '#10B981', // Emerald green MongoDB accent
    description: 'Performs find, insert, update, or aggregate operations on MongoDB collections',
    inputs: [{ id: 'main', name: 'Input Data' }],
    outputs: [{ id: 'main', name: 'Mongo Result' }],
    parameters: [
      {
        id: 'operation',
        name: 'Mongo Operation',
        type: 'select',
        default: 'insertOne',
        options: [
          { label: 'Insert One Document (insertOne)', value: 'insertOne' },
          { label: 'Find Documents (find)', value: 'find' },
          { label: 'Update Document (updateOne)', value: 'updateOne' },
          { label: 'Delete Document (deleteOne)', value: 'deleteOne' },
          { label: 'Aggregate Pipeline (aggregate)', value: 'aggregate' },
        ],
      },
      {
        id: 'collection',
        name: 'Collection Name',
        type: 'string',
        default: 'users',
        placeholder: 'e.g. leads, tickets, metrics',
        description: 'Target MongoDB collection name',
      },
      {
        id: 'queryJson',
        name: 'Query / Document JSON (Supports {{ $json.field }})',
        type: 'json',
        default: '{\n  "name": "{{ $json.user.name || $json.customer }}",\n  "email": "{{ $json.user.email || $json.email }}",\n  "createdAt": "{{ $now }}"\n}',
        placeholder: '{ "status": "active" }',
      },
      {
        id: 'mongoUri',
        name: 'MongoDB Connection Secret',
        type: 'expression',
        default: '{{ $env.MONGODB_URI || "mongodb+srv://admin:secret@cluster0.mongodb.net/logicmesh" }}',
      },
    ],
    defaultParams: {
      operation: 'insertOne',
      collection: 'incidents',
      queryJson: '{\n  "ticketId": "{{ $json.ticketId }}",\n  "customer": "{{ $json.customer }}",\n  "summary": "{{ $node[\"AI Prompt / LLM Node\"].json.summary || $json.subject }}",\n  "createdAt": "2026-08-04T13:30:00Z"\n}',
      mongoUri: '{{ $env.MONGODB_URI }}',
    },
    sampleOutput: {
      acknowledged: true,
      insertedId: '66b0ef92a1492b001f3a90bc',
      matchedCount: 1,
      modifiedCount: 1,
      collection: 'incidents',
      db: 'logicmesh_prod',
    },
  },

  // --- AI NODES ---
  ai_agent: {
    type: 'ai_agent',
    name: 'AI Prompt / LLM Node',
    category: 'ai',
    iconName: 'Sparkles',
    color: '#06B6D4', // Cyan AI accent
    description: 'Executes GPT-4o / Gemini 1.5 prompt with mustache expression variables',
    inputs: [{ id: 'main', name: 'Input Context' }],
    outputs: [{ id: 'main', name: 'AI Response' }],
    parameters: [
      {
        id: 'model',
        name: 'LLM Model',
        type: 'select',
        default: 'gemini-1.5-pro',
        options: [
          { label: 'Gemini 1.5 Pro (Recommended)', value: 'gemini-1.5-pro' },
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
        ],
      },
      {
        id: 'systemPrompt',
        name: 'System Instructions',
        type: 'string',
        default: 'You are an intelligent workflow automation assistant. Process customer tickets and produce structured JSON response with urgency score and assigned team.',
      },
      {
        id: 'userPrompt',
        name: 'User Prompt (Supports {{ $json.field }})',
        type: 'expression',
        default: 'Analyze priority for ticket "{{ $json.ticketId }}": {{ $json.subject }}.',
        placeholder: 'Type prompt or use {{ $json.someField }}',
      },
      {
        id: 'temperature',
        name: 'Temperature',
        type: 'number',
        default: 0.2,
      },
    ],
    defaultParams: {
      model: 'gemini-1.5-pro',
      systemPrompt: 'You are an AI Ticket Dispatcher. Output valid JSON with sentiment, team, and recommended action.',
      userPrompt: 'Customer: {{ $json.user.name || $json.customer }}\nIssue: {{ $json.subject || $json.event }}\nPriority: {{ $json.priority }}',
      temperature: 0.2,
    },
    sampleOutput: {
      sentiment: 'Urgent',
      assignedTeam: 'DevOps / SRE Tier 3',
      summary: 'Production cluster database sync failed for enterprise client Acme Corp.',
      recommendedAction: 'Trigger PagerDuty incident and notify #sre-alerts channel.',
      confidence: 0.98,
    },
  },

  // --- ACTIONS ---
  http_request: {
    type: 'http_request',
    name: 'HTTP Request',
    category: 'action',
    iconName: 'Globe',
    color: '#6366F1', // Indigo action accent
    description: 'Sends GET/POST/PUT HTTP request to any API endpoint',
    inputs: [{ id: 'main', name: 'Input Data' }],
    outputs: [{ id: 'main', name: 'Response Data' }],
    parameters: [
      {
        id: 'method',
        name: 'HTTP Method',
        type: 'select',
        default: 'POST',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      {
        id: 'url',
        name: 'Request URL',
        type: 'expression',
        default: 'https://api.github.com/repos/org/repo/issues',
        placeholder: 'https://api.example.com/data',
      },
      {
        id: 'headers',
        name: 'Headers (JSON format)',
        type: 'json',
        default: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{ $env.API_KEY }}"\n}',
      },
      {
        id: 'body',
        name: 'Request Body',
        type: 'expression',
        default: '{\n  "title": "{{ $node[\"AI Prompt / LLM Node\"].json.summary || $json.subject }}",\n  "severity": "{{ $json.priority }}"\n}',
      },
    ],
    defaultParams: {
      method: 'POST',
      url: 'https://api.logicmesh.io/v1/incidents',
      headers: '{\n  "Authorization": "Bearer {{ $env.API_TOKEN }}",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "ticket": "{{ $json.ticketId }}",\n  "action": "{{ $node[\"AI Prompt / LLM Node\"].json.recommendedAction }}"\n}',
    },
    sampleOutput: {
      status: 201,
      statusText: 'Created',
      data: {
        incidentId: 'INC-77210',
        created: true,
        dispatchedTo: '#sre-alerts',
      },
    },
  },

  code_node: {
    type: 'code_node',
    name: 'JavaScript Code',
    category: 'action',
    iconName: 'Code2',
    color: '#6366F1',
    description: 'Executes custom JavaScript transformation logic over incoming items',
    inputs: [{ id: 'main', name: 'Input Data' }],
    outputs: [{ id: 'main', name: 'Output Data' }],
    parameters: [
      {
        id: 'code',
        name: 'JavaScript Script',
        type: 'code',
        default: `// $json contains data from predecessor node
const input = $json;

return {
  processedAt: new Date().toISOString(),
  upperSubject: (input.subject || '').toUpperCase(),
  isUrgent: input.priority === 'HIGH' || input.sentiment === 'Urgent',
  rawInput: input
};`,
      },
    ],
    defaultParams: {
      code: `const input = $json;
const aiData = $node["AI Prompt / LLM Node"]?.json || {};

return {
  timestamp: new Date().toISOString(),
  ticketId: input.ticketId || 'TCK-GENERIC',
  summary: aiData.summary || input.subject,
  assignedTeam: aiData.assignedTeam || 'Support Tier 1',
  status: 'DISPATCHED'
};`,
    },
    sampleOutput: {
      timestamp: '2026-08-04T13:31:00Z',
      ticketId: 'TCK-9021',
      summary: 'Production cluster database sync failed for enterprise client Acme Corp.',
      assignedTeam: 'DevOps / SRE Tier 3',
      status: 'DISPATCHED',
    },
  },

  slack_node: {
    type: 'slack_node',
    name: 'Slack Notifier',
    category: 'action',
    iconName: 'MessageSquare',
    color: '#4A154B', // Slack purple
    description: 'Posts message or rich block payload to Slack channel',
    inputs: [{ id: 'main', name: 'Payload' }],
    outputs: [{ id: 'main', name: 'Slack Result' }],
    parameters: [
      {
        id: 'channel',
        name: 'Channel',
        type: 'string',
        default: '#ops-alerts',
        placeholder: '#general',
      },
      {
        id: 'message',
        name: 'Message Content',
        type: 'expression',
        default: '🚨 *New Critical Ticket*: {{ $json.ticketId }}\n*Summary*: {{ $json.summary }}\n*Assigned*: {{ $json.assignedTeam }}',
      },
    ],
    defaultParams: {
      channel: '#sre-alerts',
      message: '🚨 *Urgent Alert*: {{ $json.ticketId }}\n*Summary*: {{ $json.summary }}\n*Team*: {{ $json.assignedTeam }}',
    },
    sampleOutput: {
      ok: true,
      channel: 'C01928374',
      ts: '1722778200.000100',
      message: {
        text: '🚨 Urgent Alert: TCK-9021',
        bot_id: 'B01982734',
      },
    },
  },

  email_node: {
    type: 'email_node',
    name: 'Email SMTP Sender',
    category: 'action',
    iconName: 'Mail',
    color: '#6366F1',
    description: 'Sends automated HTML transactional email notifications',
    inputs: [{ id: 'main', name: 'Input' }],
    outputs: [{ id: 'main', name: 'Email Result' }],
    parameters: [
      {
        id: 'toEmail',
        name: 'To Address',
        type: 'expression',
        default: '{{ $json.user.email || "support-lead@company.com" }}',
      },
      {
        id: 'subject',
        name: 'Subject Line',
        type: 'expression',
        default: 'Escalation Notice: {{ $json.ticketId }}',
      },
      {
        id: 'bodyHtml',
        name: 'HTML Body',
        type: 'expression',
        default: '<h2>LogicMesh Incident Escalation</h2><p><strong>Ticket ID:</strong> {{ $json.ticketId }}</p><p><strong>Status:</strong> {{ $json.status }}</p>',
      },
    ],
    defaultParams: {
      toEmail: 'oncall@acmecorp.com',
      subject: 'Urgent Ticket Escalation: {{ $json.ticketId }}',
      bodyHtml: '<h3>LogicMesh System Alert</h3><p>Incident summary: {{ $json.summary }}</p>',
    },
    sampleOutput: {
      accepted: ['oncall@acmecorp.com'],
      rejected: [],
      messageId: '<lm-msg-99210@logicmesh.io>',
      response: '250 2.0.0 OK 1722778200',
    },
  },

  // --- LOGIC NODES ---
  if_switch: {
    type: 'if_switch',
    name: 'If / Switch Condition',
    category: 'logic',
    iconName: 'GitFork',
    color: '#F59E0B', // Amber logic accent
    description: 'Branches workflow execution path based on conditional logic',
    inputs: [{ id: 'main', name: 'Input Data' }],
    outputs: [
      { id: 'true', name: 'True Path' },
      { id: 'false', name: 'False Path' },
    ],
    parameters: [
      {
        id: 'field',
        name: 'Left Operand Expression',
        type: 'expression',
        default: '{{ $json.isUrgent || $json.priority }}',
      },
      {
        id: 'operator',
        name: 'Condition Operator',
        type: 'select',
        default: 'equals',
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Greater Than', value: 'greater' },
          { label: 'Is True / Truthy', value: 'truthy' },
        ],
      },
      {
        id: 'rightValue',
        name: 'Right Operand Value',
        type: 'string',
        default: 'HIGH',
      },
    ],
    defaultParams: {
      field: '{{ $json.priority }}',
      operator: 'equals',
      rightValue: 'HIGH',
    },
    sampleOutput: {
      branchMatched: 'true',
      evaluated: true,
      payload: {
        ticketId: 'TCK-9021',
        priority: 'HIGH',
      },
    },
  },

  filter_node: {
    type: 'filter_node',
    name: 'Data Filter',
    category: 'logic',
    iconName: 'Filter',
    color: '#F59E0B',
    description: 'Filters items passing through pipeline based on match criteria',
    inputs: [{ id: 'main', name: 'Items' }],
    outputs: [{ id: 'main', name: 'Filtered Items' }],
    parameters: [
      {
        id: 'conditionKey',
        name: 'Filter Key Expression',
        type: 'expression',
        default: '{{ $json.status }}',
      },
      {
        id: 'expectedValue',
        name: 'Expected Value',
        type: 'string',
        default: 'ACTIVE',
      },
    ],
    defaultParams: {
      conditionKey: '{{ $json.status }}',
      expectedValue: 'DISPATCHED',
    },
    sampleOutput: {
      passedFilter: true,
      retainedCount: 1,
      items: [{ ticketId: 'TCK-9021', status: 'DISPATCHED' }],
    },
  },
};
