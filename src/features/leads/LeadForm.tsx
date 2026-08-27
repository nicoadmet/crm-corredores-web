// Formulario de alta y edición de un lead (va dentro del Modal).
// Arriba lo mínimo para que el lead exista y el matching funcione: quién es, cómo ubicarlo y qué
// busca. El resto —presupuesto fino, requisitos, seguimiento— queda plegado.
import { useState } from "react";
import { Button } from "../../components/Button";
import { Collapse, Field, FormLayout, Segmented, Switch, TextArea, TextInput } from "../../components/form";

const OPERATION_OPTIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

const TYPE_OPTIONS = [
  { value: "depto", label: "Depto" },
  { value: "casa", label: "Casa" },
];

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrado", label: "Cerrado" },
  { value: "perdido", label: "Perdido" },
];

// La prioridad es opcional a propósito: obligar a clasificar a alguien que recién llamó es fricción.
const PRIORITY_OPTIONS = [
  { value: "", label: "Sin definir" },
  { value: "caliente", label: "Caliente" },
  { value: "tibio", label: "Tibio" },
  { value: "frio", label: "Frío" },
];

export type LeadFormValues = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  operationType: string;
  propertyType: string;
  zonesText: string;
  budgetMin: string;
  budgetMax: string;
  minRooms: string;
  minBathrooms: string;
  needsGarage: boolean;
  priority: "" | "caliente" | "tibio" | "frio";
  nextFollowUpDate: string;
  notes: string;
  status: string;
};

export const emptyLeadForm: LeadFormValues = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  operationType: "alquiler",
  propertyType: "depto",
  zonesText: "",
  budgetMin: "",
  budgetMax: "",
  minRooms: "",
  minBathrooms: "",
  needsGarage: false,
  priority: "",
  nextFollowUpDate: "",
  notes: "",
  status: "activo",
};

export function LeadForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
}: {
  initialValues: LeadFormValues;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: LeadFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);

  function set<K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

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
      <Field label="Nombre">
        <TextInput placeholder="Ej: Laura Pérez" value={values.contactName} onChange={(e) => set("contactName", e.target.value)} required />
      </Field>

      <Field label="Teléfono">
        <TextInput
          type="tel"
          inputMode="tel"
          placeholder="11 4455-2211"
          className="tabular-nums"
          value={values.contactPhone}
          onChange={(e) => set("contactPhone", e.target.value)}
          required
        />
      </Field>

      <Field label="Busca para">
        <Segmented options={OPERATION_OPTIONS} value={values.operationType} onChange={(v) => set("operationType", v)} />
      </Field>

      <Field label="Tipo de propiedad">
        <Segmented options={TYPE_OPTIONS} value={values.propertyType} onChange={(v) => set("propertyType", v)} />
      </Field>

      <Field label="Zonas de interés" hint="Separadas por coma. Es lo que más pesa en el matching.">
        <TextInput
          placeholder="Ej: Palermo, Villa Crespo"
          value={values.zonesText}
          onChange={(e) => set("zonesText", e.target.value)}
          required
        />
      </Field>

      <Collapse title="Más detalles" hint="Presupuesto, requisitos, prioridad, seguimiento y notas">
        <Field label="Email">
          <TextInput type="email" inputMode="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Presupuesto desde">
            <TextInput type="number" inputMode="numeric" className="tabular-nums" value={values.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} />
          </Field>
          <Field label="Presupuesto hasta">
            <TextInput type="number" inputMode="numeric" className="tabular-nums" value={values.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
          </Field>
        </div>

        <div className="flex flex-col gap-3.5 rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] text-ink-mute">
            Requisitos del cliente. Cada uno que completes hace que las sugerencias le peguen más de cerca.
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Ambientes mínimos">
              <TextInput type="number" inputMode="numeric" value={values.minRooms} onChange={(e) => set("minRooms", e.target.value)} />
            </Field>
            <Field label="Baños mínimos">
              <TextInput type="number" inputMode="numeric" value={values.minBathrooms} onChange={(e) => set("minBathrooms", e.target.value)} />
            </Field>
          </div>
          <Switch checked={values.needsGarage} onChange={(v) => set("needsGarage", v)} label="Necesita cochera" />
        </div>

        <Field label="Prioridad">
          <Segmented
            options={PRIORITY_OPTIONS}
            value={values.priority}
            onChange={(v) => set("priority", v as LeadFormValues["priority"])}
          />
        </Field>

        <Field label="Estado">
          <Segmented options={STATUS_OPTIONS} value={values.status} onChange={(v) => set("status", v)} />
        </Field>

        <Field label="Próximo seguimiento" hint="Te avisamos cuando llegue la fecha, incluso con la app cerrada.">
          <TextInput type="date" value={values.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} />
        </Field>

        <Field label="Notas">
          <TextArea value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </Collapse>

      </FormLayout>
    </form>
  );
}
