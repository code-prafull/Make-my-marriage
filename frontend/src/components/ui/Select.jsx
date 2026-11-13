import { forwardRef } from "react";

/** Styled native select with label + error message. */
const Select = forwardRef(function Select(
  { label, error, hint, id, className = "", children, ...props },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-wine-900">
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? "true" : undefined}
        className={`block w-full appearance-none rounded-xl border bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23a22653%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-wine-950 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-wine-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-wine-200 focus:border-wine-500 focus:ring-wine-100"
        } ${className}`}
        {...props}
      >
        {children}
      </select>

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

export default Select;
