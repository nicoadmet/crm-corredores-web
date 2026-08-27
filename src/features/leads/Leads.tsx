// Lista de leads de la cuenta logueada: alta y edición en modal, borrado (papelera), paginación,
// búsqueda/filtros (texto libre + chips de operación/tipo/estado) y panel de seguimientos urgentes.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { Modal } from "../../components/Modal";
import { LeadForm, emptyLeadForm } from "./LeadForm";
import type { LeadFormValues } from "./LeadForm";
import { FilterChips } from "../../components/FilterChips";
import { FilterSelect } from "../../components/FilterSelect";
import { Menu } from "../../components/Menu";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonList } from "../../components/Skeleton";
import { useToast } from "../../lib/toast";
import { getFollowUpStatus, FOLLOW_UP_LABELS, FOLLOW_UP_STYLES } from "../../lib/followUp";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { useNewParam } from "../../lib/useNewParam";
import { usePageChrome } from "../../lib/pageChrome";

type Lead = RouterOutputs["leads"]["list"]["items"][number];

const PAGE_SIZE = 10;

const OPERATION_LABELS: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  depto: "Depto",
  casa: "Casa",
};

const STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

const PRIORITY_STYLES: Record<string, string> = {
  caliente: "bg-red-100 text-red-700",
  tibio: "bg-yellow-100 text-yellow-700",
  frio: "bg-blue-100 text-blue-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  caliente: "Caliente",
  tibio: "Tibio",
  frio: "Frío",
};

const OPERATION_OPTIONS = Object.entries(OPERATION_LABELS).map(([value, label]) => ({ value, label }));
const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

function toFormValues(l: Lead): LeadFormValues {
  return {
    contactName: l.contactName,
    contactPhone: l.contactPhone,
    contactEmail: l.contactEmail ?? "",
    operationType: l.operationType,
    propertyType: l.propertyType,
    zonesText: l.zones.join(", "),
    budgetMin: l.budgetMin != null ? String(l.budgetMin) : "",
    budgetMax: l.budgetMax != null ? String(l.budgetMax) : "",
    minRooms: l.minRooms != null ? String(l.minRooms) : "",
    minBathrooms: l.minBathrooms != null ? String(l.minBathrooms) : "",
    needsGarage: l.needsGarage ?? false,
    priority: (l.priority as LeadFormValues["priority"]) ?? "",
    nextFollowUpDate: l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toISOString().slice(0, 10) : "",
    notes: l.notes ?? "",
    status: l.status,
  };
}

function toMutationInput(values: LeadFormValues) {
  const zones = values.zonesText
    .split(",")
    .map((z) => z.trim())
    .filter(Boolean);
  return {
    contactName: values.contactName,
    contactPhone: values.contactPhone,
    contactEmail: values.contactEmail || undefined,
    operationType: values.operationType,
    propertyType: values.propertyType,
    zones,
    priority: values.priority || undefined,
    // null explícito (no undefined) cuando el campo está vacío: así el backend sabe que hay que
    // BORRAR la fecha, en vez de simplemente ignorar el campo y dejar la que ya tenía guardada.
    nextFollowUpDate: values.nextFollowUpDate ? new Date(values.nextFollowUpDate) : null,
    budgetMin: values.budgetMin ? Number(values.budgetMin) : undefined,
    budgetMax: values.budgetMax ? Number(values.budgetMax) : undefined,
    minRooms: values.minRooms ? Number(values.minRooms) : undefined,
    minBathrooms: values.minBathrooms ? Number(values.minBathrooms) : undefined,
    needsGarage: values.needsGarage || undefined,
    notes: values.notes || undefined,
    status: values.status || undefined,
  };
}

function FollowUpBadge({ date }: { date: Lead["nextFollowUpDate"] }) {
  const status = getFollowUpStatus(date);
  if (!status) return null;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FOLLOW_UP_STYLES[status]}`}>
      {FOLLOW_UP_LABELS[status]}
    </span>
  );
}

// Iniciales del contacto para el avatar de la fila. Es sólo un ancla visual: en una lista larga,
// una figura redonda al principio de cada fila ayuda a no perder el renglón.
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

function budgetLabel(lead: Lead): string {
  if (lead.budgetMin && lead.budgetMax) return `${lead.budgetMin} a ${lead.budgetMax}`;
  if (lead.budgetMax) return `hasta ${lead.budgetMax}`;
  if (lead.budgetMin) return `desde ${lead.budgetMin}`;
  return "—";
}

function searchingLabel(lead: Lead): string {
  const type = PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType;
  const zones = lead.zones.length > 0 ? lead.zones.join(", ") : "sin zona";
  return `${type} · ${zones}`;
}

export function Leads() {
  const utils = trpc.useUtils();
  const toast = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  // Se guarda en una constante (en vez de escribirlo inline en el useQuery) porque las actualizaciones
  // optimistas necesitan tocar exactamente esta misma entrada de la caché.
  const listInput = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    operationType: operationFilter || undefined,
    propertyType: typeFilter || undefined,
    status: statusFilter || undefined,
  };

  const list = trpc.leads.list.useQuery(listInput);
  const followUps = trpc.leads.followUpSummary.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const create = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
      setModalOpen(false);
      toast("Lead creado.");
    },
    onError: () => toast("No se pudo crear el lead.", "error"),
  });
  const update = trpc.leads.update.useMutation({
    onSuccess: (updatedLead) => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
      // Sin esto, si volvés a la ficha de detalle del lead (LeadDetail.tsx) sin recargar la página,
      // podía seguir mostrando los datos de antes de editar.
      utils.leads.getById.invalidate({ id: updatedLead.id });
      setModalOpen(false);
      toast("Cambios guardados.");
    },
    onError: () => toast("No se pudieron guardar los cambios.", "error"),
  });
  // Borrado optimista: la tarjeta desaparece al instante y, si el servidor falla, vuelve a su lugar.
  const deleteLead = trpc.leads.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.leads.list.cancel(listInput);
      const previous = utils.leads.list.getData(listInput);
      utils.leads.list.setData(listInput, (old) =>
        old ? { ...old, items: old.items.filter((l) => l.id !== id), total: Math.max(0, old.total - 1) } : old,
      );
      return { previous };
    },
    onSuccess: () => toast("Lead enviado a la papelera."),
    onError: (_error, _variables, context) => {
      if (context?.previous) utils.leads.list.setData(listInput, context.previous);
      toast("No se pudo eliminar el lead.", "error");
    },
    onSettled: () => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
    },
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  // El botón flotante de alta rápida llega acá con ?new=1 y abre este mismo formulario.
  useNewParam(openCreate);

  function openEdit(l: Lead) {
    setEditing(l);
    setModalOpen(true);
  }

  function handleSubmit(values: LeadFormValues) {
    if (editing) {
      update.mutate({ id: editing.id, ...toMutationInput(values) });
    } else {
      create.mutate(toMutationInput(values));
    }
  }

  function handleDelete(l: Lead) {
    if (confirm(`¿Eliminar a "${l.contactName}"? Vas a poder recuperarlo más adelante desde la papelera.`)) {
      deleteLead.mutate({ id: l.id });
    }
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setOperationFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  }

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || operationFilter || typeFilter || statusFilter);

  // El panel de urgentes de antes mostraba también los "próximos" (hasta 3 días). Acá sólo entran
  // los que hay que resolver hoy: vencidos y de hoy. Los próximos ya se ven con su badge en la lista.
  const needsAttention = (followUps.data?.items ?? []).filter((lead) => {
    const status = getFollowUpStatus(lead.nextFollowUpDate);
    return status === "vencido" || status === "hoy";
  });
  const overdueCount = followUps.data?.overdueCount ?? 0;

  usePageChrome("Leads", total > 0 ? `${total} ${hasFilters ? "con los filtros puestos" : "cargados"}` : undefined);

  function menuItemsFor(l: Lead) {
    return [
      { label: "Editar", onSelect: () => openEdit(l) },
      { label: "Ver ficha e historial", onSelect: () => navigate(`/app/leads/${l.id}`) },
      { label: "Eliminar", onSelect: () => handleDelete(l), danger: true },
    ];
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-5">

      {needsAttention.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-2.5">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5 text-red-700">
              <path d="M12 8v5M12 16.5h.01M12 3.5 2.8 19.5h18.4z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-red-700">
              {needsAttention.length} {needsAttention.length === 1 ? "seguimiento" : "seguimientos"} para resolver
              {overdueCount > 0 && needsAttention.length > overdueCount ? ` (${overdueCount} vencidos)` : ""}
            </span>
            <span className="block truncate text-[11.5px] text-red-900/70">
              {needsAttention.slice(0, 3).map((l) => l.contactName).join(", ")}
              {needsAttention.length > 3 ? ` y ${needsAttention.length - 3} más` : ""}
            </span>
          </span>
          <button
            type="button"
            onClick={() => navigate(`/app/leads/${needsAttention[0].id}`)}
            className="flex h-7 flex-shrink-0 items-center rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            Empezar
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 md:max-w-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint">
              <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4.5 4.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <FilterSelect label="Operación" options={OPERATION_OPTIONS} value={operationFilter} onChange={(v) => updateFilter(setOperationFilter, v)} />
            <FilterSelect label="Tipo" options={PROPERTY_TYPE_OPTIONS} value={typeFilter} onChange={(v) => updateFilter(setTypeFilter, v)} />
            <FilterSelect label="Estado" options={STATUS_OPTIONS} value={statusFilter} onChange={(v) => updateFilter(setStatusFilter, v)} />
          </div>

          <Button size="sm" onClick={openCreate} className="ml-auto hidden flex-shrink-0 md:inline-flex">
            + Nuevo lead
          </Button>
        </div>

        <div className="flex flex-col gap-2 lg:hidden">
          <FilterChips label="Operación" options={OPERATION_OPTIONS} value={operationFilter} onChange={(v) => updateFilter(setOperationFilter, v)} />
          <FilterChips label="Estado" options={STATUS_OPTIONS} value={statusFilter} onChange={(v) => updateFilter(setStatusFilter, v)} />
        </div>
      </div>

      {list.isLoading && <SkeletonList count={5} />}

      {!list.isLoading && items.length === 0 && !hasFilters && (
        <EmptyState
          icon="👤"
          title="Todavía no cargaste ningún lead"
          description="Un lead es un cliente que busca algo. Cargá qué busca y el sistema te avisa solo cuando una propiedad de tu cartera le encaja."
          actionLabel="+ Cargar mi primer lead"
          onAction={openCreate}
        />
      )}

      {!list.isLoading && items.length === 0 && hasFilters && (
        <EmptyState
          icon="🔍"
          title="Ningún lead coincide"
          description="Probá con otro nombre o sacá alguno de los filtros que tenés puestos."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      )}

      {items.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-hairline bg-surface lg:block">
            <div className="flex items-center gap-3 border-b border-hairline bg-gray-50/60 px-4 py-2 text-[10px] font-semibold tracking-[0.06em] text-ink-faint">
              <span className="flex-1">CONTACTO</span>
              <span className="hidden w-52 flex-shrink-0 xl:block">BUSCA</span>
              <span className="hidden w-32 flex-shrink-0 text-right 2xl:block">PRESUPUESTO</span>
              <span className="hidden w-20 flex-shrink-0 2xl:block">PRIORIDAD</span>
              <span className="w-24 flex-shrink-0">ESTADO</span>
              <span className="w-36 flex-shrink-0">SEGUIMIENTO</span>
              <span className="w-8 flex-shrink-0" />
            </div>

            {items.map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(`/app/leads/${l.id}`)}
                className="flex cursor-pointer items-center gap-3 border-b border-divider-soft px-4 py-2 transition-colors last:border-b-0 hover:bg-gray-50/70"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-semibold text-ink-soft">
                    {initialsFor(l.contactName)}
                  </span>
                  <span className="min-w-0">
                    <Link
                      to={`/app/leads/${l.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate text-[13px] font-semibold text-ink hover:text-teal-700"
                    >
                      {l.contactName}
                    </Link>
                    <span className="block truncate text-[11.5px] tabular-nums text-ink-mute">{l.contactPhone}</span>
                  </span>
                </span>

                <span className="hidden w-52 flex-shrink-0 truncate text-[11.5px] text-ink-soft xl:block">{searchingLabel(l)}</span>
                <span className="hidden w-32 flex-shrink-0 truncate text-right text-[12.5px] font-medium tabular-nums text-ink-soft 2xl:block">{budgetLabel(l)}</span>

                <span className="hidden w-20 flex-shrink-0 2xl:block">
                  {l.priority && (
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${PRIORITY_STYLES[l.priority] ?? "bg-gray-100 text-ink-soft"}`}>
                      {PRIORITY_LABELS[l.priority] ?? l.priority}
                    </span>
                  )}
                </span>

                <span className="w-24 flex-shrink-0">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
                    {STATUS_LABELS[l.status] ?? l.status}
                  </span>
                </span>

                <span className="w-36 flex-shrink-0"><FollowUpBadge date={l.nextFollowUpDate} /></span>

                <span onClick={(e) => e.stopPropagation()} className="flex">
                  <Menu items={menuItemsFor(l)} />
                </span>
              </div>
            ))}
          </div>

          {/* Celular: Llamar es la acción principal — un lead se atiende con el teléfono en la mano. */}
          <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:hidden">
            {items.map((l) => (
              <li key={l.id} className="overflow-hidden rounded-xl border border-hairline bg-surface">
                <div onClick={() => navigate(`/app/leads/${l.id}`)} className="flex flex-col gap-1.5 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {l.priority && (
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${PRIORITY_STYLES[l.priority] ?? "bg-gray-100 text-ink-soft"}`}>
                        {PRIORITY_LABELS[l.priority] ?? l.priority}
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                    <FollowUpBadge date={l.nextFollowUpDate} />
                  </div>
                  <span className="text-[15px] font-bold tracking-tight text-ink">{l.contactName}</span>
                  <span className="text-xs text-ink-mute">
                    Busca {searchingLabel(l).toLowerCase()} · {budgetLabel(l)}
                  </span>
                </div>

                <div className="flex items-stretch border-t border-divider">
                  <a
                    href={`tel:${l.contactPhone}`}
                    className="flex h-11 flex-1 items-center justify-center gap-2 text-[12.5px] font-semibold text-teal-700 transition-colors active:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5C11.6 19.6 4.4 12.4 3.5 5.2A1.5 1.5 0 0 1 5 3.5z" />
                    </svg>
                    Llamar
                  </a>
                  <span className="w-px bg-divider" />
                  <button
                    type="button"
                    onClick={() => openEdit(l)}
                    className="flex h-11 flex-1 items-center justify-center gap-2 text-[12.5px] font-medium text-ink-soft transition-colors active:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M4 20h4L19 9l-4-4L4 16z" />
                    </svg>
                    Editar
                  </button>
                  <span className="w-px bg-divider" />
                  <span className="flex w-13 items-center justify-center">
                    <Menu items={menuItemsFor(l)} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button variant="link" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Anterior
          </Button>
          <span className="text-[12.5px] tabular-nums text-ink-mute">
            Página {page} de {totalPages}
          </span>
          <Button variant="link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Siguiente →
          </Button>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar lead" : "Nuevo lead"}>
        <LeadForm
          key={editing?.id ?? "new"}
          initialValues={editing ? toFormValues(editing) : emptyLeadForm}
          submitLabel={editing ? "Guardar cambios" : "Agregar"}
          submitting={create.isPending || update.isPending}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
