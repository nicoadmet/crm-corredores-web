// Panel de estadísticas: números clave de Propiedades y Leads de la cuenta logueada.
// Nada de reportes pesados — sólo conteos por estado y una tasa de conversión aproximada,
// para tener un panorama de un vistazo.
import { trpc } from "../trpc";

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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex-1 min-w-[140px]">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-teal-700 mt-1">{value}</p>
    </div>
  );
}

function StatusBreakdown({
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
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      <ul className="flex flex-col gap-2">
        {Object.entries(labels).map(([status, label]) => {
          const count = counts[status] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={status} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right flex-shrink-0">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Stats() {
  const { data, isLoading } = trpc.stats.summary.useQuery();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Estadísticas</h1>

      {isLoading && <p className="text-gray-500">Cargando...</p>}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <StatTile label="Propiedades activas" value={String(data.properties.byStatus.disponible ?? 0)} />
            <StatTile label="Total de leads" value={String(data.leads.total)} />
            <StatTile
              label="Tasa de conversión"
              value={data.leads.conversionRate != null ? `${data.leads.conversionRate}%` : "—"}
            />
          </div>

          <StatusBreakdown
            title="Propiedades por estado"
            labels={PROPERTY_STATUS_LABELS}
            counts={data.properties.byStatus}
            total={data.properties.total}
          />

          <StatusBreakdown
            title="Leads por estado"
            labels={LEAD_STATUS_LABELS}
            counts={data.leads.byStatus}
            total={data.leads.total}
          />
        </div>
      )}
    </div>
  );
}
