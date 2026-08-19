// Lista de leads de la cuenta logueada: alta y edición en modal, borrado (papelera), paginación,
// búsqueda/filtros (texto libre + chips de operación/tipo/estado) y panel de seguimientos urgentes.
import { useState } from "react";
import { trpc } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { Modal } from "../../components/Modal";
import { LeadForm, emptyLeadForm } from "./LeadForm";
import type { LeadFormValues } from "./LeadForm";
import { FilterChips } from "../../components/FilterChips";
import { getFollowUpStatus, FOLLOW_UP_LABELS, FOLLOW_UP_STYLES } from "../../lib/followUp";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

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

export function Leads() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const list = trpc.leads.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    operationType: operationFilter || undefined,
    propertyType: typeFilter || undefined,
    status: statusFilter || undefined,
  });
  const followUps = trpc.leads.followUpSummary.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const create = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
      setModalOpen(false);
    },
  });
  const update = trpc.leads.update.useMutation({
    onSuccess: (updatedLead) => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
      // Sin esto, si volvés a la ficha de detalle del lead (LeadDetail.tsx) sin recargar la página,
      // podía seguir mostrando los datos de antes de editar.
      utils.leads.getById.invalidate({ id: updatedLead.id });
      setModalOpen(false);
    },
  });
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.followUpSummary.invalidate();
    },
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

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

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const urgentLeads = followUps.data?.items ?? [];
  const hasFilters = Boolean(search || operationFilter || typeFilter || statusFilter);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button
          onClick={openCreate}
          className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
        >
          + Agregar
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre..."
          className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
        />
        <FilterChips
          label="Operación"
          options={OPERATION_OPTIONS}
          value={operationFilter}
          onChange={(v) => updateFilter(setOperationFilter, v)}
        />
        <FilterChips
          label="Tipo"
          options={PROPERTY_TYPE_OPTIONS}
          value={typeFilter}
          onChange={(v) => updateFilter(setTypeFilter, v)}
        />
        <FilterChips
          label="Estado"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(v) => updateFilter(setStatusFilter, v)}
        />
      </div>

      {urgentLeads.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Seguimientos urgentes</h2>
          <ul className="flex flex-col gap-2">
            {urgentLeads.map((l) => (
              <li
                key={l.id}
                className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2 cursor-pointer hover:border-teal-300"
                onClick={() => openEdit(l)}
              >
                <p className="text-sm font-medium text-gray-900 break-words">{l.contactName}</p>
                <FollowUpBadge date={l.nextFollowUpDate} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {list.isLoading && <p className="text-gray-500">Cargando...</p>}
      {!list.isLoading && items.length === 0 && !hasFilters && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          Todavía no cargaste ningún lead. Tocá "+ Agregar" para crear el primero.
        </p>
      )}
      {!list.isLoading && items.length === 0 && hasFilters && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          No hay leads que coincidan con la búsqueda/filtros.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((l) => (
          <li key={l.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                {OPERATION_LABELS[l.operationType] ?? l.operationType}
              </span>
              <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {PROPERTY_TYPE_LABELS[l.propertyType] ?? l.propertyType}
              </span>
              <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {STATUS_LABELS[l.status] ?? l.status}
              </span>
              {l.priority && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[l.priority] ?? "bg-gray-100 text-gray-700"}`}>
                  {PRIORITY_LABELS[l.priority] ?? l.priority}
                </span>
              )}
              <FollowUpBadge date={l.nextFollowUpDate} />
            </div>
            <p className="font-medium break-words">
              {l.contactName} — {l.contactPhone}
            </p>
            <p className="text-sm text-gray-600 mt-1 break-words">
              Busca {OPERATION_LABELS[l.operationType]?.toLowerCase() ?? l.operationType} en {l.zones.join(", ")}
              {(l.budgetMin || l.budgetMax) && (
                <>
                  {" "}
                  — presupuesto {l.budgetMin ?? "?"} a {l.budgetMax ?? "?"}
                </>
              )}
            </p>
            {l.notes && <p className="text-sm text-gray-500 mt-1 break-words">Notas: {l.notes}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <button onClick={() => openEdit(l)} className="text-teal-700 hover:underline">
                Editar
              </button>
              <button onClick={() => handleDelete(l)} className="text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-teal-700 disabled:text-gray-300"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-teal-700 disabled:text-gray-300"
          >
            Siguiente →
          </button>
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
