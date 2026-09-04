// Avatar con menú de la cuenta. Aparece en dos lugares: abajo de la barra lateral en escritorio
// ("rail") y en la barra superior del celular ("compact"), donde no hay barra lateral.
import { useState } from "react";
import { Link } from "react-router-dom";
import { trpc } from "../trpc";

function initialsFor(value: string): string {
  // Sirve tanto para un nombre real como para un email de respaldo
  // , separando por espacio, punto, guión o guión bajo.
  const base = value.includes("@") ? (value.split("@")[0] ?? "") : value;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : base.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export function UserMenu({
  email,
  onLogout,
  onOpenAccount,
  variant = "rail",
}: {
  email: string;
  onLogout: () => void;
  onOpenAccount: () => void;
  variant?: "rail" | "compact";
}) {
  const [open, setOpen] = useState(false);
  // El nombre de la cuenta es el que el corredor edita en "Mi cuenta" y el que firma sus páginas
  // públicas. Mostrarlo acá (y no el email) es lo que hace que ese campo tenga sentido visible.
  const account = trpc.account.get.useQuery();
  const displayName = account.data?.name?.trim() || email;
  const showEmailApart = displayName !== email;
  const initials = initialsFor(displayName);

  return (
    <div className="relative">
      {open && (
        // Capa transparente a pantalla completa: cierra el menú al tocar cualquier otro lado.
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "rail"
            ? "flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            : "flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        }
      >
        {variant === "rail" ? (
          <>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10.5px] font-semibold text-teal-700">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-ink-soft">{displayName}</span>
              <span className="block truncate text-[10.5px] text-ink-faint">{showEmailApart ? email : "Plan Free"}</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 flex-shrink-0 text-ink-faint">
              <path d="M5 12h.01M12 12h.01M19 12h.01" />
            </svg>
          </>
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-56 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg ${
            variant === "rail" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
          }`}
        >
          <div className="border-b border-divider px-3 py-2.5">
            <p className="truncate text-xs font-medium text-ink">{displayName}</p>
            {showEmailApart && <p className="truncate text-[10.5px] text-ink-faint">{email}</p>}
            <p className="text-[10.5px] text-ink-faint">Plan Free</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenAccount();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink-faint">
              <path d="M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
            </svg>
            Mi cuenta
          </button>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-ink-soft transition-colors hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink-faint">
              <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" />
            </svg>
            Ir al sitio público
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 border-t border-divider px-3 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink-faint">
              <path d="M14 8V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2M10 12h9M16 8.5l3.5 3.5-3.5 3.5" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
