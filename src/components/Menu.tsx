// Menú de acciones que se abre desde el botón "⋯" de una fila. Las acciones secundarias de cada
// propiedad o lead viven acá en vez de estar todas visibles: en una lista de 10 filas, cinco links
// por fila son cincuenta cosas para leer.
import { useState } from "react";
import type { ReactNode } from "react";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

export function Menu({ items, label = "Más acciones" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-shrink-0">
      {open && (
        <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-gray-100 hover:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
          <path d="M12 5h.01M12 12h.01M12 19h.01" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-ink-soft hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
