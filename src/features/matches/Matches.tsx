// Lista de matches sugeridos: se generan y actualizan solos cuando cambian leads o propiedades.
// Ordenados por puntaje: los de arriba son los que conviene mover hoy.
import { Link } from "react-router-dom";
import { trpc } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonList } from "../../components/Skeleton";
import { usePageChrome } from "../../lib/pageChrome";

type Match = RouterOutputs["matches"]["list"][number];

// 70 es el mismo umbral que usa el backend para disparar una notificación push: arriba de eso el
// match es lo bastante fuerte como para levantar el teléfono.
const STRONG_SCORE = 70;

export function Matches() {
  const list = trpc.matches.list.useQuery();
  const matches = [...(list.data ?? [])].sort((a: Match, b: Match) => b.score - a.score);
  const strong = matches.filter((m) => m.score >= STRONG_SCORE).length;

  usePageChrome(
    "Matches",
    matches.length > 0 ? `${matches.length} en total · ${strong} fuertes` : undefined,
  );

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-5">
      {list.isLoading && <SkeletonList count={4} />}

      {!list.isLoading && matches.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Todavía no hay matches"
          description="Se generan solos: cuando una propiedad de tu cartera coincide con lo que busca un lead, aparece acá sin que tengas que hacer nada."
        />
      )}

      {matches.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex flex-col gap-2 border-b border-divider-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50/70 sm:flex-row sm:items-center sm:gap-4"
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums ${
                  match.score >= STRONG_SCORE ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-ink-soft"
                }`}
                title={`Puntaje ${match.score}`}
              >
                {match.score}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]">
                  <Link
                    to={`/app/leads/${match.leadId}`}
                    className="truncate rounded-sm font-semibold text-ink transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    {match.lead.contactName}
                  </Link>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 flex-shrink-0 text-ink-faint">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <Link
                    to={`/app/properties/${match.propertyId}`}
                    className="truncate rounded-sm font-semibold text-ink transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    {match.property.title}
                  </Link>
                </span>

                {match.reasons.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {match.reasons.map((reason) => (
                      <span key={reason} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">
                        {reason}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className="flex-shrink-0 text-[11.5px] text-ink-faint">
                {match.property.zone}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
