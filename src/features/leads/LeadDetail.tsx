// Ficha de un lead. A la izquierda la historia con el cliente (registrar interacción + timeline),
// que es lo que se consulta antes de levantar el teléfono; a la derecha los datos duros: qué busca,
// cuándo hay que volver a contactarlo, y qué propiedades de la cartera le encajan.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trpc } from "../../trpc";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { useToast } from "../../lib/toast";
import { usePageChrome } from "../../lib/pageChrome";
import { getFollowUpStatus, FOLLOW_UP_LABELS, FOLLOW_UP_STYLES } from "../../lib/followUp";

const OPERATION_LABELS: Record<string, string> = { venta: "Venta", alquiler: "Alquiler" };
const PROPERTY_TYPE_LABELS: Record<string, string> = { depto: "Depto", casa: "Casa" };
const PRIORITY_LABELS: Record<string, string> = { caliente: "Caliente", tibio: "Tibio", frio: "Frío" };
const PRIORITY_STYLES: Record<string, string> = {
  caliente: "bg-red-100 text-red-700",
  tibio: "bg-yellow-100 text-yellow-700",
  frio: "bg-blue-100 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  llamada: "Llamada",
  visita: "Visita",
  mensaje: "Mensaje",
  nota: "Nota",
  estado: "Cambio de estado",
};

const ACTIVITY_TYPE_OPTIONS = [
  { value: "llamada", label: "Llamada" },
  { value: "visita", label: "Visita" },
  { value: "mensaje", label: "Mensaje" },
  { value: "nota", label: "Nota" },
] as const;

// Un ícono por tipo de interacción: en una timeline larga, la forma se reconoce más rápido que la palabra.
const ACTIVITY_ICONS: Record<string, string> = {
  llamada: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5C11.6 19.6 4.4 12.4 3.5 5.2A1.5 1.5 0 0 1 5 3.5z",
  visita: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  mensaje: "M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.3A8.5 8.5 0 1 1 20.5 11.5z",
  nota: "M6 3.5h9L19 8v12.5H6zM14.5 3.5V8H19",
  estado: "M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6M17 3v3.5h-3.5M7 21v-3.5h3.5",
};

function Card({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
      <header className="flex items-center gap-2 border-b border-divider px-3.5 py-2.5">
        <h2 className="text-xs font-semibold text-ink-soft">{title}</h2>
        {aside && <span className="ml-auto text-[10.5px] text-ink-faint">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-[10.5px] text-ink-faint">{label}</span>
      <span className="text-[12.5px] font-medium text-ink">{value}</span>
    </span>
  );
}

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();
  const toast = useToast();

  const { data: lead, isLoading, error } = trpc.leads.getById.useQuery({ id: id ?? "" }, { enabled: !!id });
  const matches = trpc.matches.list.useQuery();

  const [activityType, setActivityType] = useState<"llamada" | "visita" | "mensaje" | "nota">("llamada");
  const [activityNote, setActivityNote] = useState("");

  const addActivity = trpc.leads.addActivity.useMutation({
    onSuccess: () => {
      utils.leads.getById.invalidate({ id: id ?? "" });
      setActivityNote("");
      toast("Interacción registrada.");
    },
    onError: () => toast("No se pudo registrar la interacción.", "error"),
  });

  usePageChrome(lead?.contactName ?? "Lead", lead ? STATUS_LABELS[lead.status] ?? lead.status : undefined);

  function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !activityNote.trim()) return;
    addActivity.mutate({ leadId: id, type: activityType, note: activityNote.trim() });
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-3 p-4 sm:p-5" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-5">
        <EmptyState icon="🔎" title="No se encontró el lead" description="Puede que lo hayas eliminado o que el link esté desactualizado." />
        <div className="mt-4 text-center">
          <Link to="/app/leads" className="rounded-sm text-sm text-teal-700 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            ← Volver a Leads
          </Link>
        </div>
      </div>
    );
  }

  const leadMatches = (matches.data ?? []).filter((m) => m.leadId === lead.id);
  const followUpStatus = getFollowUpStatus(lead.nextFollowUpDate);
  const budget =
    lead.budgetMin && lead.budgetMax
      ? `${lead.budgetMin} a ${lead.budgetMax}`
      : lead.budgetMax
        ? `hasta ${lead.budgetMax}`
        : lead.budgetMin
          ? `desde ${lead.budgetMin}`
          : null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link to="/app/leads" className="rounded-sm text-[12.5px] text-ink-mute transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
          ← Leads
        </Link>
        {lead.priority && (
          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${PRIORITY_STYLES[lead.priority] ?? "bg-gray-100 text-ink-soft"}`}>
            {PRIORITY_LABELS[lead.priority] ?? lead.priority}
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
          {STATUS_LABELS[lead.status] ?? lead.status}
        </span>
        {followUpStatus && (
          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${FOLLOW_UP_STYLES[followUpStatus]}`}>
            {FOLLOW_UP_LABELS[followUpStatus]}
          </span>
        )}

        <a
          href={`tel:${lead.contactPhone}`}
          className="ml-auto inline-flex h-8 items-center gap-2 rounded-lg bg-teal-600 px-3 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d={ACTIVITY_ICONS.llamada} />
          </svg>
          Llamar
        </a>
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_340px]">

        <div className="flex flex-col gap-3.5">
          <Card title="Registrar una interacción">
            <form onSubmit={handleAddActivity} className="flex flex-col gap-2 p-3.5 sm:flex-row">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as typeof activityType)}
                className="h-9 rounded-lg border border-gray-300 px-2.5 text-[13px] text-ink sm:w-32"
              >
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                placeholder="¿Qué pasó?"
                className="h-9 flex-1 rounded-lg border border-gray-300 px-3 text-[13px] text-ink placeholder:text-ink-faint"
              />
              <Button type="submit" loading={addActivity.isPending} disabled={!activityNote.trim()}>
                Agregar
              </Button>
            </form>
          </Card>

          <Card title="Historial" aside={`${lead.activities.length}`}>
            {lead.activities.length === 0 ? (
              <p className="px-3.5 py-8 text-center text-[12.5px] text-ink-faint">
                Todavía no hay interacciones registradas. Anotá la primera llamada o visita acá arriba.
              </p>
            ) : (
              <ul className="flex flex-col p-3.5">
                {lead.activities.map((activity, index) => {
                  const isState = activity.type === "estado";
                  const last = index === lead.activities.length - 1;
                  return (
                    <li key={activity.id} className="flex gap-3">
                      {/* Línea vertical que une los hitos: hace que se lea como una historia y no como
                          una lista suelta de renglones. */}
                      <span className="flex flex-col items-center">
                        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${isState ? "bg-gray-100 text-ink-faint" : "bg-teal-50 text-teal-700"}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                            <path d={ACTIVITY_ICONS[activity.type] ?? ACTIVITY_ICONS.nota} />
                          </svg>
                        </span>
                        {!last && <span className="w-px flex-1 bg-divider" />}
                      </span>

                      <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${last ? "" : "pb-4"}`}>
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span className={`text-[12.5px] font-semibold ${isState ? "text-ink-mute" : "text-ink"}`}>
                            {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
                          </span>
                          <span className="text-[11px] tabular-nums text-ink-faint">
                            {new Date(activity.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                            {" · "}
                            {new Date(activity.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                        {activity.note && <span className="text-[12.5px] leading-relaxed text-ink-soft">{activity.note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="Contacto">
            <div className="flex flex-col gap-3 p-3.5">
              <Fact label="Teléfono" value={<span className="tabular-nums">{lead.contactPhone}</span>} />
              {lead.contactEmail && <Fact label="Email" value={lead.contactEmail} />}
              {lead.nextFollowUpDate && (
                <Fact
                  label="Próximo seguimiento"
                  value={
                    <span className="flex flex-wrap items-center gap-2">
                      {/* nextFollowUpDate se guarda como medianoche UTC del día elegido (sin hora):
                          se muestra forzando UTC para no correr un día para atrás en Argentina. */}
                      {new Date(lead.nextFollowUpDate).toLocaleDateString("es-AR", { timeZone: "UTC" })}
                      {followUpStatus && (
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${FOLLOW_UP_STYLES[followUpStatus]}`}>
                          {FOLLOW_UP_LABELS[followUpStatus]}
                        </span>
                      )}
                    </span>
                  }
                />
              )}
            </div>
          </Card>

          <Card title="Qué busca">
            <div className="flex flex-col gap-3 p-3.5">
              <Fact label="Operación" value={OPERATION_LABELS[lead.operationType] ?? lead.operationType} />
              <Fact label="Tipo" value={PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType} />
              <Fact label="Zonas" value={lead.zones.length > 0 ? lead.zones.join(", ") : "sin definir"} />
              {budget && <Fact label="Presupuesto" value={<span className="tabular-nums">{budget}</span>} />}
              {(lead.minRooms != null || lead.minBathrooms != null || lead.needsGarage) && (
                <span className="flex flex-col gap-1">
                  <span className="text-[10.5px] text-ink-faint">Requisitos</span>
                  <span className="flex flex-wrap gap-1.5">
                    {lead.minRooms != null && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">{lead.minRooms}+ ambientes</span>
                    )}
                    {lead.minBathrooms != null && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">{lead.minBathrooms}+ baños</span>
                    )}
                    {lead.needsGarage && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">cochera</span>}
                  </span>
                </span>
              )}
              {lead.notes && (
                <span className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] text-ink-faint">Notas</span>
                  <span className="text-xs leading-relaxed text-ink-soft">{lead.notes}</span>
                </span>
              )}
            </div>
          </Card>

          {leadMatches.length > 0 && (
            <Card title="Propiedades que le encajan" aside={`${leadMatches.length}`}>
              {leadMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/app/properties/${match.propertyId}`}
                  className="flex items-center gap-3 border-b border-divider-soft px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink">{match.property.title}</span>
                    {match.reasons.length > 0 && (
                      <span className="block truncate text-[11px] text-ink-mute">{match.reasons.join(" · ")}</span>
                    )}
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-teal-800">
                    {match.score}
                  </span>
                </Link>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
