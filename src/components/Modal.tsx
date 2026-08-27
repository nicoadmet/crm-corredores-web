// Modal genérico: overlay + panel (hoja inferior en mobile, centrado en desktop).
// El panel es una columna: encabezado fijo arriba y cuerpo que scrollea. El padding lo pone el
// contenido, no el panel — así una barra de acciones pegada abajo (ver FormLayout) puede ocupar
// todo el ancho sin pelearse con márgenes negativos.
import { useEffect } from "react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    // Sin esto, al scrollear dentro del modal en mobile se mueve también la lista de atrás.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-panel-in flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:max-h-[88vh] sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-divider px-5 py-3.5">
          <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-gray-100 hover:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
