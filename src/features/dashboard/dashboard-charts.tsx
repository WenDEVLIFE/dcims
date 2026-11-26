"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/shared/chart-container";
import { formatCentavos, formatCompactCentavos } from "@/lib/currency";
import type { SeriesPoint } from "@/stores/selectors";

/**
 * Chart palette comes from the --chart-* tokens so no component renders a
 * library default colour. Quantities are never summed across units: movement
 * charts use transaction counts, value charts use currency.
 */

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const AXIS_STYLE = {
  fontSize: 11,
  fill: "var(--color-muted-foreground)",
} as const;

const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: 12,
  color: "var(--color-popover-foreground)",
} as const;

interface MovementChartProps {
  data: SeriesPoint[];
}

export function MonthlyMovementChart({ data }: MovementChartProps) {
  return (
    <ChartContainer
      title="Stock movements"
      description="Transactions recorded per month. Counts, not quantities, because units differ."
    >
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          formatter={(value) => [
            `${Number(value ?? 0)} transactions`,
            "Movements",
          ]}
        />
        <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function CategoryValueChart({ data }: MovementChartProps) {
  return (
    <ChartContainer
      title="Inventory value by category"
      description="Weighted-average valuation of stock on hand."
    >
      <PieChart>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => formatCentavos(Number(value ?? 0))}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={45}
          outerRadius={85}
          paddingAngle={1}
          stroke="var(--color-card)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.label}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function WarehouseValueChart({ data }: MovementChartProps) {
  return (
    <ChartContainer
      title="Inventory value by warehouse"
      description="Where the capital currently sits."
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatCompactCentavos(value)}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={96}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => formatCentavos(Number(value ?? 0))}
        />
        <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function ProjectExpenditureChart({ data }: MovementChartProps) {
  return (
    <ChartContainer
      title="Project material expenditure"
      description="Value of stock released to each active site."
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatCompactCentavos(value)}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={130}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => formatCentavos(Number(value ?? 0))}
        />
        <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function ProcurementTrendChart({ data }: MovementChartProps) {
  return (
    <ChartContainer
      title="Procurement spend"
      description="Committed purchase order value by month."
    >
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatCompactCentavos(value)}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => formatCentavos(Number(value ?? 0))}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS[0] }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
