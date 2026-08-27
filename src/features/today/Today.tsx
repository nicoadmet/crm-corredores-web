// Pantalla de inicio del dashboard. Responde una sola pregunta: ¿qué tengo que hacer hoy?
// Junta lo que antes había que ir a buscar a tres pestañas distintas: seguimientos que se pasaron
// de fecha, lo que hay agendado para hoy, y los matches más fuertes de la cartera.
import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { trpc } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { usePageChrome } from "../../lib/pageChrome";
import { getFollowUpStatus, FOLLOW_UP_LABELS, FOLLOW_UP_STYLES } from "../../lib/followUp";
import { groupAgendaEvents } from "../agenda/agendaGrouping";

type Match = RouterOutputs["matches"]["list"][number];

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  disponible: "Disponibles",
  reservada: "Reservadas",
  vendida: "Vendidas",
  pausada: "Pausadas",
};

// Sólo "disponible" lleva teal: es el único estado que significa "esto lo podés vender hoy".
const PROPERTY_STATUS_BARS: Record<string, string> = {
  disponible: "bg-teal-600",
  reservada: "bg-teal-200",
  vendida: "bg-gray-300",
  pausada: "bg-gray-200",
};

function Card({ title, dotClass, count, children, footer }: {
  title: string;
  dotClass?: string;
  count?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
      <header className="flex items-center gap-2 border-b border-divider px-3 py-2.5">
        {dotClass && <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />}
        <h2 className="text-xs font-semibold text-ink-soft">{title}</h2>
        {count != null && count > 0 && (
          <span className={`rounded-full px-1.5 text-[10.5px] font-semibold tabular-nums ${
            dotClass === "bg-red-600" ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-700"
          }`}>
            {count}
          </span>
        )}
      </header>
      <div className="flex flex-col">{children}</div>
      {footer}
    </section>
  );
}

function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 border-t border-divider px-3 py-2.5 text-[11.5px] font-medium text-teal-700 transition-colors hover:bg-gray-50"
    >
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

function Row({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flex min-h-11 items-center gap-3 border-b border-divider-soft px-3 py-2 transition-colors last:border-b-0 hover:bg-gray-50">
      {children}
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-3">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function Today() {
  const navigate = useNavigate();
  const today = new Date();
  const dateLabel = today.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  usePageChrome("Hoy", dateLabel);

  const followUps = trpc.leads.followUpSummary.useQuery();
  const agenda = trpc.agenda.list.useQuery({ includeDone: false });
  const matches = trpc.matches.list.useQuery();
  const stats = trpc.stats.summary.useQuery();

  const loading = followUps.isLoading || agenda.isLoading || matches.isLoading;

  // followUpSummary ya trae vencidos, de hoy y próximos: acá interesan sólo los dos primeros,
  // que son los que efectivamente hay que resolver antes de que termine el día.
  const needsAttention = (followUps.data?.items ?? []).filter((lead) => {
    const status = getFollowUpStatus(lead.nextFollowUpDate);
    return status === "vencido" || status === "hoy";
  });

  const agendaGroups = groupAgendaEvents(agenda.data ?? []);
  const todayEvents = [...agendaGroups.vencidos, ...agendaGroups.hoy];

  const topMatches = [...(matches.data ?? [])].sort((a: Match, b: Match) => b.score - a.score).slice(0, 4);

  const properties = stats.data?.properties;

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-3.5 p-4 sm:p-5 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const nothingToDo = needsAttention.length === 0 && todayEvents.length === 0 && topMatches.length === 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3.5 p-4 sm:p-5">
      {nothingToDo && (
        <EmptyState
          icon="☕"
          title="No tenés nada pendiente para hoy"
          description="Ni seguimientos vencidos, ni visitas agendadas, ni matches nuevos. Buen momento para cargar propiedades a la cartera."
          actionLabel="+ Cargar una propiedad"
          onAction={() => navigate("/app/properties?new=1")}
        />
      )}

      {!nothingToDo && (
        <div className="grid gap-3.5 lg:grid-cols-3">
          <Card
            title="Necesita tu atención"
            dotClass={needsAttention.length > 0 ? "bg-red-600" : "bg-gray-300"}
            count={needsAttention.length}
            footer={needsAttention.length > 0 ? <CardLink to="/app/leads">Ver todos los seguimientos</CardLink> : undefined}
          >
            {needsAttention.length === 0 && (
              <p className="px-3 py-5 text-center text-[12.5px] text-ink-faint">Ningún seguimiento atrasado. Al día.</p>
            )}
            {needsAttention.slice(0, 4).map((lead) => {
              const status = getFollowUpStatus(lead.nextFollowUpDate);
              return (
                <Row key={lead.id} to={`/app/leads/${lead.id}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink">{lead.contactName}</span>
                    <span className="block truncate text-[11.5px] text-ink-mute">{lead.contactPhone}</span>
                  </span>
                  {status && (
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${FOLLOW_UP_STYLES[status]}`}>
                      {FOLLOW_UP_LABELS[status]}
                    </span>
                  )}
                </Row>
              );
            })}
          </Card>

          <Card
            title="Agenda de hoy"
            dotClass="bg-teal-600"
            count={todayEvents.length}
            footer={<CardLink to="/app/agenda">Abrir la agenda</CardLink>}
          >
            {todayEvents.length === 0 && (
              <p className="px-3 py-5 text-center text-[12.5px] text-ink-faint">No tenés nada agendado para hoy.</p>
            )}
            {todayEvents.slice(0, 4).map((event) => (
              <Row key={event.id} to="/app/agenda">
                <span className="w-10 flex-shrink-0 text-[12px] font-semibold tabular-nums text-ink">
                  {new Date(event.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">{event.title}</span>
                  {(event.lead || event.property) && (
                    <span className="block truncate text-[11.5px] text-ink-mute">
                      {event.lead?.contactName}
                      {event.lead && event.property ? " · " : ""}
                      {event.property?.title}
                    </span>
                  )}
                </span>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                  event.type === "visita" ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-ink-soft"
                }`}>
                  {event.type === "visita" ? "Visita" : "Tarea"}
                </span>
              </Row>
            ))}
          </Card>

          <Card
            title="Matches más fuertes"
            dotClass="bg-teal-600"
            count={matches.data?.length ?? 0}
            footer={(matches.data?.length ?? 0) > 0 ? <CardLink to="/app/matches">Ver todos los matches</CardLink> : undefined}
          >
            {topMatches.length === 0 && (
              <p className="px-3 py-5 text-center text-[12.5px] text-ink-faint">
                Todavía no hay matches. Se generan solos cuando una propiedad coincide con un lead.
              </p>
            )}
            {topMatches.map((match) => (
              <Row key={match.id} to={`/app/properties/${match.propertyId}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">{match.lead.contactName}</span>
                  <span className="block truncate text-[11.5px] text-ink-mute">{match.property.title}</span>
                </span>
                <span className="flex-shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-teal-800">
                  {match.score}
                </span>
              </Row>
            ))}
          </Card>
        </div>
      )}

      {properties && properties.total > 0 && (
        <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <header className="flex items-center gap-2 border-b border-divider px-3 py-2.5">
            <h2 className="text-xs font-semibold text-ink-soft">Tu cartera</h2>
            <span className="ml-auto text-[11px] tabular-nums text-ink-faint">
              {properties.total} {properties.total === 1 ? "propiedad" : "propiedades"}
            </span>
          </header>
          <div className="flex flex-col gap-2.5 p-3 sm:grid sm:grid-cols-2 sm:gap-x-8">
            {Object.entries(PROPERTY_STATUS_LABELS).map(([status, label]) => {
              const count = properties.byStatus[status] ?? 0;
              const pct = properties.total > 0 ? Math.round((count / properties.total) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-20 flex-shrink-0 text-[11.5px] text-ink-soft">{label}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-divider">
                    <span className={`block h-full rounded-full ${PROPERTY_STATUS_BARS[status]}`} style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-6 flex-shrink-0 text-right text-[11.5px] font-semibold tabular-nums text-ink-soft">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
