# THEME.md — DCIMS Design System

## 1. Brand Identity

- Brand Name: DCIMS
- Full Name: Davao Construction Inventory Management System
- Tagline: Building Efficiency. Managing Resources.
- Industry: Construction and Logistics
- Design Language: Premium Industrial SaaS

The visual identity must communicate:

- Reliability
- Efficiency
- Precision
- Organization
- Professionalism
- Industrial strength

The interface must look like a modern enterprise
management application rather than a generic admin template.

## 2. Logo Guidelines

Primary logo:

/public/dcims.png

Application icon:

/public/dcims-icon.png

Browser favicon:

/src/app/icon.png

The application icon must use a square construction
symbol derived from the primary logo.

Logo requirements:

- Preserve the original aspect ratio.
- Use object-contain when displaying the logo.
- Do not stretch or distort the logo.
- Maintain sufficient clear space.
- Use a high-contrast logo variant when necessary.
- Avoid decorative shadows around the logo.

Use the full logo for:

- Expanded sidebar
- Welcome screen
- Printable reports
- About application page

Use the compact icon for:

- Collapsed sidebar
- Browser favicon
- Mobile navigation
- Small branding elements

## 3. Primary Color Palette

### Industrial Navy

HEX: #0F172A

Usage:

- Sidebar background
- Primary branding
- Dark surfaces
- Primary text in light mode

### Safety Orange

HEX: #F97316

Usage:

- Brand accents
- Active navigation indicators
- Selected states
- Decorative highlights
- Chart accents

### Steel Gray

HEX: #334155

Usage:

- Secondary surfaces
- Secondary text
- Dark-mode borders
- Supporting interface elements

### Off White

HEX: #F8FAFC

Usage:

- Main application background
- Secondary light surfaces

### Pure White

HEX: #FFFFFF

Usage:

- Cards
- Dialogs
- Input backgrounds
- Data tables

## 4. Color Scale

### Orange

- 50:  #FFF7ED
- 100: #FFEDD5
- 200: #FED7AA
- 300: #FDBA74
- 400: #FB923C
- 500: #F97316
- 600: #EA580C
- 700: #C2410C
- 800: #9A3412
- 900: #7C2D12

### Slate

- 50:  #F8FAFC
- 100: #F1F5F9
- 200: #E2E8F0
- 300: #CBD5E1
- 400: #94A3B8
- 500: #64748B
- 600: #475569
- 700: #334155
- 800: #1E293B
- 900: #0F172A
- 950: #020617

## 5. Semantic Colors

### Success

- Foreground: #166534
- Background: #DCFCE7
- Accent: #16A34A

Usage:

- Available materials
- Completed transactions
- Approved requests
- Successful operations

### Warning

- Foreground: #92400E
- Background: #FEF3C7
- Accent: #D97706

Usage:

- Low stock
- Pending requests
- Upcoming maintenance
- Partial deliveries

### Error

- Foreground: #991B1B
- Background: #FEE2E2
- Accent: #DC2626

Usage:

- Out of stock
- Rejected requests
- Invalid inputs
- Damaged equipment
- Failed operations

### Information

- Foreground: #1E40AF
- Background: #DBEAFE
- Accent: #2563EB

Usage:

- Ongoing projects
- Informational messages
- Warehouse transfers
- General notifications

### Neutral

- Foreground: #475569
- Background: #F1F5F9

Usage:

- Draft records
- Inactive records
- Cancelled records
- Secondary information

## 6. Light Mode Design Tokens

Use the following semantic CSS variables:

:root {
  --background: #F8FAFC;
  --foreground: #0F172A;

  --card: #FFFFFF;
  --card-foreground: #0F172A;

  --popover: #FFFFFF;
  --popover-foreground: #0F172A;

  --primary: #C2410C;
  --primary-foreground: #FFFFFF;

  --secondary: #F1F5F9;
  --secondary-foreground: #334155;

  --muted: #F1F5F9;
  --muted-foreground: #475569;

  --accent: #FFF7ED;
  --accent-foreground: #9A3412;

  --destructive: #B91C1C;
  --destructive-foreground: #FFFFFF;

  --border: #E2E8F0;
  --input: #CBD5E1;
  --ring: #EA580C;

  --sidebar: #0F172A;
  --sidebar-foreground: #E2E8F0;
  --sidebar-muted: #94A3B8;
  --sidebar-border: #1E293B;
  --sidebar-accent: #1E293B;
  --sidebar-active: #F97316;
  --sidebar-active-foreground: #0F172A;

  --brand: #F97316;
  --success: #16A34A;
  --warning: #D97706;
  --info: #2563EB;

  --radius: 0.625rem;
}

Use the darker orange primary button color to maintain
sufficient contrast with white button labels.

Safety Orange remains the main branding accent.

## 7. Dark Mode Design Tokens

.dark {
  --background: #020617;
  --foreground: #F8FAFC;

  --card: #0F172A;
  --card-foreground: #F8FAFC;

  --popover: #0F172A;
  --popover-foreground: #F8FAFC;

  --primary: #F97316;
  --primary-foreground: #0F172A;

  --secondary: #1E293B;
  --secondary-foreground: #E2E8F0;

  --muted: #1E293B;
  --muted-foreground: #94A3B8;

  --accent: #431407;
  --accent-foreground: #FDBA74;

  --destructive: #B91C1C;
  --destructive-foreground: #FFFFFF;

  --border: #334155;
  --input: #475569;
  --ring: #FB923C;

  --sidebar: #0F172A;
  --sidebar-foreground: #E2E8F0;
  --sidebar-muted: #94A3B8;
  --sidebar-border: #1E293B;
  --sidebar-accent: #1E293B;
  --sidebar-active: #F97316;
  --sidebar-active-foreground: #0F172A;

  --brand: #F97316;
  --success: #4ADE80;
  --warning: #FBBF24;
  --info: #60A5FA;
}

Dark mode status badges must use dedicated dark
background and foreground combinations.

Do not reuse light-mode badge backgrounds automatically.

Use next-themes or an equivalent hydration-safe
theme management implementation.

## 8. Layout Specifications

### Sidebar

Expanded width: 256px

Collapsed width: 72px

Background: Industrial Navy

Navigation item height: 44px

Navigation item radius: 8px

Horizontal padding: 12px

Navigation icon size: 20px

Navigation text size: 14px

Requirements:

- Group navigation items by section.
- Clearly indicate the active page.
- Provide hover feedback.
- Support sidebar collapse.
- Provide tooltips when collapsed.
- Use a drawer on mobile devices.
- Keep navigation visually consistent.

### Header

Height: 64px

Desktop horizontal padding: 24px

Mobile horizontal padding: 16px

Requirements:

- Sticky top positioning
- Subtle bottom border
- Page breadcrumb
- Global search
- Notifications
- Theme switcher
- User profile dropdown

Avoid excessive header height.

### Main Content

Desktop padding: 24px to 32px

Tablet padding: 20px

Mobile padding: 16px

Maximum content width: 1600px

Section gap: 24px

Content must remain aligned to a consistent layout grid.

## 9. Spacing System

Use a 4px-based spacing system.

- 4px: Extra small
- 8px: Small
- 12px: Compact
- 16px: Standard
- 20px: Medium
- 24px: Large
- 32px: Section spacing
- 40px: Extra large
- 48px: Major separation
- 64px: Page-level separation

Do not introduce arbitrary spacing values
without a clear design requirement.

## 10. Border Radius

- Small: 4px
- Medium: 6px
- Standard: 8px
- Card: 10px
- Dialog: 12px
- Large: 16px
- Full: 9999px

Use moderate corner rounding.

Avoid excessive pill-shaped containers.

The interface must maintain an industrial
and professional appearance.

## 11. Shadows

### Small Shadow

0 1px 2px rgba(15, 23, 42, 0.05)

### Medium Shadow

0 4px 12px rgba(15, 23, 42, 0.08)

### Large Shadow

0 12px 32px rgba(15, 23, 42, 0.12)

Use shadows sparingly.

Prefer subtle borders for standard cards and tables.

Reserve larger shadows for:

- Dialogs
- Dropdown menus
- Popovers
- Floating navigation

Avoid strong glow effects and decorative shadows.

## 12. Dashboard Design

The dashboard must include:

- Page heading
- Supporting description
- Date range filter
- KPI summary cards
- Primary analytics charts
- Inventory alerts
- Recent transactions
- Project overview

### KPI Cards

Minimum height: 120px

Padding: 20px

Border radius: 10px

Each card contains:

- Metric label
- Primary numerical value
- Supporting information
- Relevant icon
- Optional comparison indicator

Icons should use subtle tinted backgrounds.

Do not use decorative gradients on KPI cards.

Do not display fabricated percentage changes.

### Dashboard Grid

Large desktop:

- Four-column KPI grid
- Two-column analytics grid

Tablet:

- Two-column KPI grid

Mobile:

- One or two columns depending on available width

## 13. Buttons

### Primary Button

Background: Primary semantic color

Foreground: Primary foreground

Height: 40px

Radius: 8px

Usage:

- Add material
- Create project
- Submit request
- Save changes
- Receive inventory

### Secondary Button

Background: Secondary surface

Foreground: Primary text

Usage:

- Cancel
- Export
- Secondary actions

### Outline Button

Background: Transparent

Border: Standard border color

Usage:

- Filters
- Print
- View details
- Supporting actions

### Destructive Button

Background: Destructive semantic color

Foreground: White

Usage:

- Delete eligible records
- Reset data
- Confirm destructive actions

### Icon Button

Size: 36px to 44px

Requirements:

- Accessible label
- Tooltip where appropriate
- Visible hover and focus states

All buttons must provide:

- Hover state
- Active state
- Focus state
- Disabled state
- Loading state when applicable

## 14. Data Tables

Tables are the primary interface for inventory management.

Requirements:

- Clear column headings
- Consistent alignment
- Search functionality
- Column filters
- Sorting
- Pagination
- Row actions
- Empty states
- Responsive overflow handling

Table header:

- Background: Muted surface
- Font size: 12px to 13px
- Font weight: 600

Table row:

- Minimum height: 52px
- Horizontal padding: 16px
- Subtle bottom border

Use right alignment for:

- Quantities
- Unit prices
- Monetary values
- Numerical totals

Use left alignment for:

- Material names
- Project names
- Descriptions
- Supplier names

Use a dropdown menu for multiple row actions.

Avoid displaying too many action buttons per row.

## 15. Forms

Input height: 40px to 44px

Input radius: 8px

Label spacing: 8px

Field spacing: 16px

Form section spacing: 24px

Requirements:

- Visible labels
- Meaningful placeholders
- Required field indicators
- Inline validation
- Clear error messages
- Accessible keyboard interaction

Use appropriate input types:

- Text input
- Numeric input
- Currency input
- Select
- Date picker
- Textarea
- Checkbox
- Switch

Do not use placeholders as replacements for labels.

## 16. Dialogs and Drawers

Use dialogs for:

- Quick create forms
- Quick edit forms
- Confirmation messages
- Small record previews

Use full pages or large drawers for:

- Purchase orders
- Multi-item material requests
- Project details
- Complex equipment records

Dialog widths:

- Small: 400px
- Standard: 560px
- Large: 800px

On mobile, dialogs may become full-width sheets.

All dialogs must support keyboard dismissal,
focus management, and accessible titles.

## 17. Status Badges

### Inventory

- In Stock: Green
- Low Stock: Amber
- Out of Stock: Red

### Projects

- Planning: Slate
- Ongoing: Blue
- On Hold: Amber
- Completed: Green
- Cancelled: Slate

### Material Requests

- Pending: Amber
- Approved: Blue
- Rejected: Red
- Partially Fulfilled: Amber
- Fulfilled: Green
- Cancelled: Slate

### Equipment

- Available: Green
- Assigned: Blue
- Under Maintenance: Amber
- Damaged: Red
- Retired: Slate

### Purchase Orders

- Draft: Slate
- Pending: Amber
- Approved: Blue
- Ordered: Blue
- Partially Received: Amber
- Received: Green
- Cancelled: Slate

Status badges must contain readable text.

Never communicate status through color alone.

## 18. Iconography

Use Lucide React exclusively for interface icons.

Recommended icons:

- Dashboard: LayoutDashboard
- Materials: Package
- Categories: Layers
- Warehouses: Warehouse
- Stock Movements: ArrowLeftRight
- Projects: HardHat
- Material Requests: ClipboardList
- Equipment: Wrench
- Suppliers: Truck
- Purchase Orders: ShoppingCart
- Reports: ChartNoAxesCombined
- Activity Logs: History
- Settings: Settings
- Notifications: Bell
- Search: Search
- Add: Plus
- Edit: Pencil
- Delete: Trash2
- Export: Download
- Filter: SlidersHorizontal

Icon sizes:

- Inline: 14px to 16px
- Buttons: 16px to 18px
- Navigation: 20px
- KPI cards: 24px
- Empty states: 40px to 48px

Maintain consistent stroke widths.

Do not mix multiple icon libraries.

## 19. Data Visualization

Use Recharts for all application charts.

Chart palette:

- Orange: #F97316
- Blue: #2563EB
- Green: #16A34A
- Slate: #64748B
- Amber: #D97706
- Teal: #0D9488

Supported charts:

- Bar charts
- Line charts
- Area charts
- Donut charts
- Horizontal bar charts

Requirements:

- Responsive containers
- Readable axis labels
- Accessible legends
- Formatted tooltips
- Consistent colors across related charts
- Theme-aware chart styling
- Meaningful units and date labels

Do not aggregate incompatible material quantities
into a single misleading chart.

Use transaction counts or monetary values when
comparing materials with different measurement units.

Avoid:

- 3D charts
- Excessive gridlines
- Unnecessary animations
- Decorative gradients
- Unlabeled chart values

## 20. Empty States

Each module must provide a meaningful empty state.

Include:

- Relevant icon
- Short heading
- Supporting description
- Primary action when applicable

Example:

No materials found

Add your first construction material to begin
managing warehouse inventory.

Primary action: Add Material

## 21. Feedback and Notifications

Use Sonner or the shadcn/ui toast integration.

Notification types:

- Success
- Error
- Warning
- Information

Examples:

- Material added successfully.
- Warehouse transfer completed.
- Insufficient stock quantity.
- Purchase order received.
- Equipment assigned successfully.

Keep notifications concise and actionable.

Use inline errors for form validation.

## 22. Animation and Motion

Standard transition duration: 150ms to 200ms

Sidebar transition: 200ms

Dialog transition: 150ms to 200ms

Use subtle transitions for:

- Hover states
- Sidebar collapse
- Dropdown menus
- Dialog appearance
- Theme switching

Respect prefers-reduced-motion.

Avoid:

- Excessive entrance animations
- Bouncing components
- Continuous decorative animations
- Animated gradients
- Heavy parallax effects

## 23. Responsive Breakpoints

Use standard Tailwind CSS breakpoints:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

Mobile:

- Drawer sidebar
- Stacked content
- Full-width forms
- Touch-friendly controls

Tablet:

- Collapsible sidebar
- Two-column layouts

Desktop:

- Expanded sidebar
- Multi-column dashboard
- Full data tables

## 24. Accessibility Requirements

- Maintain WCAG AA text contrast.
- Use visible keyboard focus indicators.
- Provide accessible names for icon buttons.
- Use semantic landmarks.
- Support keyboard navigation.
- Provide alternative text for meaningful images.
- Avoid color-only status communication.
- Support reduced-motion preferences.

## 25. Design Restrictions

DO NOT use:

- Excessive glassmorphism
- Neon colors
- Unnecessary gradients
- Oversized typography
- Excessive rounded corners
- Decorative 3D elements
- Generic AI-generated dashboard styling
- Inconsistent icon sizes
- Excessive whitespace
- Unnecessary nested cards
- Unreadable low-contrast text
- Fake analytics or meaningless statistics

## 26. Final Design Direction

DCIMS must have a professional industrial identity.

The application should feel:

- Structured
- Modern
- Efficient
- Reliable
- Data-driven
- Enterprise-ready in appearance

Prioritize usability and visual consistency over
decorative interface elements.

Every module must follow this design system.