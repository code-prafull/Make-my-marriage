const tones = {
  wine: "bg-wine-100 text-wine-800 border-wine-200",
  gold: "bg-gold-300/30 text-gold-600 border-gold-400/40",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-wine-50 text-wine-500 border-wine-200",
};

/** Small status/priority chip. */
export default function Badge({ tone = "wine", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
