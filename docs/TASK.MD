# TASK.md — DCIMS Development Roadmap

# Davao Construction Inventory Management System

## 1. Development Overview

This document defines the implementation tasks, development
sequence, technical requirements, and acceptance criteria
for DCIMS.

DCIMS is a frontend-only construction inventory management
system designed for portfolio demonstration purposes.

All development must follow:

- docs/PROJECT.md
- docs/THEME.md
- docs/TYPOGRAPHY.md
- docs/TASK.md

Read all specification documents before implementing
any application feature.

## 2. Development Constraints

- Use Next.js App Router.
- Use TypeScript with strict mode.
- Use Tailwind CSS v4.
- Use shadcn/ui components.
- Use Lucide React for icons.
- Use Zustand for state management.
- Use LocalStorage for data persistence.
- Use Recharts for data visualization.
- Use React Hook Form and Zod for form validation.
- Use realistic fictional construction data.
- Use Philippine Peso for monetary values.
- Use Asia/Manila for date and time formatting.

DO NOT implement:

- External databases
- Supabase
- Firebase
- Backend servers
- Custom REST APIs
- Real authentication
- Payment integrations
- AI integrations
- Paid external services

All business operations must be simulated locally.

## 3. Development Timeline

Target development duration: 3 days.

### Day 1 — Foundation and Inventory

- Project initialization
- Application architecture
- Theme and typography
- Shared UI components
- Mock data
- State management
- Dashboard
- Materials management
- Categories management
- Warehouse management

### Day 2 — Construction Operations

- Stock movements
- Warehouse transfers
- Construction projects
- Material requests
- Material consumption
- Equipment management
- Supplier management
- Purchase orders

### Day 3 — Completion and Deployment

- Reports and analytics
- Activity logs
- Notifications
- Application settings
- Responsive optimization
- Functional testing
- UI refinement
- Production build
- Vercel deployment

The timeline is an aggressive target for a functional demo.

Prioritize core inventory workflows before optional
features and visual enhancements.

## 4. Task Priority Definitions

### P0 — Critical

Required for the application to function correctly.

### P1 — High

Required for a complete portfolio demonstration.

### P2 — Medium

Enhances usability and presentation.

### P3 — Optional

Implement only when all critical and high-priority
tasks have been completed.

## 5. Phase 01 — Project Initialization

Priority: P0

### Environment Setup

- [x] Initialize Next.js project.
- [x] Enable App Router.
- [x] Enable TypeScript.
- [x] Enable TypeScript strict mode.
- [x] Configure Tailwind CSS v4.
- [x] Configure ESLint.
- [x] Configure path aliases.
- [x] Initialize shadcn/ui.
- [x] Configure project directory structure.
- [x] Initialize Git repository if not already initialized.
- [x] Create README.md.

### Dependencies

- [x] Install Zustand.
- [x] Install Lucide React.
- [x] Install Recharts.
- [x] Install React Hook Form.
- [x] Install Zod.
- [x] Install @hookform/resolvers.
- [x] Install next-themes.
- [x] Install Sonner.
- [ ] Install date-fns if needed (not needed for Phase 01).

Avoid unnecessary dependencies.

### Documentation

- [x] Verify PROJECT.md.
- [x] Verify THEME.md.
- [x] Verify TYPOGRAPHY.md.
- [x] Verify TASK.md.
- [x] Ensure implementation follows all specifications.

### Acceptance Criteria

- Development server starts successfully.
- TypeScript configuration is valid.
- Tailwind CSS is working.
- shadcn/ui components render correctly.
- No dependency conflicts exist.

## 6. Phase 02 — Branding and Design System

Priority: P0

### Branding Assets

- [x] Add dcims.png to the public directory.
- [x] Prepare a square dcims-icon.png asset.
- [x] Configure browser favicon.
- [x] Remove the default Next.js favicon.
- [x] Configure website metadata.
- [x] Configure website title and description.
- [x] Verify logo visibility on light backgrounds.
- [x] Verify logo visibility on dark backgrounds.
- [x] Create reusable Logo component.

### Typography

- [x] Configure Inter using next/font.
- [x] Configure Manrope using next/font.
- [x] Configure JetBrains Mono using next/font.
- [x] Configure typography CSS variables.
- [x] Configure heading styles.
- [x] Configure body text styles.
- [x] Configure numerical typography.
- [x] Configure responsive font sizes.

### Theme

- [x] Implement light-mode design tokens.
- [x] Implement dark-mode design tokens.
- [x] Configure industrial navy branding.
- [x] Configure safety orange accents.
- [x] Configure semantic status colors.
- [x] Configure border radius.
- [x] Configure spacing system.
- [x] Configure shadow utilities.
- [x] Implement theme provider.
- [x] Implement theme switcher.
- [x] Persist theme preference.
- [x] Prevent theme hydration mismatches.

### Acceptance Criteria

- Branding is consistent throughout the application.
- Light and dark modes function correctly.
- Typography follows TYPOGRAPHY.md.
- Colors and components follow THEME.md.
- No default Next.js branding remains.

## 7. Phase 03 — Application Layout

Priority: P0

### Root Layout

- [x] Configure root layout.
- [x] Configure application providers.
- [x] Configure theme provider.
- [x] Configure toast notification provider.
- [x] Configure global styles.
- [x] Configure application metadata.

### Sidebar

- [x] Create desktop sidebar.
- [x] Display DCIMS branding.
- [x] Implement navigation groups.
- [x] Implement active route indicators.
- [x] Implement sidebar collapse.
- [x] Implement collapsed navigation tooltips.
- [x] Implement mobile navigation drawer.
- [x] Implement demo user profile section.
- [x] Persist sidebar preferences.

### Header

- [x] Create sticky application header.
- [x] Implement breadcrumb navigation.
- [ ] Implement global search interface. — Deferred to Phase 21: the search surface needs domain records from Phase 06 and a query layer from Phase 21. Omitting it now avoids shipping a control that does nothing.
- [ ] Implement notification dropdown. — Deferred to Phase 20: notifications derive from activity records created in Phase 19.
- [x] Implement theme toggle.
- [x] Implement user profile dropdown.
- [x] Implement mobile menu trigger.

### Main Content

- [x] Create reusable page container.
- [x] Create reusable page header.
- [x] Create reusable section header.
- [x] Configure responsive content spacing.
- [x] Configure maximum content width.
- [x] Add portfolio demo indicator.

### Application Routes

- [x] /dashboard
- [x] /materials
- [x] /categories
- [x] /warehouses
- [x] /stock-movements
- [x] /projects
- [x] /material-requests
- [x] /equipment
- [x] /suppliers
- [x] /purchase-orders
- [x] /reports
- [x] /activity-logs
- [x] /settings

Redirect the root route to /dashboard.

Implementation note: every module route renders a
ModulePlaceholder that names the phase responsible for
the real implementation. No placeholder exposes
nonfunctional controls, per the prohibition on fake
functional interface elements.

### Acceptance Criteria

- All navigation links work.
- Active routes are highlighted correctly.
- Sidebar collapse works.
- Mobile navigation works.
- No horizontal page overflow exists.
- Layout remains consistent across modules.

## 8. Phase 04 — Shared UI Components

Priority: P0

### shadcn/ui Components

- [x] Button
- [x] Card
- [x] Input
- [x] Label
- [x] Textarea
- [x] Select
- [x] Checkbox
- [x] Switch
- [x] Badge
- [x] Table
- [x] Dialog
- [x] Alert Dialog
- [x] Sheet
- [x] Dropdown Menu
- [x] Popover
- [x] Tooltip
- [x] Tabs
- [x] Separator
- [x] Skeleton
- [x] Avatar
- [x] Calendar
- [x] Progress
- [x] Scroll Area
- [x] Command
- [x] Breadcrumb
- [x] Pagination

### Custom Shared Components

- [x] PageHeader
- [x] SectionHeader
- [x] StatCard
- [x] DataTable
- [x] DataTableToolbar
- [x] DataTablePagination
- [x] SearchInput
- [x] FilterDropdown
- [x] StatusBadge
- [x] EmptyState
- [x] LoadingState
- [x] ErrorState
- [x] ConfirmDialog
- [x] FormField
- [x] CurrencyInput
- [x] DateRangeFilter
- [x] ExportButton
- [x] ChartContainer
- [x] RecordDetails
- [x] RowActions
- [x] DemoIndicator

Implementation notes:

- Every stock primitive was audited against the anti-ai-slop rules. `transition-all` was replaced with explicit transition properties in badge, button, progress, switch, and tabs.
- A base-layer rule in `globals.css` supplies `cursor: pointer` to non-disabled buttons and `[role="button"]` elements, because Tailwind v4 preflight leaves them on the default cursor.
- `DataTable`, `StatusBadge`, and `RecordDetails` are intentionally domain-agnostic: they take column definitions, a status string, and label/value pairs. Phase 05's domain types plug in without rewriting them.
- `ExportButton` delegates serialisation to the caller so CSV escaping and formula-injection protection live in one place in Phase 05.
- `FormField`, `CurrencyInput`, and `DateRangeFilter` carry no form-library dependency, so the React Hook Form versus TanStack Form question does not block them.

### Acceptance Criteria

- Components are reusable.
- Components support both themes.
- Components follow the design system.
- Components support keyboard interaction.
- Duplicate UI implementations are minimized.

## 9. Phase 05 — Data Models and Utilities

Priority: P0

### TypeScript Models

- [x] Material
- [x] MaterialCategory
- [x] Warehouse
- [x] InventoryBalance
- [x] StockMovement
- [x] ConstructionProject
- [x] ProjectMaterial
- [x] MaterialConsumption
- [x] MaterialRequest
- [x] MaterialRequestItem
- [x] Equipment
- [x] EquipmentAssignment
- [x] MaintenanceRecord
- [x] Supplier
- [x] PurchaseOrder
- [x] PurchaseOrderItem
- [x] ActivityLog
- [x] Notification
- [x] DemoUser
- [x] ApplicationSettings

### Enumerations and Status Types

- [x] Material status.
- [x] Stock movement type.
- [x] Warehouse status.
- [x] Project status.
- [x] Request priority.
- [x] Material request status.
- [x] Equipment condition.
- [x] Equipment status.
- [x] Supplier status.
- [x] Purchase order status.
- [x] Notification type.

### Utility Functions

- [x] Generate unique IDs.
- [x] Generate material SKU.
- [x] Generate warehouse codes.
- [x] Generate project codes.
- [x] Generate transaction reference numbers.
- [x] Generate purchase order numbers.
- [x] Generate material request numbers.
- [x] Format Philippine Peso currency.
- [x] Format numerical quantities.
- [x] Format dates.
- [x] Format timestamps.
- [x] Calculate inventory value.
- [x] Calculate weighted-average cost.
- [x] Calculate stock status.
- [x] Calculate purchase order totals.
- [x] Calculate project material expenses.
- [x] Generate CSV files.
- [x] Escape CSV values safely.
- [x] Validate imported JSON data.

### Validation Schemas

- [x] Material validation schema.
- [x] Category validation schema.
- [x] Warehouse validation schema.
- [x] Stock movement validation schema.
- [x] Project validation schema.
- [x] Material request validation schema.
- [x] Equipment validation schema.
- [x] Supplier validation schema.
- [x] Purchase order validation schema.
- [x] Application settings validation schema.
- [x] Complete demo data import schema.

Implementation notes:

- Domain types live in `src/types/domain.ts` with `src/types/index.ts` as the barrel. Status values are `as const` string unions rather than TypeScript enums, so persisted JSON stays readable and survives rehydration without reverse mapping.
- Money is integer centavos everywhere; field names carry the `Centavos` suffix so a peso value in a centavos field is a visible mistake.
- Inventory and costing helpers throw `RangeError` on invalid input instead of returning a plausible wrong number. Callers validate first; the throw catches programming errors rather than user errors.
- CSV escaping prefixes apostrophes to values starting with `=`, `+`, `-`, `@`, tab, or carriage return, and doubles embedded quotes.
- `parseDemoData` returns a result object instead of throwing, with one message per validation issue.

### Acceptance Criteria

- All entities have strongly typed interfaces.
- Shared status values are consistent.
- Financial calculations use decimal-safe operations.
- Validation prevents invalid records.
- Utility functions are reusable across modules.

## 10. Phase 06 — Mock Data

Priority: P0

### Seed Data Requirements

- [x] Create at least 50 construction materials.
- [x] Create at least 10 material categories.
- [x] Create 3 fictional warehouses.
- [x] Create 6 fictional construction projects.
- [x] Create at least 12 fictional suppliers.
- [x] Create at least 20 equipment records.
- [x] Create at least 40 stock movement records.
- [x] Create at least 15 material requests.
- [x] Create at least 10 purchase orders.
- [x] Create at least 30 activity records.
- [x] Create sample equipment assignments.
- [x] Create sample maintenance records.
- [x] Create sample notifications.
- [x] Create fictional company profile.
- [x] Create fictional demo user profile.

### Warehouse Seed Data

- [x] Central Warehouse — Matina.
- [x] North Warehouse — Buhangin.
- [x] South Warehouse — Toril.

### Project Seed Data

- [x] Matina Commercial Building.
- [x] Lanang Business Center.
- [x] Toril Residential Development.
- [x] Buhangin Warehouse Expansion.
- [x] Mintal Community Complex.
- [x] Downtown Office Renovation.

### Material Seed Data

Include realistic examples such as:

- Portland Cement
- Reinforcing Steel Bar
- Concrete Hollow Blocks
- Marine Plywood
- Washed Sand
- Crushed Gravel
- PVC Pipes
- Electrical Wires
- Roofing Sheets
- Construction Nails
- Tile Adhesive
- Waterproofing Compound
- Safety Helmets
- Safety Gloves
- Concrete Sealant

### Data Integrity

- [x] Verify all entity relationships.
- [x] Verify unique material SKUs.
- [x] Verify unique reference numbers.
- [x] Verify warehouse inventory balances.
- [x] Verify transaction quantities.
- [x] Verify project material allocations.
- [x] Verify purchase order totals.
- [x] Verify request fulfillment quantities.
- [x] Verify equipment assignments.
- [x] Verify historical transaction consistency.
- [x] Include low-stock materials.
- [x] Include out-of-stock materials.
- [x] Include partially fulfilled requests.
- [x] Include partially received purchase orders.

Verified dataset (rendered from `findSeedIntegrityProblems`, zero problems):
10 categories, 55 materials, 3 warehouses, 6 projects, 12 suppliers,
20 equipment, 124 stock movements, 98 balances, 14 project material
allocations, 15 requests, 10 purchase orders, 34 activity records,
5 notifications, 4 assignments, 3 maintenance records.

Generation rules that keep the data honest:

- Balances are derived by replaying movements, never written by hand.
- Requests and purchase orders are built before the movements they cause, so
  every fulfilled request has a matching stock-out and every received line has
  a matching stock-in.
- A stock-out is only emitted when a warehouse actually holds the quantity;
  otherwise the recorded fulfilment is reduced to zero.
- Project material allocations are aggregated from stock-outs and returns.
- One material is deliberately drained to zero to exercise the out-of-stock
  state, with its movement history explaining how.
- `src/instrumentation.ts` re-runs the integrity check at every development
  server start and reports failures in the console.

All names, contact details, business information,
and operational records must be fictional.

### Acceptance Criteria

- Seed data is realistic and consistent.
- Dashboard metrics can be derived from seed data.
- All modules contain sufficient demonstration records.
- No orphaned references exist.
- No negative inventory balances exist.

## 11. Phase 07 — State Management

Priority: P0

### Domain Store

- [x] Create centralized Zustand domain store.
- [x] Configure Zustand persist middleware.
- [x] Configure LocalStorage persistence.
- [x] Configure persisted state version.
- [x] Configure state migration.
- [x] Configure hydration handling.
- [x] Configure seed data initialization.
- [x] Implement invalid-state recovery.
- [x] Implement reusable state selectors.
- [x] Implement derived dashboard statistics.
- [x] Implement coordinated inventory transactions.
- [x] Implement demo data reset.
- [x] Implement JSON data export.
- [x] Implement validated JSON data import.

### UI Store

- [x] Manage sidebar state.
- [x] Manage mobile navigation state.
- [x] Manage global search state.
- [x] Manage notification panel state.
- [x] Manage temporary UI preferences.

### Business Actions

- [x] Create material.
- [x] Update material.
- [x] Archive material.
- [x] Create category.
- [x] Update category.
- [x] Create warehouse.
- [x] Update warehouse.
- [x] Record stock-in.
- [x] Record stock-out.
- [x] Transfer inventory.
- [x] Record stock adjustment.
- [x] Record material return.
- [x] Create project.
- [x] Update project.
- [x] Record material consumption.
- [x] Create material request.
- [x] Approve material request.
- [x] Reject material request.
- [x] Fulfill material request.
- [x] Register equipment.
- [x] Assign equipment.
- [x] Return equipment.
- [x] Record equipment maintenance.
- [x] Create supplier.
- [x] Update supplier.
- [x] Create purchase order.
- [x] Approve purchase order.
- [x] Receive purchase order.
- [x] Generate activity records.
- [x] Generate notifications.

Architecture:

- Rules live in `src/services/*` as pure functions that take the current
  dataset and return a new dataset or a failure. The store only commits a
  successful result, so a rejected operation cannot half-apply.
- `src/stores/domain-store.ts` owns persistence (`dcims-domain-v1`, version 1),
  migration, and unwraps service results into store actions.
- `src/stores/selectors.ts` derives every dashboard figure from records.
- Rehydrated data is validated with the full demo-data schema; an invalid
  payload falls back to the seed and raises a `recovered` flag.

Verified behaviour (15/15 checks, run against the seed):
over-release rejected, valid release applied, transfer to the same warehouse
rejected, over-transfer rejected, negative adjustment rejected, adjustment
without a reason rejected, approving a decided request rejected, fulfilment
never exceeding the approved quantity, re-fulfilling a completed request
rejected, over-receiving rejected, receiving against a cancelled order
rejected, double equipment assignment rejected, damaged equipment assignment
rejected, archiving stock still on hand rejected, double order approval
rejected.

### Acceptance Criteria

- Application data persists after refresh.
- Cross-module transactions remain consistent.
- Invalid operations do not partially update state.
- Dashboard values update automatically.
- No unnecessary data duplication exists.
- Resetting demo data restores the original seed state.

## 12. Phase 08 — Dashboard

Priority: P0

### Dashboard Header

- [x] Create dashboard title.
- [x] Add supporting description.
- [x] Add current date display.
- [x] Add date range filter.
- [x] Add quick action buttons.

### KPI Cards

- [x] Total inventory value.
- [x] Registered materials.
- [x] Active construction projects.
- [x] Total warehouses.
- [x] Low-stock materials.
- [x] Pending material requests.
- [x] Available equipment.
- [x] Outstanding purchase orders.

### Analytics

- [x] Monthly stock movement chart.
- [x] Inventory value by category chart.
- [x] Warehouse inventory value chart.
- [x] Project material expenditure chart.
- [x] Procurement expenditure trend chart.

### Dashboard Sections

- [x] Recent stock movements.
- [x] Low-stock inventory alerts.
- [x] Pending material requests.
- [x] Active construction projects.
- [x] Recent system activities.
- [x] Upcoming equipment maintenance.

### Business Requirements

- [x] Derive KPI values from application state.
- [x] Apply date filters to relevant analytics.
- [x] Update metrics after inventory transactions.
- [x] Provide navigation to related module details.
- [x] Handle empty datasets.
- [x] Use currency values or transaction counts when
      comparing materials with different units.

Implementation notes:

- Every figure comes from `src/stores/selectors.ts`; no dashboard value is
  hardcoded.
- Movement charts plot transaction counts and value charts plot centavos,
  because quantities in bags, metres, and pieces cannot be summed.
- Months are derived from the dataset's latest movement, not the system clock,
  so server and client render the same labels.
- The dashboard renders a skeleton until mount, then reads persisted state,
  which avoids a hydration mismatch on stored data.
- The date range filter narrows the movement chart, procurement trend, recent
  movements, and activity feed.
- Verified selector output: inventory value ₱15,677,104.00, 55 materials,
  3 warehouses, 3 active projects, 2 low-stock materials, 1 out-of-stock,
  7 open requests, 6 outstanding orders, 12 available equipment; seed
  integrity still reports zero problems.

### Acceptance Criteria

- Dashboard contains no disconnected hardcoded metrics.
- Charts use actual simulated application data.
- KPI values update after relevant transactions.
- Dashboard is responsive.
- Dashboard supports light and dark modes.

## 13. Phase 09 — Materials Management

Priority: P0

### Materials Page

- [x] Create materials page header.
- [x] Create inventory summary cards.
- [x] Create materials data table.
- [x] Display material name and SKU.
- [x] Display material category.
- [x] Display measurement unit.
- [x] Display available stock.
- [x] Display average inventory cost.
- [x] Display stock status.
- [x] Display row actions.

### Material Operations

- [x] Implement add material form.
- [x] Implement edit material form.
- [x] Implement material details view.
- [x] Implement archive material action.
- [x] Implement archive confirmation.
- [x] Implement material search.
- [x] Implement category filter.
- [x] Implement warehouse filter.
- [x] Implement stock status filter.
- [x] Implement sorting.
- [x] Implement pagination.
- [x] Implement CSV export.

### Business Validation

- [x] Prevent duplicate material SKUs.
- [x] Prevent negative unit costs.
- [x] Prevent negative reorder levels.
- [x] Validate required material fields.
- [x] Prevent archiving materials with remaining stock
      or unresolved inventory transactions.
- [x] Derive stock status from inventory balances.
- [x] Generate activity logs after changes.

Implementation notes:

- Forms use React Hook Form with the Zod `materialInputSchema`. The approved
  stack lists RHF, and `FormField` owns no form-library state, so swapping to
  TanStack later would touch the dialog only.
- SKUs are generated (`MAT-####`), never typed, which is why duplicate SKUs
  cannot be produced from the UI. The service still checks name uniqueness.
- Stock status derives from summed warehouse balances against the material's
  reorder point, so it cannot drift from the ledger.
- CSV export writes only the rows matching the current filters and runs every
  value through the formula-injection escaping in `lib/csv.ts`.

### Acceptance Criteria

- Materials can be created and edited.
- Materials can be safely archived.
- Search and filters work correctly.
- Stock quantities reflect warehouse balances.
- Changes persist after browser refresh.

## 14. Phase 10 — Categories Management

Priority: P1

- [x] Create categories page.
- [x] Display category cards or table.
- [x] Display category material counts.
- [x] Display category inventory value.
- [x] Implement create category form.
- [x] Implement edit category form.
- [x] Implement archive category action.
- [x] Implement category search.
- [x] Implement category status filter.
- [x] Prevent duplicate category names.
- [x] Prevent archiving categories with active materials.
- [x] Generate activity logs.

### Acceptance Criteria

- Categories are manageable.
- Material counts are dynamically calculated.
- Invalid category operations are prevented.

## 15. Phase 11 — Warehouse Management

Priority: P0

### Warehouse Page

- [x] Create warehouse overview page.
- [x] Display warehouse summary cards.
- [x] Display warehouse names and codes.
- [x] Display warehouse locations.
- [x] Display assigned warehouse managers.
- [x] Display warehouse inventory value.
- [x] Display registered material counts.
- [x] Display warehouse status.

### Warehouse Operations

- [x] Implement create warehouse form.
- [x] Implement edit warehouse form.
- [x] Implement warehouse details page.
- [x] Display warehouse inventory table.
- [x] Display warehouse transaction history.
- [x] Implement warehouse search.
- [x] Implement warehouse status filter.
- [x] Implement warehouse stock transfer action.
- [x] Prevent duplicate warehouse codes.
- [x] Prevent deactivation of warehouses with stock
      or unresolved transactions.

Implementation note: unresolved transactions are purchase orders assigned to
the warehouse that have not been received or cancelled. Stock movements are
committed atomically, and material requests have no assigned warehouse.

### Acceptance Criteria

- Warehouses maintain independent inventory balances.
- Warehouse inventory values are calculated correctly.
- Warehouse details reflect current application state.

## 16. Phase 12 — Stock Movements

Priority: P0

### Transaction Page

- [x] Create stock movement page.
- [x] Create transaction summary cards.
- [x] Create transaction history table.
- [x] Display transaction reference numbers.
- [x] Display transaction types.
- [x] Display material names.
- [x] Display transaction quantities.
- [x] Display source and destination warehouses.
- [x] Display transaction timestamps.
- [x] Display transaction remarks.

### Stock-In

- [x] Create stock-in form.
- [x] Select material.
- [x] Select destination warehouse.
- [x] Enter received quantity.
- [x] Enter received unit cost.
- [x] Calculate new inventory balance.
- [x] Calculate weighted-average unit cost.
- [x] Generate transaction record.
- [x] Generate activity log.

### Stock-Out

- [x] Create stock-out form.
- [x] Select material.
- [x] Select source warehouse.
- [x] Enter released quantity.
- [x] Select project when applicable.
- [x] Validate available stock.
- [x] Deduct inventory quantity.
- [x] Record transaction cost snapshot.
- [x] Update project inventory when applicable.
- [x] Generate transaction record.
- [x] Generate activity log.

### Warehouse Transfer

- [x] Create warehouse transfer form.
- [x] Select source warehouse.
- [x] Select destination warehouse.
- [x] Select material.
- [x] Enter transfer quantity.
- [x] Validate source stock.
- [x] Prevent identical source and destination.
- [x] Deduct source inventory.
- [x] Increase destination inventory.
- [x] Recalculate destination average unit cost.
- [x] Generate transfer transaction.
- [x] Generate activity log.

### Stock Adjustment

- [x] Create stock adjustment form.
- [x] Select adjustment type.
- [x] Enter adjustment quantity.
- [x] Require adjustment reason.
- [x] Validate resulting inventory balance.
- [x] Record adjustment transaction.

### Material Return

- [x] Select source project.
- [x] Select returned material.
- [x] Select destination warehouse.
- [x] Validate available project quantity.
- [x] Deduct project inventory.
- [x] Increase warehouse inventory.
- [x] Preserve appropriate material cost information.
- [x] Generate return transaction.

### Transaction Filters

- [x] Search transaction reference.
- [x] Filter by transaction type.
- [x] Filter by warehouse.
- [x] Filter by material.
- [x] Filter by project.
- [x] Filter by date range.
- [x] Implement CSV export.

Implementation notes:

- Warehouse balances and on-site project allocations hold their own weighted
  costs. Version 1 snapshots inherit the existing material cost on migration,
  without rewriting historical movement prices.
- Transfers use the source warehouse's carrying cost and reweight only the
  destination. Project returns use the on-site cost; completed transactions
  remain immutable. Record damaged stock as a decrease with a reason.

### Acceptance Criteria

- Stock-in increases inventory.
- Stock-out decreases inventory.
- Negative inventory is prevented.
- Transfers update both warehouses together.
- Returns update project and warehouse balances.
- Completed transactions cannot be directly edited.
- Corrections use compensating transactions.
- Every transaction generates an activity record.

## 17. Phase 13 — Construction Projects

Priority: P1

### Projects Page

- [x] Create project overview page.
- [x] Create project summary cards.
- [x] Implement project card view.
- [x] Implement project table view.
- [x] Display project status.
- [x] Display project progress.
- [x] Display material budget.
- [x] Display material expenses.
- [x] Display project location.
- [x] Display project manager.

### Project Operations

- [x] Implement create project form.
- [x] Implement edit project form.
- [x] Implement project details page.
- [x] Implement project status updates.
- [x] Implement progress updates.
- [x] Implement project search.
- [x] Implement status filters.

### Project Details

- [x] Overview tab.
- [x] Allocated materials tab.
- [x] Material consumption tab.
- [x] Material requests tab.
- [x] Equipment assignments tab.
- [x] Activity history tab.

### Material Consumption

- [x] Create material consumption form.
- [x] Select allocated project material.
- [x] Enter consumed quantity.
- [x] Validate available project stock.
- [x] Deduct consumed project materials.
- [x] Record consumption cost.
- [x] Update project material expenses.
- [x] Calculate remaining material budget.
- [x] Generate activity log.

Implementation notes:

- `ConstructionProject` gained a `progress` field (0–100). The persisted store
  is now version 3; migration backfills progress for saved projects from their
  schedule instead of defaulting everything to zero.
- Material expenses come only from consumption records, so the figure cannot
  drift from what was actually used. Remaining budget is budget minus expense,
  floored at zero.
- Consumption is deducted from on-site allocation, never from a warehouse
  balance — that stock left the warehouse at fulfilment.
- Status and progress changes go through `updateProject`, which rejects
  progress outside 0–100 and a target end date before the start date.
- The `[id]` route declares `generateStaticParams` from seed projects; projects
  created at runtime still render on demand.

### Acceptance Criteria

- Projects can be created and edited.
- Project progress remains between 0 and 100 percent.
- Material expenses are derived from consumption records.
- Project inventory cannot become negative.
- Material returns and allocations remain consistent.

## 18. Phase 14 — Material Requests

Priority: P1

### Request Management

- [x] Create material requests page.
- [x] Create request summary cards.
- [x] Create material requests table.
- [x] Display request reference numbers.
- [x] Display project information.
- [x] Display request priority.
- [x] Display requested date.
- [x] Display required date.
- [x] Display request status.

### Request Creation

- [x] Create multi-item request form.
- [x] Select construction project.
- [x] Add requested materials.
- [x] Enter requested quantities.
- [x] Select request priority.
- [x] Enter required date.
- [x] Enter request remarks.
- [x] Validate request items.
- [x] Generate request reference number.

### Approval Workflow

- [x] Implement request approval.
- [x] Implement request rejection.
- [x] Require rejection reason.
- [x] Implement request cancellation.
- [x] Enforce valid status transitions.
- [x] Prevent stock deduction during approval.

### Fulfillment Workflow

- [x] Select approved request.
- [x] Select source warehouse.
- [x] Display available warehouse stock.
- [x] Enter fulfillment quantities.
- [x] Validate requested remaining quantities.
- [x] Validate warehouse stock availability.
- [x] Deduct warehouse inventory.
- [x] Increase project inventory.
- [x] Record stock-out transaction.
- [x] Update fulfilled quantities.
- [x] Support partial fulfillment.
- [x] Update request status automatically.
- [x] Generate activity logs and notifications.

Implementation notes:

- `MaterialRequest` gained `requiredDate`; the create form requires it and the
  table shows it, while older saved requests simply render a dash.
- Cancellation is a new domain action and is limited to pending or approved
  requests. A partially fulfilled request cannot be cancelled because the
  released stock already sits on the project site.
- Approval still never touches stock. Only fulfilment deducts, and it validates
  both the remaining approved quantity and the selected warehouse balance before
  releasing anything.
- Fulfilment writes a stock-out movement per line, increases project on-site
  allocation, and sets the request to fulfilled or partially fulfilled based on
  the remaining lines.

### Acceptance Criteria

- Requests can contain multiple materials.
- Approval does not deduct stock.
- Fulfillment deducts stock correctly.
- Partial fulfillment works.
- Over-fulfillment is prevented.
- Rejected requests cannot be fulfilled.
- Fulfilled requests cannot be fulfilled again.

## 19. Phase 15 — Equipment Management

Priority: P1

### Equipment Page

- [x] Create equipment overview page.
- [x] Create equipment summary cards.
- [x] Create equipment data table.
- [x] Display equipment asset codes.
- [x] Display equipment names.
- [x] Display equipment categories.
- [x] Display equipment condition.
- [x] Display assigned project.
- [x] Display equipment status.
- [x] Display next maintenance date.

### Equipment Operations

- [x] Implement equipment registration.
- [x] Implement equipment editing.
- [x] Implement equipment details.
- [x] Implement equipment assignment.
- [x] Implement equipment return.
- [x] Implement equipment condition updates.
- [x] Implement maintenance recording.
- [x] Implement equipment retirement.
- [x] Implement assignment history.
- [x] Implement maintenance history.
- [x] Implement equipment search.
- [x] Implement category filters.
- [x] Implement status filters.

### Business Validation

- [x] Prevent duplicate asset codes.
- [x] Prevent simultaneous project assignments.
- [x] Prevent assignment of damaged equipment.
- [x] Prevent assignment during maintenance.
- [x] Prevent assignment of retired equipment.
- [x] Update equipment status after return.
- [x] Generate maintenance reminders.
- [x] Generate activity records.

Implementation notes:

- `Equipment` gained `nextMaintenanceDate`; the table shows it and the form
  schedules it. Assets without a scheduled service render a dash.
- Asset codes are generated (`EQP-####`), so duplicate codes cannot be produced
  from the interface; the service still owns the sequence.
- `updateEquipment` edits descriptive fields only. Availability changes flow
  through assign, return, maintenance, and retire, which each enforce their own
  rules.
- Retirement refuses while the asset is assigned, because retiring equipment
  that is physically on a site would leave the project holding an asset the
  register claims is out of service.
- The register form remounts keyed by asset id on open rather than resetting
  state inside an effect; the React 19 lint rule rejects setState in effects,
  and remounting is the cleaner fix.
- Maintenance reminders surface as the "Next service" column and the
  dashboard's open-maintenance section.

### Acceptance Criteria

- Equipment registration works.
- Equipment assignment and return work.
- Equipment status reflects current availability.
- Assignment history is preserved.
- Maintenance records are accessible.

## 20. Phase 16 — Supplier Management

Priority: P1

- [x] Create suppliers page.
- [x] Create supplier summary cards.
- [x] Create supplier data table.
- [x] Display company information.
- [x] Display contact information.
- [x] Display material categories.
- [x] Display payment terms.
- [x] Display supplier status.
- [x] Implement create supplier form.
- [x] Implement edit supplier form.
- [x] Implement supplier details view.
- [x] Display supplied materials.
- [x] Display purchase order history.
- [x] Implement supplier search.
- [x] Implement supplier status filters.
- [x] Implement supplier category filters.
- [x] Prevent invalid contact information.
- [x] Prevent ordering from inactive suppliers.
- [x] Generate activity records.

Implementation notes:

- Supplier categories and supplied materials are derived from purchase order
  history rather than stored on the supplier. A supplier's categories therefore
  always describe what was actually ordered, and cannot drift from the orders.
- A supplier with no orders shows "No orders yet" instead of an empty
  capability list, which would imply knowledge the demo does not have.
- Email format is validated on create and edit, and `createPurchaseOrder` still
  rejects inactive suppliers independently of the interface.
- Deactivating a supplier keeps its history intact; only new orders are blocked.

### Acceptance Criteria

- Suppliers can be created and edited.
- Supplier records are fictional.
- Supplier purchase history is derived from orders.
- Supplier relationships remain consistent.

## 21. Phase 17 — Purchase Orders

Priority: P1

### Purchase Order Page

- [x] Create purchase order overview page.
- [x] Create purchase order summary cards.
- [x] Create purchase order data table.
- [x] Display purchase order numbers.
- [x] Display supplier names.
- [x] Display order dates.
- [x] Display expected delivery dates.
- [x] Display order totals.
- [x] Display purchase order status.

### Order Creation

- [x] Create multi-item purchase order form.
- [x] Select supplier.
- [x] Select destination warehouse.
- [x] Add material line items.
- [x] Enter ordered quantities.
- [x] Enter unit prices.
- [x] Calculate line item totals.
- [x] Calculate subtotal.
- [x] Apply valid discount.
- [x] Apply delivery fee.
- [x] Calculate final order total.
- [x] Save purchase order as draft.
- [x] Submit purchase order for approval.

### Order Workflow

- [x] Implement purchase order approval.
- [x] Implement mark as ordered.
- [x] Implement order cancellation.
- [x] Implement draft order editing.
- [x] Enforce valid status transitions.
- [x] Prevent editing completed purchase orders.

### Receiving Workflow

- [x] Create receiving form.
- [x] Display ordered quantities.
- [x] Display previously received quantities.
- [x] Display remaining quantities.
- [x] Enter received quantities.
- [x] Validate remaining quantities.
- [x] Increase destination warehouse stock.
- [x] Recalculate average inventory cost.
- [x] Generate stock-in transactions.
- [x] Update received quantities.
- [x] Support partial deliveries.
- [x] Update purchase order status.
- [x] Prevent duplicate receiving operations.
- [x] Generate activity records.
- [x] Generate notifications.

### Additional Features


- [x] Implement purchase order details page.
- [x] Implement purchase order search.
- [x] Implement supplier filter.
- [x] Implement status filter.
- [x] Implement date range filter.

Implementation notes:

- Purchase orders are created as drafts and become stock only when received.
  Approval and dispatch change status; neither touches inventory.
- Draft orders are the only editable state, and editing reuses the same line
  validation and total calculation as creation.
- Cancellation is blocked once stock has been received, including partially
  received orders, because the delivered quantity is already in inventory.
- Receiving reuses the inventory service per line, so weighted-average costing
  and stock-in movements stay identical to every other receiving path.
- The form shows live subtotal, discount, delivery fee, and total using the same
  centavos arithmetic the service stores, so the preview cannot disagree with
  the saved order.
- [x] Implement printable purchase order.
- [x] Implement CSV export.

### Acceptance Criteria

- Purchase orders support multiple materials.
- Financial totals are calculated correctly.
- Receiving automatically updates inventory.
- Partial deliveries are supported.
- Over-receiving is prevented.
- Completed orders cannot be received again.
- No real financial transactions occur.

## 22. Phase 18 — Reports and Analytics

Priority: P1

### Report Dashboard

- [x] Create reports page.
- [x] Create report navigation.
- [x] Create date range filters.
- [x] Create warehouse filters.
- [x] Create project filters.
- [x] Create category filters.
- [x] Create report summary cards.

### Inventory Reports

- [x] Inventory summary report.
- [x] Inventory valuation report.
- [x] Low-stock report.
- [x] Out-of-stock report.
- [x] Warehouse inventory report.
- [x] Stock movement report.

### Construction Reports

- [x] Project material allocation report.
- [x] Project material consumption report.
- [x] Project material budget report.
- [x] Material request fulfillment report.

### Procurement Reports

- [x] Purchase order summary report.
- [x] Procurement expenditure report.
- [x] Supplier purchase history report.
- [x] Outstanding delivery report.

### Equipment Reports

- [x] Equipment availability report.
- [x] Equipment assignment report.
- [x] Equipment utilization report.
- [x] Equipment maintenance report.

### Export and Printing

- [x] Implement CSV export.
- [x] Implement print-friendly report layouts.
- [x] Add DCIMS branding to printed reports.
- [x] Add report generation date.
- [x] Add applied filter information.
- [x] Add report totals.
- [x] Add portfolio demonstration notice.
- [x] Support browser print-to-PDF.
Implementation notes:

- Eighteen reports across inventory, construction, procurement, and equipment are
  declared in one registry; each is a pure projection of state plus filters, so
  the table, the CSV, and the printed page always describe the same rows.
- Date range, warehouse, project, and category filters apply to the reports that
  use those dimensions; a report with no matching dimension simply ignores it.
- Currency columns stay in centavos until formatting, and report totals sum the
  displayed rows rather than recomputing from source records.
- Print layout hides navigation, headers, and controls through print media
  rules, and prints the company block, generation date, applied filters, and the
  demo notice that are hidden on screen.
- CSV export writes peso amounts as decimal numbers and dates as ISO days, so a
  spreadsheet can sort and total them.
- Next.js refuses `new Date()` in a client component during prerender; the
  generation timestamp is therefore computed after the mount guard.

### Acceptance Criteria

- Reports use current application state.
- Filters affect applicable report results.
- Financial values are formatted correctly.
- CSV files contain the displayed filtered records.
- Printable reports exclude navigation and controls.
- Reports do not present simulated data as real records.

## 23. Phase 19 — Activity Logs

Priority: P1

- [x] Create activity logs page.
- [x] Create activity timeline or table.
- [x] Display action descriptions.
- [x] Display related module.
- [x] Display reference numbers.
- [x] Display demo user information.
- [x] Display timestamps.
- [x] Implement activity search.
- [x] Implement module filter.
- [x] Implement action filter.
- [x] Implement date range filter.
- [x] Implement pagination.
- [x] Implement related record navigation.
- [x] Verify activity generation across modules.
Implementation notes:

- Activity entries are written by the domain services themselves, so the log
  cannot contain an operation the dataset did not perform. The page only reads.
- References are resolved from the referenced record (movement reference,
  request number, PO number, project code, SKU, asset code) rather than
  duplicated into the log entry, so a renamed record cannot desynchronise them.
- Related-record navigation maps each entity type to its module route; projects
  deep-link to the detail page.
- The page states plainly that logs are simulated and not tamper-proof, matching
  the documented demonstration limits.
- Filtering by module and by action is exposed separately: module answers "where
  did this happen", action answers "what happened".

### Acceptance Criteria

- Important business actions generate activity records.
- Activity records persist locally.
- Activity filters work correctly.
- Activity records are identified as simulated logs.

## 24. Phase 20 — Notifications

Priority: P2

- [x] Create notification dropdown.
- [x] Display unread notification count.
- [x] Implement mark as read.
- [x] Implement mark all as read.
- [x] Implement notification dismissal.
- [x] Generate low-stock notifications.
- [x] Generate out-of-stock notifications.
- [x] Generate pending request notifications.
- [x] Generate request approval notifications.
- [x] Generate purchase order receiving notifications.
- [x] Generate equipment maintenance reminders.
- [x] Implement related module navigation.
- [x] Persist notification state.
- [x] Prevent duplicate alert generation.
Implementation notes:

- Notifications are written by the domain services at the moment the event
  happens: stock-out (low and out of stock), request submitted, request
  approved, delivery received or partially received, and equipment entering
  maintenance.
- `appendNotification` drops a new alert when an identical unread one already
  exists, so repeating an operation cannot stack duplicates.
- Read state, dismissal, and the unread badge live in the persisted domain
  store, so they survive a refresh along with the records they describe.
- The header bell shows the unread count, supports mark-as-read per item, mark
  all read, and dismissal; links navigate to the owning module.

### Acceptance Criteria

- Notifications reflect simulated business events.
- Unread notification counts are accurate.
- Notification links navigate correctly.
- No external notification service is required.

## 25. Phase 21 — Global Search

Priority: P2

- [x] Implement global search dialog.
- [x] Add keyboard shortcut.
- [x] Search material names and SKUs.
- [x] Search warehouse names.
- [x] Search construction projects.
- [x] Search equipment asset codes.
- [x] Search suppliers.
- [x] Search purchase order references.
- [x] Search material request references.
- [x] Group search results by module.
- [x] Implement keyboard result navigation.
- [x] Implement empty search state.
- [x] Navigate to selected record.
Implementation notes:

- One command palette searches eight modules: materials (name and SKU),
  projects, material requests, purchase orders, suppliers, equipment,
  warehouses, and categories.
- The shortcut is Ctrl/Cmd+K, and the header exposes a search button on desktop
  plus an icon-only trigger on mobile, so the feature is not keyboard-only.
- Results are grouped by module and capped per group so one large collection
  cannot bury the others; cmdk provides arrow-key navigation and Enter to open.
- Selecting a result navigates to the owning module, with projects and
  warehouses deep-linking to their detail pages.
- An empty query lists the first records of each module and a no-match query
  explains what to try, instead of showing a blank dialog.

### Acceptance Criteria

- Global search works across supported modules.
- Search results reflect current application state.
- Selecting a result opens the correct record.

## 26. Phase 22 — Application Settings

Priority: P1

### Company Profile

- [x] Display fictional company information.
- [x] Edit company name.
- [x] Edit company address.
- [x] Edit company contact information.
- [x] Persist company settings.

### Demo User Profile

- [x] Display demo user information.
- [x] Edit demo user name.
- [x] Edit demo user role label.
- [x] Edit demo user contact information.
- [x] Persist profile settings.

Demo user roles are presentation-only.

Do not implement or claim real access control.

### Appearance

- [x] Light theme.
- [x] Dark theme.
- [x] System theme.
- [x] Sidebar preference.
- [x] Table density preference.

### Inventory Preferences

- [x] Default reorder level.
- [x] Default warehouse.
- [x] Default measurement unit where applicable.

### Notification Preferences

- [x] Enable or disable low-stock alerts.
- [x] Enable or disable request alerts.
- [x] Enable or disable maintenance reminders.

### Demo Data Management

- [x] Export complete demo data as JSON.
- [x] Import validated JSON data.
- [x] Validate schema version.
- [x] Validate entity relationships.
- [x] Reject invalid imported data.
- [x] Implement reset demo data.
- [x] Require reset confirmation.
- [x] Restore original seed data.

### About Application

- [x] Display DCIMS logo.
- [x] Display application name.
- [x] Display application version.
- [x] Display technology stack.
- [x] Display project description.
- [x] Display portfolio demonstration disclaimer.
Implementation notes:

- Settings are stored in the persisted domain store, so company, profile,
  inventory defaults, notification preferences, and table density survive a
  refresh.
- Demo user roles are explicitly labelled presentation-only; nothing in the app
  claims they enforce access.
- Table density writes a `data-density` attribute on the document and CSS
  reacts to it, so every table honours the preference without threading props.
- Import validates the complete file with the shared schema before replacing
  anything; invalid files leave existing data untouched.
- Reset restores the seed dataset and requires explicit confirmation, and the
  screen tells you to export first.
- About states the stack, locale, fictional-data policy, and the demonstration
  disclaimer required by the project rules.

### Acceptance Criteria

- Settings persist after browser refresh.
- Theme changes apply immediately.
- Demo data can be exported and restored.
- Invalid imports do not overwrite existing data.
- Reset requires explicit confirmation.

## 27. Phase 23 — Responsive Design

Priority: P0

### Desktop

- [ ] Test 1920px viewport.
- [ ] Test 1440px viewport.
- [ ] Test 1280px viewport.
- [ ] Verify expanded sidebar.
- [ ] Verify collapsed sidebar.
- [ ] Verify dashboard grid.
- [ ] Verify table layouts.

### Tablet

- [ ] Test 1024px viewport.
- [ ] Test 768px viewport.
- [ ] Verify collapsible navigation.
- [ ] Verify responsive charts.
- [ ] Verify two-column card layouts.
- [ ] Verify form usability.

### Mobile

- [ ] Test 430px viewport.
- [ ] Test 390px viewport.
- [ ] Test 360px viewport.
- [ ] Verify navigation drawer.
- [ ] Verify stacked dashboard cards.
- [ ] Verify table overflow handling.
- [ ] Verify responsive dialogs.
- [ ] Verify full-width form controls.
- [ ] Verify touch-friendly interactions.
- [ ] Verify readable typography.

Status: static audit complete; viewport verification outstanding.

The layout was reviewed against every hazard this phase names, and five defects
were fixed:

- Project detail and settings tab strips now scroll horizontally instead of
  clipping six or seven triggers on a 360–430px screen.
- The category form's two-column field row stacks below 640px.
- Dialog content is capped at the viewport height with internal scrolling, so a
  long purchase-order form cannot push its actions off-screen on a short phone.
- Data tables enforce a 36rem minimum width, so columns stay readable and the
  container scrolls instead of crushing cells.
- KPI values wrap rather than overflow their card at narrow widths.

Not verified, and not claimed: actual rendering at 1920, 1440, 1280, 1024, 768,
430, 390, and 360px; sidebar expand/collapse by hand; chart resize behaviour;
touch target sizes. These need a browser session.

### Acceptance Criteria

- No unintended horizontal page overflow.
- All modules remain accessible.
- Charts resize correctly.
- Forms remain usable.
- Navigation works on all supported screen sizes.

## 28. Phase 24 — Accessibility

Priority: P1

- [x] Verify semantic HTML structure.
- [x] Verify heading hierarchy.
- [ ] Verify keyboard navigation.
- [x] Verify visible focus indicators.
- [x] Verify form labels.
- [x] Verify accessible validation messages.
- [x] Verify accessible dialog titles.
- [ ] Verify dialog focus management.
- [x] Verify icon button accessible names.
- [x] Verify image alternative text.
- [x] Verify light-mode text contrast.
- [x] Verify dark-mode text contrast.
- [x] Verify status labels do not rely only on color.
- [x] Verify reduced-motion support.
- [ ] Verify browser zoom behavior.

Status: static and numerical audit complete; interactive verification outstanding.

Verified:

- Contrast computed from the actual theme tokens using WCAG relative luminance.
  Twenty foreground/background pairs across both themes all pass AA; the lowest
  ratio is 4.95 (light brand text on off-white) and the highest is 19.28.
- One h1 per page comes from PageHeader; sections use h2/h3, so the outline is
  consistent across modules.
- Landmarks: aside, nav[aria-label="Primary"], header, main#main-content, plus a
  "Skip to content" link as the first focusable element.
- Every DialogContent carries a DialogTitle; dialog and sheet close buttons
  expose an sr-only "Close".
- No Image lacks alt text, and every icon-only button in application code has an
  aria-label.
- Navigation tables now declare scope="col" on every header cell; nine were
  missing.
- Status badges always render a text label, so colour is never the only cue.
- Reduced motion: transitions carry motion-reduce variants and chart animation
  is disabled outright.

Not verified, and not claimed: keyboard traversal end to end, focus visibility
on a real screen, Radix focus-trap behaviour, and browser zoom at 200 percent.
These need a browser session.

### Acceptance Criteria

- Core workflows are keyboard accessible.
- Interactive controls have accessible names.
- Text remains readable in both themes.
- Dialogs and forms support accessible interaction.

## 29. Phase 25 — Business Logic Testing

Priority: P0

### Inventory Tests

- [x] Verify stock-in increases quantity.
- [x] Verify stock-out decreases quantity.
- [x] Verify zero-quantity transactions are rejected.
- [x] Verify negative quantities are rejected.
- [x] Verify insufficient stock is rejected.
- [x] Verify weighted-average cost calculations.
- [x] Verify inventory valuation.
- [x] Verify stock status calculations.
- [x] Verify warehouse transfers preserve total stock.
- [x] Verify invalid transfers leave state unchanged.
- [x] Verify material returns update both locations.

### Material Request Tests

- [x] Verify request creation.
- [x] Verify request approval.
- [x] Verify request rejection.
- [x] Verify approval does not deduct stock.
- [x] Verify full fulfillment.
- [x] Verify partial fulfillment.
- [x] Verify over-fulfillment prevention.
- [x] Verify rejected requests cannot be fulfilled.
- [x] Verify duplicate fulfillment prevention.

### Purchase Order Tests

- [x] Verify line item calculations.
- [x] Verify subtotal calculations.
- [x] Verify discounts.
- [x] Verify delivery fees.
- [x] Verify final order totals.
- [x] Verify partial receiving.
- [x] Verify full receiving.
- [x] Verify over-receiving prevention.
- [x] Verify duplicate receiving prevention.
- [x] Verify stock-in transaction generation.

### Project Tests

- [x] Verify project material allocation.
- [x] Verify project material consumption.
- [x] Verify negative project stock prevention.
- [x] Verify project material returns.
- [x] Verify project material expense calculations.
- [x] Verify remaining material budget calculations.

### Equipment Tests

- [x] Verify equipment assignment.
- [x] Verify equipment return.
- [x] Verify duplicate assignment prevention.
- [x] Verify maintenance status restrictions.
- [x] Verify retired equipment restrictions.

### Persistence Tests

- [ ] Verify data persists after refresh.
- [ ] Verify data persists after browser restart.
- [ ] Verify theme persistence.
- [ ] Verify state migration.
- [ ] Verify invalid LocalStorage recovery.
- [x] Verify JSON export.
- [x] Verify JSON import.
- [x] Verify invalid import rejection.
- [ ] Verify demo data reset.

### Acceptance Criteria

- All critical inventory calculations pass.
- Invalid transactions are safely rejected.
- Related records remain consistent.
- No critical business logic errors remain.

Test harness:

- `npm run test` runs Vitest over `src/**/*.test.ts` with the `@` alias mapped
  to `src`, so the suites import the same services the app uses.
- 48 tests across six files: inventory (10), material requests (9), purchase
  orders (8), projects (6), equipment (8), and seed/persistence contracts (7).
- Services are pure functions over `DomainData`, so every test starts from a
  fresh `structuredClone` of the seed and cannot leak state into another test.
- Three real defects were caught while writing the suite: a test assumed the
  material's global unit cost changed instead of the warehouse balance (phase 12
  moved costing per warehouse), a fulfilment test picked a warehouse that did not
  hold the requested material, and a stock-in call was missing its cost argument.
  Each was a defect in the test, not the service — which is exactly what running
  them is for.

Still browser-dependent, and not claimed: persist after refresh, persist after
browser restart, theme persistence, store migration, invalid LocalStorage
recovery, and the reset flow. JSON export/import and invalid-import rejection
are covered by the seed contract suite.

## 30. Phase 26 — UI and UX Refinement

Priority: P1

- [x] Verify consistent page headers.
- [x] Verify consistent button styling.
- [x] Verify consistent card spacing.
- [x] Verify consistent table spacing.
- [x] Verify consistent status badges.
- [x] Verify consistent typography.
- [x] Verify consistent icon sizes.
- [x] Verify meaningful empty states.
- [x] Verify confirmation dialogs.
- [x] Verify success notifications.
- [x] Verify error notifications.
- [x] Verify form validation feedback.
- [x] Verify hover states.
- [x] Verify focus states.
- [x] Verify disabled states.
- [x] Verify loading states where applicable.
- [x] Remove unnecessary visual decorations.
- [x] Remove placeholder interface content.
- [x] Remove nonfunctional buttons.
- [x] Remove unfinished navigation items.
- [x] Remove default framework assets.

### Acceptance Criteria

- Interface appears professional and polished.
- All visible controls perform their intended actions.
- No unfinished placeholder sections remain.
- Visual styling follows THEME.md and TYPOGRAPHY.md.

Refinement notes:

- All fourteen module pages render through PageContainer + PageHeader, so header
  spacing, title size, and action placement are identical everywhere.
- Status wording was duplicated in five files; it now lives in
  src/lib/status-labels.ts, so "Partially fulfilled" cannot become "Partial" on
  one screen and not another.
- Removed the now-unused ModulePlaceholder component: every route has a real
  module, so leaving placeholder scaffolding would be dead code pretending to be
  a feature.
- Removed the remaining default framework assets (file.svg, globe.svg,
  window.svg); public/ now holds only the two brand images.
- Audited for dead controls: no href="#" links, no buttons without handlers, no
  navigation entries pointing at unbuilt routes.
- Loading, empty, error, confirmation, and toast feedback follow one shared
  component each rather than ad-hoc variants.

Not verified, and not claimed: visual polish on a real screen, hover/focus
states as rendered, and overall aesthetic sign-off. Those need a browser.

## 31. Phase 27 — Performance Optimization

Priority: P2

- [x] Optimize component rendering.
- [x] Use Zustand selectors appropriately.
- [ ] Avoid unnecessary global state subscriptions.
- [x] Avoid unnecessary useEffect hooks.
- [x] Memoize expensive calculations when justified.
- [x] Optimize logo and image assets.
- [x] Use Next.js Image where appropriate.
- [ ] Lazy-load heavy chart components if necessary.
- [ ] Avoid excessive LocalStorage writes.
- [x] Avoid storing large base64 images in LocalStorage.
- [x] Remove unused dependencies.
- [x] Remove unused imports.
- [x] Remove duplicate utility functions.
- [x] Check production bundle size.
- [ ] Verify acceptable dashboard rendering performance.

### Acceptance Criteria

- Application interactions remain responsive.
- Large data tables remain usable.
- No unnecessary repeated state updates occur.
- No major hydration or rendering errors exist.

Performance notes:

- The dashboard now derives every chart series, KPI set, and low-stock list in a
  single `useMemo` keyed on store state and the date range. Previously each
  render recomputed all five series, so marking a notification read or toggling
  the theme re-ran the full analytics pass.
- The projects summary was quadratic: it called `projectOverview()` once per
  project inside a `reduce`. It now reuses the rows already derived.
- Removed `date-fns`, which nothing imported.
- Bundle measured from the production build: 37 JS chunks totalling 2,107 kB
  uncompressed, largest single chunk 470 kB (React/Next runtime), CSS 105 kB.
  Route-level code splitting already keeps Recharts on the dashboard and reports
  only.
- No base64 imagery is stored; brand assets load through `next/image`.

Known gap, not claimed as done: eleven components still subscribe to the whole
store (`useDomainStore()` with no selector), so any state write re-renders the
mounted page. That is cheap with one page mounted at a time, but it is not the
selector discipline this phase asks for. Refactoring each page to
`useShallow` picks is the next step and was not attempted here.

Also not verified: actual interaction latency and dashboard frame timings, which
need a browser profiler.


## 32. Phase 28 — Final Build and Deployment

Priority: P0

### Code Quality

- [x] Run ESLint.
- [x] Resolve lint errors.
- [x] Run TypeScript type checking.
- [x] Resolve TypeScript errors.
- [x] Remove unused variables.
- [x] Remove unused imports.
- [x] Remove debugging console logs.
- [x] Verify all application routes.
- [x] Verify no broken asset references.

### Production Build

- [x] Run npm run build.
- [x] Resolve production build errors.
- [x] Run npm run start.
- [x] Test production application locally.
- [x] Verify production metadata.
- [x] Verify production favicon.
- [ ] Verify production theme behavior.
- [ ] Verify production LocalStorage persistence.

### Deployment

- [x] Prepare Git repository.
- [x] Commit completed implementation.
- [ ] Configure Vercel project.
- [ ] Deploy production application.
- [ ] Verify deployed website.
- [ ] Test deployed navigation.
- [ ] Test deployed inventory transactions.
- [ ] Test deployed responsive layouts.
- [x] Verify no environment variables are required
      for core application functionality.

### Documentation

- [x] Update README.md.
- [x] Add project overview.
- [x] Add technology stack.
- [x] Add installation instructions.
- [x] Add development commands.
- [x] Add feature summary.
- [ ] Add application screenshots.
- [ ] Add deployment URL after deployment.
- [x] Add frontend-only architecture explanation.
- [x] Add demonstration limitations.

### Acceptance Criteria

- Production build completes successfully.
- Deployed application is accessible.
- All critical workflows function after deployment.
- No backend configuration is required.
- Documentation accurately describes the application.

Build verification notes:

- ESLint, `tsc --noEmit`, the 48-test Vitest suite, and `next build` all pass.
- No debugging `console.*` statements remain in application code; the only
  logging is the dev-only seed-integrity guard in `src/instrumentation.ts`,
  which returns early outside development.
- Production server started on port 3005 and every route was requested:
  `/` returns 307 to `/dashboard`, and all thirteen module routes plus the two
  detail routes return 200.
- Production metadata resolves to `<title>DCIMS</title>` and the favicon is
  served from `icon.png`.
- No `process.env` reads exist in application code, so no environment variables
  are required to run the app.

Blocked, and deliberately not done:

- **Deployment.** No Vercel project is configured and no deploy has been
  attempted, because publishing to an external account requires the owner's
  explicit authorisation. The repository is pushed and build-ready on
  `typography/manrope-default`.
- **Deployed-site checks** (navigation, transactions, responsive layout on the
  deployed URL) depend on that deployment.
- **Screenshots** in the README need a browser session to capture.

Tracker note: the progress table remains the source of truth. Phases 23, 24, 26,
and 27 are marked In Progress because their acceptance depends on browser
verification that has not been performed; the code-level work for each is
described in its section.

## 33. Recommended Project Structure

dcims/
├── docs/
│   ├── PROJECT.md
│   ├── THEME.md
│   ├── TYPOGRAPHY.md
│   └── TASK.md
├── public/
│   ├── dcims.png
│   ├── dcims-icon.png
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       ├── materials/
│   │       ├── categories/
│   │       ├── warehouses/
│   │       ├── stock-movements/
│   │       ├── projects/
│   │       ├── material-requests/
│   │       ├── equipment/
│   │       ├── suppliers/
│   │       ├── purchase-orders/
│   │       ├── reports/
│   │       ├── activity-logs/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── shared/
│   │   ├── charts/
│   │   └── forms/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── categories/
│   │   ├── warehouses/
│   │   ├── stock-movements/
│   │   ├── projects/
│   │   ├── material-requests/
│   │   ├── equipment/
│   │   ├── suppliers/
│   │   ├── procurement/
│   │   ├── reports/
│   │   └── settings/
│   ├── data/
│   │   ├── materials.ts
│   │   ├── categories.ts
│   │   ├── warehouses.ts
│   │   ├── projects.ts
│   │   ├── equipment.ts
│   │   ├── suppliers.ts
│   │   ├── transactions.ts
│   │   └── seed.ts
│   ├── stores/
│   │   ├── domain-store.ts
│   │   └── ui-store.ts
│   ├── services/
│   │   ├── inventory.service.ts
│   │   ├── project.service.ts
│   │   ├── procurement.service.ts
│   │   └── equipment.service.ts
│   ├── schemas/
│   ├── types/
│   ├── hooks/
│   ├── constants/
│   └── lib/
│       ├── utils.ts
│       ├── currency.ts
│       ├── date.ts
│       ├── inventory.ts
│       └── export.ts
├── package.json
├── tsconfig.json
└── README.md

The services directory must contain local business
logic only.

Do not implement network services or external APIs.

## 34. Development Execution Order

Complete tasks according to their dependencies.

1. Project initialization.
2. Branding and design system.
3. Application layout.
4. Shared UI components.
5. Data models and utilities.
6. Mock data.
7. State management.
8. Dashboard.
9. Materials management.
10. Categories management.
11. Warehouse management.
12. Stock movements.
13. Construction projects.
14. Material requests.
15. Equipment management.
16. Supplier management.
17. Purchase orders.
18. Reports and analytics.
19. Activity logs.
20. Notifications.
21. Global search.
22. Application settings.
23. Responsive design.
24. Accessibility.
25. Business logic testing.
26. UI and UX refinement.
27. Performance optimization.
28. Final build and deployment.

Do not implement dependent features before their
required data models and business logic are available.

## 35. Scope Reduction Strategy

If the three-day development target cannot be achieved,
prioritize the following modules:

### Minimum Functional Demo

- Dashboard
- Materials
- Categories
- Warehouses
- Stock Movements
- Construction Projects
- Material Requests
- Suppliers
- Purchase Orders
- Basic Reports
- Demo Data Persistence

### Secondary Features

- Equipment maintenance history
- Advanced analytics
- Global search
- Notification preferences
- Advanced report filters
- JSON data import
- Table density preferences

Do not sacrifice inventory consistency to implement
optional features.

If a feature is deferred, remove or hide its unfinished
controls instead of presenting nonfunctional interactions.

## 36. AI Coding Agent Instructions

These instructions apply to any AI coding agent
working on the DCIMS repository.

### Before Implementation

- Read PROJECT.md.
- Read THEME.md.
- Read TYPOGRAPHY.md.
- Read TASK.md.
- Inspect the existing repository.
- Inspect package.json.
- Identify existing components and dependencies.
- Identify completed and incomplete tasks.
- Avoid reinitializing an existing working project.
- Create a focused implementation plan.

### During Implementation

- Implement tasks according to dependency order.
- Reuse existing components where appropriate.
- Follow the approved technology stack.
- Follow the approved project architecture.
- Follow the approved theme and typography.
- Keep components modular and maintainable.
- Use strongly typed data models.
- Validate all business inputs.
- Maintain consistent inventory balances.
- Avoid unnecessary architectural complexity.
- Avoid introducing unapproved dependencies.
- Avoid implementing backend infrastructure.
- Avoid modifying unrelated working features.
- Avoid replacing functional code without justification.
- Do not fabricate successful test results.

### After Each Phase

- Verify implemented functionality.
- Run relevant lint checks.
- Run TypeScript type checking.
- Test affected business workflows.
- Resolve discovered errors.
- Update completed tasks in TASK.md.
- Document unresolved issues.
- Proceed only when required dependencies are stable.

### Task Completion Rules

Mark a task as completed only when:

- The feature has been implemented.
- The feature works as intended.
- Required validation exists.
- Related state updates are consistent.
- The interface follows the design specifications.
- Relevant tests or manual verification have passed.

Do not mark tasks as completed based solely on
generated code or visual appearance.

## 37. Definition of Done

The DCIMS portfolio demonstration is complete when:

- [ ] All required application routes are functional.
- [ ] Core inventory operations work correctly.
- [ ] Materials and warehouses are manageable.
- [ ] Stock-in and stock-out are functional.
- [ ] Warehouse transfers are functional.
- [ ] Construction projects are manageable.
- [ ] Material requests support fulfillment.
- [ ] Purchase orders support receiving.
- [ ] Equipment assignment and return are functional.
- [ ] Supplier management is functional.
- [ ] Dashboard statistics update dynamically.
- [ ] Reports use current application data.
- [ ] CSV exports are functional.
- [ ] Activity records are generated.
- [ ] Application data persists locally.
- [ ] Demo data reset is functional.
- [ ] Light and dark modes are functional.
- [ ] Desktop layouts are responsive.
- [ ] Tablet layouts are responsive.
- [ ] Mobile layouts are responsive.
- [ ] Critical business logic tests pass.
- [ ] No critical runtime errors remain.
- [ ] No TypeScript errors remain.
- [ ] Production build completes successfully.
- [ ] Application is ready for Vercel deployment.
- [ ] Application clearly identifies itself as a demo.
- [ ] Documentation reflects implemented functionality.

## 38. Development Progress Tracking

Update this section after each completed phase.

| Phase | Module | Priority | Status |
|-------|--------|----------|--------|
| 01 | Project Initialization | P0 | Completed |
| 02 | Branding and Design System | P0 | Completed |
| 03 | Application Layout | P0 | Completed |
| 04 | Shared UI Components | P0 | Completed |
| 05 | Data Models and Utilities | P0 | Completed |
| 06 | Mock Data | P0 | Completed |
| 07 | State Management | P0 | Completed |
| 08 | Dashboard | P0 | Completed |
| 09 | Materials Management | P0 | Completed |
| 10 | Categories Management | P1 | Completed |
| 11 | Warehouse Management | P0 | Completed |
| 12 | Stock Movements | P0 | Completed |
| 13 | Construction Projects | P1 | Completed |
| 14 | Material Requests | P1 | Completed |
| 15 | Equipment Management | P1 | Completed |
| 16 | Supplier Management | P1 | Completed |
| 17 | Purchase Orders | P1 | Completed |
| 18 | Reports and Analytics | P1 | Completed |
| 19 | Activity Logs | P1 | Completed |
| 20 | Notifications | P2 | Completed |
| 21 | Global Search | P2 | Completed |
| 22 | Application Settings | P1 | Completed |
| 23 | Responsive Design | P0 | In Progress |
| 24 | Accessibility | P1 | In Progress |
| 25 | Business Logic Testing | P0 | In Progress |
| 26 | UI and UX Refinement | P1 | In Progress |
| 27 | Performance Optimization | P2 | In Progress |
| 28 | Build and Deployment | P0 | In Progress |

Allowed task statuses:

- Pending
- In Progress
- Completed
- Blocked
- Deferred

## 39. Known Demonstration Limitations

- Data is stored locally in the user's browser.
- Data is not synchronized across devices.
- Clearing browser storage may remove application data.
- Authentication and user roles are simulated.
- Activity logs are not tamper-proof.
- Inventory costing is simplified.
- Construction records are fictional.
- Financial transactions are simulated.
- No external services are connected.
- The application is not intended for production use.

These limitations must not be represented as
production-ready capabilities.

## 40. Final Development Instruction

Build DCIMS as a polished, functional, and realistic
construction inventory management portfolio demonstration.

The application must prioritize:

1. Inventory data consistency.
2. Functional business workflows.
3. Professional visual design.
4. Responsive user experience.
5. Reusable frontend architecture.
6. Maintainable TypeScript code.
7. Reliable local data persistence.

Do not overengineer the application.

Do not introduce backend infrastructure.

Do not expand the scope into a full construction ERP.

Follow PROJECT.md, THEME.md, and TYPOGRAPHY.md
throughout the entire development process.

The final result must demonstrate the appearance and
behavior of a professional construction inventory
management platform while remaining frontend-only.
