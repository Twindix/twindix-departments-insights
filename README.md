# Twindix Departments Insights

<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║    ████████╗██╗    ██╗██╗███╗   ██╗██████╗ ██╗██╗  ██╗          ║
║    ╚══██╔══╝██║    ██║██║████╗  ██║██╔══██╗██║╚██╗██╔╝          ║
║       ██║   ██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║ ╚███╔╝           ║
║       ██║   ██║███╗██║██║██║╚██╗██║██║  ██║██║ ██╔██╗           ║
║       ██║   ╚███╔███╔╝██║██║ ╚████║██████╔╝██║██╔╝ ██╗          ║
║       ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝          ║
║                                                                  ║
║          D E P A R T M E N T S   I N S I G H T S               ║
║                                                                  ║
║   Department Performance  •  Employee KPIs  •  HR Analytics     ║
║   Competency Assessment  •  9 Departments  •  700+ Employees    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Departments Performance and Employee Insights Platform**

*A platform that consolidates employee performance data into an interactive dashboard — so HR managers can monitor departments, track KPIs, and assess competencies instead of digging through Excel sheets.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Accessible-161618?logo=radixui&logoColor=white)](https://radix-ui.com)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-State-433E38)](https://zustand-demo.pmnd.rs)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**[Live Demo →](https://twindix-departments-insights.netlify.app)**

</div>

---

## About the Project

Twindix Departments Insights is a departments performance and employee insights platform designed to solve the most common challenges HR managers face when tracking employee performance across multiple departments.

The platform was born from real pain points: employee performance data scattered across Excel sheets, manual evaluation processes that take weeks, no real-time visibility into departmental analytics, and the lack of a unified view for competency assessments and KPI tracking across the entire organization.

**This is not about surveillance.** It is about giving HR managers the tools to understand departmental performance patterns, identify training needs, recognize high performers, and make data-driven decisions — replacing fragmented Excel workflows with a modern, interactive dashboard.

### What Problems Does This Platform Solve?

Based on the original data sources — **Departments Insights.xlsx** (daily task tracking across 9 departments) and **Member Insights.xlsx** (individual performance evaluation templates) — the platform addresses **5 core HR analytics challenges**:

| # | Problem Area | What Happens | Platform Solution |
|---|-------------|-------------|-------------------|
| 1 | **Scattered Employee Data** | Daily task records, attendance, hours, and performance metrics are buried in multi-sheet Excel files with 1000+ rows per department | Unified dashboard with department tabs, search, role filters, performance filters, and paginated tables |
| 2 | **Manual Performance Evaluation** | KPI assessments, competency ratings, and overall scoring require manual calculation across weighted categories (70% technical + 20% competencies + 10% administrative) | Automated scoring with visual gauges, progress bars, and weighted calculations displayed per employee |
| 3 | **No Cross-Department Visibility** | Each department's data lives in a separate Excel sheet — no way to compare or see company-wide patterns | "All" tab showing 700 employees across all departments with unified filtering and sorting |
| 4 | **Static Historical Data** | Excel sheets show raw numbers by date without trends, patterns, or visual context | Interactive SVG trend charts with hover tooltips, animated progress bars, and date-grouped performance cards |
| 5 | **Fragmented Competency Tracking** | Behavioral competency assessments (5-level scales for Communication, Perseverance, Customer Focus) exist only in template form | Per-employee competency cards with visual level indicators, behavioral descriptions, and score breakdowns |

### Data Sources

The platform's data originates from two Excel files (originally exported from Apple Numbers):

**Departments Insights.xlsx** — 12 sheets covering company-wide and per-department daily task tracking:
- **إجمالي الشركة** (Company Total) — Aggregated daily metrics across all departments
- **9 Department sheets** (المالية, الإدارة العليا, مبيعات الشركات, مبيعات داخلية, خدمة العملاء, التسويق, الشؤون الإدارية, المشروعات, مبيعات بروكر) — Per-employee daily records with 18 columns: registration status, attendance, task counts, execution rates, planned/unplanned split, work hours, actual hours, lost hours, and work percentages
- Each department sheet contains repeated date blocks with employee rows + totals per date

**Member Insights.xlsx** — 8 sheets forming a complete performance evaluation template:
- **Cover** — Department name, evaluation period (الفترة الاولى من 1-1-2019 وحتى 28-2-2019)
- **Introduction** — Performance evaluation system description and objectives
- **Objectives** — Technical performance KPIs (70% weight) with 8 metrics: follow-up rates, activity execution, visit rates, contract rates, revenue targets, report compliance, financial policy adherence
- **Non-Technical Competencies** — Competency assessment (20% weight) with 6 rating levels (مميز وكفء → ضعيف) and 3 core competencies
- **Overall Performance Calculation** — Weighted scoring: الجدارات (0.2) + الإنتاجية (0.7) + الإلتزام الإداري (0.1)
- **Evidence** — Justification fields for outstanding (متميز) and very weak (ضعيف جدا) ratings
- **V-lookup** — Core competency definitions with 5 behavioral levels each for: التواصل و التعاون, المثابرة وتحقيق الانجازات, الاهتمام بالعميل

### Wireframe Reference

The app structure follows a **Wireframe.pdf** that defines:
- Dashboard with 8 department circles (إدارة المشروعات, إدارة المالية, إدارة خدمة العملاء, إدارة IT, إدارة الموارد البشرية, إدارة التخطيط الاستراتيجي, إدارة المراجعة, إدارة القطاع التجاري)
- Permission-gated access ("ليس لديك تصريح للاطلاع على هذه المعلومات")
- HR department deep-dive with member tables
- Individual member profile with all Excel data rendered in modern UI
- Member insights page showing the full evaluation template content

---

## Platform Features

### Department Dashboard
The central view showing 9 company departments as interactive cards with animated conic-gradient performance gauges. Each card displays the department name, employee count, and overall performance percentage. The HR department card has a green access indicator — clicking it navigates to the detailed HR view. Other departments show a lock icon and display an access restriction toast notification. Summary statistics above show total departments, total employees, average performance, and top-performing department.

### HR Department — Employee Tables
A tabbed interface with horizontal scrolling showing all 9 departments plus an "All" tab (700 employees). Each tab features:
- **Department progress bar** — Animated bar showing the tab's overall performance
- **Triple filter system** — Search by name, filter by role (department-specific roles), filter by performance level (Excellent 90%+, Good 75-89%, Average 60-74%, Weak <60%)
- **Active filter badges** — Visual indicators of applied filters with individual clear buttons
- **Paginated table** — Configurable page sizes (5/10/20/50), first/prev/next/last navigation, row count display
- **Table columns** — Employee name (clickable → profile), role, department, performance progress bar, insights button

### Member Profile
Individual employee performance history page with:
- **Summary stat cards** — Animated count-up numbers for total tasks, executed tasks, unexecuted tasks, lost hours, average performance
- **SVG trend chart** — Interactive performance trend line with HTML axis labels, hover tooltips showing date and percentage, vertical guide lines, animated line drawing, and area fill
- **Tasks bar chart** — Stacked horizontal bars per date (green executed vs red unexecuted) with registration status badges
- **Hours comparison** — Actual vs daily work hours bars per date
- **Detailed daily cards** — Grid of cards per date showing all 18 tracked fields with status badges and mini progress bars

### Member Performance Insights
Six-tab evaluation view presenting the full Member Insights Excel data:
- **مقدمة (Introduction)** — Performance evaluation system description + large overall score gauge + rating badge
- **الأهداف (Objectives)** — KPI table with 8 metrics showing target vs actual with color coding, relative weights, notes, and mini comparison bars
- **الجدارات (Competencies)** — 3 competency cards (Communication & Collaboration, Perseverance & Achievement, Customer Focus) each with 5-level visual scale, selected level highlight, score percentage, and behavioral description
- **نتيجة الأداء (Overall Performance)** — Large score gauge + 3 weighted component bars (Indicators 70%, Competencies 20%, Administrative 10%) + strengths and weaknesses cards
- **الأدلة (Evidence)** — Two styled cards for excellence evidence and weakness evidence
- **الجدارات الأساسية (Core Competencies)** — 3 expandable competency definitions with 5 behavioral levels each

### Settings
- **Dark / Light Mode** — System preference detection with manual toggle
- **Compact View** — Toggleable mode that reduces padding and spacing across the entire interface
- **Date Format** — Configurable display (short Arabic, full Arabic with weekday, ISO format)

### Error Handling & Offline Support
- **Error Boundary** — Catches rendering errors with Arabic error messages, copy-to-clipboard stack traces, and retry/home buttons
- **404 Page** — Arabic "page not found" with back/home navigation
- **500 Page** — Arabic "server error" with retry/home navigation
- **Offline Banner** — Real-time network status detection with persistent warning banner
- **Offline Page** — Standalone HTML fallback when the app is unreachable

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Styling | Tailwind CSS 4.1 |
| Components | Radix UI (accessible primitives) + shadcn/ui patterns |
| State | Zustand (sidebar state) |
| Routing | React Router 7 |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| Data | Static TypeScript seed modules (no backend) |
| Auth | Dummy login (localStorage session) |
| Build | Vite 6.4 |
| PWA | vite-plugin-pwa (service worker, offline fallback) |
| Font | IBM Plex Sans Arabic + Inter |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Clone or navigate to the project directory
cd "Departments Insights"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Login
- **Email:** hr.admin@twindix.com
- **Password:** demo

**[Live Demo →](https://twindix-departments-insights.netlify.app)**

The app includes 700 employees across 9 departments with realistic performance data, all bundled as static TypeScript modules.

---

## Static Data Architecture

**This POC has no backend or database.** All data is stored as static TypeScript seed modules (`src/data/seed/`) that are compiled into the application bundle. This was a deliberate decision to ship the demo without any backend dependencies or storage limitations.

### How it works:

| Concern | How It's Handled |
|---------|-----------------|
| **Data Source** | Static TypeScript arrays in `src/data/seed/` — compiled into the JS bundle at build time. Originally sourced from Excel files. |
| **Data Access** | Views import seed modules directly (e.g., `import { seedMembers } from "@/data/seed"`). No async calls, no fetching. |
| **Authentication** | Dummy login — email `hr.admin@twindix.com` + password `demo`. Session stored in `localStorage`. |
| **User Preferences** | Theme (dark/light), date format, and compact view are stored in `localStorage` — the only use of browser storage. |
| **Data Generation** | Members are generated programmatically using a seeded PRNG (mulberry32) with pools of Arabic names and department-specific roles. Performance tiers vary by department for realistic distribution. |
| **State Management** | Zustand for UI state (sidebar). React Context for auth and theme. |

### Seed Data Modules

| Module | Description | Records |
|---|---|---|
| `seed/departments.ts` | Department & sub-department definitions | 9 + 9 |
| `seed/members.ts` | Employee roster generated from Arabic name pools | 700 |
| `seed/department-records.ts` | Daily performance records (last 15 working days) | 10,500 |
| `seed/member-insights.ts` | Individual KPI & competency evaluations | 700 |

### Data Sources

- **Departments Insights.xlsx** — Daily task tracking per employee across 9 departments. Tracks: registration status, task counts, execution rates, work hours, planned vs unplanned work
- **Member Insights.xlsx** — Individual performance evaluations. Tracks: KPI objectives with weighted scoring, competency assessments with behavioral levels, overall performance calculation, evidence documentation

### What a real backend would look like:

```
Client (React)  →  REST API (Node.js/Express)  →  PostgreSQL
                    ↕                                ↕
                 Redis (cache)              Migration scripts
                    ↕
              WebSocket (real-time)
```

### POC Limitations

| Area | Current Approach | Production Solution |
|------|-----------------|---------------------|
| **Data** | Static TypeScript modules compiled into bundle | REST API + PostgreSQL database |
| **Authentication** | Dummy login with localStorage session | OAuth 2.0 / SSO with JWT tokens |
| **Data editing** | Read-only — no mutations | Full CRUD operations via API |
| **Charts** | CSS gauges + SVG trend lines | Recharts or Visx for advanced visualizations |
| **Notifications** | Toast notifications only | Email + Slack webhook notifications |
| **Report export** | In-browser only | PDF and CSV export |
| **Multi-language** | Arabic only | Full i18n with English support |
| **Data import** | Hardcoded from Excel | Excel/CSV upload with automatic parsing |

---

## Project Structure

```
src/
├── atoms/          → Reusable UI primitives (Button, Badge, Card, Input, Label)
├── components/     → Composed components organized by feature
│   └── shared/     → Sidebar, Topbar, Header, ScoreGauge, ProgressBar, DataTable,
│                     DepartmentCircle, StatCard, StatusBadge, ErrorBoundary
├── contexts/       → React contexts (Auth, Theme)
├── data/           → Route config, sidebar navigation, constants
│   └── seed/       → All seed data modules (departments, members, records, insights)
├── enums/          → TypeScript enums (Theme, PerformanceStatus, RegistrationStatus)
├── hooks/          → Custom hooks
│   └── shared/     → useAuth, useTheme, useCountUp, useLocalStorage,
│                     useOnlineStatus, useSettings (with formatDate)
├── interfaces/     → TypeScript interfaces for all data models
├── layouts/        → Auth layout (centered card) and Dashboard layout (sidebar + topbar)
├── providers/      → Context providers (Auth with dummy login, Theme with system detection)
├── routes/         → Router config with protected/public route guards
├── store/          → Zustand stores (sidebar state)
├── ui/             → Radix UI wrapper components (Avatar, Dialog, Dropdown, Tabs, Tooltip, etc.)
├── utils/          → Utility functions (cn, storage helpers, formatDate, formatNumber)
└── views/          → Page views
    ├── auth/login/      → Login page with demo credentials
    ├── dashboard/       → Department circles overview
    ├── departments/hr/  → HR employee tables with filters & pagination
    ├── members/profile/ → Individual member performance history
    ├── members/insights/→ Member KPI & competency evaluation
    ├── settings/        → App settings (theme, compact, date format)
    ├── profile/         → User profile page
    └── errors/          → 404 and 500 error pages
```

---

## License

PROPRIETARY — Twindix Global Inc.

## Author

**[Mohamed Elhawary](https://hawary.dev)** 

Based on the original *Departments Insights* and *Member Insights* Excel data sources — a comprehensive dataset of daily employee task tracking and periodic performance evaluations across 9 company departments.
