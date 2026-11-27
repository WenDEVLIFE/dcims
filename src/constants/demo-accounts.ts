import type { DemoUser, DemoUserRole } from "@/types/domain";

/**
 * Demo accounts for the simulated login.
 *
 * These credentials are published on the login screen on purpose: they are a
 * role-switching mechanism for a portfolio demo, not a security boundary. Any
 * claim of access control here would be false.
 */

export interface DemoAccount {
  user: DemoUser;
  password: string;
  /** Shown on the login screen so a visitor can pick a role. */
  blurb: string;
}

export const DEMO_PASSWORD = "dcims2026";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    user: {
      id: "usr-warehouse",
      name: "Mara Villanueva",
      role: "Warehouse supervisor",
      email: "warehouse@dcims.example",
      initials: "MV",
    },
    password: DEMO_PASSWORD,
    blurb: "Receives deliveries, transfers stock, releases requests.",
  },
  {
    user: {
      id: "usr-procurement",
      name: "Rafael Montaño",
      role: "Procurement officer",
      email: "procurement@dcims.example",
      initials: "RM",
    },
    password: DEMO_PASSWORD,
    blurb: "Drafts and approves purchase orders, tracks suppliers.",
  },
  {
    user: {
      id: "usr-engineer",
      name: "Karlo Bautista",
      role: "Project engineer",
      email: "engineer@dcims.example",
      initials: "KB",
    },
    password: DEMO_PASSWORD,
    blurb: "Raises material requests and records site consumption.",
  },
  {
    user: {
      id: "usr-clerk",
      name: "Grace Villamor",
      role: "Inventory clerk",
      email: "clerk@dcims.example",
      initials: "GV",
    },
    password: DEMO_PASSWORD,
    blurb: "Maintains the material catalogue and cycle counts.",
  },
];

export function findAccount(
  email: string,
  password: string,
): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (account) =>
      account.user.email.toLowerCase() === normalized &&
      account.password === password,
  );
}

export function accountForRole(role: DemoUserRole): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((account) => account.user.role === role);
}
