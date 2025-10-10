# Copilot / AI agent instructions — bld-scrum-poker

This file contains focused, repo-specific notes to help an AI be immediately productive.

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

- Big picture

  - This is a single-page Angular 20 application (generated with Angular CLI). The app uses the new standalone component API and bootstrapApplication (see `src/main.ts` and `src/app/app.ts`).
  - Firebase is initialized at app bootstrap via `src/app/app.config.ts` using `@angular/fire` and Firestore (`provideFirebaseApp` / `provideFirestore`). The firebase config lives in `src/environments/environment*.ts`.

- Where to start reading (high value files)

  - `package.json` — scripts (`start` → `ng serve`, `build`, `watch`, `test`).
  - `angular.json` — build/serve configurations and file replacements (development replaces `environment.ts` with `environment.development.ts`).
  - `src/main.ts` — app bootstrap (uses `bootstrapApplication`).
  - `src/app/app.config.ts` — global providers (router, firebase, firestore, error listeners, zone options).
  - `src/environments/environment*.ts` — firebase keys and flags (production=false/true).
  - `src/app/app.ts` and `src/app/app.html` — primary root component and template; useful examples of signals and standalone component patterns.

- Developer workflows (exact commands)

  - Start dev server (default development config): `npm start` (runs `ng serve`).
  - Production build: `npm run build`.
  - Continuous watch build (development): `npm run watch`.
  - Run unit tests (Karma): `npm test`.

- Safety & PR notes for agents

  - Don't add new secrets to the repo. If a change requires secret keys or service accounts, mention using environment variables or a secret manager in the PR description.
  - When modifying environment files, call out whether a change affects `fileReplacements` in `angular.json` (development vs production).

- Quick references (paths)
  - App bootstrap: `src/main.ts`
  - App providers/config: `src/app/app.config.ts`
  - Root component: `src/app/app.ts` + `src/app/app.html`
  - Routes: `src/app/app.routes.ts`
  - Environments: `src/environments/environment*.ts`
  - Scripts: `package.json`
