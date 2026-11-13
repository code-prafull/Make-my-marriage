import { forwardRef } from "react";

/** Styled textarea with label + error message. */
const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, rows = 4, className = "", ...props },
  ref
) {
  const areaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-wine-900">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        className={`block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-wine-950 placeholder:text-wine-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-wine-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-wine-200 focus:border-wine-500 focus:ring-wine-100"
        } ${className}`}
        {...props}
      />

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

export default Textarea;
