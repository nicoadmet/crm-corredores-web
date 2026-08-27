// Buscador global (⌘K / Ctrl+K): un solo campo que busca propiedades, leads y zonas de la cuenta,
// con los resultados agrupados por tipo. La última fila no es un resultado sino una acción: si lo
// que buscás no existe todavía, lo creás desde acá.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../trpc";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

// Mismo mínimo que aplica el backend: con menos de 2 letras cualquier búsqueda trae media cartera.
const MIN_QUERY_LENGTH = 2;

type Row = { key: string; group: string; label: string; sublabel?: string; trailing?: string; to: string };

const OPERATION_LABELS: Record<string, string> = { venta: "Venta", alquiler: "Alquiler" };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);

  const results = trpc.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: open && debouncedQuery.trim().length >= MIN_QUERY_LENGTH },
  );

  const rows = useMemo<Row[]>(() => {
    const data = results.data;
    const list: Row[] = [];

    for (const property of data?.properties ?? []) {
      list.push({
        key: `p-${property.id}`,
        group: "Propiedades",
        label: property.title,
        sublabel: `${property.zone} · ${property.status}`,
        trailing: `${property.currency} ${property.price}`,
        to: `/app/properties/${property.id}`,
      });
    }
    for (const lead of data?.leads ?? []) {
      list.push({
        key: `l-${lead.id}`,
        group: "Leads",
        label: lead.contactName,
        sublabel: `${OPERATION_LABELS[lead.operationType] ?? lead.operationType} · ${lead.zones.join(", ") || "sin zona"}`,
        trailing: lead.contactPhone,
        to: `/app/leads/${lead.id}`,
      });
    }
    for (const zone of data?.zones ?? []) {
      list.push({
        key: `z-${zone.zone}`,
        group: "Zonas",
        label: zone.zone,
        sublabel: `${zone.count} ${zone.count === 1 ? "propiedad" : "propiedades"} en esta zona`,
        to: `/app/properties?q=${encodeURIComponent(zone.zone)}`,
      });
    }
    if (query.trim().length >= MIN_QUERY_LENGTH) {
      list.push({
        key: "action-new",
        group: "Acciones",
        label: "Cargar una propiedad nueva",
        to: "/app/properties?new=1",
      });
    }
    return list;
  }, [results.data, query]);

  // Cada vez que cambian los resultados el cursor tiene que volver arriba: si no, podía quedar
  // apuntando a una fila que ya no existe y Enter no hacía nada.
  useEffect(() => setCursor(0), [rows.length]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function select(row: Row | undefined) {
    if (!row) return;
    onClose();
    navigate(row.to);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (rows.length === 0 ? 0 : (c + 1) % rows.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (rows.length === 0 ? 0 : (c - 1 + rows.length) % rows.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(rows[cursor]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  const showEmpty =
    debouncedQuery.trim().length >= MIN_QUERY_LENGTH && !results.isLoading && rows.length <= 1;
  let lastGroup = "";

  return (
    <div className="animate-overlay-in fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-4 pt-16 sm:pt-24" onClick={onClose} role="presentation">
      <div
        className="animate-panel-in flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar"
      >
        <div className="flex h-14 items-center gap-3 border-b border-divider px-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4 flex-shrink-0 text-ink-mute">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Buscar propiedad, lead o zona..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <span className="rounded border border-hairline bg-gray-50 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-faint">esc</span>
        </div>

        <div className="max-h-[54vh] overflow-y-auto py-1.5">
          {query.trim().length < MIN_QUERY_LENGTH && (
            <p className="px-4 py-6 text-center text-[13px] text-ink-faint">Escribí al menos dos letras.</p>
          )}

          {results.isLoading && query.trim().length >= MIN_QUERY_LENGTH && (
            <p className="px-4 py-6 text-center text-[13px] text-ink-faint">Buscando...</p>
          )}

          {rows.map((row, index) => {
            const header = row.group !== lastGroup ? row.group : null;
            lastGroup = row.group;
            return (
              <div key={row.key}>
                {header && (
                  <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.06em] text-ink-faint">
                    {header.toUpperCase()}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => select(row)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                    index === cursor ? "bg-gray-50" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{row.label}</span>
                    {row.sublabel && <span className="block truncate text-[11.5px] text-ink-mute">{row.sublabel}</span>}
                  </span>
                  {row.trailing && (
                    <span className="flex-shrink-0 text-[12.5px] font-medium tabular-nums text-ink-soft">{row.trailing}</span>
                  )}
                  {index === cursor && (
                    <span className="flex-shrink-0 rounded border border-hairline bg-gray-50 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-faint">↵</span>
                  )}
                </button>
              </div>
            );
          })}

          {showEmpty && (
            <p className="px-4 pb-2 pt-1 text-center text-[12.5px] text-ink-faint">
              No encontramos nada con “{debouncedQuery}”.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-divider bg-gray-50/60 px-4 py-2 text-[11px] text-ink-faint">
          <span><span className="font-medium text-ink-mute">↑↓</span> moverse</span>
          <span><span className="font-medium text-ink-mute">↵</span> abrir</span>
          <span className="ml-auto hidden sm:block">Busca en propiedades, leads y zonas de tu cuenta</span>
        </div>
      </div>
    </div>
  );
}
