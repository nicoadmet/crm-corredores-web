// Abre el formulario de alta de una pantalla cuando se llega con ?new=1 en la URL.
// Es el mecanismo que usan el botón flotante de alta rápida y el buscador global para decirle a una
// pantalla "abrí tu formulario vacío", sin que tengan que conocerse entre sí.
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export function useNewParam(onNew: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  // La función de alta se vuelve a crear en cada render de la pantalla. Guardarla en una ref evita
  // que el efecto se dispare de nuevo por eso solo (abriría el formulario dos veces).
  const callback = useRef(onNew);
  callback.current = onNew;

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    callback.current();
    // Se limpia el parámetro para que recargar la página, o volver con "atrás", no vuelva a abrir
    // el formulario solo.
    searchParams.delete("new");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
}
