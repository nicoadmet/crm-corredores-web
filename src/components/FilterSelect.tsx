// Filtro de selección única como desplegable, para la barra de herramientas del escritorio.
// (En celular los mismos filtros se muestran como fila de chips: ver FilterChips.)
import { useState } from "react";

export function FilterSelect({
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
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      {open && (
        <button type="button" aria-label="Cerrar filtro" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
      )}

      <div
        className={`flex h-7 items-center rounded-lg border text-xs font-medium transition-colors ${
          selected ? "border-teal-200 bg-teal-50 text-teal-700" : "border-hairline bg-surface text-ink-soft hover:bg-gray-50"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-full items-center gap-1.5 rounded-lg px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {selected ? `${label}: ${selected.label}` : label}
          {!selected && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-ink-faint">
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </button>

        {selected && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Quitar filtro de ${label.toLowerCase()}`}
            className="flex h-full items-center pr-2 pl-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-3 w-3">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div role="listbox" className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`flex w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-gray-50 ${
              value === "" ? "font-semibold text-teal-700" : "text-ink-soft"
            }`}
          >
            Todos
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-gray-50 ${
                value === option.value ? "font-semibold text-teal-700" : "text-ink-soft"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
