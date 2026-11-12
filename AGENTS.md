# AGENTS.md — Kanbangit Frontend

## 1. Project context

Kanbangit is a web application for managing a software team's GitHub Issues through a Kanban board. The frontend is maintained in this repository; the NestJS backend is a separate repository: `itsaknife/kanbangit-be`.

Core product scope:
- GitHub OAuth sign-in and repository connection.
- View, create, and update GitHub Issues through the backend.
- Kanban workflow: `todo`, `in_progress`, `done`.
- Issue filtering, dashboard reporting, weekly AI summaries, and duplicate-issue warnings.
- Realtime issue updates through Socket.io.

Work on GitHub Issues only. Do not introduce Pull Request or code-merge workflows unless explicitly requested.

## 2. Verified stack

- Next.js `16.4.3`, App Router, React `19.3.0`.
- TypeScript with `strict: true`.
- Tailwind CSS v4.
- Custom UI components in `src/components/ui`; Radix UI primitives are used selectively.
- Zustand for client-side shared state.
- Axios for REST requests.
- Socket.io Client for realtime updates.
- dnd-kit for Kanban drag-and-drop.
- Recharts for dashboard charts.
- Lucide React for icons.

Do not assume the repository uses a complete shadcn/ui component set. `components.json` exists, but the current UI implementation is primarily maintained in `src/components/ui`.

## 3. Repository structure

All application code lives under `src/`:

- `app/`: App Router pages, layouts, route groups, and global styles.
  - `(auth)/`: authentication routes.
  - `(main)/`: authenticated application routes.
  - `(main)/repositories/[repoId]/`: repository-scoped board, issues, and dashboard.
- `components/`: UI grouped by feature: `ai`, `auth`, `board`, `dashboard`, `issues`, `layout`, `repositories`, `ui`.
- `config/`: browser-safe environment configuration.
- `constants/`: route names, board definitions, issue values, and socket event names.
- `hooks/`: feature hooks and reusable React hooks.
- `providers/`: application-level providers.
- `services/`: HTTP client, API services, and Socket.io connection.
- `stores/`: Zustand stores.
- `types/`: shared TypeScript domain and API types.
- `utils/`: pure helpers for formatting, filtering, grouping, and errors.

Use the existing folders and naming patterns. Do not create a parallel architecture or move files across modules without a clear requirement.

## 4. Architecture and implementation rules

### Routing and rendering
- Use the App Router conventions already present in the project.
- Keep pages and layouts server components by default. Add `"use client"` only when a component needs React client state, effects, event handlers, browser APIs, or client-side libraries.
- Keep route pages thin; put feature UI in the corresponding `src/components/<feature>/` module.
- Before changing Next.js-specific behavior, read the relevant documentation shipped with the installed version under `node_modules/next/dist/docs/`. This project uses Next.js 16; do not rely on outdated conventions.

### API and services
- All REST calls must go through `src/services/http.ts`.
- Put endpoint-specific methods in the relevant service module (`auth`, `issue`, `repository`, `dashboard`, or `ai`). Components must not call Axios or backend endpoints directly.
- Use the existing `http` methods and typed return values. Preserve the shared `ApiError` handling and `withCredentials` behavior.
- Keep API request/response types in `src/types/`. Do not use `any` to bypass an unclear contract; inspect the backend implementation or ask for clarification.
- Browser-exposed environment variables must use the `NEXT_PUBLIC_` prefix and be accessed through `src/config/env.ts`. Never expose secrets in frontend code.

### State and data flow
- Use the existing Zustand stores for shared client state where appropriate. Do not introduce another state library or move all component state into global stores.
- Keep server data operations in services and state orchestration in hooks/stores, following existing patterns.
- Prefer feature hooks (for example `useIssues`, `useBoard`, `useDashboard`) to keep components focused on rendering and user interaction.
- Keep derived values derived: use selectors or `useMemo` where useful rather than storing duplicate state.
- Handle loading, empty, error, and action-in-progress states explicitly.

### Realtime
- Reuse the shared Socket.io connection in `src/services/socket.ts`; do not create a new socket connection per component.
- Use `joinRepoRoom` / `useRepoRoom` for repository room lifecycle and `useSocketEvent` for event subscriptions.
- Keep event names and payload types centralized in `src/constants/socket-events.ts` and `src/types/`.
- Socket event names and payload contracts must remain compatible with the NestJS backend. Verify both sides before changing them.
- Clean up listeners and room subscriptions when their consumers unmount.

### UI, styling, and interactions
- Reuse existing components from `src/components/ui` before creating new primitives.
- Use Radix primitives when an existing project component is built around them; do not add a second UI framework.
- Use Tailwind utility classes and the existing `cn` helper (`src/utils/cn.ts`) for conditional class composition.
- Follow the current visual language, responsive behavior, accessibility attributes, and component API conventions.
- Use dnd-kit for Kanban drag-and-drop. Preserve current drag activation behavior and ensure issue status changes use the existing data flow.
- Use Recharts for dashboard charts and Lucide React for icons.
- Avoid unnecessary dependencies. Check whether an existing package or component already solves the requirement before adding one.

## 5. TypeScript and code conventions

- Keep TypeScript strict and define explicit types for component props, API payloads, and domain data.
- Prefer `import type` for type-only imports.
- Use the `@/*` alias for imports from `src/`.
- Follow the existing file naming: React components in PascalCase (for example `IssueDetail.tsx`); hooks in camelCase with the `use` prefix; services and stores use the existing `*.service.ts` and `*.store.ts` patterns.
- Follow the repository Prettier configuration: double quotes, semicolons, trailing commas, 100-character print width, and 2-space indentation.
- Keep functions and components focused. Extract shared logic only when it is genuinely reused or improves clarity.
- Do not add comments that merely restate the code. Document non-obvious business rules and integration contracts.

## 6. Commands

Run commands from the frontend repository root:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run format:check
npm run build
```

Available scripts are defined in `package.json`. There is currently no dedicated `test` script; do not claim tests were run unless a test setup is added and executed.

Before finishing a change:
1. Run `npm run lint` and `npm run typecheck`.
2. Run `npm run build` for changes affecting routing, rendering, configuration, or production behavior.
3. Run `npm run format:check` (or format only the files you changed).
4. Report commands that were not run and any remaining failures.

## 7. Working agreement for coding agents

- Inspect the relevant files and existing patterns before editing. Search for an existing hook, service, type, component, or utility before creating another.
- Make the smallest change that correctly solves the requested task. Do not perform broad refactors, rename unrelated files, or change unrelated behavior.
- Do not silently change API contracts, socket events, route structure, domain types, or dependencies. Explain the impact and verify the backend contract when applicable.
- Do not fabricate backend capabilities or assume an endpoint exists. If the frontend and backend disagree, identify the mismatch rather than hiding it with unsafe casts or mock behavior.
- Preserve existing user-facing behavior unless the task explicitly asks to change it.
- Never commit secrets, `.env` values, access tokens, or credentials. Do not place secrets in `NEXT_PUBLIC_` variables.
- In the final report, summarize changed files, behavior, validation commands and results, and any assumptions or follow-up work.
