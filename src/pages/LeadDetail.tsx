// Página de detalle de un lead (solo lectura salvo la timeline), a la que se llega desde un match.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trpc } from "../trpc";
import { getFollowUpStatus, FOLLOW_UP_LABELS, FOLLOW_UP_STYLES } from "../lib/followUp";

const OPERATION_LABELS: Record<string, string> = { venta: "Venta", alquiler: "Alquiler" };
const PROPERTY_TYPE_LABELS: Record<string, string> = { depto: "Depto", casa: "Casa" };
const PRIORITY_LABELS: Record<string, string> = { caliente: "Caliente", tibio: "Tibio", frio: "Frío" };
const PRIORITY_STYLES: Record<string, string> = {
  caliente: "bg-red-100 text-red-700",
  tibio: "bg-yellow-100 text-yellow-700",
  frio: "bg-blue-100 text-blue-700",
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
];

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();
  const { data: lead, isLoading, error } = trpc.leads.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id }
  );

  const [activityType, setActivityType] = useState<"llamada" | "visita" | "mensaje" | "nota">("llamada");
  const [activityNote, setActivityNote] = useState("");

  const addActivity = trpc.leads.addActivity.useMutation({
    onSuccess: () => {
      utils.leads.getById.invalidate({ id: id ?? "" });
      setActivityNote("");
    },
  });

  function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !activityNote.trim()) return;
    addActivity.mutate({ leadId: id, type: activityType, note: activityNote.trim() });
  }

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  if (error || !lead) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-500">No se encontró el lead.</p>
        <Link to="/app/leads" className="text-teal-700 hover:underline text-sm">
          ← Volver a Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Link to="/app/leads" className="text-sm text-teal-700 hover:underline">
        ← Volver a Leads
      </Link>

      <div className="flex flex-wrap items-center gap-2 mt-4 mb-1">
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
          {OPERATION_LABELS[lead.operationType] ?? lead.operationType}
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
          {PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType}
        </span>
        {lead.priority && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              PRIORITY_STYLES[lead.priority] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {PRIORITY_LABELS[lead.priority] ?? lead.priority}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 break-words">{lead.contactName}</h1>
      <p className="text-gray-600 mt-1 break-words">
        {lead.contactPhone}
        {lead.contactEmail ? ` — ${lead.contactEmail}` : ""}
      </p>

      <div className="mt-4 flex flex-col gap-1 text-sm text-gray-700 break-words">
        <p>
          Busca {OPERATION_LABELS[lead.operationType]?.toLowerCase() ?? lead.operationType} en{" "}
          {lead.zones.join(", ")}
        </p>
        {(lead.budgetMin || lead.budgetMax) && (
          <p>
            Presupuesto: {lead.budgetMin ?? "?"} a {lead.budgetMax ?? "?"}
          </p>
        )}
        {lead.minRooms != null && <p>Ambientes mínimos: {lead.minRooms}</p>}
        {lead.minBathrooms != null && <p>Baños mínimos: {lead.minBathrooms}</p>}
        {lead.needsGarage && <p>Necesita cochera</p>}
        {lead.nextFollowUpDate && (
          <p className="flex flex-wrap items-center gap-2">
            {/* nextFollowUpDate se guarda como medianoche UTC del día elegido (sin hora) —
                se muestra forzando timeZone: "UTC" para no correr un día para atrás en Argentina. */}
            Próximo seguimiento:{" "}
            {new Date(lead.nextFollowUpDate).toLocaleDateString("es-AR", { timeZone: "UTC" })}
            {(() => {
              const status = getFollowUpStatus(lead.nextFollowUpDate);
              if (!status) return null;
              return (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FOLLOW_UP_STYLES[status]}`}>
                  {FOLLOW_UP_LABELS[status]}
                </span>
              );
            })()}
          </p>
        )}
        {lead.notes && <p>Notas: {lead.notes}</p>}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Registrar interacción</h2>
        <form onSubmit={handleAddActivity} className="flex flex-col sm:flex-row gap-2">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as typeof activityType)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-36"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
          />
          <button
            type="submit"
            disabled={addActivity.isPending || !activityNote.trim()}
            className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:bg-gray-300"
          >
            Agregar
          </button>
        </form>

        {lead.activities.length > 0 ? (
          <ul className="flex flex-col gap-2 mt-4">
            {lead.activities.map((activity) => (
              <li key={activity.id} className="flex flex-wrap items-start gap-2 text-sm">
                <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    activity.type === "estado" ? "bg-gray-100 text-gray-500" : "bg-teal-50 text-teal-700"
                  }`}
                >
                  {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
                </span>
                {activity.note && <span className="text-gray-700 break-words">{activity.note}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 mt-4">Todavía no hay interacciones registradas.</p>
        )}
      </div>
    </div>
  );
}
