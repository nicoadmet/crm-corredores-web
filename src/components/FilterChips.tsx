// Fila de chips seleccionables para filtrar una lista (selección única, con opción "Todos").
// Se usa en celular; en escritorio los mismos filtros se muestran como desplegables (FilterSelect).
export function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex-shrink-0 text-xs text-ink-faint">{label}:</span>
      <button
        type="button"
        onClick={() => onChange("")}
        aria-pressed={value === ""}
        className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
          value === "" ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        Todos
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
            value === opt.value ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
