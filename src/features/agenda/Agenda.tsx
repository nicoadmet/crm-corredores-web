// Agenda: lista cronológica de eventos (visitas a propiedades ligadas a un Lead + Property, o
// tareas/recordatorios libres) agrupados por día. Alta y edición en modal; marcar como realizado
// saca el evento de la lista principal y lo manda al historial.
import { useState } from "react";
import { trpc } from "../../trpc";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Menu } from "../../components/Menu";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonList } from "../../components/Skeleton";
import { useToast } from "../../lib/toast";
import { useNewParam } from "../../lib/useNewParam";
import { usePageChrome } from "../../lib/pageChrome";
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
  tarea: "bg-gray-100 text-ink-soft",
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
  semana: "text-ink-faint",
  masAdelante: "text-ink-faint",
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

// Una fila de la agenda. La hora va en una canaleta de ancho fijo a la izquierda y el tipo se marca
// con una barra de color, para poder leer la columna de horarios de un saque en vez de fila por fila.
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
  const date = new Date(event.date);
  const time = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const done = event.status !== "pendiente";

  return (
    <li className="flex items-center gap-3 border-b border-divider-soft pr-3 transition-colors last:border-b-0 hover:bg-gray-50/70">
      <span className={`h-11 w-[3px] flex-shrink-0 ${event.type === "visita" ? "bg-teal-500" : "bg-gray-200"}`} />

      <span className="w-11 flex-shrink-0 text-[13px] font-semibold tabular-nums text-ink">{time}</span>

      <span className="hidden w-16 flex-shrink-0 sm:block">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${TYPE_STYLES[event.type] ?? "bg-gray-100 text-ink-soft"}`}>
          {TYPE_LABELS[event.type] ?? event.type}
        </span>
      </span>

      <span className="min-w-0 flex-1 py-2">
        <span className={`block truncate text-[13px] font-semibold ${done ? "text-ink-mute line-through" : "text-ink"}`}>
          {event.title}
        </span>
        {(event.lead || event.property) && (
          <span className="block truncate text-[11.5px] text-ink-mute">
            {event.lead?.contactName}
            {event.lead && event.property ? " · " : ""}
            {event.property?.title}
          </span>
        )}
      </span>

      {done && (
        <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
          {STATUS_LABELS[event.status] ?? event.status}
        </span>
      )}

      {!done && (
        <button
          type="button"
          onClick={onComplete}
          className="hidden h-7 flex-shrink-0 items-center gap-1.5 rounded-lg border border-hairline px-2.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:bg-gray-50 sm:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-teal-600">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
          Realizado
        </button>
      )}

      <Menu
        items={[
          ...(done ? [] : [{ label: "Marcar como realizado", onSelect: onComplete }]),
          { label: "Editar", onSelect: onEdit },
          { label: "Eliminar", onSelect: onDelete, danger: true },
        ]}
      />
    </li>
  );
}

export function Agenda() {
  const utils = trpc.useUtils();
  const toast = useToast();
  const [showHistorial, setShowHistorial] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);

  // Se guarda en una constante porque las actualizaciones optimistas necesitan tocar exactamente
  // esta misma entrada de la caché.
  const listInput = { includeDone: showHistorial };
  const list = trpc.agenda.list.useQuery(listInput);
  const leadsQuery = trpc.leads.listOptions.useQuery();
  const propertiesQuery = trpc.properties.listOptions.useQuery();

  const leadOptions = leadsQuery.data ?? [];
  const propertyOptions = propertiesQuery.data ?? [];

  const create = trpc.agenda.create.useMutation({
    onSuccess: () => {
      utils.agenda.list.invalidate();
      setModalOpen(false);
      toast("Evento agendado.");
    },
    onError: () => toast("No se pudo agendar el evento.", "error"),
  });

  const update = trpc.agenda.update.useMutation({
    onSuccess: () => {
      utils.agenda.list.invalidate();
      setModalOpen(false);
      toast("Cambios guardados.");
    },
    onError: () => toast("No se pudieron guardar los cambios.", "error"),
  });

  // "Marcar realizado" usa su propia instancia de la misma mutation para poder ser optimista
  // (el evento sale de la lista al instante) sin afectar al guardado del formulario de arriba.
  const completeEvent = trpc.agenda.update.useMutation({
    onMutate: async ({ id }) => {
      await utils.agenda.list.cancel(listInput);
      const previous = utils.agenda.list.getData(listInput);
      utils.agenda.list.setData(listInput, (old) => {
        if (!old) return old;
        // Con el historial oculto, un evento realizado ya no pertenece a esta lista: se saca.
        if (!showHistorial) return old.filter((e) => e.id !== id);
        return old.map((e) => (e.id === id ? { ...e, status: "realizado" } : e));
      });
      return { previous };
    },
    onSuccess: () => toast("Marcado como realizado."),
    onError: (_error, _variables, context) => {
      if (context?.previous) utils.agenda.list.setData(listInput, context.previous);
      toast("No se pudo marcar como realizado.", "error");
    },
    onSettled: () => utils.agenda.list.invalidate(),
  });

  // Borrado optimista: el evento desaparece al instante y, si el servidor falla, vuelve a su lugar.
  const deleteEvent = trpc.agenda.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.agenda.list.cancel(listInput);
      const previous = utils.agenda.list.getData(listInput);
      utils.agenda.list.setData(listInput, (old) => (old ? old.filter((e) => e.id !== id) : old));
      return { previous };
    },
    onSuccess: () => toast("Evento eliminado."),
    onError: (_error, _variables, context) => {
      if (context?.previous) utils.agenda.list.setData(listInput, context.previous);
      toast("No se pudo eliminar el evento.", "error");
    },
    onSettled: () => utils.agenda.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  // El botón flotante de alta rápida llega acá con ?new=1 y abre este mismo formulario.
  useNewParam(openCreate);

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
  const pendingCount = events.filter((e) => e.status === "pendiente").length;

  usePageChrome(
    "Agenda",
    pendingCount > 0 ? `${pendingCount} ${pendingCount === 1 ? "evento pendiente" : "eventos pendientes"}` : undefined,
  );

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-5">

      <div className="mb-3 flex items-center gap-2">
        <div className="flex gap-0.5 rounded-lg border border-hairline bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={() => setShowHistorial(false)}
            className={`h-6 rounded-md px-2.5 text-xs transition-colors ${
              showHistorial ? "font-medium text-ink-mute" : "bg-surface font-semibold text-ink shadow-sm"
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setShowHistorial(true)}
            className={`h-6 rounded-md px-2.5 text-xs transition-colors ${
              showHistorial ? "bg-surface font-semibold text-ink shadow-sm" : "font-medium text-ink-mute"
            }`}
          >
            Historial
          </button>
        </div>

        <Button size="sm" onClick={openCreate} className="ml-auto hidden md:inline-flex">
          + Nuevo evento
        </Button>
      </div>

      {list.isLoading && <SkeletonList count={4} />}

      {!list.isLoading && events.length === 0 && (
        <EmptyState
          icon="📅"
          title="Tu agenda está vacía"
          description="Anotá una visita (con el lead y la propiedad que la motivan) o una tarea suelta, con día y hora."
          actionLabel="+ Agendar lo primero"
          onAction={openCreate}
        />
      )}

      {events.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          {BUCKET_ORDER.map((key) => {
            const items = groups[key];
            if (items.length === 0) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-2 border-b border-hairline bg-gray-50/60 px-4 py-2">
                  <span className={`text-[10px] font-semibold tracking-[0.06em] ${BUCKET_HEADER_STYLES[key]}`}>
                    {AGENDA_BUCKET_LABELS[key].toUpperCase()}
                  </span>
                  <span className="ml-auto text-[11px] tabular-nums text-ink-faint">{items.length}</span>
                </div>
                <ul className="flex flex-col">
                  {items.map((e) => (
                    <EventItem
                      key={e.id}
                      event={e}
                      onEdit={() => openEdit(e)}
                      onDelete={() => handleDelete(e)}
                      onComplete={() => completeEvent.mutate({ id: e.id, status: "realizado" })}
                    />
                  ))}
                </ul>
              </div>
            );
          })}

          {showHistorial && groups.historial.length > 0 && (
            <div>
              <div className="flex items-center gap-2 border-b border-hairline bg-gray-50/60 px-4 py-2">
                <span className="text-[10px] font-semibold tracking-[0.06em] text-ink-faint">HISTORIAL</span>
                <span className="ml-auto text-[11px] tabular-nums text-ink-faint">{groups.historial.length}</span>
              </div>
              <ul className="flex flex-col">
                {groups.historial.map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    onEdit={() => openEdit(e)}
                    onDelete={() => handleDelete(e)}
                    onComplete={() => completeEvent.mutate({ id: e.id, status: "realizado" })}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
