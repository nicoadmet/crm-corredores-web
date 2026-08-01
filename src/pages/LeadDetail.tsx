// Página de detalle de un lead (solo lectura), a la que se llega desde un match.
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

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading, error } = trpc.leads.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id }
  );

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
            Próximo seguimiento: {new Date(lead.nextFollowUpDate).toLocaleDateString()}
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
    </div>
  );
}
