# TYPOGRAPHY.md — DCIMS Typography System

## 1. Typography Overview

The DCIMS typography system is designed for a modern
construction inventory management platform.

Typography must communicate:

- Professionalism
- Clarity
- Precision
- Reliability
- Readability
- Information hierarchy

The application is data-intensive.

Typography must prioritize readable tables, forms,
numerical values, dashboard metrics, and navigation.

## 2. Font Families

### Application Font — Manrope

Font Family: Manrope

Category: Sans-serif

Usage:

- Page titles
- Section headings
- Dashboard headings
- KPI values
- Body text
- Navigation
- Data tables
- Forms
- Buttons
- Dialog content
- Descriptions
- Notifications
- General interface text

Supported weights:

- 400 Regular
- 500 Medium
- 600 SemiBold
- 700 Bold
- 800 ExtraBold

Manrope is the default application font. It carries both
visual hierarchy and body text; weight, size, and color
create the hierarchy that a second text family would
otherwise provide.

Do not introduce a second text family.

Specification note:

This system previously specified Inter as the primary
text face. Inter, Geist, Space Grotesk, and Poppins are
excluded by the project's anti-ai-slop design rules, which
also cap the interface at two font families. Manrope plus
JetBrains Mono satisfies both constraints without adding a
typeface. This amendment is approved and supersedes the
earlier Inter specification.

### Monospace Font — JetBrains Mono

Font Family: JetBrains Mono

Category: Monospace

Usage:

- Material SKU
- Asset codes
- Reference numbers
- Transaction identifiers
- Purchase order numbers
- Warehouse codes
- Technical identifiers

Supported weights:

- 400 Regular
- 500 Medium
- 600 SemiBold

Do not use monospace fonts for general body text.

Use tabular numerals with Manrope for
most financial and numerical values.

## 3. Next.js Font Configuration

Use next/font/google to load fonts.

File:

src/app/layout.tsx

Implementation:

import type { Metadata } from "next";
import {
  Manrope,
  JetBrains_Mono,
} from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DCIMS",
    template: "%s | DCIMS",
  },
  description:
    "Davao Construction Inventory Management System",
  icons: {
    icon: "/dcims-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      <body
        className={[
          manrope.variable,
          jetbrainsMono.variable,
          "font-sans",
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}

Merge this configuration with existing application
providers and layout components.

Do not remove existing theme or state providers.

The dcims-icon.png file must exist before referencing it.

Use either metadata-based icons or Next.js file-based
icons consistently to avoid duplicate configuration.

## 4. Tailwind CSS Font Configuration

For Tailwind CSS v4, configure font tokens
inside src/app/globals.css.

@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-manrope);
  --font-heading: var(--font-manrope);
  --font-mono: var(--font-jetbrains-mono);
}

body {
  font-family: var(--font-manrope), Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-manrope), Arial, sans-serif;
}

code,
pre,
.font-mono {
  font-family: var(--font-jetbrains-mono), monospace;
}

.numeric {
  font-variant-numeric: tabular-nums;
}

Merge these declarations with the existing
shadcn/ui theme configuration.

Do not replace existing semantic color tokens.

## 5. Typography Scale

### Display

Font: Manrope

Size: 40px

Line Height: 48px

Weight: 800

Letter Spacing: -0.04em

Usage:

- Large welcome headings
- Special overview sections

Use sparingly inside the dashboard.

### Heading 1

Font: Manrope

Size: 30px

Line Height: 38px

Weight: 700

Letter Spacing: -0.025em

Usage:

- Main page titles
- Dashboard title
- Module titles

Tailwind:

font-heading text-[30px] leading-[38px]
font-bold tracking-tight

### Heading 2

Font: Manrope

Size: 24px

Line Height: 32px

Weight: 700

Letter Spacing: -0.02em

Usage:

- Major section headings
- Detail page headings
- Report headings

Tailwind:

font-heading text-2xl leading-8
font-bold tracking-tight

### Heading 3

Font: Manrope

Size: 20px

Line Height: 28px

Weight: 600

Letter Spacing: -0.015em

Usage:

- Dashboard section headings
- Form section headings
- Dialog headings

Tailwind:

font-heading text-xl leading-7 font-semibold

### Heading 4

Font: Manrope

Size: 18px

Line Height: 26px

Weight: 600

Usage:

- Card headings
- Subsection headings

Tailwind:

font-heading text-lg leading-[26px] font-semibold

### Heading 5

Font: Manrope

Size: 16px

Line Height: 24px

Weight: 600

Usage:

- Compact card headings
- Table section headings
- Form groups

Tailwind:

text-base leading-6 font-semibold

### Body Large

Font: Manrope

Size: 16px

Line Height: 24px

Weight: 400

Usage:

- Page descriptions
- Important supporting content

Tailwind:

text-base leading-6 font-normal

### Body Default

Font: Manrope

Size: 14px

Line Height: 21px

Weight: 400

Usage:

- General interface text
- Table content
- Form content
- Dialog content

Tailwind:

text-sm leading-[21px] font-normal

### Body Small

Font: Manrope

Size: 13px

Line Height: 20px

Weight: 400

Usage:

- Secondary information
- Metadata
- Supporting descriptions

Tailwind:

text-[13px] leading-5 font-normal

### Caption

Font: Manrope

Size: 12px

Line Height: 16px

Weight: 400

Usage:

- Timestamps
- Chart labels
- Helper text
- Supporting metadata

Tailwind:

text-xs leading-4 font-normal

### Overline

Font: Manrope

Size: 11px

Line Height: 16px

Weight: 600

Letter Spacing: 0.06em

Text Transform: Uppercase

Usage:

- Sidebar navigation groups
- Small section labels

Tailwind:

text-[11px] leading-4 font-semibold
tracking-wider uppercase

## 6. Font Weight Guidelines

### Regular — 400

Use for:

- Body text
- Descriptions
- General table content
- Supporting information

### Medium — 500

Use for:

- Navigation items
- Buttons
- Form labels
- Important table values

### SemiBold — 600

Use for:

- Section headings
- Card headings
- Active navigation
- Table headings
- Status labels

### Bold — 700

Use for:

- Main page titles
- KPI values
- Financial totals
- Important numerical information

### ExtraBold — 800

Use only for:

- Large display headings
- Special branding elements

Do not use bold text excessively.

Maintain a clear distinction between
primary and secondary information.

## 7. Dashboard Typography

### KPI Label

Font: Manrope

Size: 13px

Weight: 500

Color: Muted foreground

Example:

Total Inventory Value

### KPI Value

Font: Manrope

Size: 28px to 32px

Weight: 700

Line Height: 1.2

Letter Spacing: -0.025em

Use tabular numerals.

Example:

₱4,825,600.00

### KPI Supporting Text

Font: Manrope

Size: 12px

Weight: 400

Color: Muted foreground

### Chart Title

Font: Manrope

Size: 16px

Weight: 600

### Chart Description

Font: Manrope

Size: 13px

Weight: 400

### Chart Axis Labels

Font: Manrope

Size: 11px to 12px

Weight: 400

### Chart Tooltip

Font: Manrope

Size: 13px

Weight: 500

All chart values must remain readable in both themes.

## 8. Navigation Typography

### Sidebar Section Labels

Font: Manrope

Size: 11px

Weight: 600

Letter Spacing: 0.06em

Text Transform: Uppercase

Color: Sidebar muted foreground

### Sidebar Navigation Items

Font: Manrope

Size: 14px

Weight: 500

Line Height: 20px

### Active Navigation Item

Font: Manrope

Size: 14px

Weight: 600

Use the active navigation foreground token.

### Breadcrumbs

Font: Manrope

Size: 13px

Weight: 400

Current breadcrumb:

Weight: 500

Color: Foreground

## 9. Data Table Typography

### Column Headers

Font: Manrope

Size: 12px to 13px

Weight: 600

Line Height: 18px

Use sentence case.

Examples:

- Material name
- Available stock
- Unit cost
- Warehouse
- Status

### Table Cell Content

Font: Manrope

Size: 14px

Weight: 400

Line Height: 20px

### Primary Record Name

Font: Manrope

Size: 14px

Weight: 500

### Secondary Record Information

Font: Manrope

Size: 12px

Weight: 400

Color: Muted foreground

### Numerical Cells

Font: Manrope

Size: 14px

Weight: 500

Alignment: Right

Use tabular numerals.

### Record Identifiers

Font: JetBrains Mono

Size: 12px

Weight: 500

Examples:

MAT-0001
WH-MATINA-01
PO-2026-001
REQ-2026-015
EQP-0008

Avoid excessive letter spacing on identifiers.

## 10. Form Typography

### Form Label

Font: Manrope

Size: 14px

Weight: 500

Line Height: 20px

### Input Text

Font: Manrope

Size: 14px

Weight: 400

Line Height: 20px

On mobile, use 16px input text where necessary
to prevent automatic browser zoom.

### Placeholder

Font: Manrope

Size: Inherit from input

Weight: 400

Color: Muted foreground

### Helper Text

Font: Manrope

Size: 12px

Weight: 400

Line Height: 18px

### Error Message

Font: Manrope

Size: 12px to 13px

Weight: 500

Color: Destructive foreground appropriate to surface

### Required Field Indicator

Use a small asterisk next to the label.

Provide accessible required-field semantics.

## 11. Button Typography

### Primary Buttons

Font: Manrope

Size: 14px

Weight: 600

Line Height: 20px

### Secondary Buttons

Font: Manrope

Size: 14px

Weight: 500

### Small Buttons

Font: Manrope

Size: 12px to 13px

Weight: 500

### Large Buttons

Font: Manrope

Size: 15px to 16px

Weight: 600

Use sentence case for button labels.

Correct:

- Add material
- Create project
- Save changes
- Export report
- Receive inventory

Avoid:

- ADD MATERIAL
- CREATE PROJECT
- SAVE CHANGES

## 12. Status Badge Typography

Font: Manrope

Size: 11px to 12px

Weight: 600

Line Height: 16px

Use readable sentence case labels.

Examples:

- In stock
- Low stock
- Out of stock
- Pending
- Approved
- Completed
- Under maintenance

Do not use oversized badges.

Do not use all-uppercase text for every status.

## 13. Currency Formatting

All financial values must use Philippine Peso formatting.

Locale: en-PH

Currency: PHP

Currency Symbol: ₱

Default decimal places: 2

Example:

₱1,250.00
₱45,000.00
₱4,825,600.00

Recommended utility:

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

The amount parameter represents pesos.

Convert integer centavos to pesos before formatting.

Use compact currency formatting only when necessary
for dashboard cards and chart labels.

Example:

₱4.83M

Always provide the exact amount in a tooltip
or supporting detail when using compact formatting.

## 14. Number Formatting

Use locale-aware numerical formatting.

Recommended utility:

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 3,
  }).format(value);
}

Examples:

1,250
24,500
2.75
150.125

Do not display unnecessary trailing zeros.

Material quantities must support appropriate
decimal precision based on their unit.

Examples:

250 bags
120 pcs
15.5 m³
2,500 kg
45.75 m²

## 15. Date and Time Formatting

Locale: en-PH

Timezone: Asia/Manila

Preferred date format:

Nov 25, 2026

Preferred time format:

1:30 PM

Preferred transaction timestamp:

Nov 25, 2026, 1:30 PM

Recommended utility:

export function formatDate(
  value: string | Date
): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

export function formatDateTime(
  value: string | Date
): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(date);
}

Validate date values before formatting.

Treat calendar-only dates separately from timestamps
to avoid unintended timezone shifts.

## 16. Responsive Typography

### Desktop

Page title: 30px

Section heading: 24px

Card heading: 18px

Body: 14px

KPI value: 32px

### Tablet

Page title: 26px

Section heading: 22px

Card heading: 18px

Body: 14px

KPI value: 28px

### Mobile

Page title: 24px

Section heading: 20px

Card heading: 16px

Body: 14px

KPI value: 24px to 28px

Example responsive page title:

font-heading text-2xl md:text-[26px]
lg:text-[30px] font-bold tracking-tight

Example responsive KPI value:

font-heading text-2xl md:text-[28px]
lg:text-[32px] font-bold tabular-nums

Do not allow large currency values to overflow cards.

Use responsive font sizing or compact formatting
when necessary.

## 17. Text Color Hierarchy

### Primary Text

Light mode: #0F172A

Dark mode: #F8FAFC

Usage:

- Page headings
- Primary content
- Important numerical values

### Secondary Text

Light mode: #334155

Dark mode: #CBD5E1

Usage:

- Supporting content
- Form descriptions
- Secondary table values

### Muted Text

Light mode: #475569

Dark mode: #94A3B8

Usage:

- Metadata
- Captions
- Helper text
- Timestamps

### Brand Text

Light mode: #C2410C

Dark mode: #FB923C

Usage:

- Important links
- Brand accents
- Selected text elements

Use semantic theme tokens instead of hardcoding
colors directly inside individual components.

## 18. Text Alignment

Use left alignment for:

- Page headings
- Paragraphs
- Navigation
- Forms
- Record names
- Descriptions

Use right alignment for:

- Monetary values
- Quantities
- Numerical totals
- Financial table columns

Use center alignment for:

- Empty states
- Small status indicators
- Confirmation messages
- Selected branding sections

Avoid center-aligned paragraphs in data-heavy pages.

## 19. Text Truncation

Use text truncation only when necessary.

Single-line truncation:

truncate

Multi-line truncation:

line-clamp-2

Requirements:

- Provide access to complete record names.
- Use tooltips for truncated identifiers when useful.
- Allow important descriptions to wrap.
- Never hide critical validation messages.
- Avoid truncating financial totals.

## 20. Accessibility

- Maintain readable text contrast.
- Use semantic heading hierarchy.
- Support browser zoom.
- Avoid text smaller than 11px.
- Prefer at least 12px for secondary content.
- Maintain sufficient line height.
- Do not rely on font weight alone to indicate status.
- Avoid long uppercase sentences.
- Do not disable user text scaling.

Heading levels must represent document structure,
not merely visual appearance.

## 21. Typography Restrictions

DO NOT use:

- More than two font families
- Decorative script fonts
- Serif fonts for general interface text
- Excessive uppercase text
- Excessive bold text
- Oversized dashboard headings
- Extremely tight letter spacing
- Low-contrast metadata
- Monospace fonts for general paragraphs
- Inconsistent font sizes between similar components

## 22. Final Typography Direction

DCIMS typography must be clean, compact,
professional, and suitable for data-intensive interfaces.

Use:

- Manrope for visual hierarchy, headings, and general
  application readability.
- JetBrains Mono for technical identifiers.
- Tabular numerals for financial and inventory values.

All typography must remain consistent across:

- Dashboard
- Materials
- Warehouses
- Projects
- Equipment
- Procurement
- Reports
- Settings

Every component must follow this typography system.