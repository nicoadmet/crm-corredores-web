// Panel de estadísticas: números clave de la cuenta de un vistazo.
// Nada de gráficos con ejes — son un puñado de conteos, y para eso una tarjeta con el número grande
// se lee más rápido que cualquier gráfico. Sin semáforo rojo/verde: un estado no es "bueno" ni "malo"
// por sí solo, así que las barras van en gris y teal.
import { trpc } from "../../trpc";
import { Skeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { usePageChrome } from "../../lib/pageChrome";

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  pausada: "Pausada",
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

// Sólo el primer estado de cada lista lleva teal: es el que significa "esto está en juego hoy".
const BAR_STYLES = ["bg-teal-600", "bg-teal-200", "bg-gray-300", "bg-gray-200"];

function Tile({ label, value, hint, alert }: { label: string; value: string; hint?: string; alert?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-hairline bg-surface p-3.5">
      <span className="text-[11px] text-ink-faint">{label}</span>
      <span className={`text-2xl font-bold tracking-tight tabular-nums ${alert ? "text-red-600" : "text-ink"}`}>{value}</span>
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </div>
  );
}

function Breakdown({
  title,
  labels,
  counts,
  total,
}: {
  title: string;
  labels: Record<string, string>;
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
      <header className="flex items-center gap-2 border-b border-divider px-3.5 py-2.5">
        <h2 className="text-xs font-semibold text-ink-soft">{title}</h2>
        <span className="ml-auto text-[11px] tabular-nums text-ink-faint">{total}</span>
      </header>
      <div className="flex flex-col gap-3 p-3.5">
        {Object.entries(labels).map(([status, label], index) => {
          const count = counts[status] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-3">
              <span className="w-20 flex-shrink-0 text-[11.5px] text-ink-soft">{label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-divider">
                <span className={`block h-full rounded-full ${BAR_STYLES[index] ?? "bg-gray-200"}`} style={{ width: `${pct}%` }} />
              </span>
              <span className="w-14 flex-shrink-0 text-right text-[11.5px] tabular-nums text-ink-faint">
                <span className="font-semibold text-ink-soft">{count}</span> · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Stats() {
  const summary = trpc.stats.summary.useQuery();
  const navCounts = trpc.stats.navCounts.useQuery();
  const followUps = trpc.leads.followUpSummary.useQuery();

  const data = summary.data;
  usePageChrome("Estadísticas", "Un vistazo a tu cuenta");

  if (summary.isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-3.5 p-4 sm:p-5" aria-busy="true" aria-label="Cargando">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-hairline bg-surface p-3.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-7 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!data || (data.properties.total === 0 && data.leads.total === 0)) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-5">
        <EmptyState
          icon="📊"
          title="Todavía no hay números para mostrar"
          description="Los números aparecen solos a medida que cargás propiedades y leads. No hay nada que configurar."
        />
      </div>
    );
  }

  const overdue = followUps.data?.overdueCount ?? 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3.5 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Propiedades activas"
          value={String(data.properties.byStatus.disponible ?? 0)}
          hint={`de ${data.properties.total} en cartera`}
        />
        <Tile label="Leads cargados" value={String(data.leads.total)} hint={`${data.leads.byStatus.activo ?? 0} activos`} />
        <Tile
          label="Tasa de conversión"
          value={data.leads.conversionRate != null ? `${data.leads.conversionRate}%` : "—"}
          hint="leads que llegaron a cerrado"
        />
        <Tile
          label="Seguimientos vencidos"
          value={String(overdue)}
          hint={navCounts.data ? `${navCounts.data.matches} matches activos` : undefined}
          alert={overdue > 0}
        />
      </div>

      <Breakdown
        title="Propiedades por estado"
        labels={PROPERTY_STATUS_LABELS}
        counts={data.properties.byStatus}
        total={data.properties.total}
      />

      <Breakdown title="Leads por estado" labels={LEAD_STATUS_LABELS} counts={data.leads.byStatus} total={data.leads.total} />
    </div>
  );
}
