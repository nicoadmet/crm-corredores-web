// Devuelve una versión "demorada" de un valor: sólo se actualiza después de que el valor
// original deja de cambiar durante `delayMs`. Sirve para no disparar un pedido al backend
// en cada tecla que se escribe en un buscador — sólo cuando la persona hace una pausa.
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
