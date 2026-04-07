# AI Agent Instructions

## Business Context

**Twindix Departments Insights** is a proof-of-concept HR analytics dashboard for Twindix Global Inc. It provides interactive visualization of employee performance, department KPIs, and competency assessments across 9 organizational departments.

### Purpose
- Replace manual Excel-based HR reporting with an interactive dashboard
- Track individual employee performance over time (tasks, hours, execution rates)
- Provide competency assessments with 6-tab detailed evaluation views
- Enable department-level and organization-level performance comparison

### Departments (9 total)
الموارد البشرية (HR), IT, المالية (Finance), المشروعات (Projects), خدمة العملاء (Customer Service), القطاع التجاري (Commercial), التسويق (Marketing), الشؤون الإدارية (Admin), المبيعات (Sales)

### Key Metrics
- **Performance:** executedWorkPercentage (tasks executed / total tasks)
- **KPIs:** 8 weighted indicators (follow-ups, activities, visits, contracts, revenue, reports, compliance)
- **Competencies:** 3 core areas rated 1-5 (Communication, Perseverance, Customer Focus)
- **Overall Score:** 70% indicators + 20% competencies + 10% administrative

## Technical Architecture

### Stack
- React 19 + TypeScript 5.8 (strict mode)
- Tailwind CSS 4.1 with CSS custom properties for theming
- Vite 6 build system with PWA support
- Radix UI for accessible primitives
- Zustand for sidebar state, React Context for auth/theme
- React Router v7 for routing with protected/public route guards

### Data Handling
- **No backend** — all data is statically generated at import time
- **Deterministic PRNG** (mulberry32 algorithm) ensures consistent data across builds
- ~700 employees generated with Arabic names, department roles, joining dates
- ~100 date records per employee spanning 3 years at varying frequencies
- Employee insights (KPIs, competencies, evidence) generated per employee

### Seed Data Files (`src/data/seed/`)
| File | Purpose | Output |
|------|---------|--------|
| `employees.ts` | Employee roster | `seedEmployees` (700 records) |
| `employee-insights.ts` | KPI & competency evaluations | `seedEmployeeInsights` (700 records) |
| `department-records.ts` | Daily performance records | `seedDepartmentRecords` (~70,000 records) |
| `departments.ts` | Department definitions | `seedDepartments` (9 records) |

### Routing
| Route | View |
|-------|------|
| `/` | Dashboard (department overview circles) |
| `/departments/hr` | HR sections radial overview |
| `/departments/hr/sections/performance-management` | Employee table with filters |
| `/departments/projects` | Projects management with project cards |
| `/departments/finance` | Financial indicators dashboard |
| `/employees/:id/profile` | Employee performance history + charts |
| `/employees/:id/insights` | 6-tab competency evaluation |
| `/settings` | Theme, date format, compact mode |
| `/login` | Demo authentication |

### Key Patterns
- **Barrel exports:** Every directory has an `index.ts` that re-exports its contents
- **Skeleton loading:** `useDeferredLoad` hook delays rendering to show skeleton placeholders
- **Page titles:** `usePageTitle("Arabic page name")` hook sets the browser tab title per page
- **Seeded PRNG:** All random data uses `mulberry32` — adding new `rand()` calls at the end of loops preserves existing data
- **RTL layout:** Entire UI is right-to-left Arabic. Positioning uses `right` not `left`
- **CSS variables:** Colors defined as CSS custom properties, switched for dark/light themes
- **Custom charts:** Performance trend chart is built with SVG + HTML (no charting library)
- **URL state persistence:** All filters, tabs, pagination (page/limit), sort options, and view modes are stored in URL query parameters using `useSearchParams`. This ensures state survives page refresh and enables shareable URLs. Default/empty values are removed from the URL to keep it clean. Page resets to 1 when filters change. Sort format: `?sort=key:direction` (e.g., `?sort=avg:desc`). When building new pages with filters, pagination, or tabs, ALWAYS persist state in URL params.

### URL Query Param Convention
| Param | Purpose | Example |
|-------|---------|---------|
| `tab` | Active tab value | `?tab=dept-hr` |
| `page` | Current page number | `?page=2` |
| `limit` | Items per page | `?limit=20` |
| `q` | Search query | `?q=محمد` |
| `sort` | Sort column and direction | `?sort=name:asc,performance:desc` |
| `preset` | Date range preset | `?preset=7d` |
| `from`, `to` | Custom date range | `?from=2026-01-01&to=2026-04-07` |
| Filter keys | Filter values (perf, role, tenure, cost, time, quality) | `?perf=excellent&role=all` |

### Employee Tenure System
- `joiningDate` field on each employee (ISO string)
- Employees with ≤3 months tenure are labeled "موظف جديد" (New Employee) — green animated badge
- Employees with >10 years tenure are labeled "موظف متميز" (Distinguished Employee) — gold badge
- HR table supports filtering by tenure category

## Deployment
- Hosted on Netlify: https://twindix-departments-insights.netlify.app
- Demo credentials: `hr.performance.admin@twindix.com` / `demo`
- Build: `pnpm build` (tsc + vite + postbuild)
