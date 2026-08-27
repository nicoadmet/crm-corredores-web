// Navegación del dashboard: barra lateral en escritorio (con marca arriba y cuenta abajo) y barra
// inferior de 5 pestañas en celular, más un botón flotante de alta rápida.
// Los ítems van agrupados a propósito: lo que se usa todos los días arriba, lo de consulta abajo.
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { trpc } from "../trpc";
import { UserMenu } from "./UserMenu";

type IconProps = { className?: string };

function Icon({ d, className = "h-4 w-4" }: { d: string } & IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

// Un solo `d` por ícono (con varios sub-trazos) para poder dibujarlos desde una lista de datos.
const PATHS = {
  today: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M12 2.5v2M12 19.5v2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M2.5 12h2M19.5 12h2M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4",
  properties: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5M10 21v-6h4v6",
  leads: "M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8.6a2.8 2.8 0 0 1 0 5.6M15.6 14.5c2.2.6 3.7 2.6 3.7 5.5",
  matches: "M8 12h8M13 7l5 5-5 5M11 17l-5-5 5-5",
  agenda: "M5 5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 5M8 3v4M16 3v4M3.5 9.5h17",
  catalogs: "M4.5 3.5h6v6h-6zM13.5 3.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z",
  stats: "M4 20V10M12 20V4M20 20v-7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
} as const;

type CountKey = "properties" | "leads" | "matches" | "agenda" | "catalogs";
type NavItem = { to: string; label: string; icon: keyof typeof PATHS; count?: CountKey; end?: boolean };

const GROUPS: { label?: string; items: NavItem[] }[] = [
  { items: [{ to: "/app", label: "Hoy", icon: "today", end: true }] },
  {
    label: "CARTERA",
    items: [
      { to: "/app/properties", label: "Propiedades", icon: "properties", count: "properties" },
      { to: "/app/leads", label: "Leads", icon: "leads", count: "leads" },
      { to: "/app/matches", label: "Matches", icon: "matches", count: "matches" },
    ],
  },
  {
    label: "ORGANIZACIÓN",
    items: [
      { to: "/app/agenda", label: "Agenda", icon: "agenda", count: "agenda" },
      { to: "/app/catalogs", label: "Catálogos", icon: "catalogs", count: "catalogs" },
    ],
  },
  { items: [{ to: "/app/stats", label: "Estadísticas", icon: "stats" }] },
];

// En el celular no entran seis pestañas cómodas: van las cuatro de todos los días y el resto
// queda en "Más".
const TABS: NavItem[] = [
  { to: "/app", label: "Hoy", icon: "today", end: true },
  { to: "/app/properties", label: "Propiedades", icon: "properties" },
  { to: "/app/leads", label: "Leads", icon: "leads" },
  { to: "/app/agenda", label: "Agenda", icon: "agenda" },
];

const MORE_ITEMS: NavItem[] = [
  { to: "/app/matches", label: "Matches", icon: "matches" },
  { to: "/app/catalogs", label: "Catálogos", icon: "catalogs" },
  { to: "/app/stats", label: "Estadísticas", icon: "stats" },
];

// Qué significa "+" en cada pantalla. Sin esto el botón flotante prometía "agregar" y siempre
// terminaba creando una propiedad, aunque estuvieras parado en Leads.
type QuickAdd = { label: string; to: string };

const QUICK_ADD_BY_SECTION: { prefix: string; quickAdd: QuickAdd }[] = [
  { prefix: "/app/properties", quickAdd: { label: "Propiedad", to: "/app/properties?new=1" } },
  { prefix: "/app/leads", quickAdd: { label: "Lead", to: "/app/leads?new=1" } },
  { prefix: "/app/agenda", quickAdd: { label: "Evento", to: "/app/agenda?new=1" } },
  { prefix: "/app/catalogs", quickAdd: { label: "Catálogo", to: "/app/catalogs?new=1" } },
];

// En Hoy, Matches y Estadísticas no hay una única cosa obvia para dar de alta, así que el botón
// abre la lista y elegís.
const QUICK_ADD_OPTIONS: QuickAdd[] = QUICK_ADD_BY_SECTION.map((entry) => entry.quickAdd);

function quickAddFor(pathname: string): QuickAdd | null {
  const match = QUICK_ADD_BY_SECTION.find((entry) => pathname.startsWith(entry.prefix));
  return match?.quickAdd ?? null;
}

function OverdueBadge({ count, floating = false }: { count: number; floating?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={`flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ${
        floating ? "absolute -right-2 -top-1.5 border-[1.5px] border-white" : ""
      }`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function DashboardNav({
  email,
  onLogout,
  onOpenAccount,
}: {
  email: string;
  onLogout: () => void;
  onOpenAccount: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const quickAdd = quickAddFor(location.pathname);

  const counts = trpc.stats.navCounts.useQuery();
  const followUps = trpc.leads.followUpSummary.useQuery();
  const overdueCount = followUps.data?.overdueCount ?? 0;

  function countFor(key?: CountKey) {
    if (!key || !counts.data) return null;
    return counts.data[key];
  }

  return (
    <>
      {/* Barra lateral: escritorio y tablet */}
      <nav className="hidden md:flex md:w-58 md:flex-shrink-0 md:flex-col md:border-r md:border-hairline md:bg-rail">
        <div className="flex h-13 items-center gap-2.5 border-b border-hairline px-3.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" />
            </svg>
          </span>
          <span className="text-[13.5px] font-semibold tracking-tight text-ink">InmoCRM</span>
        </div>

        <div className="flex flex-col p-2">
          {GROUPS.map((group) => (
            <div key={group.label ?? group.items[0].to} className="flex flex-col gap-px">
              {group.label && (
                <span className="px-2.5 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.07em] text-ink-faint">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${
                      isActive ? "bg-teal-50 font-semibold text-teal-700" : "font-medium text-ink-soft hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon d={PATHS[item.icon]} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/app/leads" && <OverdueBadge count={overdueCount} />}
                  {countFor(item.count) != null && (
                    <span className="text-[11px] font-medium tabular-nums text-ink-faint">{countFor(item.count)}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-hairline p-2">
          <UserMenu email={email} onLogout={onLogout} onOpenAccount={onOpenAccount} />
        </div>
      </nav>

      {/* Barra inferior: celular */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-hairline bg-surface md:hidden">
        {TABS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors ${
                isActive ? "font-semibold text-teal-700" : "font-medium text-gray-400"
              }`
            }
          >
            <span className="relative flex">
              <Icon d={PATHS[item.icon]} className="h-5 w-5" />
              {item.to === "/app/leads" && <OverdueBadge count={overdueCount} floating />}
            </span>
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-gray-400"
        >
          <Icon d={PATHS.more} className="h-5 w-5" />
          Más
        </button>
      </nav>

      {/* Alta rápida: el pilar del producto es cargar en menos de 30 segundos, así que el botón tiene
          que estar a un pulgar de distancia desde cualquier pantalla. Da de alta lo que corresponde a
          la pantalla donde estás, y lo dice con todas las letras para que no haya sorpresas. */}
      <button
        type="button"
        onClick={() => (quickAdd ? navigate(quickAdd.to) : setQuickAddOpen(true))}
        aria-label={quickAdd ? `Cargar ${quickAdd.label.toLowerCase()}` : "Cargar algo nuevo"}
        className={`fixed bottom-20 right-4 z-30 flex h-13 items-center justify-center gap-1.5 bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition-colors hover:bg-teal-700 active:bg-teal-800 md:hidden ${
          quickAdd ? "rounded-full pl-4 pr-5 text-sm font-semibold" : "w-13 rounded-full"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={quickAdd ? "h-4.5 w-4.5" : "h-6 w-6"}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {quickAdd?.label}
      </button>

      {quickAddOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:hidden" onClick={() => setQuickAddOpen(false)}>
          <div className="animate-panel-in w-full rounded-t-2xl bg-surface p-2 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-1 h-1 w-9 rounded-full bg-gray-200" />
            <p className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-mute">¿Qué querés cargar?</p>
            {QUICK_ADD_OPTIONS.map((option) => (
              <button
                key={option.to}
                type="button"
                onClick={() => {
                  setQuickAddOpen(false);
                  navigate(option.to);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[15px] font-medium text-ink transition-colors active:bg-gray-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {moreOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="animate-panel-in w-full rounded-t-2xl bg-surface p-2 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-gray-200" />
            {MORE_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium text-ink transition-colors active:bg-gray-100"
              >
                <Icon d={PATHS[item.icon]} className="h-5 w-5 text-ink-mute" />
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 border-t border-divider px-3 py-3.5 text-left text-[15px] font-medium text-ink-soft"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink-mute">
                <path d="M14 8V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2M10 12h9M16 8.5l3.5 3.5-3.5 3.5" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
