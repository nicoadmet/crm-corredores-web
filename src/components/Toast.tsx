// Avisos breves que confirman que una acción salió bien (o falló), sin frenar al usuario con un alert.
import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ToastContext } from "../lib/toast";
import type { ShowToast, ToastVariant } from "../lib/toast";

type ToastItem = { id: number; message: string; variant: ToastVariant };

const DURATION_MS = 3500;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-teal-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-900 text-white",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((message, variant = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Arriba de la barra inferior en mobile (bottom-20), abajo a la derecha en desktop. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${VARIANT_STYLES[t.variant]}`}
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
            >
              {VARIANT_ICONS[t.variant]}
            </span>
            <span className="min-w-0 break-words">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
