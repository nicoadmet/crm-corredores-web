// Barra superior del dashboard: título de la pantalla, buscador global y cuenta.
// El título sale de la ruta, salvo que la pantalla lo pise con usePageChrome() — por ejemplo la
// ficha de una propiedad, donde el título es el nombre de la propiedad.
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { PageChromeContext, titleForPath } from "../lib/pageChrome";
import { UserMenu } from "./UserMenu";

export function DashboardTopbar({
  email,
  onLogout,
  onOpenSearch,
  onOpenAccount,
}: {
  email: string;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}) {
  const location = useLocation();
  const store = useContext(PageChromeContext);
  const chrome = store?.chrome?.path === location.pathname ? store.chrome : null;

  const title = chrome?.title ?? titleForPath(location.pathname);
  const subtitle = chrome?.subtitle;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-hairline bg-surface px-4 py-2.5 md:h-13 md:px-5 md:py-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
        <h1 className="truncate text-lg font-bold tracking-tight text-ink md:text-[15px] md:font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-faint tabular-nums md:text-[12.5px]">{subtitle}</p>}
      </div>

      {/* Escritorio: el buscador se ve como un campo. Celular: sólo el ícono, para no comerse el ancho. */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-7.5 w-62 items-center gap-2 rounded-lg border border-hairline bg-gray-50 px-2.5 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:flex"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint">
          <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4.5 4.5" />
        </svg>
        <span className="flex-1 truncate text-xs text-ink-faint">Buscar propiedad, lead o zona</span>
        <span className="rounded border border-hairline bg-surface px-1 py-px text-[10px] font-medium text-ink-faint">⌘K</span>
      </button>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Buscar"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
          <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4.5 4.5" />
        </svg>
      </button>

      {/* En escritorio la cuenta vive abajo de la barra lateral; acá sólo hace falta en celular. */}
      <div className="md:hidden">
        <UserMenu email={email} onLogout={onLogout} onOpenAccount={onOpenAccount} variant="compact" />
      </div>
    </header>
  );
}
