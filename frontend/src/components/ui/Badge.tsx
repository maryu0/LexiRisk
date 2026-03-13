import React from "react";
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-colors";
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700 font-semibold",
    warning: "bg-amber-100 text-amber-700 font-semibold",
    danger: "bg-red-100 text-red-700 font-semibold",
    info: "bg-sky-100 text-sky-700 font-semibold",
    outline: "border border-slate-200 text-slate-500 bg-transparent",
  };
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };
  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
