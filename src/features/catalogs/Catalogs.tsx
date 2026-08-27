// Lista de catálogos: cada uno agrupa varias propiedades bajo un link público único para
// compartir por WhatsApp. Alta/edición en modal (nombre + checklist de propiedades), sin papelera.
import { useState } from "react";
import { trpc, API_URL } from "../../trpc";
import type { RouterOutputs } from "../../trpc";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonList } from "../../components/Skeleton";
import { useToast } from "../../lib/toast";
import { useNewParam } from "../../lib/useNewParam";
import { usePageChrome } from "../../lib/pageChrome";
import { Menu } from "../../components/Menu";
import { Field, FormLayout, TextInput } from "../../components/form";
import { SharePreview } from "../../components/SharePreview";

type Catalog = RouterOutputs["catalogs"]["list"][number];
type PropertyOption = RouterOutputs["properties"]["list"]["items"][number];

export function Catalogs() {
  const utils = trpc.useUtils();
  const toast = useToast();
  const list = trpc.catalogs.list.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Catalog | null>(null);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [previewing, setPreviewing] = useState<Catalog | null>(null);

  // Los metadatos del link los calcula el backend con el mismo helper que usa la página pública,
  // para que la vista previa no se despegue de lo que ve el cliente.
  const previewMeta = trpc.catalogs.shareInfo.useQuery(
    { id: previewing?.id ?? "" },
    { enabled: !!previewing },
  );

  const propertyOptions = trpc.properties.list.useQuery({
    page: 1,
    pageSize: 50,
    search: propertySearch || undefined,
  });

  const create = trpc.catalogs.create.useMutation({
    onSuccess: () => {
      utils.catalogs.list.invalidate();
      setModalOpen(false);
      toast("Catálogo creado.");
    },
    onError: () => toast("No se pudo crear el catálogo.", "error"),
  });

  const update = trpc.catalogs.update.useMutation({
    onSuccess: () => {
      utils.catalogs.list.invalidate();
      setModalOpen(false);
      toast("Cambios guardados.");
    },
    onError: () => toast("No se pudieron guardar los cambios.", "error"),
  });

  // Borrado optimista: la tarjeta desaparece al instante y, si el servidor falla, vuelve a su lugar.
  const deleteCatalog = trpc.catalogs.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.catalogs.list.cancel();
      const previous = utils.catalogs.list.getData();
      utils.catalogs.list.setData(undefined, (old) => (old ? old.filter((c) => c.id !== id) : old));
      return { previous };
    },
    onSuccess: () => toast("Catálogo eliminado."),
    onError: (_error, _variables, context) => {
      if (context?.previous) utils.catalogs.list.setData(undefined, context.previous);
      toast("No se pudo eliminar el catálogo.", "error");
    },
    onSettled: () => utils.catalogs.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setSelectedIds([]);
    setPropertySearch("");
    setModalOpen(true);
  }

  // El botón flotante de alta rápida llega acá con ?new=1 y abre este mismo formulario.
  useNewParam(openCreate);

  function openEdit(c: Catalog) {
    setEditing(c);
    setName(c.name);
    setSelectedIds(c.properties.map((cp) => cp.propertyId));
    setPropertySearch("");
    setModalOpen(true);
  }

  function toggleProperty(id: string) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedIds.length === 0) return;
    if (editing) {
      update.mutate({ id: editing.id, name: name.trim(), propertyIds: selectedIds });
    } else {
      create.mutate({ name: name.trim(), propertyIds: selectedIds });
    }
  }

  function handleDelete(c: Catalog) {
    if (confirm(`¿Eliminar el catálogo "${c.name}"? Esta acción no se puede deshacer.`)) {
      deleteCatalog.mutate({ id: c.id });
    }
  }

  const catalogs = list.data ?? [];
  const properties = propertyOptions.data?.items ?? [];

  usePageChrome(
    "Catálogos",
    catalogs.length > 0 ? `${catalogs.length} ${catalogs.length === 1 ? "armado" : "armados"}` : undefined,
  );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-5">

      <div className="mb-3 flex items-center">
        <p className="text-[12.5px] text-ink-mute">
          Un catálogo agrupa varias propiedades en un solo link para mandar por WhatsApp.
        </p>
        <Button size="sm" onClick={openCreate} className="ml-auto hidden flex-shrink-0 md:inline-flex">
          + Nuevo catálogo
        </Button>
      </div>

      {list.isLoading && <SkeletonList count={3} />}

      {!list.isLoading && catalogs.length === 0 && (
        <EmptyState
          icon="📎"
          title="Todavía no armaste ningún catálogo"
          description="Un catálogo agrupa varias propiedades en un solo link para mandar por WhatsApp, sin ruido de la competencia."
          actionLabel="+ Armar mi primer catálogo"
          onAction={openCreate}
        />
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((c) => {
          const link = `${API_URL}/c/${c.id}`;
          const texto = encodeURIComponent(`${c.name}\n${link}`);
          const covers = c.properties.slice(0, 4);
          return (
            <li key={c.id} className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface transition-colors hover:border-teal-300">
              {/* Las portadas de las primeras propiedades: es la forma más rápida de reconocer un
                  catálogo de un vistazo, más que su nombre. */}
              <div className="grid grid-cols-4 gap-px bg-divider">
                {covers.map((cp) => (
                  <span key={cp.propertyId} className="flex h-16 items-center justify-center bg-gray-100">
                    {cp.property.images[0] ? (
                      <img src={cp.property.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-300">
                        <path d="M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 3-3L20 17" />
                      </svg>
                    )}
                  </span>
                ))}
                {covers.length < 4 &&
                  Array.from({ length: 4 - covers.length }, (_, i) => (
                    <span key={`empty-${i}`} className="h-16 bg-gray-50" />
                  ))}
              </div>

              <div className="flex flex-1 flex-col gap-0.5 p-3">
                <span className="truncate text-[13px] font-semibold text-ink">{c.name}</span>
                <span className="text-[11.5px] tabular-nums text-ink-mute">
                  {c.properties.length} {c.properties.length === 1 ? "propiedad" : "propiedades"}
                </span>
              </div>

              <div className="flex items-stretch border-t border-divider">
                <a
                  href={`https://wa.me/?text=${texto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 flex-1 items-center justify-center gap-2 text-[12.5px] font-semibold text-teal-700 transition-colors hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.3A8.5 8.5 0 1 1 20.5 11.5z" />
                  </svg>
                  Compartir
                </a>
                <span className="w-px bg-divider" />
                <button
                  type="button"
                  onClick={() => setPreviewing(c)}
                  className="flex h-10 flex-1 items-center justify-center gap-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                  Vista previa
                </button>
                <span className="w-px bg-divider" />
                <span className="flex w-11 items-center justify-center">
                  <Menu
                    items={[
                      { label: "Editar", onSelect: () => openEdit(c) },
                      { label: "Abrir el link en otra pestaña", onSelect: () => window.open(link, "_blank", "noopener") },
                      { label: "Eliminar", onSelect: () => handleDelete(c), danger: true },
                    ]}
                  />
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <SharePreview
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        url={`${API_URL}/c/${previewing?.id ?? ""}`}
        meta={previewMeta.data}
        whatsappText={`${previewing?.name ?? ""}\n${API_URL}/c/${previewing?.id ?? ""}`}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar catálogo" : "Nuevo catálogo"}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <FormLayout
            actions={
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              loading={create.isPending || update.isPending}
              disabled={!name.trim() || selectedIds.length === 0}
            >
              {create.isPending || update.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear catálogo"}
            </Button>
            }
          >
          <Field label="Nombre del catálogo" hint="Es lo que va a ver el cliente arriba del link.">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Deptos zona norte"
              required
            />
          </Field>

          <Field label="Propiedades" hint={`${selectedIds.length} seleccionadas`}>
            <TextInput
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Buscar por título o zona..."
            />
          </Field>
          <ul className="flex max-h-64 flex-col gap-px overflow-y-auto rounded-lg border border-hairline p-1">
            {properties.map((p: PropertyOption) => {
              const checked = selectedIds.includes(p.id);
              return (
                <li key={p.id}>
                  <label className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${checked ? "bg-teal-50" : "hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleProperty(p.id)} className="accent-teal-600" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{p.title}</span>
                    <span className="flex-shrink-0 text-[11.5px] tabular-nums text-ink-mute">
                      {p.currency} {p.price}
                    </span>
                  </label>
                </li>
              );
            })}
            {properties.length === 0 && <p className="p-2 text-xs text-ink-faint">No hay propiedades que coincidan.</p>}
          </ul>
          </FormLayout>
        </form>
      </Modal>
    </div>
  );
}
