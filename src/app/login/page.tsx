import { LoginForm } from "@/features/auth/login-form";
import { Logo } from "@/components/shared/logo";

export const metadata = {
  title: "Sign in",
  description: "Sign in to the DCIMS portfolio demonstration with a demo account.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Logo decorative priority />

        <div className="max-w-md">
          <h1 className="text-2xl leading-8 font-bold tracking-tight">
            Davao Construction Inventory Management System
          </h1>
          <p className="mt-3 text-sm leading-6 text-sidebar-muted">
            A frontend-only demonstration of construction inventory, warehouse,
            procurement, and equipment workflows using simulated data stored in this
            browser.
          </p>
          <p className="mt-4 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-sidebar-muted">
            Sign-in is simulated. The accounts below are published credentials for
            switching roles, not a security boundary — nothing here protects data or
            enforces permissions.
          </p>
        </div>

        <p className="text-xs text-sidebar-muted">
          en-PH · PHP · Asia/Manila · v0.1.0
        </p>
      </section>

      <section className="flex flex-col justify-center bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <Logo decorative priority />
          </div>
          <h2 className="text-xl leading-7 font-semibold">Sign in</h2>
          <p className="mt-1 mb-6 text-[0.8125rem] text-muted-foreground">
            Choose a demo role to explore the modules as that persona.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
