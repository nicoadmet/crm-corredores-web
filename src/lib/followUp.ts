// Clasifica el "próximo seguimiento" de un lead según su fecha: vencido, hoy, próximo (≤3 días) o nada.
// Usa horas UTC (no locales): nextFollowUpDate se guarda como medianoche UTC del día elegido
// (viene de un <input type="date">, sin hora), así que hay que leerlo de vuelta también en UTC —
// si acá se usara hora local, en Argentina (UTC-3) cualquier fecha se corre un día para atrás.
export type FollowUpStatus = "vencido" | "hoy" | "proximo";

export function getFollowUpStatus(date: string | Date | null | undefined): FollowUpStatus | null {
  if (!date) return null;

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const startOfTarget = new Date(date);
  startOfTarget.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "vencido";
  if (diffDays === 0) return "hoy";
  if (diffDays <= 3) return "proximo";
  return null;
}

export const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  vencido: "Seguimiento vencido",
  hoy: "Seguimiento hoy",
  proximo: "Seguimiento próximo",
};

export const FOLLOW_UP_STYLES: Record<FollowUpStatus, string> = {
  vencido: "bg-red-100 text-red-700",
  hoy: "bg-amber-100 text-amber-700",
  proximo: "bg-teal-50 text-teal-700",
};
