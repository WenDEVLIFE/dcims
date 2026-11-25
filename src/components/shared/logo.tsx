import Image from "next/image";

import { cn } from "@/lib/utils";
import brandLogo from "../../../public/dcims.png";
import brandIcon from "../../../public/dcims-icon.png";

type LogoProps = {
  variant?: "full" | "compact";
  decorative?: boolean;
  priority?: boolean;
  className?: string;
};

/**
 * Brand artwork. This renders the approved assets as-is; sizing is the
 * caller's responsibility, since the full logo carries a tagline that needs
 * generous width to stay legible.
 */
export function Logo({
  variant = "full",
  decorative = false,
  priority = false,
  className,
}: LogoProps) {
  const compact = variant === "compact";

  return (
    <Image
      src={compact ? brandIcon : brandLogo}
      alt={decorative ? "" : "Davao Construction Inventory Management System"}
      sizes={compact ? "48px" : "(max-width: 400px) 100vw, 384px"}
      priority={priority}
      className={cn(
        compact
          ? "size-12 rounded-md object-contain"
          : "h-auto w-full max-w-sm rounded-card bg-brand-surface object-contain",
        className,
      )}
    />
  );
}
