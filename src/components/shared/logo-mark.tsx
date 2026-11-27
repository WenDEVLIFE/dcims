import Image from "next/image";

import iconDark from "../../../public/dcims-icon-dark.png";
import iconLight from "../../../public/dcims-icon-light.png";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  /** Rendered width and height in pixels; the artwork is square. */
  size?: number;
  priority?: boolean;
  /**
   * Forces the light-artwork export. Use it on surfaces that stay dark in both
   * themes, such as the navigation rail, where a theme-based swap would put
   * navy artwork on navy.
   */
  onDark?: boolean;
  className?: string;
}

/**
 * Brand mark with one transparent asset per theme.
 *
 * The artwork is navy by design, so a single file disappears on dark surfaces.
 * Two exports of the same mark are swapped by the theme class instead of
 * recolouring with CSS filters, which would distort the orange accent.
 */
export function LogoMark({
  size = 32,
  priority = false,
  onDark = false,
  className,
}: LogoMarkProps) {
  if (onDark) {
    return (
      <Image
        src={iconDark}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={iconLight}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0 object-contain dark:hidden", className)}
      />
      <Image
        src={iconDark}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={cn("hidden shrink-0 object-contain dark:block", className)}
      />
    </>
  );
}
