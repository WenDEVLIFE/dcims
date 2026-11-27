import { describe, expect, it } from "vitest";

import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  accountForRole,
  findAccount,
} from "@/constants/demo-accounts";

describe("demo accounts", () => {
  it("provides one account per role", () => {
    const roles = DEMO_ACCOUNTS.map((account) => account.user.role);
    expect(new Set(roles).size).toBe(roles.length);
    expect(roles).toHaveLength(4);
    expect(accountForRole("Warehouse supervisor")).toBeDefined();
    expect(accountForRole("Procurement officer")).toBeDefined();
    expect(accountForRole("Project engineer")).toBeDefined();
    expect(accountForRole("Inventory clerk")).toBeDefined();
  });

  it("uses unique emails and ids", () => {
    const emails = DEMO_ACCOUNTS.map((account) => account.user.email.toLowerCase());
    const ids = DEMO_ACCOUNTS.map((account) => account.user.id);
    expect(new Set(emails).size).toBe(emails.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("accepts published credentials case-insensitively and rejects others", () => {
    const account = DEMO_ACCOUNTS[0];
    expect(findAccount(account.user.email.toUpperCase(), DEMO_PASSWORD)).toBeDefined();
    expect(findAccount(`  ${account.user.email}  `, DEMO_PASSWORD)).toBeDefined();
    expect(findAccount(account.user.email, "wrong-password")).toBeUndefined();
    expect(findAccount("nobody@dcims.example", DEMO_PASSWORD)).toBeUndefined();
  });
});
