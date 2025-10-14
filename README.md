# bld-scrum-poker

Small single-page Angular app for planning poker. This repository uses Angular standalone components
and Firestore for rooms and participants.

## Quick start

Requirements:
- Node.js (22+ recommended)
- npm

Install dependencies:

    npm install

Run the dev server:

    npm start

This runs `ng serve` using the development configuration. The app bootstraps with `bootstrapApplication`.

## Project layout

- `src/` — application source
  - `app/` — main app files and components
  - `environments/` — firebase configs per environment
- `public/` — public static files

Key files:
- `src/main.ts` — app bootstrap
- `src/app/app.config.ts` — global providers (router, firebase, error handlers)
- `src/app/services/firestore.service.ts` — Firestore operations (rooms & participants)
- `src/app/services/participant.service.ts` — single source-of-truth for local participant persistence

## Firestore and local development

This project uses Firestore via `@angular/fire` and the Firebase Web SDK.

Local development with the Firestore emulator (recommended for integration tests):

1. Install the Firebase CLI (if you don't have it):

       npm install -g firebase-tools

2. Start the emulator in the repo root (it will pick up `firebase.json`):

       firebase emulators:start --only firestore

3. Configure your local `src/environments/environment.local.ts` or `environment.development.ts` to
   point to the emulator using the standard firebase SDK `useEmulator` calls. See Firebase docs for details.

Note: Integration tests against the emulator are recommended for transactional and batch operations. Unit
tests use an injectable `FirestoreAdapter` that wraps Firestore helper functions and is easily mocked.

## Tests

Run unit tests (Karma + Jasmine):

    npm test

If tests fail when trying to spy on Firebase module-level helpers, prefer the adapter-based mock approach
already used in the codebase (`FirestoreAdapter`). This avoids issues with non-writable/narrow exports in
bundled test runners.
