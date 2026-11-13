import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Form input with label, error message and optional password visibility toggle.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = "text",
    id,
    className = "",
    togglePassword = false,
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && togglePassword ? (visible ? "text" : "password") : type;
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-wine-900"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={error ? "true" : undefined}
          className={`block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-wine-950 placeholder:text-wine-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-wine-50 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-wine-200 focus:border-wine-500 focus:ring-wine-100"
          } ${togglePassword ? "pr-11" : ""} ${className}`}
          {...props}
        />

        {isPassword && togglePassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-wine-400 transition-colors hover:text-wine-700"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-wine-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
