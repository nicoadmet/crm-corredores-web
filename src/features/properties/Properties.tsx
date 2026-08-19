// Lista de propiedades de la cuenta logueada: alta y edición en modal, duplicado, borrado (papelera),
// paginación y búsqueda/filtros (texto libre + chips de operación/tipo/estado/etiqueta).
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { trpc, API_URL } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { supabase } from "../../lib/supabase";
import { Modal } from "../../components/Modal";
import { PropertyForm, emptyPropertyForm } from "./PropertyForm";
import type { PropertyFormValues } from "./PropertyForm";
import { FilterChips } from "../../components/FilterChips";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

type Property = RouterOutputs["properties"]["list"]["items"][number];

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
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  pausada: "Pausada",
};

const OPERATION_OPTIONS = Object.entries(OPERATION_LABELS).map(([value, label]) => ({ value, label }));
const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

function toFormValues(p: Property): PropertyFormValues {
  return {
    title: p.title,
    operationType: p.operationType,
    propertyType: p.propertyType,
    price: String(p.price),
    zone: p.zone,
    address: p.address ?? "",
    rooms: p.rooms != null ? String(p.rooms) : "",
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
    garage: p.garage,
    garageSpaces: p.garageSpaces != null ? String(p.garageSpaces) : "",
    coveredArea: p.coveredArea != null ? String(p.coveredArea) : "",
    totalArea: p.totalArea != null ? String(p.totalArea) : "",
    floor: p.floor ?? "",
    age: p.age != null ? String(p.age) : "",
    description: p.description ?? "",
    ownerName: p.ownerName ?? "",
    ownerPhone: p.ownerPhone ?? "",
    ownerNotes: p.ownerNotes ?? "",
    exclusive: p.exclusive,
    exclusiveUntil: p.exclusiveUntil ? new Date(p.exclusiveUntil).toISOString().slice(0, 10) : "",
    tagsText: p.tags.join(", "),
  };
}

function toMutationInput(values: PropertyFormValues) {
  return {
    title: values.title,
    operationType: values.operationType,
    propertyType: values.propertyType,
    price: Number(values.price),
    zone: values.zone,
    address: values.address || undefined,
    rooms: values.rooms ? Number(values.rooms) : undefined,
    bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
    bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
    garage: values.garage,
    garageSpaces: values.garage && values.garageSpaces ? Number(values.garageSpaces) : undefined,
    coveredArea: values.coveredArea ? Number(values.coveredArea) : undefined,
    totalArea: values.totalArea ? Number(values.totalArea) : undefined,
    floor: values.floor || undefined,
    age: values.age ? Number(values.age) : undefined,
    description: values.description || undefined,
    ownerName: values.ownerName || undefined,
    ownerPhone: values.ownerPhone || undefined,
    ownerNotes: values.ownerNotes || undefined,
    exclusive: values.exclusive,
    exclusiveUntil: values.exclusive && values.exclusiveUntil ? new Date(values.exclusiveUntil) : undefined,
    tags: values.tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

export function Properties() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const list = trpc.properties.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    operationType: operationFilter || undefined,
    propertyType: typeFilter || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
  });
  const topTags = trpc.properties.topTags.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const create = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
      setModalOpen(false);
    },
  });

  const update = trpc.properties.update.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
      setModalOpen(false);
    },
  });

  const deleteProperty = trpc.properties.delete.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
    },
  });

  const duplicateProperty = trpc.properties.duplicate.useMutation({
    onSuccess: (copy) => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
      setEditing(copy);
      setModalOpen(true);
    },
  });

  const addImage = trpc.propertyImages.create.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setModalOpen(true);
  }

  function handleSubmit(values: PropertyFormValues) {
    if (editing) {
      update.mutate({ id: editing.id, ...toMutationInput(values) });
    } else {
      create.mutate(toMutationInput(values));
    }
  }

  function handleDelete(p: Property) {
    if (confirm(`¿Eliminar "${p.title}"? Vas a poder recuperarla más adelante desde la papelera.`)) {
      deleteProperty.mutate({ id: p.id });
    }
  }

  function handleDuplicate(p: Property) {
    duplicateProperty.mutate({ id: p.id });
  }

  async function handlePhoto(propertyId: string, file: File) {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${propertyId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("property-images").upload(path, compressed);
    if (error) {
      console.error(error);
      return;
    }

    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    addImage.mutate({ propertyId, url: data.publicUrl });
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tagOptions = (topTags.data ?? []).map((t) => ({ value: t.tag, label: t.tag }));
  const hasFilters = Boolean(search || operationFilter || typeFilter || statusFilter || tagFilter);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
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
          placeholder="Buscar por título o zona..."
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
        {tagOptions.length > 0 && (
          <FilterChips
            label="Etiqueta"
            options={tagOptions}
            value={tagFilter}
            onChange={(v) => updateFilter(setTagFilter, v)}
          />
        )}
      </div>

      {list.isLoading && <p className="text-gray-500">Cargando...</p>}
      {!list.isLoading && items.length === 0 && !hasFilters && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          Todavía no cargaste ninguna propiedad. Tocá "+ Agregar" para crear la primera.
        </p>
      )}
      {!list.isLoading && items.length === 0 && hasFilters && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          No hay propiedades que coincidan con la búsqueda/filtros.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {items.map((p) => {
          const link = `${API_URL}/p/${p.id}`;
          const texto = encodeURIComponent(`${p.title} — ${p.currency} ${p.price}\n${link}`);
          return (
            <li key={p.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
              {p.images[0] && (
                <img src={p.images[0].url} alt={p.title} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    {OPERATION_LABELS[p.operationType] ?? p.operationType}
                  </span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType}
                  </span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  {p.exclusive && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">🔒 Exclusiva</span>
                  )}
                </div>
                <p className="font-medium break-words">
                  {p.title} — {p.zone} — {p.currency} {p.price}
                </p>
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  <a
                    href={`https://wa.me/?text=${texto}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    Compartir por WhatsApp
                  </a>
                  <button onClick={() => openEdit(p)} className="text-teal-700 hover:underline">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDuplicate(p)}
                    disabled={duplicateProperty.isPending}
                    className="text-teal-700 hover:underline disabled:text-gray-300"
                  >
                    Duplicar
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs max-w-[140px]"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhoto(p.id, file);
                    }}
                  />
                </div>
                <details className="mt-2 text-sm text-gray-600">
                  <summary className="cursor-pointer text-teal-700">Ver detalle</summary>
                  <div className="mt-2 flex flex-col gap-1 break-words">
                    {p.address && <p>Dirección: {p.address}</p>}
                    {p.rooms != null && <p>Ambientes: {p.rooms}</p>}
                    {p.bedrooms != null && <p>Dormitorios: {p.bedrooms}</p>}
                    {p.bathrooms != null && <p>Baños: {p.bathrooms}</p>}
                    {p.garage && <p>Cochera{p.garageSpaces ? ` (${p.garageSpaces})` : ""}</p>}
                    {p.coveredArea != null && <p>M² cubiertos: {p.coveredArea}</p>}
                    {p.totalArea != null && <p>M² totales: {p.totalArea}</p>}
                    {p.floor && <p>Piso/unidad: {p.floor}</p>}
                    {p.age != null && <p>Antigüedad: {p.age === 0 ? "A estrenar" : `${p.age} años`}</p>}
                    {p.description && <p>Descripción: {p.description}</p>}
                    {p.exclusive && (
                      <p>
                        Exclusividad
                        {p.exclusiveUntil ? ` hasta ${new Date(p.exclusiveUntil).toLocaleDateString()}` : ""}
                      </p>
                    )}
                    {(p.ownerName || p.ownerPhone || p.ownerNotes) && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="font-medium text-gray-700">Propietario (uso interno):</p>
                        {p.ownerName && <p>Nombre: {p.ownerName}</p>}
                        {p.ownerPhone && <p>Teléfono: {p.ownerPhone}</p>}
                        {p.ownerNotes && <p>Notas: {p.ownerNotes}</p>}
                      </div>
                    )}
                    {p.priceHistory.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="font-medium text-gray-700">Historial de precios:</p>
                        <ul className="flex flex-col gap-1 mt-1">
                          {p.priceHistory.map((entry, i) => {
                            const prev = p.priceHistory[i - 1];
                            const prevPrice = prev ? Number(prev.price) : null;
                            const currentPrice = Number(entry.price);
                            const priceWentUp = prevPrice != null && currentPrice > prevPrice;
                            const priceWentDown = prevPrice != null && currentPrice < prevPrice;
                            return (
                              <li key={entry.id} className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                                <span>
                                  {entry.currency} {entry.price}
                                </span>
                                {i === 0 && <span className="text-xs text-gray-400">(precio inicial)</span>}
                                {priceWentUp && <span className="text-xs text-teal-700">↑ subió</span>}
                                {priceWentDown && <span className="text-xs text-red-600">↓ bajó</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </li>
          );
        })}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar propiedad" : "Nueva propiedad"}>
        <PropertyForm
          key={editing?.id ?? "new"}
          initialValues={editing ? toFormValues(editing) : emptyPropertyForm}
          submitLabel={editing ? "Guardar cambios" : "Agregar"}
          submitting={create.isPending || update.isPending}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
