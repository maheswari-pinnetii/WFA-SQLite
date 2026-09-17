# STACKLY WFA — ENTERPRISE HUMAN ICON SYSTEM DOCUMENTATION

## 1. Icon Library Standard
- **Primary Icon Library**: `@mui/icons-material` (Outlined variants as default).
- **Secondary Icon Library**: `lucide-react` (Used strictly for functional UI controls with standardized stroke weights of `1.75`–`2.0`).
- **Forbidden**: Emoji characters, ASCII symbols as icons (`→`, `✓`), generic AI sparkles (`✨`, `🤖`, `🚀`), continuous neon pulse animations, and hardcoded bright decorative icon containers.

---

## 2. Icon Sizing Hierarchy
| Category | Icon Size | Usage Context |
| :--- | :--- | :--- |
| **Micro / Status** | `12px – 14px` | Status chips, inline table metadata, badges |
| **Control / Button** | `16px – 18px` | Buttons, search inputs, dropdown arrows, filter triggers |
| **Navigation / Header** | `18px – 20px` | Sidebar navigation items, top enterprise header actions |
| **KPI / Metric** | `20px – 24px` | KPI card headers, metric indicators |
| **Empty / Error State** | `32px – 48px` | Data table empty state, 404/500 error boundaries |

---

## 3. Semantic Mapping Reference Table

| Feature / Domain | Preferred Icon | Semantic Purpose |
| :--- | :--- | :--- |
| **Dashboard** | `LayoutDashboard` / `DashboardOutlined` | Executive & Role Command Center |
| **Employees** | `Users` / `PeopleOutlined` | Workforce roster & employee directory |
| **Organization** | `Building2` / `ApartmentOutlined` | Departments, teams, and cost centers |
| **Attendance** | `Clock` / `AccessTimeOutlined` | Live shifts, check-ins, and work hours |
| **Leave** | `CalendarDays` / `EventAvailableOutlined` | PTO, leave balances, and holidays |
| **Payroll** | `Payments` / `FileSpreadsheet` / `ReceiptLong` | Salary, payslips, and compliance |
| **Performance** | `TrendingUp` / `AssessmentOutlined` | Reviews, OKRs, and productivity |
| **Projects & Sprints**| `Folder` / `DirectionsRun` / `Task` | Sprints, tasks, and task boards |
| **Analytics** | `BarChart3` / `AnalyticsOutlined` | Real-time workforce metrics |
| **Security & Audit** | `ShieldCheck` / `History` / `Security` | ABAC/RBAC, audit logs, system security |
| **Settings** | `Settings` / `SettingsOutlined` | Enterprise configuration & profiles |

---

## 4. Accessibility Rules
1. Every icon-only button must have an explicit `aria-label` or `title` property (e.g., `aria-label="Delete employee"`).
2. Color must never be the sole status indicator — status badges must include both a semantic icon and readable label text.
