import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "state-layer inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,box-shadow] disabled:pointer-events-none disabled:opacity-40 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  filled: "bg-primary text-on-primary hover:shadow-1",
  tonal: "bg-primary-container text-on-primary-container",
  outlined: "border border-outline text-primary bg-transparent",
  text: "text-primary bg-transparent",
  danger: "bg-error text-on-error hover:shadow-1",
  success: "bg-success text-on-success hover:shadow-1",
};

/** sm 32px, md 40px (desktop default), lg 48px (field default — meets the 48px touch target). */
const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-lg",
  md: "h-10 px-5 text-label-lg",
  lg: "h-12 px-6 text-title-md",
};

export function buttonClasses({
  variant = "filled",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], block && "w-full", className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  variant,
  size,
  block,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, block, className })} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
