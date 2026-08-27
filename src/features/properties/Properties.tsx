// Lista de propiedades de la cuenta logueada: alta y edición en modal, duplicado, borrado (papelera),
// paginación y búsqueda/filtros (texto libre + chips de operación/tipo/estado/etiqueta).
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { trpc, API_URL } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { Modal } from "../../components/Modal";
import { PropertyForm, emptyPropertyForm } from "./PropertyForm";
import type { PropertyFormValues } from "./PropertyForm";
import { FilterChips } from "../../components/FilterChips";
import { FilterSelect } from "../../components/FilterSelect";
import { Menu } from "../../components/Menu";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonList } from "../../components/Skeleton";
import { useToast } from "../../lib/toast";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { useNewParam } from "../../lib/useNewParam";
import { usePageChrome } from "../../lib/pageChrome";

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
    currency: p.currency,
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
    currency: values.currency,
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

// Resume las características de una propiedad en una sola línea, salteando lo que no esté cargado.
function metaLine(p: Property): string {
  const parts = [p.zone];
  if (p.coveredArea != null) parts.push(`${p.coveredArea} m²`);
  if (p.rooms != null) parts.push(`${p.rooms} amb`);
  if (p.bathrooms != null) parts.push(`${p.bathrooms} ${p.bathrooms === 1 ? "baño" : "baños"}`);
  if (p.garage) parts.push("cochera");
  return parts.join(" · ");
}

// "hoy" / "ayer" / "22 ago": en una columna angosta, una fecha completa no aporta y ocupa el doble.
function shortDate(value: string | Date): string {
  const date = new Date(value);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

const STATUS_STYLES: Record<string, string> = {
  disponible: "bg-teal-50 text-teal-700",
  reservada: "bg-gray-100 text-ink-soft",
  vendida: "bg-gray-100 text-ink-soft",
  pausada: "bg-gray-100 text-ink-soft",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLES[status] ?? "bg-gray-100 text-ink-soft"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Thumb({ url, alt, size }: { url?: string; alt: string; size: string }) {
  if (url) return <img src={url} alt={alt} className={`${size} flex-shrink-0 rounded-lg object-cover`} />;
  return (
    <span className={`${size} flex flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 3-3L20 17" />
        <circle cx="9" cy="9" r="1.4" />
      </svg>
    </span>
  );
}

export function Properties() {
  const utils = trpc.useUtils();
  const toast = useToast();
  const navigate = useNavigate();
  // El buscador global puede llegar acá con ?q=<texto> para dejar la lista ya filtrada por zona.
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [operationFilter, setOperationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
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
    tag: tagFilter || undefined,
  };

  const list = trpc.properties.list.useQuery(listInput);
  const topTags = trpc.properties.topTags.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const create = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
      setModalOpen(false);
      toast("Propiedad creada.");
    },
    onError: () => toast("No se pudo crear la propiedad.", "error"),
  });

  const update = trpc.properties.update.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.topTags.invalidate();
      setModalOpen(false);
      toast("Cambios guardados.");
    },
    onError: () => toast("No se pudieron guardar los cambios.", "error"),
  });

  // Borrado optimista: la tarjeta desaparece al instante y, si el servidor falla, vuelve a su lugar.
  const deleteProperty = trpc.properties.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.properties.list.cancel(listInput);
      const previous = utils.properties.list.getData(listInput);
      utils.properties.list.setData(listInput, (old) =>
        old ? { ...old, items: old.items.filter((p) => p.id !== id), total: Math.max(0, old.total - 1) } : old,
      );
      return { previous };
    },
    onSuccess: () => toast("Propiedad enviada a la papelera."),
    onError: (_error, _variables, context) => {
      if (context?.previous) utils.properties.list.setData(listInput, context.previous);
      toast("No se pudo eliminar la propiedad.", "error");
    },
    onSettled: () => {
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
      toast("Copia creada. Ajustá lo que cambie y guardá.");
    },
    onError: () => toast("No se pudo duplicar la propiedad.", "error"),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  // El botón flotante de alta rápida llega acá con ?new=1 y abre este mismo formulario.
  useNewParam(openCreate);

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

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setOperationFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setTagFilter("");
    setPage(1);
  }

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tagOptions = (topTags.data ?? []).map((t) => ({ value: t.tag, label: t.tag }));
  const hasFilters = Boolean(search || operationFilter || typeFilter || statusFilter || tagFilter);

  usePageChrome(
    "Propiedades",
    total > 0 ? `${total} ${hasFilters ? "con los filtros puestos" : "en cartera"}` : undefined,
  );

  // Las mismas acciones alimentan el menú "⋯" del escritorio y el del celular.
  function menuItemsFor(p: Property) {
    return [
      { label: "Editar", onSelect: () => openEdit(p) },
      { label: "Duplicar", onSelect: () => handleDuplicate(p), disabled: duplicateProperty.isPending },
      { label: "Ver ficha completa", onSelect: () => navigate(`/app/properties/${p.id}`) },
      { label: "Eliminar", onSelect: () => handleDelete(p), danger: true },
    ];
  }

  function whatsappLink(p: Property) {
    const link = `${API_URL}/p/${p.id}`;
    return `https://wa.me/?text=${encodeURIComponent(`${p.title} — ${p.currency} ${p.price}\n${link}`)}`;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-5">

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
              placeholder="Buscar por título o zona..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <FilterSelect label="Operación" options={OPERATION_OPTIONS} value={operationFilter} onChange={(v) => updateFilter(setOperationFilter, v)} />
            <FilterSelect label="Tipo" options={PROPERTY_TYPE_OPTIONS} value={typeFilter} onChange={(v) => updateFilter(setTypeFilter, v)} />
            <FilterSelect label="Estado" options={STATUS_OPTIONS} value={statusFilter} onChange={(v) => updateFilter(setStatusFilter, v)} />
            {tagOptions.length > 0 && (
              <FilterSelect label="Etiqueta" options={tagOptions} value={tagFilter} onChange={(v) => updateFilter(setTagFilter, v)} />
            )}
          </div>

          <Button size="sm" onClick={openCreate} className="ml-auto hidden flex-shrink-0 md:inline-flex">
            + Nueva propiedad
          </Button>
        </div>

        {/* En celular los filtros no entran como desplegables en una fila: van como chips. */}
        <div className="flex flex-col gap-2 lg:hidden">
          <FilterChips label="Operación" options={OPERATION_OPTIONS} value={operationFilter} onChange={(v) => updateFilter(setOperationFilter, v)} />
          <FilterChips label="Estado" options={STATUS_OPTIONS} value={statusFilter} onChange={(v) => updateFilter(setStatusFilter, v)} />
          {tagOptions.length > 0 && (
            <FilterChips label="Etiqueta" options={tagOptions} value={tagFilter} onChange={(v) => updateFilter(setTagFilter, v)} />
          )}
        </div>
      </div>

      {list.isLoading && <SkeletonList count={5} withImage />}

      {!list.isLoading && items.length === 0 && !hasFilters && (
        <EmptyState
          icon="🏠"
          title="Todavía no cargaste ninguna propiedad"
          description="Cargá la primera en menos de 30 segundos: alcanza con título, operación, tipo, precio y zona."
          actionLabel="+ Cargar mi primera propiedad"
          onAction={openCreate}
        />
      )}

      {!list.isLoading && items.length === 0 && hasFilters && (
        <EmptyState
          icon="🔍"
          title="Ninguna propiedad coincide"
          description="Probá con otras palabras o sacá alguno de los filtros que tenés puestos."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      )}

      {items.length > 0 && (
        <>
          {/* Escritorio: tabla densa. Entran tres veces más propiedades por pantalla que con tarjetas,
              y el precio alineado a la derecha se puede comparar de un vistazo. */}
          <div className="hidden overflow-hidden rounded-xl border border-hairline bg-surface lg:block">
            <div className="flex items-center gap-3 border-b border-hairline bg-gray-50/60 px-4 py-2 text-[10px] font-semibold tracking-[0.06em] text-ink-faint">
              <span className="w-11 flex-shrink-0" />
              <span className="flex-1">PROPIEDAD</span>
              <span className="hidden w-44 flex-shrink-0 xl:block">ETIQUETAS</span>
              <span className="w-24 flex-shrink-0">ESTADO</span>
              <span className="w-28 flex-shrink-0 text-right">PRECIO</span>
              <span className="hidden w-16 flex-shrink-0 text-right 2xl:block">EDITADA</span>
              <span className="w-8 flex-shrink-0" />
            </div>

            {items.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/app/properties/${p.id}`)}
                className="flex cursor-pointer items-center gap-3 border-b border-divider-soft px-4 py-2 transition-colors last:border-b-0 hover:bg-gray-50/70"
              >
                <Thumb url={p.images[0]?.url} alt={p.title} size="h-11 w-11" />

                <span className="min-w-0 flex-1">
                  <Link
                    to={`/app/properties/${p.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-[13px] font-semibold text-ink hover:text-teal-700"
                  >
                    {p.title}
                  </Link>
                  <span className="block truncate text-[11.5px] text-ink-mute">{metaLine(p)}</span>
                </span>

                <span className="hidden w-44 flex-shrink-0 gap-1 overflow-hidden xl:flex">
                  {p.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="truncate rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">{tag}</span>
                  ))}
                  {p.tags.length > 2 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-faint">+{p.tags.length - 2}</span>
                  )}
                </span>

                <span className="w-24 flex-shrink-0">
                  <StatusPill status={p.status} />
                  {p.exclusive && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-800">excl.</span>}
                </span>

                <span className="w-28 flex-shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">
                  {p.currency} {p.price}
                </span>

                <span className="hidden w-16 flex-shrink-0 text-right text-[11.5px] tabular-nums text-ink-faint 2xl:block">{shortDate(p.updatedAt)}</span>

                <span onClick={(e) => e.stopPropagation()} className="flex">
                  <Menu items={menuItemsFor(p)} />
                </span>
              </div>
            ))}
          </div>

          {/* Celular: tarjeta, con Compartir como acción principal — es lo que más se usa en la calle. */}
          <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:hidden">
            {items.map((p) => (
              <li key={p.id} className="overflow-hidden rounded-xl border border-hairline bg-surface">
                <div onClick={() => navigate(`/app/properties/${p.id}`)} className="flex gap-3 p-3">
                  <Thumb url={p.images[0]?.url} alt={p.title} size="h-19 w-19" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-base font-bold tracking-tight tabular-nums text-ink">
                        {p.currency} {p.price}
                      </span>
                      <span className="ml-auto flex-shrink-0"><StatusPill status={p.status} /></span>
                    </span>
                    <span className="truncate text-[13px] font-medium text-ink-soft">{p.title}</span>
                    <span className="truncate text-xs text-ink-mute">{metaLine(p)}</span>
                  </span>
                </div>

                <div className="flex items-stretch border-t border-divider">
                  <a
                    href={whatsappLink(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 flex-1 items-center justify-center gap-2 text-[12.5px] font-semibold text-teal-700 transition-colors active:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.3A8.5 8.5 0 1 1 20.5 11.5z" />
                    </svg>
                    Compartir
                  </a>
                  <span className="w-px bg-divider" />
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="flex h-11 flex-1 items-center justify-center gap-2 text-[12.5px] font-medium text-ink-soft transition-colors active:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M4 20h4L19 9l-4-4L4 16z" />
                    </svg>
                    Editar
                  </button>
                  <span className="w-px bg-divider" />
                  <span className="flex w-13 items-center justify-center">
                    <Menu items={menuItemsFor(p)} />
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
