# LogicMesh

> **LogicMesh** is a visual workflow automation platform & node-based execution engine inspired by n8n. Designed with modern aesthetics, dark mode glassmorphism, dynamic expression syntax, real-time node execution visualizer, and extensive integration nodes.

---

## 📚 Documentation Index
- [Architecture & DAG Engine Specs](docs/ARCHITECTURE.md)
- [Feature Breakdown & Node Catalog](docs/FEATURES_SPEC.md)
- [UI / UX Design System & Color Tokens](docs/UI_DESIGN_SYSTEM.md)

---

## ✨ Key Features
- 🎨 **n8n-Grade Visual Canvas Editor**: Drag-and-drop node placement, custom handles, smooth Bezier curves, mini-map, and fit view.
- ⚡ **Real-Time Execution Engine**: Built-in DAG topological resolver that executes workflows step-by-step with real-time status pulses (`12ms` execution metrics).
- 🧬 **Dynamic Expression Engine**: Mustache expressions (`{{ $json.data.user }}`) with full context interpolation and real-time inspector dynamic evaluation preview.
- 🤖 **AI Node & Integrations**: Integrated OpenAI / Gemini LLM runner, Webhook listener trigger, HTTP REST action, Code JavaScript evaluator, Slack notifier, and Filter/Switch logic nodes.
- 📜 **Execution Log Inspector**: Step-by-step history trace with raw JSON input/output inspection.
- 📦 **Import / Export / Templates**: Import/export raw workflow JSON specs, or pick from pre-configured workflow templates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation & Running
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Built With
- **React 19** + **TypeScript**
- **Vite**
- **@xyflow/react** (React Flow canvas)
- **Lucide React** (Modern Iconography)
- **Canvas Confetti** (Execution Delight)
- **Vanilla CSS Tokens** (Professional Glassmorphic Dark Theme)
