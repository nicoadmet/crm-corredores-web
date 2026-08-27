// Formulario reutilizable para crear o editar un evento de agenda (visita o tarea libre),
// usado dentro del Modal de alta y edición. Si el tipo es "visita", lead y propiedad son
// obligatorios; si es "tarea", quedan como opcionales.
import { useState } from "react";
import { Button } from "../../components/Button";
import { Field, FormLayout, Segmented, TextArea, TextInput } from "../../components/form";

const TYPE_OPTIONS = [
  { value: "visita", label: "Visita" },
  { value: "tarea", label: "Tarea" },
];

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
];

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

  const isVisita = values.type === "visita";

  // El <select> nativo se queda: en el celular abre el selector del sistema, que es más cómodo que
  // cualquier lista propia, y acá hay que elegir entre cientos de leads o propiedades.
  const selectClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-surface px-3 text-[15px] text-ink transition-colors focus:border-teal-500 focus:outline-none sm:h-10 sm:text-sm";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="flex flex-col"
    >
      <FormLayout
        actions={
        <Button type="submit" size="lg" className="w-full sm:w-auto" loading={submitting}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
        }
      >
      <Field label="Tipo">
        <Segmented
          options={TYPE_OPTIONS}
          value={values.type}
          onChange={(v) => set("type", v as AgendaEventFormValues["type"])}
        />
      </Field>

      <Field label="Título">
        <TextInput
          placeholder={isVisita ? "Ej: Visita depto en Palermo" : "Ej: Llamar al banco"}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </Field>

      <Field label="Fecha y hora">
        <TextInput type="datetime-local" value={values.date} onChange={(e) => set("date", e.target.value)} required />
      </Field>

      <Field label={isVisita ? "Lead" : "Lead (opcional)"}>
        <select className={selectClass} value={values.leadId} onChange={(e) => set("leadId", e.target.value)} required={isVisita}>
          <option value="">{isVisita ? "Elegí un lead..." : "Sin lead"}</option>
          {leadOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.contactName}
            </option>
          ))}
        </select>
      </Field>

      <Field label={isVisita ? "Propiedad" : "Propiedad (opcional)"}>
        <select
          className={selectClass}
          value={values.propertyId}
          onChange={(e) => set("propertyId", e.target.value)}
          required={isVisita}
        >
          <option value="">{isVisita ? "Elegí una propiedad..." : "Sin propiedad"}</option>
          {propertyOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notas">
        <TextArea rows={2} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      <Field label="Estado">
        <Segmented
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={(v) => set("status", v as AgendaEventFormValues["status"])}
        />
      </Field>

      </FormLayout>
    </form>
  );
}
