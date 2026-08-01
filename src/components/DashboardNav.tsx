// Navegación del dashboard: sidebar lateral en desktop/tablet, barra inferior en mobile.
// Muestra un badge rojo sobre "Leads" con la cantidad de seguimientos vencidos.
import { NavLink } from "react-router-dom";
import { trpc } from "../trpc";

function PropertiesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 8.5a2.8 2.8 0 1 1 0 5.6" strokeLinecap="round" />
      <path d="M15 14.2c2.3.5 4 2.6 4 5.8" strokeLinecap="round" />
    </svg>
  );
}

function MatchesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M8 12h8" strokeLinecap="round" />
      <path d="M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/app/properties", label: "Propiedades", icon: PropertiesIcon },
  { to: "/app/leads", label: "Leads", icon: LeadsIcon },
  { to: "/app/matches", label: "Matches", icon: MatchesIcon },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function DashboardNav() {
  const followUps = trpc.leads.followUpSummary.useQuery();
  const overdueCount = followUps.data?.overdueCount ?? 0;

  return (
    <>
      {/* Sidebar: desktop/tablet */}
      <nav className="hidden md:flex md:w-56 md:flex-shrink-0 md:flex-col md:gap-1 md:border-r md:border-gray-200 md:bg-white md:p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {to === "/app/leads" && <NavBadge count={overdueCount} />}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Barra inferior: mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-gray-200 bg-white md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? "text-teal-700" : "text-gray-500"
              }`
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {to === "/app/leads" && <NavBadge count={overdueCount} />}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
