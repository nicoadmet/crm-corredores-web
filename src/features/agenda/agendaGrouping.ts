// Agrupa los eventos de agenda en baldes por día (Vencidos/Hoy/Mañana/Esta semana/Más adelante)
// para armar la lista cronológica de Agenda.tsx, y separa aparte los que ya no están "pendiente"
// (realizado/cancelado) para el historial.
// A diferencia de nextFollowUpDate (que es sólo fecha, sin hora, guardada en UTC — ver followUp.ts),
// acá "date" es un timestamp real con hora que el usuario eligió en su horario local, así que
// comparamos en hora local, sin trucos de UTC.
import type { RouterOutputs } from "../../trpc";

export type AgendaEvent = RouterOutputs["agenda"]["list"][number];

export type AgendaBucketKey = "vencidos" | "hoy" | "manana" | "semana" | "masAdelante";

export const AGENDA_BUCKET_LABELS: Record<AgendaBucketKey, string> = {
  vencidos: "Vencidos",
  hoy: "Hoy",
  manana: "Mañana",
  semana: "Esta semana",
  masAdelante: "Más adelante",
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function groupAgendaEvents(
  events: AgendaEvent[]
): Record<AgendaBucketKey, AgendaEvent[]> & { historial: AgendaEvent[] } {
  const buckets: Record<AgendaBucketKey, AgendaEvent[]> = {
    vencidos: [],
    hoy: [],
    manana: [],
    semana: [],
    masAdelante: [],
  };
  const historial: AgendaEvent[] = [];

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  for (const event of events) {
    if (event.status !== "pendiente") {
      historial.push(event);
      continue;
    }
    const day = startOfDay(new Date(event.date));
    if (day < today) buckets.vencidos.push(event);
    else if (day.getTime() === today.getTime()) buckets.hoy.push(event);
    else if (day.getTime() === tomorrow.getTime()) buckets.manana.push(event);
    else if (day < weekEnd) buckets.semana.push(event);
    else buckets.masAdelante.push(event);
  }

  historial.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { ...buckets, historial };
}
