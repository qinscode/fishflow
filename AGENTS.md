# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens and layouts (e.g., `(tabs)/`, dynamic routes like `fish/[id].tsx`, `+not-found.tsx`).
- `components/`: Reusable UI (PascalCase files), animations, themed views.
- `lib/`: State (`store.ts`), data access (`database.ts`), i18n, utils, types, constants.
- `hooks/`: Custom React hooks (files prefixed with `use`).
- `assets/`: Fonts and images; avoid adding oversized unoptimized assets.
- `data/`: Fish datasets (JSON). Treat as source of truth for local seeding.
- `constants/`, `scripts/`, `ios/`: App constants, maintenance scripts, native project.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm start`: Launch Expo dev server.
- `npm run ios` / `android` / `web`: Run on iOS simulator, Android emulator, or web.
- `npm run type-check`: TypeScript strict mode check (no emit).
- `npm run lint` / `lint:fix`: Lint codebase; auto-fix where possible.
- `npm run format` / `format:check`: Prettier formatting or verification.
- `npm run generate-images`: Regenerate image mappings under `lib/fishImagesMap.ts`.
- `npm run reset-project`: Clean caches and reset project scaffolding.

## Coding Style & Naming Conventions
- Language: TypeScript with strict mode; React Native + Expo Router.
- Formatting: Prettier (2 spaces, single quotes, semicolons, width 80).
- Linting: ESLint (Expo config) with rules for `prefer-const`, `eqeqeq`, braces, React Hooks, and alphabetized `import/order`.
- Naming: Components in PascalCase (`components/Button.tsx`); hooks start with `use...`; route files use Expo Router patterns (`app/(tabs)/home.tsx`, `app/fish/[id].tsx`).
- Imports: Use `@/` path alias to root (e.g., `@/lib/utils`).

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Jest + React Native Testing Library.
- Name tests `*.test.ts(x)` colocated with source or in `__tests__/`.
- Keep tests deterministic; mock native modules where needed.
- Do not start the server by yourself; let user start it and ask feeback questions if needed
- 
## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (e.g., `feat(fishdex): add edibility sorting`, `refactor(app): optimize layout`). Use present tense and a concise scope.
- PRs: include a clear description, linked issues, before/after screenshots or GIFs for UI changes, and platforms tested (iOS/Android/Web).
- Before opening a PR: run `npm run lint`, `npm run type-check`, and `npm run format:check` locally.

## Security & Configuration Tips
- Do not commit secrets or private API keys. Use Expo config and platform keychains outside VCS.
- Keep large media optimized; prefer referencing assets in `assets/images/` and regenerate maps via scripts.
- Avoid editing generated native files under `ios/` unless required.

