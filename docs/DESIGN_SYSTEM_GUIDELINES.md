# LogicMesh Component & Design System Guidelines

This document serves as the single source of truth for design tokens, button variants, color palette rules, and UI component standards across the **LogicMesh** visual workflow automation engine.

---

## 🎨 Color Palette Tokens & Standards

### 1. Primary Action Token (Brand Accent)
- **Class**: `bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-xs shadow-blue-600/20 rounded-xl`
- **Use For**: All primary action buttons across the entire platform!
  - `Run Workflow` button in Header
  - `Execute step` button in Node Configuration Modal
  - `Create Workflow` / `Create Mesh` primary CTA buttons
  - Floating `+ Add Node / Component` button on Canvas

### 2. Secondary Action Token
- **Class**: `bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 rounded-xl`
- **Use For**: Secondary actions, tool buttons, utility options, dropdown triggers, and standard navigation items.

### 3. Success / Active Status Token
- **Class**: `bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs rounded-xl`
- **Use For**: `Published` status badges/buttons, successful node badges, and output payload active tab indicators.

### 4. Warning / Pending Status Token
- **Class**: `bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-2xs rounded-xl`
- **Use For**: `Executing...` active states, `Archived` status badges, live polling indicators.

### 5. Danger / Destructive Action Token
- **Class**: `bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl`
- **Use For**: `Delete Node`, `Delete Workflow`, `Clear Logs`, destructive confirmation modals.

---

## 🚫 Strict Design Rules for Agents & Developers

1. **NO Inconsistent Button Colors**:
   - ❌ **DO NOT** use `bg-orange-600`, `bg-slate-900`, `bg-black`, or custom arbitrary colors for primary action buttons.
   - ✅ **ALWAYS** use the standardized `bg-blue-600 hover:bg-blue-700` primary token for primary actions (`Run`, `Execute step`, `Create`).

2. **100% Light Theme Standard (`Flowaxon / n8n Aesthetic`)**:
   - ❌ **DO NOT** create dark containers (`bg-slate-900`, `bg-slate-950`, `bg-black`) for inspector drawers, code panels, output containers, or payload viewers.
   - ✅ **ALWAYS** use light mode backgrounds: `bg-white`, `bg-slate-50`, `border-slate-200`, and `text-slate-800`.

3. **Typography**:
   - Headers: `font-heading font-extrabold text-slate-900`
   - Body text: `font-sans text-slate-700`
   - Code & JSON payloads: `font-mono text-xs text-slate-800 select-text`

4. **Component Border Radius**:
   - Cards / Containers: `rounded-2xl` or `rounded-3xl`
   - Buttons / Inputs: `rounded-xl`
   - Badges / Floating Pills: `rounded-full`
