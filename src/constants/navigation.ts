import {
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Inventory",
    items: [
      { label: "Materials", href: "/materials", icon: Package },
      { label: "Categories", href: "/categories", icon: Tags },
      { label: "Warehouses", href: "/warehouses", icon: Warehouse },
      {
        label: "Stock movements",
        href: "/stock-movements",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Projects", href: "/projects", icon: HardHat },
      {
        label: "Material requests",
        href: "/material-requests",
        icon: ClipboardList,
      },
      { label: "Equipment", href: "/equipment", icon: Wrench },
    ],
  },
  {
    label: "Procurement",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Purchase orders", href: "/purchase-orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Activity logs", href: "/activity-logs", icon: ScrollText },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const HOME_ROUTE = "/dashboard";
