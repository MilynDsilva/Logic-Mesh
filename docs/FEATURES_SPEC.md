# LogicMesh Features & Technical Specifications

## Node Catalog & Integration Capabilities

### 1. Triggers
- **Webhook Trigger**: Generates mock HTTP endpoint listener with configurable path, method (GET, POST, PUT, DELETE), headers, and auth payload.
- **Schedule / Cron Trigger**: Cron string support (`*/5 * * * *`, `@hourly`, `@daily`), manual trigger test mode.
- **Manual / On-Demand Trigger**: Click-to-run trigger with custom initial JSON payload injection.
- **Event Listener Trigger**: Triggers execution on system events (e.g. database change, file upload event).

### 2. Actions & Integrations
- **HTTP Request Action**: Full REST client node with URL parameter interpolation, headers, authentication (Bearer Token, Basic Auth, API Key), payload body formatters (JSON, Form Data, Raw).
- **AI Agent Node (OpenAI / Gemini / Anthropic)**: System prompt configuration, dynamic user input evaluation, temperature slider, structured JSON output parser.
- **Code Execution Node**: Custom JavaScript sandbox executor with standard helpers (`$json`, `axios`, `lodash`-like utilities).
- **Slack Integrator**: Post chat message, send rich blocks, post to channel or webhook URL.
- **Email / SMTP Sender**: Send HTML formatted transactional emails with dynamic subject and recipient bindings.
- **Database Query (PostgreSQL / Redis / MongoDB)**: Dynamic query formatter, parameter sanitization, row mapping.

### 3. Logic & Control Flow
- **If / Switch Node**: Multi-branch conditional evaluation (Equals, Contains, Greater Than, Regex, Is Empty).
- **Filter Node**: Array data filtering based on expression predicates.
- **Merge / Join Node**: Combine payloads from multiple parallel execution paths (Append, Merge by Key, Wait for All).
- **Split In Batches**: Batch iterator for processing large arrays sequentially.

---

## Interactive Features

### 1. Visual Node Canvas
- Drag-and-drop node placement from side library or search palette (`Cmd/Ctrl + K`).
- Handle snapping & smart auto-routing Bezier connections.
- Mini-map, zoom controls (10% to 200%), fit view, grid snapping.
- Context menu: Duplicate, Disable/Enable node, Delete node, Test single node.

### 2. Live Inspector & Expression Builder
- Dual panel inspector: Node Parameters & Input/Output Data JSON Viewer.
- Live Expression Evaluator: Auto-complete autocomplete for `$json` fields with real-time preview of evaluated results.
- Test Node Execution: Execute individual nodes in isolation with sample payload input.

### 3. Execution History & Logs
- Full timeline view of previous workflow runs.
- Step-by-step trace showing duration, memory footprint, input JSON, output JSON, error tracebacks.
- One-click Re-run execution with modified input parameters.

### 4. Workflow Management & Templates
- Save & Load workflow configurations stored locally or via server API.
- Pre-built Template Gallery:
  - *AI Automated Customer Support Ticket Dispatcher*
  - *Webhook to Slack & Email Escalation Alert*
  - *Scheduled E-commerce Price Tracker & Database Sync*
  - *Multi-API Data Mashup & Summarizer*
- Export to JSON / Import from JSON file.
