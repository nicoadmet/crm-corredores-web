// Agenda: lista cronológica de eventos (visitas a propiedades ligadas a un Lead + Property, o
// tareas/recordatorios libres) agrupados por día. Alta y edición en modal; marcar como realizado
// saca el evento de la lista principal y lo manda al historial.
import { useState } from "react";
import { trpc } from "../../trpc";
import { Modal } from "../../components/Modal";
import { AgendaEventForm, emptyAgendaEventForm } from "./AgendaEventForm";
import type { AgendaEventFormValues } from "./AgendaEventForm";
import { groupAgendaEvents, AGENDA_BUCKET_LABELS } from "./agendaGrouping";
import type { AgendaBucketKey, AgendaEvent } from "./agendaGrouping";

const TYPE_LABELS: Record<string, string> = {
  visita: "Visita",
  tarea: "Tarea",
};

const TYPE_STYLES: Record<string, string> = {
  visita: "bg-teal-50 text-teal-700",
  tarea: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

const BUCKET_HEADER_STYLES: Record<AgendaBucketKey, string> = {
  vencidos: "text-red-700",
  hoy: "text-amber-700",
  manana: "text-teal-700",
  semana: "text-gray-700",
  masAdelante: "text-gray-700",
};

const BUCKET_ORDER: AgendaBucketKey[] = ["vencidos", "hoy", "manana", "semana", "masAdelante"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Convierte un Date a formato "YYYY-MM-DDTHH:mm" (lo que espera <input type="datetime-local">),
// en hora local (a propósito: acá la hora sí importa, a diferencia de nextFollowUpDate).
function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFormValues(e: AgendaEvent): AgendaEventFormValues {
  return {
    title: e.title,
    type: e.type as AgendaEventFormValues["type"],
    date: toDatetimeLocalValue(new Date(e.date)),
    leadId: e.leadId ?? "",
    propertyId: e.propertyId ?? "",
    notes: e.notes ?? "",
    status: e.status as AgendaEventFormValues["status"],
  };
}

function toMutationInput(values: AgendaEventFormValues) {
  return {
    title: values.title,
    type: values.type,
    date: new Date(values.date),
    // null explícito (no undefined) cuando no hay lead/propiedad/notas elegidos: así el backend
    // sabe que hay que desvincular, en vez de ignorar el campo y dejar el valor que ya tenía.
    leadId: values.leadId || null,
    propertyId: values.propertyId || null,
    notes: values.notes || null,
    status: values.status,
  };
}

function EventItem({
  event,
  onEdit,
  onDelete,
  onComplete,
}: {
  event: AgendaEvent;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}) {
  const time = new Date(event.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return (
    <li className="border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-500">{time}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[event.type] ?? "bg-gray-100 text-gray-700"}`}>
          {TYPE_LABELS[event.type] ?? event.type}
        </span>
        {event.status !== "pendiente" && (
          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {STATUS_LABELS[event.status] ?? event.status}
          </span>
        )}
      </div>
      <p className="font-medium break-words">{event.title}</p>
      {(event.lead || event.property) && (
        <p className="text-sm text-gray-600 mt-1 break-words">
          {event.lead && <>Lead: {event.lead.contactName}</>}
          {event.lead && event.property && " — "}
          {event.property && <>Propiedad: {event.property.title}</>}
        </p>
      )}
      {event.notes && <p className="text-sm text-gray-500 mt-1 break-words">Notas: {event.notes}</p>}
      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
        {event.status === "pendiente" && (
          <button onClick={onComplete} className="text-teal-700 hover:underline">
            Marcar realizado
          </button>
        )}
        <button onClick={onEdit} className="text-teal-700 hover:underline">
          Editar
        </button>
        <button onClick={onDelete} className="text-red-600 hover:underline">
          Eliminar
        </button>
      </div>
    </li>
  );
}

export function Agenda() {
  const utils = trpc.useUtils();
  const [showHistorial, setShowHistorial] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);

  const list = trpc.agenda.list.useQuery({ includeDone: showHistorial });
  const leadsQuery = trpc.leads.listOptions.useQuery();
  const propertiesQuery = trpc.properties.listOptions.useQuery();

  const leadOptions = leadsQuery.data ?? [];
  const propertyOptions = propertiesQuery.data ?? [];

  const create = trpc.agenda.create.useMutation({
    onSuccess: () => {
      utils.agenda.list.invalidate();
      setModalOpen(false);
    },
  });
  const update = trpc.agenda.update.useMutation({
    onSuccess: () => {
      utils.agenda.list.invalidate();
      setModalOpen(false);
    },
  });
  const deleteEvent = trpc.agenda.delete.useMutation({
    onSuccess: () => utils.agenda.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(e: AgendaEvent) {
    setEditing(e);
    setModalOpen(true);
  }

  function handleSubmit(values: AgendaEventFormValues) {
    if (editing) {
      update.mutate({ id: editing.id, ...toMutationInput(values) });
    } else {
      create.mutate(toMutationInput(values));
    }
  }

  function handleDelete(e: AgendaEvent) {
    if (confirm(`¿Eliminar "${e.title}"?`)) {
      deleteEvent.mutate({ id: e.id });
    }
  }

  const events = list.data ?? [];
  const groups = groupAgendaEvents(events);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <button
          onClick={openCreate}
          className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
        >
          + Agregar
        </button>
      </div>

      <button onClick={() => setShowHistorial((v) => !v)} className="text-sm text-teal-700 hover:underline mb-4">
        {showHistorial ? "Ocultar historial" : "Ver historial (realizados y cancelados)"}
      </button>

      {list.isLoading && <p className="text-gray-500">Cargando...</p>}

      {!list.isLoading && events.length === 0 && (
        <p className="text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          Todavía no cargaste ningún evento. Tocá "+ Agregar" para crear el primero.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {BUCKET_ORDER.map((key) => {
          const items = groups[key];
          if (items.length === 0) return null;
          return (
            <div key={key}>
              <h2 className={`text-sm font-semibold mb-2 ${BUCKET_HEADER_STYLES[key]}`}>{AGENDA_BUCKET_LABELS[key]}</h2>
              <ul className="flex flex-col gap-3">
                {items.map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    onEdit={() => openEdit(e)}
                    onDelete={() => handleDelete(e)}
                    onComplete={() => update.mutate({ id: e.id, status: "realizado" })}
                  />
                ))}
              </ul>
            </div>
          );
        })}

        {showHistorial && groups.historial.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2 text-gray-700">Historial</h2>
            <ul className="flex flex-col gap-3">
              {groups.historial.map((e) => (
                <EventItem
                  key={e.id}
                  event={e}
                  onEdit={() => openEdit(e)}
                  onDelete={() => handleDelete(e)}
                  onComplete={() => update.mutate({ id: e.id, status: "realizado" })}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar evento" : "Nuevo evento"}>
        <AgendaEventForm
          key={editing?.id ?? "new"}
          initialValues={editing ? toFormValues(editing) : emptyAgendaEventForm}
          leadOptions={leadOptions}
          propertyOptions={propertyOptions}
          submitLabel={editing ? "Guardar cambios" : "Agregar"}
          submitting={create.isPending || update.isPending}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
