import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
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
    "Davao Construction Inventory Management System — a frontend demonstration of construction inventory workflows.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PH" className="min-h-full" suppressHydrationWarning>
      <body className={`${manrope.variable} ${jetBrainsMono.variable} min-h-dvh font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
