// Formulario reutilizable para crear o editar una propiedad (usado dentro del Modal de alta y edición).
import { useState } from "react";

export type PropertyFormValues = {
  title: string;
  operationType: string;
  propertyType: string;
  price: string;
  zone: string;
  address: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  garage: boolean;
  garageSpaces: string;
  coveredArea: string;
  totalArea: string;
  floor: string;
  age: string;
  description: string;
  ownerName: string;
  ownerPhone: string;
  ownerNotes: string;
  exclusive: boolean;
  exclusiveUntil: string;
  tagsText: string;
};

export const emptyPropertyForm: PropertyFormValues = {
  title: "",
  operationType: "venta",
  propertyType: "depto",
  price: "",
  zone: "",
  address: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  garage: false,
  garageSpaces: "",
  coveredArea: "",
  totalArea: "",
  floor: "",
  age: "",
  description: "",
  ownerName: "",
  ownerPhone: "",
  ownerNotes: "",
  exclusive: false,
  exclusiveUntil: "",
  tagsText: "",
};

export function PropertyForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
}: {
  initialValues: PropertyFormValues;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: PropertyFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);

  function set<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
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
        <input
          className={inputClass}
          placeholder="Título"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
        <select
          className={inputClass}
          value={values.operationType}
          onChange={(e) => set("operationType", e.target.value)}
        >
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select
          className={inputClass}
          value={values.propertyType}
          onChange={(e) => set("propertyType", e.target.value)}
        >
          <option value="depto">Depto</option>
          <option value="casa">Casa</option>
        </select>
        <input
          className={inputClass}
          placeholder="Precio"
          type="number"
          value={values.price}
          onChange={(e) => set("price", e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Zona"
          value={values.zone}
          onChange={(e) => set("zone", e.target.value)}
          required
        />
      </div>

      <details className="border-t border-gray-200 pt-3">
        <summary className="cursor-pointer font-medium text-gray-700 text-sm">Más detalles (opcional)</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <input className={inputClass} placeholder="Dirección" value={values.address} onChange={(e) => set("address", e.target.value)} />
          <input className={inputClass} placeholder="Ambientes" type="number" value={values.rooms} onChange={(e) => set("rooms", e.target.value)} />
          <input className={inputClass} placeholder="Dormitorios" type="number" value={values.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          <input className={inputClass} placeholder="Baños" type="number" value={values.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={values.garage} onChange={(e) => set("garage", e.target.checked)} />
            Cochera
          </label>
          {values.garage && (
            <input
              className={inputClass}
              placeholder="Cantidad de cocheras"
              type="number"
              value={values.garageSpaces}
              onChange={(e) => set("garageSpaces", e.target.value)}
            />
          )}
          <input className={inputClass} placeholder="M² cubiertos" type="number" value={values.coveredArea} onChange={(e) => set("coveredArea", e.target.value)} />
          <input className={inputClass} placeholder="M² totales" type="number" value={values.totalArea} onChange={(e) => set("totalArea", e.target.value)} />
          <input className={inputClass} placeholder="Piso/unidad" value={values.floor} onChange={(e) => set("floor", e.target.value)} />
          <input className={inputClass} placeholder="Antigüedad (años, 0 = a estrenar)" type="number" value={values.age} onChange={(e) => set("age", e.target.value)} />
        </div>
        <textarea className={`${inputClass} mt-3`} placeholder="Descripción" value={values.description} onChange={(e) => set("description", e.target.value)} />

        <input
          className={`${inputClass} mt-3`}
          placeholder="Etiquetas (separadas por coma, ej: a estrenar, con pileta)"
          value={values.tagsText}
          onChange={(e) => set("tagsText", e.target.value)}
        />

        <p className="text-xs text-gray-500 mt-4 mb-2">Datos del propietario (uso interno, no se muestran en la ficha pública):</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Nombre del propietario" value={values.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
          <input className={inputClass} placeholder="Teléfono del propietario" value={values.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} />
        </div>
        <textarea className={`${inputClass} mt-3`} placeholder="Notas sobre el propietario" value={values.ownerNotes} onChange={(e) => set("ownerNotes", e.target.value)} />

        <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
          <input type="checkbox" checked={values.exclusive} onChange={(e) => set("exclusive", e.target.checked)} />
          Exclusividad
        </label>
        {values.exclusive && (
          <input className={`${inputClass} mt-2`} type="date" value={values.exclusiveUntil} onChange={(e) => set("exclusiveUntil", e.target.value)} />
        )}
      </details>

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
