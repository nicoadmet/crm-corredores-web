// Piezas compartidas de los formularios. Existen para que los tres (propiedad, lead, evento) se vean
// y se comporten igual, y para que los campos tengan 44px de alto: se cargan parado en la calle,
// con el pulgar, no sentado con mouse.
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const CONTROL =
  "h-11 w-full rounded-xl border border-gray-300 bg-surface px-3 text-[15px] text-ink transition-colors placeholder:text-ink-faint focus:border-teal-500 focus:outline-none sm:h-10 sm:text-sm";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`w-full rounded-xl border border-gray-300 bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-ink transition-colors placeholder:text-ink-faint focus:border-teal-500 focus:outline-none sm:text-sm ${props.className ?? ""}`}
    />
  );
}

// Un segmento se toca una vez; un desplegable son dos toques y una lista que tapa la pantalla.
// Por eso operación, tipo y moneda son segmentos y no <select>.
export function Segmented({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  // Cuatro opciones no entran en una fila de 350px sin que el texto se corte: ahí van en dos filas
  // en el celular, y vuelven a una sola fila cuando hay lugar.
  const wraps = !compact && options.length > 3;

  return (
    <div className={`gap-0.5 rounded-xl bg-gray-100 p-0.5 ${wraps ? "grid grid-cols-2 sm:flex" : "flex"}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`flex h-10 items-center justify-center rounded-[10px] text-sm transition-colors sm:h-9 ${
              compact ? "px-3.5" : "flex-1 px-1"
            } ${active ? "bg-teal-600 font-semibold text-white shadow-sm" : "font-medium text-ink-mute hover:text-ink-soft"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <span className={`relative h-5.5 w-9.5 flex-shrink-0 rounded-full transition-colors ${checked ? "bg-teal-600" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-4.5" : "left-0.5"}`} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </span>
    </button>
  );
}

// "Más detalles": lo que no hace falta para que la propiedad exista queda plegado, para que el alta
// entre en una pantalla y se pueda hacer en menos de 30 segundos.
export function Collapse({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center gap-3 px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium text-ink">{title}</span>
          {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 flex-shrink-0 text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      {open && <div className="flex flex-col gap-3.5 border-t border-divider p-3">{children}</div>}
    </div>
  );
}

// Estructura estándar de un formulario dentro del Modal: cuerpo que scrollea y barra de acciones
// pegada abajo. En un formulario largo en el celular, el botón de guardar quedaba fuera de la
// pantalla y había que llegar hasta el final para encontrarlo.
export function FormLayout({ children, actions }: { children: ReactNode; actions: ReactNode }) {
  return (
    <>
      <div className="flex flex-col gap-3.5 px-5 pb-4 pt-4">{children}</div>
      <div className="sticky bottom-0 border-t border-divider bg-surface px-5 py-3">{actions}</div>
    </>
  );
}
