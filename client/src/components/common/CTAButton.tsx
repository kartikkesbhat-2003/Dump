// components/ui/CTAButton.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CTAButtonProps {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CTAButton = ({
  label,
  href,
  variant = "primary",
  icon,
  className,
  size = "md",
}: CTAButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 border border-border",
    ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2 text-sm",
    lg: "h-10 px-6 py-2.5 text-base",
  };


  return (
    <Link
      to={href}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </Link>
  );
};
