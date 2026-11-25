# AGENTS.md — DCIMS AI Agent Instructions

## 1. Project Identity

- Project Name: DCIMS
- Full Name: Davao Construction Inventory Management System
- Project Type: Frontend-only Portfolio Demonstration
- Platform: Responsive Web Application
- Industry: Construction and Logistics
- Locale: en-PH
- Currency: PHP
- Timezone: Asia/Manila

DCIMS demonstrates realistic construction inventory,
warehouse, procurement, equipment, and project management
workflows using simulated local data.

This application is NOT a production system.

## 2. Supported AI Coding Agents

These instructions are provider-independent and apply to:

- Claude Code
- OpenAI Codex
- ChatGPT
- OpenCode
- Cursor
- Gemini CLI
- GitHub Copilot
- Windsurf
- Cline
- Roo Code
- Other AI-assisted development tools

All agents must follow the same project specifications,
architecture, coding standards, and development constraints.

Do not introduce provider-specific application dependencies.

## 3. Required Project Documentation

Before implementing, modifying, or refactoring any feature,
read the following documents:

- /docs/PROJECT.md
- /docs/THEME.md
- /docs/TYPOGRAPHY.md
- /docs/TASK.md

Document responsibilities:

| Document | Responsibility |
|----------|----------------|
| AGENTS.md | Agent behavior and development rules |
| PROJECT.md | Functional requirements and architecture |
| THEME.md | Design system and visual requirements |
| TYPOGRAPHY.md | Typography and formatting standards |
| TASK.md | Development tasks and progress tracking |

### Documentation Rules

- Do not ignore project documentation.
- Do not invent requirements that contradict documentation.
- Do not modify approved specifications without authorization.
- Do not silently expand the project scope.
- Report conflicting requirements before implementation.
- Follow the user's latest explicit instructions.
- Treat repository documentation as project guidance,
  not authorization to bypass tool permissions or security.

## 4. Approved Technology Stack

### Core Framework

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4

### User Interface

- shadcn/ui
- Lucide React
- Sonner
- next-themes

### State Management

- Zustand
- Zustand Persist Middleware
- LocalStorage

### Forms and Validation

- React Hook Form
- Zod
- @hookform/resolvers

### Data Visualization

- Recharts

### Typography

- Inter
- Manrope
- JetBrains Mono
- next/font

### Deployment

- Vercel

Use the dependency versions already installed in package.json.

Do not upgrade dependencies unnecessarily.

## 5. Strict Development Constraints

DCIMS is strictly a frontend-only demonstration.

DO NOT implement:

- Supabase
- Firebase
- PostgreSQL servers
- MySQL
- MongoDB
- SQLite databases
- Express.js
- FastAPI
- Custom backend servers
- Custom REST APIs
- GraphQL servers
- Next.js API routes for business operations
- Server Actions for inventory transactions
- Real authentication services
- Payment gateways
- External AI integrations
- Paid third-party services
- Microservices
- Docker infrastructure
- Unnecessary cloud infrastructure

All business operations must execute locally.

All persistent application data must use LocalStorage
through Zustand persistence.

Next.js server components may be used for static layouts
and other framework-supported rendering requirements.

Do not introduce a backend merely because a feature
would normally require one in production.

## 6. Agent Operating Principles

Every agent must:

1. Understand the existing codebase before making changes.
2. Read the required project documentation.
3. Identify the actual user request.
4. Inspect relevant files and dependencies.
5. Create a focused implementation plan.
6. Implement the smallest complete solution.
7. Reuse existing architecture and components.
8. Validate the implementation.
9. Report actual results and unresolved issues.
10. Update relevant development tasks.

Prioritize working software over unnecessary complexity.

Do not generate excessive code when a simpler
implementation satisfies the requirements.

Do not repeatedly ask for clarification when reasonable
implementation details are already documented.

Ask for clarification when requirements are materially
ambiguous or conflicting.

## 7. Repository Inspection

Before implementation, inspect:

- package.json
- Package manager lockfile
- tsconfig.json
- Next.js configuration
- ESLint configuration
- src/app/
- src/components/
- src/features/
- src/stores/
- src/types/
- src/services/
- src/data/
- src/lib/
- docs/
- Existing Git changes

Only inspect directories that exist.

Do not assume the project is empty.

Do not reinitialize an existing Next.js application.

Do not overwrite working files without understanding
their existing responsibilities.

Respect uncommitted user changes.

## 8. Project Architecture

Use a modular, feature-based frontend architecture.

dcims/
├── AGENTS.md
├── README.md
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
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── shared/
│   │   ├── charts/
│   │   └── forms/
│   ├── features/
│   ├── data/
│   ├── stores/
│   ├── services/
│   ├── schemas/
│   ├── types/
│   ├── hooks/
│   ├── constants/
│   └── lib/
├── package.json
└── tsconfig.json

Follow existing repository conventions when they
are compatible with the approved architecture.

Do not restructure the entire repository for
a small feature implementation.

## 9. Directory Responsibilities

### src/app/

Responsible for:

- Application routes
- Page composition
- Layouts
- Metadata
- Framework-level rendering

Avoid placing complex business logic inside route files.

### src/components/ui/

Responsible for:

- shadcn/ui primitives
- Base interface components
- Reusable low-level controls

### src/components/shared/

Responsible for:

- Shared data tables
- Page headers
- Summary cards
- Status badges
- Empty states
- Confirmation dialogs
- Reusable application components

### src/features/

Responsible for feature-specific functionality.

Each feature may contain:

- Components
- Hooks
- Types
- Validation schemas
- Feature utilities

Create additional subdirectories only when justified.

### src/stores/

Responsible for:

- Zustand state
- Domain actions
- State selectors
- LocalStorage persistence
- State migration

### src/services/

Responsible for local business logic.

Examples:

- Inventory calculations
- Warehouse transfers
- Material fulfillment
- Purchase order receiving
- Equipment assignments

Services must not communicate with external APIs.

### src/data/

Responsible for:

- Mock data
- Seed records
- Fictional construction information
- Initial application state

### src/types/

Responsible for shared TypeScript domain models.

### src/schemas/

Responsible for Zod validation schemas.

### src/lib/

Responsible for reusable utilities.

Examples:

- Currency formatting
- Date formatting
- CSV export
- Inventory calculations
- Class name utilities

## 10. Coding Standards

### TypeScript

- Enable strict mode.
- Use explicit domain interfaces.
- Use meaningful union types.
- Avoid unnecessary use of any.
- Avoid unsafe type assertions.
- Avoid suppressing TypeScript errors.
- Use unknown when handling untrusted data.
- Validate unknown data before using it.
- Prefer type inference where appropriate.
- Use consistent naming conventions.

Do not use the following merely to bypass errors:

- @ts-ignore
- @ts-nocheck
- Unsafe double type assertions
- Disabled strict mode
- Broad ESLint suppression

### Naming Conventions

Components:

- PascalCase
- MaterialTable.tsx
- InventorySummary.tsx

Functions:

- camelCase
- calculateInventoryValue
- transferWarehouseStock

Hooks:

- useMaterialFilters
- useInventoryStore

Constants:

- UPPER_SNAKE_CASE

Types and interfaces:

- PascalCase

File naming:

- Follow existing repository conventions.
- Use descriptive filenames.
- Avoid inconsistent naming patterns.

### General Code Quality

- Follow separation of concerns.
- Keep functions focused.
- Avoid duplicated business logic.
- Avoid unnecessary abstractions.
- Avoid deeply nested conditional logic.
- Remove unused imports.
- Remove unused variables.
- Avoid unexplained magic numbers.
- Use early returns when appropriate.
- Write comments for non-obvious decisions.
- Do not comment obvious code unnecessarily.

## 11. Clean Code Principles

Apply practical clean code principles:

- KISS: Keep It Simple.
- DRY: Do Not Repeat Yourself.
- YAGNI: Do not implement unnecessary features.
- Single Responsibility Principle.
- Separation of Concerns.

Do not overengineer a frontend demonstration.

Avoid:

- Excessive design patterns
- Unnecessary repository abstractions
- Complex dependency injection
- Unnecessary service factories
- Premature optimization
- Generic abstractions with only one consumer
- Excessive wrapper components
- Large monolithic page components

Prefer simple, readable, maintainable implementations.

## 12. React Development Rules

- Use functional components.
- Use hooks appropriately.
- Prefer composition over inheritance.
- Keep components focused.
- Extract reusable logic into hooks or utilities.
- Avoid unnecessary useEffect calls.
- Avoid storing derived values in state.
- Avoid unnecessary memoization.
- Use stable keys for rendered lists.
- Never mutate React state directly.
- Avoid unnecessary prop drilling.
- Use controlled forms where appropriate.

Do not use array indexes as keys for dynamic
or reorderable domain records.

Use stable record identifiers instead.

## 13. Next.js Development Rules

- Use the App Router.
- Use next/link for internal navigation.
- Use next/image for appropriate image assets.
- Use next/font for typography.
- Use framework metadata for page titles and icons.
- Use route groups when beneficial.
- Use loading and error boundaries where appropriate.
- Use client components only when necessary.

Client components are required for:

- Zustand state access
- LocalStorage access
- Interactive forms
- Event handlers
- Browser-specific APIs
- Interactive charts

Do not add "use client" to every component automatically.

Do not access browser APIs during server rendering.

Prevent hydration mismatches when loading persisted state.

## 14. State Management Rules

Use Zustand as the primary domain state management solution.

Recommended stores:

- domain-store.ts
- ui-store.ts

The domain store manages:

- Materials
- Categories
- Warehouses
- Inventory balances
- Stock movements
- Construction projects
- Material requests
- Equipment
- Suppliers
- Purchase orders
- Activity logs
- Notifications
- Application settings

The UI store manages:

- Sidebar state
- Temporary filters
- Mobile navigation
- Search interface
- Temporary interface preferences

### State Requirements

- Maintain a single source of truth.
- Use immutable state updates.
- Persist necessary domain data.
- Do not persist unnecessary temporary UI state.
- Use reusable selectors.
- Derive dashboard metrics from domain records.
- Version persisted data.
- Support state migration.
- Handle invalid persisted data safely.
- Handle LocalStorage quota and availability errors.
- Prevent hydration mismatches.

Cross-module transactions must update related records
through one coordinated domain action.

Do not implement separate disconnected states
for the same inventory records.

## 15. LocalStorage Rules

- Use a consistent storage key.
- Recommended key: dcims-domain-v1.
- Maintain a persisted schema version.
- Validate imported data.
- Validate persisted data before relying on it.
- Handle missing or invalid storage.
- Initialize seed data when appropriate.
- Preserve valid user-created demonstration records.
- Do not overwrite valid data on every application load.
- Do not store sensitive credentials.
- Do not store large base64 image assets.

Resetting demo data must require explicit confirmation.

If persisted data is corrupted, provide a recovery
or reset option rather than silently destroying it.

LocalStorage is not a secure database.

Do not claim that locally stored records are protected
against tampering or synchronized across devices.

## 16. Inventory Business Rules

Inventory consistency is a critical project requirement.

### General Rules

- Inventory quantities cannot become negative.
- Material quantities must be valid finite numbers.
- Transaction quantities must be greater than zero.
- Material and warehouse references must exist.
- Completed transactions cannot be directly edited.
- Corrections must use compensating transactions.
- Inventory balances must remain consistent.
- Every completed inventory transaction must generate
  an activity record.

### Stock-In

- Validate material and warehouse.
- Validate received quantity.
- Validate unit cost.
- Increase warehouse inventory.
- Recalculate weighted-average unit cost.
- Record transaction history.
- Generate activity record.

### Stock-Out

- Validate available warehouse stock.
- Reject insufficient stock.
- Deduct released quantity.
- Preserve transaction cost snapshot.
- Update project inventory when applicable.
- Generate activity record.

### Warehouse Transfer

- Validate source warehouse.
- Validate destination warehouse.
- Prevent identical source and destination.
- Validate available source quantity.
- Deduct source stock.
- Increase destination stock.
- Preserve inventory cost information.
- Update both warehouses together.
- Record transfer history.

### Material Return

- Validate available project inventory.
- Deduct project inventory.
- Increase destination warehouse inventory.
- Preserve appropriate cost information.
- Record return transaction.

### Stock Adjustment

- Require a valid adjustment reason.
- Validate resulting inventory quantity.
- Prevent negative inventory.
- Record adjustment history.

### Transaction Integrity

Validate all affected records before applying changes.

If any validation fails, leave the existing state unchanged.

Do not partially complete multi-record transactions.

## 17. Material Request Rules

Supported statuses:

- Pending
- Approved
- Rejected
- Partially Fulfilled
- Fulfilled
- Cancelled

Required workflow:

1. Create material request.
2. Validate requested materials.
3. Submit request.
4. Approve or reject request.
5. Validate warehouse availability.
6. Release approved quantities.
7. Update warehouse inventory.
8. Update project inventory.
9. Update fulfillment status.
10. Generate activity record.

Important:

- Approval must not deduct stock.
- Fulfillment must deduct stock.
- Partial fulfillment must be supported.
- Over-fulfillment must be prevented.
- Rejected requests cannot be fulfilled.
- Completed requests cannot be fulfilled again.

Enforce valid status transitions in domain actions,
not only through disabled interface buttons.

## 18. Procurement Rules

Supported purchase order statuses:

- Draft
- Pending
- Approved
- Ordered
- Partially Received
- Received
- Cancelled

Required workflow:

1. Create purchase order.
2. Validate supplier.
3. Validate destination warehouse.
4. Validate order items.
5. Calculate financial totals.
6. Approve purchase order.
7. Mark purchase order as ordered.
8. Receive delivered materials.
9. Generate stock-in transactions.
10. Update receiving status.

Important:

- Purchase orders may contain multiple materials.
- Receiving must update inventory automatically.
- Partial deliveries must be supported.
- Over-receiving must be prevented.
- Duplicate receiving must be prevented.
- Cancelled orders cannot receive inventory.
- Completed orders cannot be received again.
- Inactive suppliers cannot receive new orders.

Do not implement real payments.

## 19. Equipment Management Rules

Supported equipment statuses:

- Available
- Assigned
- Under Maintenance
- Damaged
- Retired

Rules:

- Equipment asset codes must be unique.
- Equipment cannot be assigned to multiple projects
  simultaneously.
- Damaged equipment cannot be assigned.
- Retired equipment cannot be assigned.
- Equipment under maintenance cannot be assigned.
- Returning equipment must update its availability.
- Assignment history must be preserved.
- Maintenance history must be preserved.

## 20. Financial Calculation Rules

All monetary values must use Philippine Peso.

Use integer centavos or an approved decimal-safe utility
for monetary calculations.

Do not rely on unrounded floating-point arithmetic
for financial totals.

Calculate:

- Inventory valuation
- Weighted-average unit cost
- Purchase order subtotal
- Discounts
- Delivery fees
- Purchase order total
- Project material consumption cost
- Remaining project material budget

Use consistent rounding rules.

Inventory valuation must be derived from actual
inventory balances and associated costs.

Do not independently hardcode financial dashboard values.

The costing implementation is a simplified demonstration,
not certified accounting software.

## 21. Mock Data Rules

All records must be fictional.

Use realistic construction-related data.

Required demonstration records:

- At least 50 materials
- At least 10 material categories
- 3 warehouses
- 6 construction projects
- At least 12 suppliers
- At least 20 equipment records
- At least 40 stock movements
- At least 15 material requests
- At least 10 purchase orders
- At least 30 activity records

Use fictional Davao-based locations and businesses.

Example warehouse locations:

- Matina
- Buhangin
- Toril

Example construction project locations:

- Lanang
- Mintal
- Downtown Davao
- Matina
- Toril

Mock data must maintain valid entity relationships.

Do not generate random data on every page render.

Use deterministic seed data.

Do not create contradictory inventory balances
and transaction histories.

## 22. UI and UX Rules

Follow:

- docs/THEME.md
- docs/TYPOGRAPHY.md

The interface must follow a premium industrial SaaS style.

### Brand Colors

- Industrial Navy: #0F172A
- Safety Orange: #F97316
- Steel Gray: #334155
- Off White: #F8FAFC
- Pure White: #FFFFFF

Use semantic design tokens instead of hardcoding
colors throughout individual components.

### Typography

- Headings: Manrope
- Body: Inter
- Technical identifiers: JetBrains Mono
- Numerical values: Tabular numerals

### Branding Assets

Primary logo:

/public/dcims.png

Compact application icon:

/public/dcims-icon.png

Do not replace approved branding without authorization.

Preserve logo aspect ratio.

### Interface Requirements

- Consistent page headers
- Consistent navigation
- Consistent spacing
- Consistent button styles
- Consistent status badges
- Responsive data tables
- Accessible forms
- Meaningful empty states
- Clear validation feedback
- Confirmation dialogs
- Functional interface controls

Avoid:

- Generic dashboard templates
- Excessive gradients
- Excessive glassmorphism
- Neon colors
- Excessive rounded corners
- Unnecessary animations
- Decorative 3D elements
- Oversized typography
- Excessive whitespace
- Inconsistent icon libraries
- Unnecessary nested cards

Do not redesign unrelated pages while implementing
a functional change.

## 23. Responsive Design Rules

Support desktop, tablet, and mobile devices.

Use standard Tailwind breakpoints:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Desktop

- Expanded sidebar
- Multi-column dashboard
- Full data tables
- Expanded charts

### Tablet

- Collapsible sidebar
- Two-column layouts
- Scrollable tables

### Mobile

- Drawer navigation
- Stacked layouts
- Responsive cards
- Full-width forms
- Touch-friendly controls

Prevent unintended horizontal page overflow.

Do not hide essential functionality on mobile devices.

## 24. Accessibility Rules

- Use semantic HTML.
- Provide accessible form labels.
- Provide visible focus indicators.
- Support keyboard navigation.
- Use accessible dialogs.
- Provide accessible icon button names.
- Maintain WCAG AA text contrast.
- Provide meaningful image alternative text.
- Respect reduced-motion preferences.
- Support browser zoom.
- Do not communicate status through color alone.

Accessibility requirements apply to both light
and dark themes.

## 25. Form Validation Rules

Use React Hook Form and Zod.

All forms must:

- Validate required fields.
- Validate numerical ranges.
- Validate references.
- Validate dates.
- Display meaningful error messages.
- Prevent invalid submissions.
- Provide submission feedback.

Domain actions must independently enforce
critical business rules.

Do not rely solely on interface-level validation.

Validate imported JSON and persisted data as untrusted input.

## 26. Data Table Rules

Data tables should support relevant functionality:

- Search
- Filtering
- Sorting
- Pagination
- Row actions
- Empty states
- Responsive overflow
- CSV export

Do not implement unnecessary table functionality
when a simpler list satisfies the module requirements.

Align numerical values to the right.

Use consistent column definitions.

Use stable identifiers for table rows.

## 27. Dashboard and Analytics Rules

All dashboard statistics must derive from application state.

Examples:

- Inventory value
- Material count
- Warehouse count
- Active project count
- Low-stock count
- Pending request count
- Available equipment count
- Outstanding purchase order count

Charts must use actual simulated records.

Do not fabricate disconnected chart values.

Do not fabricate percentage growth indicators.

Do not aggregate incompatible measurement units.

For cross-material comparisons, use:

- Transaction counts
- Financial values
- Other meaningful normalized metrics

Charts must support responsive layouts
and theme-aware styling.

## 28. Error Handling Rules

Handle errors explicitly.

Examples:

- Invalid form values
- Insufficient stock
- Duplicate identifiers
- Invalid status transitions
- Missing referenced records
- Invalid imported data
- LocalStorage failures
- Unexpected runtime errors

Provide actionable error messages.

Do not silently ignore errors.

Do not use empty catch blocks.

Do not expose unnecessary internal implementation
details to application users.

Do not use success notifications when an operation fails.

## 29. Security and Privacy Rules

Although DCIMS is a demonstration, follow
reasonable frontend security practices.

- Never include real credentials.
- Never include API keys.
- Never include private user information.
- Never commit secrets.
- Never use real supplier contact details.
- Validate imported data.
- Escape exported CSV content appropriately.
- Prevent spreadsheet formula injection in CSV exports.
- Avoid unsafe HTML rendering.
- Avoid dangerouslySetInnerHTML unless justified.
- Avoid executing imported strings as code.
- Avoid eval and Function constructors.
- Do not introduce unnecessary external scripts.

Simulated roles are not real access control.

Do not claim that client-side restrictions provide
production-grade authorization.

Do not send repository data to external services
without user authorization.

## 30. Dependency Management

Before installing a dependency:

1. Inspect package.json.
2. Check whether an existing dependency solves the problem.
3. Check whether a native browser or framework API is enough.
4. Evaluate the necessity of the dependency.
5. Use the existing package manager.

Do not:

- Install multiple libraries for the same purpose.
- Replace the existing package manager.
- Generate conflicting lockfiles.
- Upgrade unrelated dependencies.
- Install backend dependencies.
- Install large packages for trivial utilities.
- Modify dependency versions merely to bypass errors.

Report dependencies added during implementation.

## 31. File Modification Rules

Agents must:

- Modify only relevant files.
- Preserve unrelated working functionality.
- Preserve existing user changes.
- Follow existing naming conventions.
- Keep changes focused on the requested task.
- Reuse existing utilities and components.

Agents must not:

- Delete unrelated files.
- Rewrite the entire application unnecessarily.
- Replace approved architecture without authorization.
- Remove existing functionality silently.
- Modify project documentation without justification.
- Overwrite user-created assets.
- Create duplicate implementations of existing features.

Inspect the resulting diff before reporting completion.

## 32. Git and Command Safety

Never execute destructive commands without explicit
user authorization.

Examples:

- git reset --hard
- git clean -fd
- git push --force
- Destructive recursive file deletion
- Commands that overwrite unrelated user files

Do not revert changes made by the user.

Do not commit changes unless requested.

Do not push changes unless requested.

Do not deploy the application unless requested.

Do not bypass tool permission prompts.

Use non-destructive repository inspection commands.

Recommended:

- git status --short
- git diff
- git diff --stat
- git log -5 --oneline

## 33. Development Workflow

### Step 1 — Analyze

- Read the user request.
- Read project documentation.
- Inspect relevant source files.
- Identify existing implementation.
- Identify dependencies and constraints.
- Identify affected modules.

### Step 2 — Plan

Create a focused implementation plan containing:

- Objective
- Affected files
- Required changes
- Dependencies
- Validation strategy

For small changes, use a concise internal plan.

Do not create unnecessary planning documents.

### Step 3 — Implement

- Follow approved architecture.
- Implement the requested functionality.
- Reuse existing components.
- Validate business operations.
- Handle relevant edge cases.
- Preserve existing functionality.

### Step 4 — Verify

- Inspect modified files.
- Run relevant checks.
- Verify TypeScript correctness.
- Verify lint correctness.
- Test affected business logic.
- Verify responsive behavior when possible.

### Step 5 — Document

- Update relevant TASK.md checkboxes.
- Record unresolved issues.
- Summarize implementation.
- Report verification results.

## 34. Task Management Rules

Use docs/TASK.md as the development progress tracker.

Allowed statuses:

- Pending
- In Progress
- Completed
- Blocked
- Deferred

Before implementing:

- Identify the relevant task.
- Check its dependencies.
- Determine whether it is already implemented.

After implementing:

- Verify the functionality.
- Mark completed tasks accurately.
- Update phase status when appropriate.
- Document blockers.

Do not mark a task completed merely because:

- Code was generated.
- A component renders.
- A page exists.
- A placeholder interface was created.
- The agent assumes functionality works.

Completion requires actual implementation
and appropriate verification.

## 35. Multi-Agent Collaboration

Multiple AI agents may work on DCIMS.

Each agent must have a clearly defined responsibility.

Recommended roles:

### Primary Agent

Responsible for:

- Understanding user requirements
- Coordinating implementation
- Managing task dependencies
- Reviewing changes
- Integrating completed work

### Frontend Agent

Responsible for:

- React components
- Next.js pages
- Responsive layouts
- Shared UI components

### Design Agent

Responsible for:

- Theme consistency
- Typography
- Component styling
- Accessibility
- Visual quality

### Business Logic Agent

Responsible for:

- Inventory calculations
- Stock movements
- Warehouse transfers
- Material fulfillment
- Purchase order receiving
- Equipment assignments

### State Management Agent

Responsible for:

- Zustand stores
- Domain actions
- Selectors
- Persistence
- State migrations
- Cross-module consistency

### Testing Agent

Responsible for:

- Functional verification
- Business logic testing
- Regression testing
- Edge case identification

### Review Agent

Responsible for:

- Code quality
- Architecture compliance
- Security review
- Dependency review
- Documentation compliance

### Documentation Agent

Responsible for:

- TASK.md updates
- README.md updates
- Implementation summaries
- Known limitation documentation

These are conceptual responsibilities.

Do not assume the current AI tool supports
automatic subagent creation.

Use available subagent capabilities only when supported
and useful for the current task.

## 36. Multi-Agent Coordination Rules

When multiple agents are available:

- Assign independent tasks where possible.
- Define file ownership before parallel implementation.
- Avoid simultaneous modification of the same files.
- Share domain types and interfaces.
- Establish business rules before UI implementation.
- Establish shared components before duplicating UI.
- Review changes before integration.
- Resolve conflicts before continuing.
- Verify integrated functionality.

Do not create multiple competing implementations
of the same feature.

Do not delegate trivial tasks unnecessarily.

Subagents must follow the same AGENTS.md instructions.

The primary agent remains responsible for integration
and final verification.

## 37. Agent Context Management

To reduce unnecessary context usage:

- Read only relevant source files after reviewing
  required project documentation.
- Avoid repeatedly reading unchanged files.
- Search for existing implementations before creating new ones.
- Avoid dumping entire repositories into context.
- Summarize large files when delegating tasks.
- Provide subagents with focused requirements.
- Avoid unnecessary repeated tool calls.
- Preserve important architectural decisions.
- Use TASK.md to track implementation progress.

Do not sacrifice correctness to reduce token usage.

When context becomes limited, record a concise handoff
containing:

- Current objective
- Completed work
- Modified files
- Remaining tasks
- Verification results
- Known blockers
- Important implementation decisions

Do not include secrets in handoff summaries.

## 38. Testing Requirements

Test relevant business logic after implementation.

### Inventory

- Stock-in calculations
- Stock-out calculations
- Negative stock prevention
- Warehouse transfers
- Material returns
- Weighted-average cost
- Inventory valuation

### Material Requests

- Request creation
- Approval
- Rejection
- Partial fulfillment
- Full fulfillment
- Over-fulfillment prevention

### Procurement

- Purchase order totals
- Partial receiving
- Full receiving
- Duplicate receiving prevention
- Over-receiving prevention

### Equipment

- Assignment
- Return
- Duplicate assignment prevention
- Maintenance restrictions

### Persistence

- Browser refresh
- LocalStorage recovery
- State migration
- JSON export
- JSON import
- Demo data reset

### Interface

- Navigation
- Forms
- Dialogs
- Filters
- Search
- Responsive layouts
- Theme switching

Use existing testing tools when available.

Do not introduce an unnecessarily complex testing
infrastructure for a simple demonstration.

## 39. Verification Commands

Inspect package.json before running commands.

Use the repository's existing package manager.

For an npm-based repository, common commands include:

    npm run dev

    npm run lint

    npx tsc --noEmit

    npm run build

    npm run start

    npm test

Only run scripts that exist or tools that are installed.

If ESLint is configured without a lint script,
use the existing ESLint CLI configuration.

Do not download additional tools automatically
merely to perform verification.

If a command cannot be executed, report the limitation.

Never fabricate successful command results.

## 40. Definition of Done

A feature is complete only when:

- The requested functionality is implemented.
- Required business validation exists.
- Relevant state updates are consistent.
- Existing functionality remains intact.
- The interface follows THEME.md.
- Typography follows TYPOGRAPHY.md.
- Responsive behavior is acceptable.
- Error states are handled.
- Relevant verification has passed.
- TASK.md reflects actual implementation status.

A visually complete interface with nonfunctional
controls is not considered complete.

## 41. Scope Control

DCIMS is a portfolio demonstration.

Prioritize:

1. Inventory consistency.
2. Functional workflows.
3. Professional interface.
4. Responsive design.
5. Maintainable code.
6. Local data persistence.

Do not expand the application into:

- A full construction ERP
- A real accounting system
- A payroll management system
- A production procurement platform
- A real multi-tenant SaaS platform
- A production warehouse management system

Additional features require explicit user approval
when they materially expand the approved scope.

## 42. Agent Response Format

After completing an implementation, provide
a concise development summary.

Recommended format:

### Summary

Describe the implemented functionality.

### Files Changed

List important created or modified files.

### Verification

Report actual results:

- TypeScript: Passed / Failed / Not Run
- ESLint: Passed / Failed / Not Run
- Build: Passed / Failed / Not Run
- Functional Tests: Passed / Failed / Not Run

### Task Progress

Identify updated TASK.md tasks.

### Known Issues

Report unresolved errors, limitations, or blockers.

### Next Step

Identify the next logical development task
when relevant.

Do not claim the application is fully functional
unless the required workflows have been verified.

Do not provide excessive explanations for small changes.

## 43. Prohibited Agent Behaviors

Agents must not:

- Ignore project specifications.
- Introduce unapproved backend infrastructure.
- Fabricate test results.
- Fabricate implementation progress.
- Mark incomplete tasks as completed.
- Create fake functional buttons.
- Create disconnected dashboard statistics.
- Introduce unnecessary dependencies.
- Overengineer simple functionality.
- Rewrite unrelated working code.
- Remove user changes.
- Execute destructive commands without authorization.
- Expose credentials or private information.
- Claim simulated security is production-ready.
- Claim local data is synchronized across devices.
- Make external deployments without authorization.
- Silently change approved branding.
- Silently change approved project scope.

## 44. Project Completion Requirements

Before declaring DCIMS complete, verify:

- All required routes are functional.
- Core inventory operations work.
- Warehouse transfers work.
- Material requests work.
- Purchase order receiving works.
- Equipment management works.
- Supplier management works.
- Dashboard statistics are dynamically calculated.
- Reports use current application state.
- CSV exports work.
- Activity logs are generated.
- LocalStorage persistence works.
- Demo data reset works.
- Light and dark modes work.
- Responsive layouts work.
- No critical TypeScript errors remain.
- No critical runtime errors remain.
- Production build completes successfully.
- The application clearly identifies itself as a demo.

## 45. Final Agent Directive

Build DCIMS as a polished, realistic, and functional
construction inventory management demonstration.

Always prioritize correctness, maintainability,
professional design, and user experience.

Follow the approved project documentation.

Use the existing architecture.

Keep implementations simple and focused.

Do not introduce unnecessary infrastructure.

Do not expand the project beyond its demonstration scope.

Verify actual functionality before reporting completion.

All AI agents working on this repository must follow
these instructions regardless of their provider,
model, framework, or execution environment.