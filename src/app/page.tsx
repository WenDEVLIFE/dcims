import { Logo } from "@/components/shared/logo";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

export default function Home() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-3xl content-center gap-6 px-4 py-8 md:px-5 lg:px-8">
      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>
      <section className="grid gap-4 rounded-card border border-border border-t-4 border-t-brand bg-card p-4 text-card-foreground shadow-sm sm:p-6">
        <Logo decorative />
        <h1>Davao Construction Inventory Management System</h1>
        <p className="text-base leading-6 text-muted-foreground">
          Building Efficiency. Managing Resources.
        </p>
        <p className="text-muted-foreground">
          Explore a frontend demonstration of construction inventory, warehouse,
          procurement, and equipment workflows using simulated data.
        </p>
      </section>
    </main>
  );
}
