"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/constants/demo-accounts";
import { useDomainStore } from "@/stores/domain-store";
import { useSessionStore } from "@/stores/session-store";
import type { DemoAccount } from "@/constants/demo-accounts";

export function LoginForm() {
  const router = useRouter();
  const signIn = useSessionStore((state) => state.signIn);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].user.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function chooseRole(account: DemoAccount) {
    setEmail(account.user.email);
    setPassword(account.password);
    setError(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const success = signIn(email, password);
    if (!success) {
      setSubmitting(false);
      setError("That email and password do not match an account.");
      return;
    }

    // Keep the domain actor in step with the signed-in identity, so activity
    // entries are attributed to the role currently exploring the demo.
    const account = DEMO_ACCOUNTS.find(
      (candidate) => candidate.user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (account) {
      const state = useDomainStore.getState();
      state.updateSettings({ ...state.settings, demoUser: account.user });
    }

    router.replace("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => {
              setEmail(event.currentTarget.value);
              setError(null);
            }}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
              setError(null);
            }}
            required
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-[0.8125rem] text-error-foreground"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="gap-2">
          <LockKeyhole aria-hidden="true" />
          Sign in
        </Button>
      </form>

      <div className="rounded-card border border-border bg-card p-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Test accounts
        </p>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          Pick an account to fill the form. Every account uses the password{" "}
          <span className="font-mono text-foreground">{DEMO_PASSWORD}</span>.
        </p>

        <ul className="mt-2 flex flex-col divide-y divide-border">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.user.id}>
              <button
                type="button"
                onClick={() => chooseRole(account)}
                className="flex w-full items-center gap-3 rounded-sm px-1 py-2 text-left transition-colors duration-150 ease-out hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-[0.6875rem] font-semibold"
                >
                  {account.user.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {account.user.name}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-muted-foreground">
                    {account.user.role} · {account.user.email}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground">
                    {account.blurb}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-border" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
