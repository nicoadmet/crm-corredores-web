// Formulario reutilizable para crear o editar un lead (usado dentro del Modal de alta y edición).
import { useState } from "react";

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

  const inputClass = "border border-gray-300 rounded-md px-3 py-2 w-full text-sm";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Nombre" value={values.contactName} onChange={(e) => set("contactName", e.target.value)} required />
        <input className={inputClass} placeholder="Teléfono" value={values.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} required />
        <input
          className={inputClass}
          placeholder="Email (opcional)"
          type="email"
          value={values.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
        />
        <select className={inputClass} value={values.operationType} onChange={(e) => set("operationType", e.target.value)}>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select className={inputClass} value={values.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
          <option value="depto">Depto</option>
          <option value="casa">Casa</option>
        </select>
        <select className={inputClass} value={values.status} onChange={(e) => set("status", e.target.value)}>
          <option value="activo">Activo</option>
          <option value="en_proceso">En proceso</option>
          <option value="cerrado">Cerrado</option>
          <option value="perdido">Perdido</option>
        </select>
        <input
          className={inputClass}
          placeholder="Zonas de interés (separadas por coma)"
          value={values.zonesText}
          onChange={(e) => set("zonesText", e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Presupuesto mínimo (opcional)"
          type="number"
          value={values.budgetMin}
          onChange={(e) => set("budgetMin", e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Presupuesto máximo (opcional)"
          type="number"
          value={values.budgetMax}
          onChange={(e) => set("budgetMax", e.target.value)}
        />
        <select
          className={inputClass}
          value={values.priority}
          onChange={(e) => set("priority", e.target.value as LeadFormValues["priority"])}
        >
          <option value="">Prioridad (opcional)</option>
          <option value="caliente">Caliente</option>
          <option value="tibio">Tibio</option>
          <option value="frio">Frío</option>
        </select>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Próximo seguimiento (opcional)</label>
          <input
            className={inputClass}
            type="date"
            value={values.nextFollowUpDate}
            onChange={(e) => set("nextFollowUpDate", e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1">Preferencias para matching (opcional, ayudan a mejorar las sugerencias):</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={inputClass}
          placeholder="Ambientes mínimos"
          type="number"
          value={values.minRooms}
          onChange={(e) => set("minRooms", e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Baños mínimos"
          type="number"
          value={values.minBathrooms}
          onChange={(e) => set("minBathrooms", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={values.needsGarage} onChange={(e) => set("needsGarage", e.target.checked)} />
          Necesita cochera
        </label>
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
