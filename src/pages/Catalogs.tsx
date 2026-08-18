// Lista de catálogos: cada uno agrupa varias propiedades bajo un link público único para
// compartir por WhatsApp. Alta/edición en modal (nombre + checklist de propiedades), sin papelera.
import { useState } from "react";
import { trpc, API_URL } from "../trpc";
import type { RouterOutputs } from "../trpc";
import { Modal } from "../components/Modal";

type Catalog = RouterOutputs["catalogs"]["list"][number];
type PropertyOption = RouterOutputs["properties"]["list"]["items"][number];

export function Catalogs() {
  const utils = trpc.useUtils();
  const list = trpc.catalogs.list.useQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Catalog | null>(null);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [propertySearch, setPropertySearch] = useState("");

  const propertyOptions = trpc.properties.list.useQuery({
    page: 1,
    pageSize: 50,
    search: propertySearch || undefined,
  });

  const create = trpc.catalogs.create.useMutation({
    onSuccess: () => {
      utils.catalogs.list.invalidate();
      setModalOpen(false);
    },
  });

  const update = trpc.catalogs.update.useMutation({
    onSuccess: () => {
      utils.catalogs.list.invalidate();
      setModalOpen(false);
    },
  });
  
  const deleteCatalog = trpc.catalogs.delete.useMutation({
    onSuccess: () => utils.catalogs.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setSelectedIds([]);
    setPropertySearch("");
    setModalOpen(true);
  }

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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
        <button
          onClick={openCreate}
          className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
        >
          + Nuevo catálogo
        </button>
      </div>

      {list.isLoading && <p className="text-gray-500">Cargando...</p>}
      {!list.isLoading && catalogs.length === 0 && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          Todavía no armaste ningún catálogo. Tocá "+ Nuevo catálogo" para agrupar propiedades y compartirlas con un solo link.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {catalogs.map((c) => {
          const link = `${API_URL}/c/${c.id}`;
          const texto = encodeURIComponent(`${c.name}\n${link}`);
          return (
            <li key={c.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium break-words">{c.name}</p>
              <p className="text-sm text-gray-500 mt-1">{c.properties.length} propiedades</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <a
                  href={`https://wa.me/?text=${texto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Compartir por WhatsApp
                </a>
                <button onClick={() => openEdit(c)} className="text-teal-700 hover:underline">
                  Editar
                </button>
                <button onClick={() => handleDelete(c)} className="text-red-600 hover:underline">
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar catálogo" : "Nuevo catálogo"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del catálogo (ej: Deptos zona norte)"
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
            required
          />
          <input
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
            placeholder="Buscar propiedades por título o zona..."
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
          />
          <p className="text-xs text-gray-500">{selectedIds.length} propiedades seleccionadas</p>
          <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
            {properties.map((p: PropertyOption) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleProperty(p.id)} />
                  <span className="break-words">
                    {p.title} — {p.zone} — {p.currency} {p.price}
                  </span>
                </label>
              </li>
            ))}
            {properties.length === 0 && <p className="text-xs text-gray-400 p-2">No hay propiedades que coincidan.</p>}
          </ul>
          <button
            type="submit"
            disabled={create.isPending || update.isPending || !name.trim() || selectedIds.length === 0}
            className="self-start bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {create.isPending || update.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear catálogo"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
