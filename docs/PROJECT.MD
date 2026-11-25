# PROJECT.md — DCIMS Development Specification

# Davao Construction Inventory Management System

## 1. Project Overview

DCIMS (Davao Construction Inventory Management System) is a
modern, responsive web application designed to demonstrate
the management of construction materials, equipment, warehouses,
suppliers, procurement, and project inventory.

The application is a frontend-only portfolio demonstration
inspired by real-world construction inventory management systems.

The system must provide realistic and interactive workflows
without requiring a backend server or external database.

## 2. Project Identity

- Project Name: DCIMS
- Full Name: Davao Construction Inventory Management System
- Tagline: Building Efficiency. Managing Resources.
- Industry: Construction and Logistics
- Platform: Responsive Web Application
- Project Type: Portfolio Demonstration
- Currency: Philippine Peso (PHP)
- Locale: en-PH
- Timezone: Asia/Manila

## 3. Development Objectives

- Develop a professional construction inventory dashboard.
- Demonstrate realistic inventory management workflows.
- Provide interactive material and equipment management.
- Simulate warehouse and construction site operations.
- Demonstrate procurement and supplier management.
- Provide meaningful inventory reports and analytics.
- Deliver a premium and responsive SaaS user experience.

## 4. Technology Stack

### Frontend

- Next.js using App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### State Management

- Zustand
- Zustand Persist Middleware
- Browser LocalStorage

### Forms and Validation

- React Hook Form
- Zod

### Data Visualization

- Recharts

### Data Management

- TypeScript mock data
- LocalStorage persistence
- Client-side filtering
- Client-side pagination
- Client-side sorting

### Deployment

- Vercel

## 5. Development Restrictions

This project is strictly a frontend-only demonstration.

DO NOT implement:

- Supabase
- Firebase
- PostgreSQL server
- MySQL
- MongoDB
- External databases
- Express.js backend
- FastAPI backend
- Custom REST API
- Real authentication services
- Payment gateways
- Paid external services
- AI integrations

All application data must be simulated locally.

All CRUD operations must update the shared application state
and persist changes through LocalStorage.

Next.js server components may be used for static layouts,
but business operations must remain client-side.

Do not present simulated authentication or authorization
as production-grade security.

## 6. Application Architecture

The application follows a modular frontend architecture.

Application Flow:

User Interface
    |
React Components
    |
Feature Modules
    |
Zustand Stores
    |
LocalStorage Persistence

Each feature must have clearly separated:

- Components
- Types
- Validation schemas
- Business logic
- State management
- Utility functions

Avoid placing all application logic inside page components.

## 7. Application Layout

The main application layout consists of:

### Sidebar

- DCIMS logo
- Navigation sections
- Active navigation indicator
- Collapsible sidebar
- User profile section
- Mobile navigation drawer

### Header

- Page title
- Breadcrumb navigation
- Global search
- Notification button
- Theme toggle
- User profile dropdown

### Main Content

- Page-specific heading
- Supporting description
- Primary actions
- Summary cards
- Data tables
- Charts
- Forms
- Dialogs
- Empty states

### Footer

- DCIMS branding
- Application version
- Portfolio demonstration notice

## 8. Navigation Structure

### Overview

- Dashboard

### Inventory

- Materials
- Categories
- Warehouses
- Stock Movements

### Operations

- Projects
- Material Requests
- Equipment

### Procurement

- Suppliers
- Purchase Orders

### Administration

- Reports
- Activity Logs
- Settings

## 9. Core Modules

### 9.1 Dashboard

The dashboard provides a centralized overview of inventory
and construction operations.

Summary cards:

- Total inventory value
- Total registered materials
- Active construction projects
- Total warehouses
- Low-stock materials
- Pending material requests
- Available equipment
- Outstanding purchase orders

Dashboard visualizations:

- Monthly stock movement chart
- Inventory value by category
- Project material expenditure
- Warehouse stock distribution
- Procurement expenditure trend

Additional sections:

- Recent stock movements
- Low-stock alerts
- Pending material requests
- Active project overview
- Recent system activities

All dashboard statistics must be calculated dynamically
from the shared application state.

Do not hardcode dashboard totals independently of inventory data.

### 9.2 Materials Management

Manage construction material records.

Material fields:

- Material ID
- SKU
- Material name
- Description
- Category
- Unit of measurement
- Unit cost
- Reorder level
- Preferred supplier
- Material image
- Status
- Date created
- Date updated

Supported material categories:

- Cement and Concrete
- Steel and Metals
- Aggregates
- Lumber and Wood
- Electrical Supplies
- Plumbing Supplies
- Roofing Materials
- Paint and Finishing
- Safety Equipment
- Hardware and Fasteners

Functionalities:

- Add material
- Edit material
- Archive material
- View material details
- Search materials
- Filter by category
- Filter by stock status
- Sort materials
- Paginate records
- Export materials to CSV

Stock status:

- In Stock
- Low Stock
- Out of Stock

Stock status must be derived from available stock
and the configured reorder level.

Do not store duplicate stock totals in material records.

### 9.3 Categories Management

Manage material classifications.

Category fields:

- Category ID
- Category name
- Description
- Icon
- Color
- Status

Functionalities:

- Create category
- Edit category
- Archive category
- View associated materials
- Search categories

Prevent category deletion when active materials
are still assigned to that category.

### 9.4 Warehouse Management

Manage multiple construction storage locations.

Warehouse fields:

- Warehouse ID
- Warehouse name
- Warehouse code
- Address
- Assigned manager
- Contact number
- Storage capacity
- Status
- Date created

Functionalities:

- Add warehouse
- Edit warehouse
- View warehouse inventory
- View stock quantities
- View warehouse transactions
- Transfer materials between warehouses
- Filter warehouse records

Example fictional warehouses:

- DCIMS Central Warehouse - Matina
- DCIMS North Warehouse - Buhangin
- DCIMS South Warehouse - Toril

Each warehouse must maintain independent inventory balances.

### 9.5 Stock Movements

Track all inventory transactions.

Transaction types:

- Stock In
- Stock Out
- Warehouse Transfer
- Material Return
- Stock Adjustment
- Damaged Stock

Transaction fields:

- Transaction ID
- Reference number
- Transaction type
- Material ID
- Quantity
- Unit cost snapshot
- Source warehouse
- Destination warehouse
- Project ID
- Performed by
- Transaction date
- Remarks

Functionalities:

- Record stock-in transactions
- Record stock-out transactions
- Transfer materials
- Record material returns
- Adjust stock quantities
- View transaction history
- Filter by transaction type
- Filter by date range
- Export transaction records

Business rules:

- Quantity must be greater than zero.
- Stock-out cannot exceed available stock.
- Transfers must update both warehouse balances.
- Source and destination warehouses must be different.
- Completed transactions cannot be directly edited.
- Corrections must use compensating transactions.
- Every transaction must generate an activity log.

### 9.6 Construction Projects

Manage fictional construction projects.

Project fields:

- Project ID
- Project name
- Project code
- Project description
- Project location
- Project manager
- Client name
- Start date
- Target completion date
- Material budget
- Progress percentage
- Project status

Project statuses:

- Planning
- Ongoing
- On Hold
- Completed
- Cancelled

Functionalities:

- Create project
- Edit project
- View project details
- View allocated materials
- View material consumption
- Monitor material expenses
- Update project progress
- Filter projects by status

Example fictional projects:

- Matina Commercial Building
- Lanang Business Center
- Toril Residential Development
- Buhangin Warehouse Expansion
- Mintal Community Complex
- Downtown Office Renovation

Project progress is manually updated for demonstration.

Project material expenses must be derived from
recorded material consumption transactions.

### 9.7 Material Requests

Simulate construction site material requests.

Request fields:

- Request ID
- Request reference number
- Project ID
- Requested by
- Request date
- Required date
- Requested materials
- Requested quantities
- Fulfilled quantities
- Priority
- Status
- Remarks

Priority levels:

- Low
- Normal
- High
- Urgent

Request statuses:

- Pending
- Approved
- Rejected
- Partially Fulfilled
- Fulfilled
- Cancelled

Workflow:

1. Create material request.
2. Select construction project.
3. Add requested materials and quantities.
4. Submit request.
5. Approve or reject request.
6. Validate available warehouse stock.
7. Release approved materials.
8. Update warehouse and project inventory.
9. Update fulfillment status.
10. Record activity log.

Approval alone must not deduct stock.

Stock must only be deducted when materials are released.

Partial fulfillment must be supported.

### 9.8 Equipment Management

Manage construction tools and equipment.

Equipment fields:

- Equipment ID
- Asset code
- Equipment name
- Category
- Brand
- Model
- Serial number
- Purchase date
- Acquisition cost
- Assigned warehouse
- Assigned project
- Assigned personnel
- Equipment condition
- Equipment status
- Next maintenance date

Equipment categories:

- Heavy Equipment
- Power Tools
- Hand Tools
- Measuring Equipment
- Safety Equipment
- Construction Machinery

Equipment statuses:

- Available
- Assigned
- Under Maintenance
- Damaged
- Retired

Functionalities:

- Register equipment
- Edit equipment information
- Assign equipment to project
- Return equipment
- Update equipment condition
- Record maintenance
- View assignment history
- Search and filter equipment

Prevent equipment from being assigned to multiple
projects simultaneously.

### 9.9 Supplier Management

Manage fictional construction suppliers.

Supplier fields:

- Supplier ID
- Company name
- Contact person
- Email address
- Contact number
- Business address
- Material categories
- Payment terms
- Status
- Remarks

Functionalities:

- Add supplier
- Edit supplier
- View supplier profile
- View supplied materials
- View purchase order history
- Search suppliers
- Filter suppliers

Supplier statuses:

- Active
- Inactive

All supplier information must be fictional.

### 9.10 Purchase Orders

Simulate construction material procurement.

Purchase order fields:

- Purchase order ID
- Purchase order number
- Supplier ID
- Destination warehouse
- Order date
- Expected delivery date
- Ordered materials
- Ordered quantities
- Received quantities
- Unit prices
- Subtotal
- Discount
- Delivery fee
- Total amount
- Status
- Remarks

Purchase order statuses:

- Draft
- Pending
- Approved
- Ordered
- Partially Received
- Received
- Cancelled

Functionalities:

- Create purchase order
- Edit draft purchase order
- Approve purchase order
- Mark purchase order as ordered
- Receive materials
- Record partial deliveries
- Calculate purchase order totals
- View purchase order details
- Print purchase order
- Export purchase order records

Receiving materials must automatically create
stock-in transactions.

Prevent receiving more than the ordered quantity.

Purchase order totals must be calculated from line items.

Do not implement actual financial payments.

### 9.11 Reports and Analytics

Provide inventory and operational reports.

Report types:

- Inventory Summary
- Stock Movement Report
- Low-Stock Report
- Warehouse Inventory Report
- Project Material Consumption Report
- Equipment Utilization Report
- Procurement Expense Report
- Supplier Purchase History

Functionalities:

- Filter by date range
- Filter by warehouse
- Filter by project
- Filter by material category
- View summary statistics
- View charts
- Export reports to CSV
- Print reports

Reports must use actual application state.

Inventory valuation must use a consistent simplified
weighted-average cost calculation.

This calculation is for demonstration purposes only
and is not a certified accounting implementation.

### 9.12 Activity Logs

Track important application actions.

Activity fields:

- Activity ID
- Action
- Module
- Description
- Reference ID
- Performed by
- Timestamp

Tracked actions:

- Material created
- Material updated
- Stock received
- Stock released
- Warehouse transfer completed
- Project created
- Material request approved
- Equipment assigned
- Purchase order received

Functionalities:

- View activity history
- Search activities
- Filter by module
- Filter by date

Activity logs are simulated local records.

They are not tamper-proof security audit logs.

### 9.13 Settings

Provide application customization.

Settings sections:

- Company profile
- Demo user profile
- Appearance
- Notification preferences
- Inventory preferences
- Data management
- About application

Functionalities:

- Update fictional company information
- Update demo user profile
- Change application theme
- Configure display preferences
- Export demo data as JSON
- Import validated demo data
- Reset demonstration data

Resetting demo data must require confirmation.

## 10. Inventory Business Logic

### 10.1 Inventory Balances

Maintain inventory balances using:

- Material ID
- Warehouse ID
- On-hand quantity
- Average unit cost

Each material and warehouse combination must be unique.

### 10.2 Stock-In

New stock = Current stock + Received quantity

Weighted average unit cost:

New average cost =
(
    Current stock * Current average cost
    +
    Received quantity * Received unit cost
)
/
New stock

### 10.3 Stock-Out

New stock = Current stock - Released quantity

Reject transactions that would create negative stock.

### 10.4 Warehouse Transfer

Source stock = Source stock - Transfer quantity

Destination stock =
Destination stock + Transfer quantity

Transfer inventory using the source warehouse's
average unit cost.

Both inventory updates must occur within one
coordinated Zustand state update.

### 10.5 Inventory Valuation

Inventory value =
Sum of each warehouse balance quantity
multiplied by its average unit cost.

### 10.6 Project Material Tracking

Materials released to a project must increase
the project's available material quantity.

Recording material consumption must reduce
the project's available material quantity.

Project consumption cost must use the recorded
cost snapshot associated with consumed materials.

Unused materials may be returned to a warehouse.

Do not count warehouse transfers as material consumption.

### 10.7 Low-Stock Detection

Out of Stock:

Available quantity equals zero.

Low Stock:

Available quantity is greater than zero
and less than or equal to the reorder level.

In Stock:

Available quantity exceeds the reorder level.

## 11. Data Models

Create TypeScript interfaces for:

- Material
- MaterialCategory
- Warehouse
- InventoryBalance
- StockMovement
- ConstructionProject
- ProjectMaterial
- MaterialConsumption
- MaterialRequest
- MaterialRequestItem
- Equipment
- EquipmentAssignment
- MaintenanceRecord
- Supplier
- PurchaseOrder
- PurchaseOrderItem
- ActivityLog
- Notification
- DemoUser
- ApplicationSettings

Use unique identifiers generated through
crypto.randomUUID().

Use ISO 8601 timestamps for stored dates.

Use consistent enumerations or union types for statuses.

Use integer centavos or a decimal-safe utility
for financial calculations.

## 12. Mock Data Requirements

Provide realistic fictional seed data containing:

- At least 50 construction materials
- At least 10 material categories
- 3 warehouses
- 6 construction projects
- At least 12 suppliers
- At least 20 equipment records
- At least 40 stock movement records
- At least 15 material requests
- At least 10 purchase orders
- At least 30 activity records

All relationships must be consistent.

Mock inventory balances and transaction histories
must not contradict each other.

Use realistic Philippine construction material units:

- Bag
- Piece
- Kilogram
- Meter
- Square Meter
- Cubic Meter
- Liter
- Roll
- Sheet
- Set
- Box
- Bundle

Use fictional Davao-based business and project information.

## 13. State Management

Use Zustand as the centralized state management solution.

Recommended stores:

- Inventory Store
- Project Store
- Equipment Store
- Procurement Store
- Activity Store
- Settings Store
- UI Store

Cross-module business transactions must use coordinated
state updates through a shared domain action.

A single persisted domain store may be used when needed
to prevent inconsistent cross-store transactions.

Requirements:

- Persist domain data using LocalStorage.
- Version persisted state.
- Support state migration.
- Handle invalid persisted data.
- Prevent hydration mismatches.
- Provide reusable selectors.
- Derive dashboard statistics from domain state.
- Support resetting the application to seed data.

Do not persist unnecessary temporary UI state.

## 14. Project Directory Structure

dcims/
├── docs/
│   ├── PROJECT.md
│   ├── THEME.md
│   └── TYPOGRAPHY.md
├── public/
│   ├── dcims.png
│   ├── dcims-icon.png
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   ├── icon.png
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
│   │   ├── warehouses/
│   │   ├── projects/
│   │   ├── equipment/
│   │   ├── procurement/
│   │   └── reports/
│   ├── data/
│   ├── stores/
│   ├── services/
│   ├── types/
│   ├── schemas/
│   ├── hooks/
│   ├── constants/
│   └── lib/
├── package.json
└── README.md

The services directory contains local business logic only.

Do not implement network services or backend APIs.

## 15. Responsive Design

Desktop:

- Full sidebar navigation
- Multi-column dashboard
- Complete data tables
- Expanded charts

Tablet:

- Collapsible sidebar
- Two-column dashboard
- Horizontally scrollable tables

Mobile:

- Drawer navigation
- Single-column layout
- Responsive cards
- Touch-friendly controls
- Full-width forms

All modules must remain usable on mobile devices.

## 16. Accessibility

- Use semantic HTML.
- Provide accessible form labels.
- Support keyboard navigation.
- Provide visible focus indicators.
- Use accessible dialog components.
- Maintain WCAG AA text contrast.
- Do not rely solely on color for status indicators.
- Respect reduced-motion preferences.

## 17. Code Quality Standards

- Enable TypeScript strict mode.
- Avoid unnecessary use of any.
- Use reusable components.
- Follow separation of concerns.
- Avoid duplicated business logic.
- Use meaningful variable and function names.
- Validate all form inputs.
- Handle empty and invalid states.
- Avoid unnecessary dependencies.
- Remove unused code and imports.
- Avoid hardcoded values when derived values are available.

## 18. Testing Requirements

Test the following scenarios:

- Material creation and editing
- Stock-in and stock-out
- Negative stock prevention
- Warehouse transfers
- Material request approval
- Partial material fulfillment
- Purchase order receiving
- Duplicate delivery prevention
- Equipment assignment and return
- Inventory valuation
- Project material consumption
- LocalStorage persistence
- Demo data reset
- Invalid data import
- Responsive navigation
- Dark and light themes

## 19. Acceptance Criteria

The project is considered complete when:

- All navigation routes are functional.
- All core modules are interactive.
- CRUD operations work correctly.
- Inventory calculations remain consistent.
- Dashboard statistics update dynamically.
- Data persists after browser refresh.
- Reports can be exported.
- The application is responsive.
- No major runtime errors exist.
- The application can be deployed to Vercel.
- The interface follows THEME.md and TYPOGRAPHY.md.
- The application clearly identifies itself as a demo.

## 20. Final Development Direction

Build DCIMS as a polished construction inventory
management portfolio demonstration.

Prioritize:

1. Visual quality.
2. Consistent user experience.
3. Functional interactions.
4. Realistic business logic.
5. Maintainable frontend architecture.
6. Responsive design.

Do not expand the project into a production ERP system.

Do not introduce backend infrastructure.

The final application must demonstrate the appearance
and behavior of a professional construction inventory
management platform using local simulated data.