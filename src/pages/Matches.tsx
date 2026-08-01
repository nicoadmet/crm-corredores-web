// Lista de matches sugeridos: se generan y actualizan solos cuando cambian leads o propiedades.
import { Link } from "react-router-dom";
import { trpc } from "../trpc";
import type { RouterOutputs } from "../trpc";

type Match = RouterOutputs["matches"]["list"][number];

export function Matches() {
  const list = trpc.matches.list.useQuery();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Matches</h1>

      {list.isLoading && <p className="text-gray-500">Cargando...</p>}
      {!list.isLoading && (list.data?.length ?? 0) === 0 && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          Todavía no hay matches. Se generan solos a medida que cargás leads y propiedades que coincidan.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {list.data?.map((m: Match) => (
          <li key={m.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium break-words">
                <Link to={`/app/leads/${m.leadId}`} className="text-teal-700 hover:underline">
                  {m.lead.contactName}
                </Link>
                <span className="text-gray-500 font-normal"> ({m.lead.zones.join(", ")})</span>
                {" — "}
                <Link to={`/app/properties/${m.propertyId}`} className="text-teal-700 hover:underline">
                  {m.property.title}
                </Link>
                <span className="text-gray-500 font-normal"> ({m.property.zone})</span>
              </p>
              <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full flex-shrink-0">
                Puntaje: {m.score}
              </span>
            </div>
            {m.reasons.length > 0 && <p className="text-sm text-gray-500 mt-2">{m.reasons.join(" · ")}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
