# Claude Code Instructions

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by `@commitlint/cli` and `@commitlint/config-conventional`.

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Format:**
```
<type>(<optional scope>): <subject>

<optional body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

- Header max 100 characters
- Subject must not be empty
- Arabic body text is allowed
- Always add the `Co-Authored-By` signature line when Claude authors or co-authors a commit

**Git hooks (husky):**
- `commit-msg` — validates commit message via commitlint
- `pre-commit` — runs TypeScript type-checking

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Styling:** Tailwind CSS 4.1 with CSS variables for theming
- **Routing:** React Router v7 (react-router-dom)
- **State:** Zustand (sidebar), React Context (auth, theme)
- **UI Primitives:** Radix UI (Avatar, Dialog, Dropdown, Select, Tabs, Tooltip)
- **Icons:** Lucide React
- **Calendar:** react-day-picker v9
- **Build:** Vite 6 + PWA plugin
- **Deployment:** Netlify

## Path Aliases

`@/` maps to `src/` — configured in `tsconfig.json` and `vite.config.ts`.

## Data Architecture

All data is **static and seeded** — no backend or API calls.

### Seed Data (`src/data/seed/`)

- Uses **mulberry32** seeded PRNG for deterministic pseudo-random generation
- `employees.ts` — 700 employees across 9 departments with Arabic names, roles, joining dates
- `employee-insights.ts` — KPI evaluations, competency assessments, evidence text per employee
- `department-records.ts` — ~100 date records per employee spanning 3 years (daily, weekly, bi-weekly, monthly frequency)
- `departments.ts` — 9 department definitions with performance biases

**Important:** When modifying seed data generation, preserve the PRNG call order to avoid changing existing deterministic data. Add new `rand()` calls at the END of each member's loop iteration.

### Data Exports (`src/data/seed/index.ts`)

All seed data is exported as pre-generated arrays: `seedEmployees`, `seedEmployeeInsights`, `seedDepartmentRecords`, `seedDepartments`.

## Loader Pattern

Pages use `useDeferredLoad(ms)` hook which returns `false` until the specified delay passes, then `true`. During the loading state, skeleton components are shown (e.g., `EmployeeProfileSkeleton`, `EmployeeInsightsSkeleton`, `DashboardSkeleton`).

## RTL / Arabic

- HTML is `dir="rtl"` with `lang="ar"`
- Use `right` instead of `left` for absolute positioning
- Primary font: `IBM Plex Sans Arabic`
- All UI labels, content, and meta tags are in Arabic
- Date formatting uses `ar-EG` locale

## Project Structure

```
src/
├── atoms/          → UI primitives (Badge, Button, Card, Input, Label)
├── components/shared/ → Reusable components (charts, tables, pickers, layout)
├── contexts/       → Auth & Theme contexts
├── data/           → Routes, sidebar config, constants, seed data
├── enums/          → TypeScript enums
├── hooks/          → Custom hooks (settings, auth, theme, animations)
├── interfaces/     → TypeScript interfaces
├── layouts/        → Dashboard & Auth layouts
├── providers/      → Context providers
├── routes/         → Router config, route guards
├── store/          → Zustand stores
├── ui/             → Radix UI wrapper components
├── utils/          → Utility functions (cn, formatDate, storage)
└── views/          → Page components (dashboard, departments, employees, settings)
```

## Coding Conventions

- Barrel exports via `index.ts` in each directory
- CSS variables for theming (dark mode supported)
- Component files export named functions (no default exports)
- Tailwind utility classes for styling, CSS variables for colors
- Arabic numeral display uses Tailwind `tabular-nums` class
