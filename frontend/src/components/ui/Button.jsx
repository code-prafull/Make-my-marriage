import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-wine-700 text-white hover:bg-wine-800 focus-visible:ring-wine-600 shadow-sm shadow-wine-900/20",
  secondary:
    "bg-white text-wine-800 border border-wine-200 hover:bg-wine-50 focus-visible:ring-wine-400",
  ghost:
    "text-wine-700 hover:bg-wine-100 focus-visible:ring-wine-400",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-wine-50 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
