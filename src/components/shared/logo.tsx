import Image from "next/image";
import brandLogo from "../../../public/dcims.png";
import brandIcon from "../../../public/dcims-icon.png";

type LogoProps = {
  variant?: "full" | "compact";
  decorative?: boolean;
};

export function Logo({ variant = "full", decorative = false }: LogoProps) {
  const compact = variant === "compact";

  return (
    <Image
      src={compact ? brandIcon : brandLogo}
      alt={decorative ? "" : "Davao Construction Inventory Management System"}
      sizes={compact ? "48px" : "(max-width: 400px) 100vw, 384px"}
      className={
        compact
          ? "size-12 rounded-md object-contain"
          : "h-auto w-full max-w-sm rounded-card bg-brand-surface object-contain"
      }
    />
  );
}
