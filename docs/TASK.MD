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

- [ ] Create materials page header.
- [ ] Create inventory summary cards.
- [ ] Create materials data table.
- [ ] Display material name and SKU.
- [ ] Display material category.
- [ ] Display measurement unit.
- [ ] Display available stock.
- [ ] Display average inventory cost.
- [ ] Display stock status.
- [ ] Display row actions.

### Material Operations

- [ ] Implement add material form.
- [ ] Implement edit material form.
- [ ] Implement material details view.
- [ ] Implement archive material action.
- [ ] Implement archive confirmation.
- [ ] Implement material search.
- [ ] Implement category filter.
- [ ] Implement warehouse filter.
- [ ] Implement stock status filter.
- [ ] Implement sorting.
- [ ] Implement pagination.
- [ ] Implement CSV export.

### Business Validation

- [ ] Prevent duplicate material SKUs.
- [ ] Prevent negative unit costs.
- [ ] Prevent negative reorder levels.
- [ ] Validate required material fields.
- [ ] Prevent archiving materials with remaining stock
      or unresolved inventory transactions.
- [ ] Derive stock status from inventory balances.
- [ ] Generate activity logs after changes.

### Acceptance Criteria

- Materials can be created and edited.
- Materials can be safely archived.
- Search and filters work correctly.
- Stock quantities reflect warehouse balances.
- Changes persist after browser refresh.

## 14. Phase 10 — Categories Management

Priority: P1

- [ ] Create categories page.
- [ ] Display category cards or table.
- [ ] Display category material counts.
- [ ] Display category inventory value.
- [ ] Implement create category form.
- [ ] Implement edit category form.
- [ ] Implement archive category action.
- [ ] Implement category search.
- [ ] Implement category status filter.
- [ ] Prevent duplicate category names.
- [ ] Prevent archiving categories with active materials.
- [ ] Generate activity logs.

### Acceptance Criteria

- Categories are manageable.
- Material counts are dynamically calculated.
- Invalid category operations are prevented.

## 15. Phase 11 — Warehouse Management

Priority: P0

### Warehouse Page

- [ ] Create warehouse overview page.
- [ ] Display warehouse summary cards.
- [ ] Display warehouse names and codes.
- [ ] Display warehouse locations.
- [ ] Display assigned warehouse managers.
- [ ] Display warehouse inventory value.
- [ ] Display registered material counts.
- [ ] Display warehouse status.

### Warehouse Operations

- [ ] Implement create warehouse form.
- [ ] Implement edit warehouse form.
- [ ] Implement warehouse details page.
- [ ] Display warehouse inventory table.
- [ ] Display warehouse transaction history.
- [ ] Implement warehouse search.
- [ ] Implement warehouse status filter.
- [ ] Implement warehouse stock transfer action.
- [ ] Prevent duplicate warehouse codes.
- [ ] Prevent deactivation of warehouses with stock
      or unresolved transactions.

### Acceptance Criteria

- Warehouses maintain independent inventory balances.
- Warehouse inventory values are calculated correctly.
- Warehouse details reflect current application state.

## 16. Phase 12 — Stock Movements

Priority: P0

### Transaction Page

- [ ] Create stock movement page.
- [ ] Create transaction summary cards.
- [ ] Create transaction history table.
- [ ] Display transaction reference numbers.
- [ ] Display transaction types.
- [ ] Display material names.
- [ ] Display transaction quantities.
- [ ] Display source and destination warehouses.
- [ ] Display transaction timestamps.
- [ ] Display transaction remarks.

### Stock-In

- [ ] Create stock-in form.
- [ ] Select material.
- [ ] Select destination warehouse.
- [ ] Enter received quantity.
- [ ] Enter received unit cost.
- [ ] Calculate new inventory balance.
- [ ] Calculate weighted-average unit cost.
- [ ] Generate transaction record.
- [ ] Generate activity log.

### Stock-Out

- [ ] Create stock-out form.
- [ ] Select material.
- [ ] Select source warehouse.
- [ ] Enter released quantity.
- [ ] Select project when applicable.
- [ ] Validate available stock.
- [ ] Deduct inventory quantity.
- [ ] Record transaction cost snapshot.
- [ ] Update project inventory when applicable.
- [ ] Generate transaction record.
- [ ] Generate activity log.

### Warehouse Transfer

- [ ] Create warehouse transfer form.
- [ ] Select source warehouse.
- [ ] Select destination warehouse.
- [ ] Select material.
- [ ] Enter transfer quantity.
- [ ] Validate source stock.
- [ ] Prevent identical source and destination.
- [ ] Deduct source inventory.
- [ ] Increase destination inventory.
- [ ] Recalculate destination average unit cost.
- [ ] Generate transfer transaction.
- [ ] Generate activity log.

### Stock Adjustment

- [ ] Create stock adjustment form.
- [ ] Select adjustment type.
- [ ] Enter adjustment quantity.
- [ ] Require adjustment reason.
- [ ] Validate resulting inventory balance.
- [ ] Record adjustment transaction.

### Material Return

- [ ] Select source project.
- [ ] Select returned material.
- [ ] Select destination warehouse.
- [ ] Validate available project quantity.
- [ ] Deduct project inventory.
- [ ] Increase warehouse inventory.
- [ ] Preserve appropriate material cost information.
- [ ] Generate return transaction.

### Transaction Filters

- [ ] Search transaction reference.
- [ ] Filter by transaction type.
- [ ] Filter by warehouse.
- [ ] Filter by material.
- [ ] Filter by project.
- [ ] Filter by date range.
- [ ] Implement CSV export.

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

- [ ] Create project overview page.
- [ ] Create project summary cards.
- [ ] Implement project card view.
- [ ] Implement project table view.
- [ ] Display project status.
- [ ] Display project progress.
- [ ] Display material budget.
- [ ] Display material expenses.
- [ ] Display project location.
- [ ] Display project manager.

### Project Operations

- [ ] Implement create project form.
- [ ] Implement edit project form.
- [ ] Implement project details page.
- [ ] Implement project status updates.
- [ ] Implement progress updates.
- [ ] Implement project search.
- [ ] Implement status filters.

### Project Details

- [ ] Overview tab.
- [ ] Allocated materials tab.
- [ ] Material consumption tab.
- [ ] Material requests tab.
- [ ] Equipment assignments tab.
- [ ] Activity history tab.

### Material Consumption

- [ ] Create material consumption form.
- [ ] Select allocated project material.
- [ ] Enter consumed quantity.
- [ ] Validate available project stock.
- [ ] Deduct consumed project materials.
- [ ] Record consumption cost.
- [ ] Update project material expenses.
- [ ] Calculate remaining material budget.
- [ ] Generate activity log.

### Acceptance Criteria

- Projects can be created and edited.
- Project progress remains between 0 and 100 percent.
- Material expenses are derived from consumption records.
- Project inventory cannot become negative.
- Material returns and allocations remain consistent.

## 18. Phase 14 — Material Requests

Priority: P1

### Request Management

- [ ] Create material requests page.
- [ ] Create request summary cards.
- [ ] Create material requests table.
- [ ] Display request reference numbers.
- [ ] Display project information.
- [ ] Display request priority.
- [ ] Display requested date.
- [ ] Display required date.
- [ ] Display request status.

### Request Creation

- [ ] Create multi-item request form.
- [ ] Select construction project.
- [ ] Add requested materials.
- [ ] Enter requested quantities.
- [ ] Select request priority.
- [ ] Enter required date.
- [ ] Enter request remarks.
- [ ] Validate request items.
- [ ] Generate request reference number.

### Approval Workflow

- [ ] Implement request approval.
- [ ] Implement request rejection.
- [ ] Require rejection reason.
- [ ] Implement request cancellation.
- [ ] Enforce valid status transitions.
- [ ] Prevent stock deduction during approval.

### Fulfillment Workflow

- [ ] Select approved request.
- [ ] Select source warehouse.
- [ ] Display available warehouse stock.
- [ ] Enter fulfillment quantities.
- [ ] Validate requested remaining quantities.
- [ ] Validate warehouse stock availability.
- [ ] Deduct warehouse inventory.
- [ ] Increase project inventory.
- [ ] Record stock-out transaction.
- [ ] Update fulfilled quantities.
- [ ] Support partial fulfillment.
- [ ] Update request status automatically.
- [ ] Generate activity logs and notifications.

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

- [ ] Create equipment overview page.
- [ ] Create equipment summary cards.
- [ ] Create equipment data table.
- [ ] Display equipment asset codes.
- [ ] Display equipment names.
- [ ] Display equipment categories.
- [ ] Display equipment condition.
- [ ] Display assigned project.
- [ ] Display equipment status.
- [ ] Display next maintenance date.

### Equipment Operations

- [ ] Implement equipment registration.
- [ ] Implement equipment editing.
- [ ] Implement equipment details.
- [ ] Implement equipment assignment.
- [ ] Implement equipment return.
- [ ] Implement equipment condition updates.
- [ ] Implement maintenance recording.
- [ ] Implement equipment retirement.
- [ ] Implement assignment history.
- [ ] Implement maintenance history.
- [ ] Implement equipment search.
- [ ] Implement category filters.
- [ ] Implement status filters.

### Business Validation

- [ ] Prevent duplicate asset codes.
- [ ] Prevent simultaneous project assignments.
- [ ] Prevent assignment of damaged equipment.
- [ ] Prevent assignment during maintenance.
- [ ] Prevent assignment of retired equipment.
- [ ] Update equipment status after return.
- [ ] Generate maintenance reminders.
- [ ] Generate activity records.

### Acceptance Criteria

- Equipment registration works.
- Equipment assignment and return work.
- Equipment status reflects current availability.
- Assignment history is preserved.
- Maintenance records are accessible.

## 20. Phase 16 — Supplier Management

Priority: P1

- [ ] Create suppliers page.
- [ ] Create supplier summary cards.
- [ ] Create supplier data table.
- [ ] Display company information.
- [ ] Display contact information.
- [ ] Display material categories.
- [ ] Display payment terms.
- [ ] Display supplier status.
- [ ] Implement create supplier form.
- [ ] Implement edit supplier form.
- [ ] Implement supplier details view.
- [ ] Display supplied materials.
- [ ] Display purchase order history.
- [ ] Implement supplier search.
- [ ] Implement supplier status filters.
- [ ] Implement supplier category filters.
- [ ] Prevent invalid contact information.
- [ ] Prevent ordering from inactive suppliers.
- [ ] Generate activity records.

### Acceptance Criteria

- Suppliers can be created and edited.
- Supplier records are fictional.
- Supplier purchase history is derived from orders.
- Supplier relationships remain consistent.

## 21. Phase 17 — Purchase Orders

Priority: P1

### Purchase Order Page

- [ ] Create purchase order overview page.
- [ ] Create purchase order summary cards.
- [ ] Create purchase order data table.
- [ ] Display purchase order numbers.
- [ ] Display supplier names.
- [ ] Display order dates.
- [ ] Display expected delivery dates.
- [ ] Display order totals.
- [ ] Display purchase order status.

### Order Creation

- [ ] Create multi-item purchase order form.
- [ ] Select supplier.
- [ ] Select destination warehouse.
- [ ] Add material line items.
- [ ] Enter ordered quantities.
- [ ] Enter unit prices.
- [ ] Calculate line item totals.
- [ ] Calculate subtotal.
- [ ] Apply valid discount.
- [ ] Apply delivery fee.
- [ ] Calculate final order total.
- [ ] Save purchase order as draft.
- [ ] Submit purchase order for approval.

### Order Workflow

- [ ] Implement purchase order approval.
- [ ] Implement mark as ordered.
- [ ] Implement order cancellation.
- [ ] Implement draft order editing.
- [ ] Enforce valid status transitions.
- [ ] Prevent editing completed purchase orders.

### Receiving Workflow

- [ ] Create receiving form.
- [ ] Display ordered quantities.
- [ ] Display previously received quantities.
- [ ] Display remaining quantities.
- [ ] Enter received quantities.
- [ ] Validate remaining quantities.
- [ ] Increase destination warehouse stock.
- [ ] Recalculate average inventory cost.
- [ ] Generate stock-in transactions.
- [ ] Update received quantities.
- [ ] Support partial deliveries.
- [ ] Update purchase order status.
- [ ] Prevent duplicate receiving operations.
- [ ] Generate activity records.
- [ ] Generate notifications.

### Additional Features

- [ ] Implement purchase order details page.
- [ ] Implement purchase order search.
- [ ] Implement supplier filter.
- [ ] Implement status filter.
- [ ] Implement date range filter.
- [ ] Implement printable purchase order.
- [ ] Implement CSV export.

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

- [ ] Create reports page.
- [ ] Create report navigation.
- [ ] Create date range filters.
- [ ] Create warehouse filters.
- [ ] Create project filters.
- [ ] Create category filters.
- [ ] Create report summary cards.

### Inventory Reports

- [ ] Inventory summary report.
- [ ] Inventory valuation report.
- [ ] Low-stock report.
- [ ] Out-of-stock report.
- [ ] Warehouse inventory report.
- [ ] Stock movement report.

### Construction Reports

- [ ] Project material allocation report.
- [ ] Project material consumption report.
- [ ] Project material budget report.
- [ ] Material request fulfillment report.

### Procurement Reports

- [ ] Purchase order summary report.
- [ ] Procurement expenditure report.
- [ ] Supplier purchase history report.
- [ ] Outstanding delivery report.

### Equipment Reports

- [ ] Equipment availability report.
- [ ] Equipment assignment report.
- [ ] Equipment utilization report.
- [ ] Equipment maintenance report.

### Export and Printing

- [ ] Implement CSV export.
- [ ] Implement print-friendly report layouts.
- [ ] Add DCIMS branding to printed reports.
- [ ] Add report generation date.
- [ ] Add applied filter information.
- [ ] Add report totals.
- [ ] Add portfolio demonstration notice.
- [ ] Support browser print-to-PDF.

### Acceptance Criteria

- Reports use current application state.
- Filters affect applicable report results.
- Financial values are formatted correctly.
- CSV files contain the displayed filtered records.
- Printable reports exclude navigation and controls.
- Reports do not present simulated data as real records.

## 23. Phase 19 — Activity Logs

Priority: P1

- [ ] Create activity logs page.
- [ ] Create activity timeline or table.
- [ ] Display action descriptions.
- [ ] Display related module.
- [ ] Display reference numbers.
- [ ] Display demo user information.
- [ ] Display timestamps.
- [ ] Implement activity search.
- [ ] Implement module filter.
- [ ] Implement action filter.
- [ ] Implement date range filter.
- [ ] Implement pagination.
- [ ] Implement related record navigation.
- [ ] Verify activity generation across modules.

### Acceptance Criteria

- Important business actions generate activity records.
- Activity records persist locally.
- Activity filters work correctly.
- Activity records are identified as simulated logs.

## 24. Phase 20 — Notifications

Priority: P2

- [ ] Create notification dropdown.
- [ ] Display unread notification count.
- [ ] Implement mark as read.
- [ ] Implement mark all as read.
- [ ] Implement notification dismissal.
- [ ] Generate low-stock notifications.
- [ ] Generate out-of-stock notifications.
- [ ] Generate pending request notifications.
- [ ] Generate request approval notifications.
- [ ] Generate purchase order receiving notifications.
- [ ] Generate equipment maintenance reminders.
- [ ] Implement related module navigation.
- [ ] Persist notification state.
- [ ] Prevent duplicate alert generation.

### Acceptance Criteria

- Notifications reflect simulated business events.
- Unread notification counts are accurate.
- Notification links navigate correctly.
- No external notification service is required.

## 25. Phase 21 — Global Search

Priority: P2

- [ ] Implement global search dialog.
- [ ] Add keyboard shortcut.
- [ ] Search material names and SKUs.
- [ ] Search warehouse names.
- [ ] Search construction projects.
- [ ] Search equipment asset codes.
- [ ] Search suppliers.
- [ ] Search purchase order references.
- [ ] Search material request references.
- [ ] Group search results by module.
- [ ] Implement keyboard result navigation.
- [ ] Implement empty search state.
- [ ] Navigate to selected record.

### Acceptance Criteria

- Global search works across supported modules.
- Search results reflect current application state.
- Selecting a result opens the correct record.

## 26. Phase 22 — Application Settings

Priority: P1

### Company Profile

- [ ] Display fictional company information.
- [ ] Edit company name.
- [ ] Edit company address.
- [ ] Edit company contact information.
- [ ] Persist company settings.

### Demo User Profile

- [ ] Display demo user information.
- [ ] Edit demo user name.
- [ ] Edit demo user role label.
- [ ] Edit demo user contact information.
- [ ] Persist profile settings.

Demo user roles are presentation-only.

Do not implement or claim real access control.

### Appearance

- [ ] Light theme.
- [ ] Dark theme.
- [ ] System theme.
- [ ] Sidebar preference.
- [ ] Table density preference.

### Inventory Preferences

- [ ] Default reorder level.
- [ ] Default warehouse.
- [ ] Default measurement unit where applicable.

### Notification Preferences

- [ ] Enable or disable low-stock alerts.
- [ ] Enable or disable request alerts.
- [ ] Enable or disable maintenance reminders.

### Demo Data Management

- [ ] Export complete demo data as JSON.
- [ ] Import validated JSON data.
- [ ] Validate schema version.
- [ ] Validate entity relationships.
- [ ] Reject invalid imported data.
- [ ] Implement reset demo data.
- [ ] Require reset confirmation.
- [ ] Restore original seed data.

### About Application

- [ ] Display DCIMS logo.
- [ ] Display application name.
- [ ] Display application version.
- [ ] Display technology stack.
- [ ] Display project description.
- [ ] Display portfolio demonstration disclaimer.

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

### Acceptance Criteria

- No unintended horizontal page overflow.
- All modules remain accessible.
- Charts resize correctly.
- Forms remain usable.
- Navigation works on all supported screen sizes.

## 28. Phase 24 — Accessibility

Priority: P1

- [ ] Verify semantic HTML structure.
- [ ] Verify heading hierarchy.
- [ ] Verify keyboard navigation.
- [ ] Verify visible focus indicators.
- [ ] Verify form labels.
- [ ] Verify accessible validation messages.
- [ ] Verify accessible dialog titles.
- [ ] Verify dialog focus management.
- [ ] Verify icon button accessible names.
- [ ] Verify image alternative text.
- [ ] Verify light-mode text contrast.
- [ ] Verify dark-mode text contrast.
- [ ] Verify status labels do not rely only on color.
- [ ] Verify reduced-motion support.
- [ ] Verify browser zoom behavior.

### Acceptance Criteria

- Core workflows are keyboard accessible.
- Interactive controls have accessible names.
- Text remains readable in both themes.
- Dialogs and forms support accessible interaction.

## 29. Phase 25 — Business Logic Testing

Priority: P0

### Inventory Tests

- [ ] Verify stock-in increases quantity.
- [ ] Verify stock-out decreases quantity.
- [ ] Verify zero-quantity transactions are rejected.
- [ ] Verify negative quantities are rejected.
- [ ] Verify insufficient stock is rejected.
- [ ] Verify weighted-average cost calculations.
- [ ] Verify inventory valuation.
- [ ] Verify stock status calculations.
- [ ] Verify warehouse transfers preserve total stock.
- [ ] Verify invalid transfers leave state unchanged.
- [ ] Verify material returns update both locations.

### Material Request Tests

- [ ] Verify request creation.
- [ ] Verify request approval.
- [ ] Verify request rejection.
- [ ] Verify approval does not deduct stock.
- [ ] Verify full fulfillment.
- [ ] Verify partial fulfillment.
- [ ] Verify over-fulfillment prevention.
- [ ] Verify rejected requests cannot be fulfilled.
- [ ] Verify duplicate fulfillment prevention.

### Purchase Order Tests

- [ ] Verify line item calculations.
- [ ] Verify subtotal calculations.
- [ ] Verify discounts.
- [ ] Verify delivery fees.
- [ ] Verify final order totals.
- [ ] Verify partial receiving.
- [ ] Verify full receiving.
- [ ] Verify over-receiving prevention.
- [ ] Verify duplicate receiving prevention.
- [ ] Verify stock-in transaction generation.

### Project Tests

- [ ] Verify project material allocation.
- [ ] Verify project material consumption.
- [ ] Verify negative project stock prevention.
- [ ] Verify project material returns.
- [ ] Verify project material expense calculations.
- [ ] Verify remaining material budget calculations.

### Equipment Tests

- [ ] Verify equipment assignment.
- [ ] Verify equipment return.
- [ ] Verify duplicate assignment prevention.
- [ ] Verify maintenance status restrictions.
- [ ] Verify retired equipment restrictions.

### Persistence Tests

- [ ] Verify data persists after refresh.
- [ ] Verify data persists after browser restart.
- [ ] Verify theme persistence.
- [ ] Verify state migration.
- [ ] Verify invalid LocalStorage recovery.
- [ ] Verify JSON export.
- [ ] Verify JSON import.
- [ ] Verify invalid import rejection.
- [ ] Verify demo data reset.

### Acceptance Criteria

- All critical inventory calculations pass.
- Invalid transactions are safely rejected.
- Related records remain consistent.
- No critical business logic errors remain.

## 30. Phase 26 — UI and UX Refinement

Priority: P1

- [ ] Verify consistent page headers.
- [ ] Verify consistent button styling.
- [ ] Verify consistent card spacing.
- [ ] Verify consistent table spacing.
- [ ] Verify consistent status badges.
- [ ] Verify consistent typography.
- [ ] Verify consistent icon sizes.
- [ ] Verify meaningful empty states.
- [ ] Verify confirmation dialogs.
- [ ] Verify success notifications.
- [ ] Verify error notifications.
- [ ] Verify form validation feedback.
- [ ] Verify hover states.
- [ ] Verify focus states.
- [ ] Verify disabled states.
- [ ] Verify loading states where applicable.
- [ ] Remove unnecessary visual decorations.
- [ ] Remove placeholder interface content.
- [ ] Remove nonfunctional buttons.
- [ ] Remove unfinished navigation items.
- [ ] Remove default framework assets.

### Acceptance Criteria

- Interface appears professional and polished.
- All visible controls perform their intended actions.
- No unfinished placeholder sections remain.
- Visual styling follows THEME.md and TYPOGRAPHY.md.

## 31. Phase 27 — Performance Optimization

Priority: P2

- [ ] Optimize component rendering.
- [ ] Use Zustand selectors appropriately.
- [ ] Avoid unnecessary global state subscriptions.
- [ ] Avoid unnecessary useEffect hooks.
- [ ] Memoize expensive calculations when justified.
- [ ] Optimize logo and image assets.
- [ ] Use Next.js Image where appropriate.
- [ ] Lazy-load heavy chart components if necessary.
- [ ] Avoid excessive LocalStorage writes.
- [ ] Avoid storing large base64 images in LocalStorage.
- [ ] Remove unused dependencies.
- [ ] Remove unused imports.
- [ ] Remove duplicate utility functions.
- [ ] Check production bundle size.
- [ ] Verify acceptable dashboard rendering performance.

### Acceptance Criteria

- Application interactions remain responsive.
- Large data tables remain usable.
- No unnecessary repeated state updates occur.
- No major hydration or rendering errors exist.

## 32. Phase 28 — Final Build and Deployment

Priority: P0

### Code Quality

- [ ] Run ESLint.
- [ ] Resolve lint errors.
- [ ] Run TypeScript type checking.
- [ ] Resolve TypeScript errors.
- [ ] Remove unused variables.
- [ ] Remove unused imports.
- [ ] Remove debugging console logs.
- [ ] Verify all application routes.
- [ ] Verify no broken asset references.

### Production Build

- [ ] Run npm run build.
- [ ] Resolve production build errors.
- [ ] Run npm run start.
- [ ] Test production application locally.
- [ ] Verify production metadata.
- [ ] Verify production favicon.
- [ ] Verify production theme behavior.
- [ ] Verify production LocalStorage persistence.

### Deployment

- [ ] Prepare Git repository.
- [ ] Commit completed implementation.
- [ ] Configure Vercel project.
- [ ] Deploy production application.
- [ ] Verify deployed website.
- [ ] Test deployed navigation.
- [ ] Test deployed inventory transactions.
- [ ] Test deployed responsive layouts.
- [ ] Verify no environment variables are required
      for core application functionality.

### Documentation

- [ ] Update README.md.
- [ ] Add project overview.
- [ ] Add technology stack.
- [ ] Add installation instructions.
- [ ] Add development commands.
- [ ] Add feature summary.
- [ ] Add application screenshots.
- [ ] Add deployment URL after deployment.
- [ ] Add frontend-only architecture explanation.
- [ ] Add demonstration limitations.

### Acceptance Criteria

- Production build completes successfully.
- Deployed application is accessible.
- All critical workflows function after deployment.
- No backend configuration is required.
- Documentation accurately describes the application.

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
| 09 | Materials Management | P0 | Pending |
| 10 | Categories Management | P1 | Pending |
| 11 | Warehouse Management | P0 | Pending |
| 12 | Stock Movements | P0 | Pending |
| 13 | Construction Projects | P1 | Pending |
| 14 | Material Requests | P1 | Pending |
| 15 | Equipment Management | P1 | Pending |
| 16 | Supplier Management | P1 | Pending |
| 17 | Purchase Orders | P1 | Pending |
| 18 | Reports and Analytics | P1 | Pending |
| 19 | Activity Logs | P1 | Pending |
| 20 | Notifications | P2 | Pending |
| 21 | Global Search | P2 | Pending |
| 22 | Application Settings | P1 | Pending |
| 23 | Responsive Design | P0 | Pending |
| 24 | Accessibility | P1 | Pending |
| 25 | Business Logic Testing | P0 | Pending |
| 26 | UI and UX Refinement | P1 | Pending |
| 27 | Performance Optimization | P2 | Pending |
| 28 | Build and Deployment | P0 | Pending |

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