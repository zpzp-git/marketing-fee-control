# AGENTS.md

## Project

This is a marketing cost-control system mock demo.

## Stack

Next.js / React / TypeScript / Tailwind.

## Responsibility

Codex is responsible for final code implementation, project integration, mock data, routing, component reuse, and build fixes.

## Rules

- Follow docs/prd/demo开发说明/00-Demo全局开发说明.md.
- Follow docs/prd/demo开发说明/uiux/00-全局UIUX设计规范.md.
- For each module, follow its module implementation document and UI/UX supplement document.
- Do not integrate real third-party systems.
- Do not implement real bank, ERP, ad platform, e-commerce platform, OA, payment, SMS, invoice verification, or external authorization APIs.
- Use mock data for all demo flows.
- Keep the implementation demo-friendly and runnable.
- Prefer existing project structure and existing components.
- Do not add large dependencies unless explicitly required.
- Every core page should consider normal, loading, empty, and error states.
- After implementation, run lint, typecheck, and build when available.