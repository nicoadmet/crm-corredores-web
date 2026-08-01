// Fila de chips seleccionables para filtrar una lista (selección única, con opción "Todos").
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
      <span className="text-xs text-gray-500 flex-shrink-0">{label}:</span>
      <button
        onClick={() => onChange("")}
        className={`text-xs px-2 py-1 rounded-full border ${
          value === "" ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        Todos
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs px-2 py-1 rounded-full border ${
            value === opt.value ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
