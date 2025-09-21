# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens, layouts, and route groups (e.g., `(tabs)/`, `fish/[id].tsx`).
- `components/`: Shared UI primitives, animations, and themed wrappers in PascalCase files.
- `lib/`: Global state, data access, utilities, types, constants, and i18n helpers.
- `hooks/`: Custom React hooks prefixed with `use`, colocated by feature.
- `assets/` & `data/`: Optimized images/fonts and canonical fish datasets; update images via `npm run generate-images`.
- `constants/`, `scripts/`, `ios/`: App-wide constants, maintenance tooling, and native project files—modify native code only when necessary.

## Build, Test, and Development Commands
- `npm install`: Install Expo + React Native dependencies.
- `npm start`: Launch the Expo dev server for simulators or devices.
- `npm run ios` / `npm run android` / `npm run web`: Open the app on the respective platform targets.
- `npm run type-check`: Run TypeScript in strict no-emit mode; keep zero errors.
- `npm run lint` (`lint:fix`): Validate ESLint rules and optionally auto-fix violations.
- `npm run format` (`format:check`): Apply or verify Prettier formatting (2 spaces, width 80).
- `npm run reset-project`: Clear caches if tooling or bundler behaves unexpectedly.

## Coding Style & Naming Conventions
- Language: TypeScript with React Native components; keep files in UTF-8 ASCII when possible.
- Formatting: Prettier, 2-space indentation, single quotes, required semicolons.
- Imports: Use `@/` alias from repo root and keep groups alphabetized per ESLint.
- Naming: Components in PascalCase, hooks start with `use`, routes follow Expo patterns like `app/fish/[id].tsx`.

## Testing Guidelines
- No runner is configured yet; prefer Jest + React Native Testing Library when adding tests.
- Name tests `*.test.ts` or `*.test.tsx` and colocate near source or in `__tests__/`.
- Keep tests deterministic; mock native modules to avoid flakiness.

## Commit & Pull Request Guidelines
- Use Conventional Commits, e.g., `feat(app): add fish detail view`.
- Ensure commits stay focused with passing lint, format, and type-check commands.
- PRs should describe changes, link issues, and include platform screenshots or GIFs for UI updates.
- Before opening a PR, run `npm run lint`, `npm run type-check`, and `npm run format:check` locally.

## Security & Configuration Tips
- Do not commit secrets or platform keys; use Expo config and local keychains.
- Keep media optimized and store under `assets/images/`; regenerate maps after updates.
- Avoid direct edits to generated native files unless coordinating with the mobile team.
