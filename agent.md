# Agent Contribution Guide

These instructions apply to every agent and contributor working in the **LogicMesh** repository.

## Protected Branches & Merge Rules

- **Never commit or push directly** to `development`, `main`, or `master`.
- **Never perform local branch merges** into protected branches. All merges must be performed by human maintainers on GitHub via Pull/Merge Requests.
- Treat `main` / `development` as protected integration branches.
- Submit completed work through feature branches and Pull Requests (PRs).

## Progress & Status Tracking

- Agents must maintain real-time progress metrics in `docs/project-status.md`.
- Every task update must specify:
  - Total project progress percentage (% done / % pending).
  - Completed milestone deliverables.
  - Active phase and current feature branch.
  - Recommended next actionable items.

## Starting Work

Before changing files:

1. Read `docs/project-status.md` and `docs/PLAN.md`.
2. Check that the working tree is clean.
3. Create a focused feature branch:

```bash
git checkout -b <type>/<short-name>
# Example: git checkout -b feat/logicmesh-visual-automation-core
```

## Branch Naming Conventions

Use lowercase branch prefixes:
- `feat/feature-name` for new features
- `fix/bug-fix` for bug fixes
- `docs/documentation-update` for documentation changes
- `refactor/component-refactor` for code improvements

## Code & Stack Conventions

- Vite + React + TypeScript with strict typing.
- n8n-inspired modern dark glassmorphic design system using CSS tokens & Tailwind CSS.
- Node-based canvas editor powered by `@xyflow/react` and Lucide icons.
- Topologically resolved DAG execution engine with expression evaluation engine.
