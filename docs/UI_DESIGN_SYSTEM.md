# LogicMesh UI / UX Design System

## Core Aesthetic & Typography Principles
LogicMesh takes direct visual inspiration from world-class workflow platforms like n8n, Vercel, and Linear. It rejects basic "vibe-coded" generic templates in favor of a crisp, high-contrast, professional dark theme with precise pixel alignment, glassmorphism paneling, and micro-interactions.

---

## 1. Color Palette Tokens

### Surface & Background Tokens
- **Canvas Base Background**: `#0D0E12` (Deep Obsidian Gray)
- **Grid Dots/Lines**: `#1A1D26`
- **Sidebar & Header Surface**: `#12141C`
- **Modal / Inspector Surface**: `#161824`
- **Card / Node Surface**: `#1A1D2B`
- **Subtle Border Ring**: `rgba(255, 255, 255, 0.08)`
- **Hover Border Ring**: `rgba(255, 255, 255, 0.2)`

### Accent Palette
- **Primary Brand Coral**: `#FF5C49` (n8n signature warm vibrant coral)
- **Primary Glow**: `rgba(255, 92, 73, 0.25)`
- **Indigo Accent**: `#6366F1` (Actions & Execution)
- **Success Mint**: `#10B981` (Execution Completed)
- **Warning Amber**: `#F59E0B` (Node Testing / Paused)
- **Error Rose**: `#EF4444` (Execution Failure)
- **Cyan AI Accent**: `#06B6D4` (AI / Prompt Nodes)

---

## 2. Typography Hierarchy
- **Primary UI Font**: Inter, system-ui, -apple-system, sans-serif
- **Code & Expression Font**: JetBrains Mono, Fira Code, monospace
- **Headings Font**: Plus Jakarta Sans, Outfit, sans-serif

| Element | Size | Weight | Line Height | Tracking | Color |
|---|---|---|---|---|---|
| H1 Page Title | 20px | 700 | 28px | -0.02em | `#F3F4F6` |
| H2 Section Title | 15px | 600 | 22px | -0.01em | `#E5E7EB` |
| Body Text | 13px | 400 | 18px | normal | `#9CA3AF` |
| Node Label | 13px | 600 | 16px | -0.01em | `#F9FAFB` |
| Handle/Port Label| 11px | 500 | 14px | 0.02em | `#9CA3AF` |
| Code/Expression | 12px | 500 | 18px | normal | `#A7F3D0` |

---

## 3. Node Visual Anatomy
Every canvas node is structured with premium details:
1. **Header Header Strip**: Category-based colored top accent stripe (Coral for Trigger, Indigo for Action, Cyan for AI, Amber for Logic).
2. **Icon & Title**: High quality Lucide SVG icon embedded inside a square rounded container with slight background contrast.
3. **Execution Status Pill**: Top-right mini status badge showing execution timing (e.g. `12ms` with green check dot).
4. **Ports / Handles**: Distinct left (Input) and right (Output) circular handles with hover highlight ring and connection line snapping preview.
5. **Node Hover / Active State**: Smooth box-shadow transition (`box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px #FF5C49`).

---

## 4. Edge & Connection Styling
- **Default Connection**: Curved Bezier path, color `#4B5563`, stroke width `2px`.
- **Selected Edge**: Glowing Coral line (`#FF5C49`), stroke width `2.5px` with drop shadow filter.
- **Executing Connection**: Animated pulsing dash array gradient stroke (`stroke-dasharray: 8`, flowing animation direction source -> target).
