// Formulario reutilizable para crear o editar un evento de agenda (visita o tarea libre),
// usado dentro del Modal de alta y edición. Si el tipo es "visita", lead y propiedad son
// obligatorios; si es "tarea", quedan como opcionales.
import { useState } from "react";

export type AgendaEventFormValues = {
  title: string;
  type: "visita" | "tarea";
  date: string; // valor de <input type="datetime-local">, ej "2026-08-10T15:30"
  leadId: string;
  propertyId: string;
  notes: string;
  status: "pendiente" | "realizado" | "cancelado";
};

export const emptyAgendaEventForm: AgendaEventFormValues = {
  title: "",
  type: "visita",
  date: "",
  leadId: "",
  propertyId: "",
  notes: "",
  status: "pendiente",
};

export function AgendaEventForm({
  initialValues,
  leadOptions,
  propertyOptions,
  submitLabel,
  submitting,
  onSubmit,
}: {
  initialValues: AgendaEventFormValues;
  leadOptions: { id: string; contactName: string }[];
  propertyOptions: { id: string; title: string }[];
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: AgendaEventFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);

  function set<K extends keyof AgendaEventFormValues>(key: K, value: AgendaEventFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const inputClass = "border border-gray-300 rounded-md px-3 py-2 w-full text-sm";
  const isVisita = values.type === "visita";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          className={inputClass}
          value={values.type}
          onChange={(e) => set("type", e.target.value as AgendaEventFormValues["type"])}
        >
          <option value="visita">Visita a propiedad</option>
          <option value="tarea">Tarea / recordatorio</option>
        </select>
        <select
          className={inputClass}
          value={values.status}
          onChange={(e) => set("status", e.target.value as AgendaEventFormValues["status"])}
        >
          <option value="pendiente">Pendiente</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <input
        className={inputClass}
        placeholder={isVisita ? "Ej: Visita depto en Palermo" : "Ej: Llamar al banco"}
        value={values.title}
        onChange={(e) => set("title", e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Fecha y hora</label>
        <input
          className={inputClass}
          type="datetime-local"
          value={values.date}
          onChange={(e) => set("date", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          className={inputClass}
          value={values.leadId}
          onChange={(e) => set("leadId", e.target.value)}
          required={isVisita}
        >
          <option value="">{isVisita ? "Lead..." : "Lead (opcional)"}</option>
          {leadOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.contactName}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={values.propertyId}
          onChange={(e) => set("propertyId", e.target.value)}
          required={isVisita}
        >
          <option value="">{isVisita ? "Propiedad..." : "Propiedad (opcional)"}</option>
          {propertyOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className={inputClass}
        placeholder="Notas (opcional)"
        value={values.notes}
        onChange={(e) => set("notes", e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
      >
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
