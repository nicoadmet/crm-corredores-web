// Título y bajada que muestra la barra superior del dashboard. Por defecto se deducen de la ruta
// (ver PAGE_TITLES); una pantalla puede pisarlos con usePageChrome() cuando el título es un dato
// —por ejemplo el nombre de la propiedad en su ficha de detalle.
import { createContext, useContext, useEffect } from "react";

export type PageChrome = {
  title: string;
  subtitle?: string;
  // La ruta para la que se fijó este título. La barra superior sólo lo usa si coincide con la ruta
  // actual: sin esto, al navegar quedaría colgado el título de la pantalla anterior por un instante.
  path: string;
};

type ChromeStore = {
  chrome: PageChrome | null;
  setChrome: (chrome: PageChrome) => void;
};

export const PageChromeContext = createContext<ChromeStore | null>(null);

const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/app/properties", title: "Propiedades" },
  { prefix: "/app/leads", title: "Leads" },
  { prefix: "/app/matches", title: "Matches" },
  { prefix: "/app/agenda", title: "Agenda" },
  { prefix: "/app/catalogs", title: "Catálogos" },
  { prefix: "/app/stats", title: "Estadísticas" },
];

export function titleForPath(pathname: string): string {
  // El más largo primero, para que /app/properties/:id no gane contra /app.
  const match = [...PAGE_TITLES].sort((a, b) => b.prefix.length - a.prefix.length)
    .find((entry) => pathname.startsWith(entry.prefix));
  return match?.title ?? "Hoy";
}

export function usePageChrome(title: string, subtitle?: string) {
  const store = useContext(PageChromeContext);
  const path = window.location.pathname;

  useEffect(() => {
    store?.setChrome({ title, subtitle, path });
    // `store` viene de un contexto estable; incluirlo en las dependencias haría correr el efecto
    // en cada render del padre sin que cambie nada del título.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, path]);
}
