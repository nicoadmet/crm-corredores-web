// Formulario de alta y edición de una propiedad (va dentro del Modal).
// Arriba, sólo lo mínimo para que la propiedad exista: cinco campos, sin scroll, para poder cargarla
// en menos de 30 segundos parado en la vereda. Todo lo demás queda plegado en "Más detalles".
import { useState } from "react";
import { Button } from "../../components/Button";
import { Collapse, Field, FormLayout, Segmented, Switch, TextArea, TextInput } from "../../components/form";

export type PropertyFormValues = {
  title: string;
  operationType: string;
  propertyType: string;
  price: string;
  currency: string;
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
  currency: "USD",
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

const OPERATION_OPTIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

const TYPE_OPTIONS = [
  { value: "depto", label: "Depto" },
  { value: "casa", label: "Casa" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
];

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
      <Field label="Título">
        <TextInput
          placeholder="Ej: Depto 3 amb · Güemes 3400 4°B"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </Field>

      <Field label="Operación">
        <Segmented options={OPERATION_OPTIONS} value={values.operationType} onChange={(v) => set("operationType", v)} />
      </Field>

      <Field label="Tipo">
        <Segmented options={TYPE_OPTIONS} value={values.propertyType} onChange={(v) => set("propertyType", v)} />
      </Field>

      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1">
          <Field label="Precio">
            <TextInput
              placeholder="189000"
              type="number"
              inputMode="numeric"
              className="font-semibold tabular-nums"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="flex-shrink-0 pb-0">
          <Segmented options={CURRENCY_OPTIONS} value={values.currency} onChange={(v) => set("currency", v)} compact />
        </div>
      </div>

      <Field label="Zona">
        <TextInput placeholder="Ej: Palermo" value={values.zone} onChange={(e) => set("zone", e.target.value)} required />
      </Field>

      <Collapse title="Más detalles" hint="Medidas, ambientes, propietario, exclusividad y etiquetas">
        <Field label="Dirección">
          <TextInput value={values.address} onChange={(e) => set("address", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Ambientes">
            <TextInput type="number" inputMode="numeric" value={values.rooms} onChange={(e) => set("rooms", e.target.value)} />
          </Field>
          <Field label="Dormitorios">
            <TextInput type="number" inputMode="numeric" value={values.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </Field>
          <Field label="Baños">
            <TextInput type="number" inputMode="numeric" value={values.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </Field>
          <Field label="Piso / unidad">
            <TextInput value={values.floor} onChange={(e) => set("floor", e.target.value)} />
          </Field>
          <Field label="M² cubiertos">
            <TextInput type="number" inputMode="numeric" value={values.coveredArea} onChange={(e) => set("coveredArea", e.target.value)} />
          </Field>
          <Field label="M² totales">
            <TextInput type="number" inputMode="numeric" value={values.totalArea} onChange={(e) => set("totalArea", e.target.value)} />
          </Field>
        </div>

        <Field label="Antigüedad" hint="En años. 0 significa a estrenar.">
          <TextInput type="number" inputMode="numeric" value={values.age} onChange={(e) => set("age", e.target.value)} />
        </Field>

        <Switch checked={values.garage} onChange={(v) => set("garage", v)} label="Tiene cochera" />
        {values.garage && (
          <Field label="Cantidad de cocheras">
            <TextInput type="number" inputMode="numeric" value={values.garageSpaces} onChange={(e) => set("garageSpaces", e.target.value)} />
          </Field>
        )}

        <Field label="Descripción">
          <TextArea value={values.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <Field label="Etiquetas" hint="Separadas por coma. Ej: a estrenar, con pileta, apto crédito">
          <TextInput value={values.tagsText} onChange={(e) => set("tagsText", e.target.value)} />
        </Field>

        <div className="flex flex-col gap-3.5 rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] text-ink-mute">
            Datos del propietario. Son de uso interno: nunca aparecen en la ficha que compartís por WhatsApp.
          </p>
          <Field label="Nombre">
            <TextInput value={values.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <TextInput type="tel" inputMode="tel" value={values.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} />
          </Field>
          <Field label="Notas">
            <TextArea rows={2} value={values.ownerNotes} onChange={(e) => set("ownerNotes", e.target.value)} />
          </Field>
        </div>

        <Switch
          checked={values.exclusive}
          onChange={(v) => set("exclusive", v)}
          label="Tengo la exclusividad"
          hint="Se muestra como distintivo en la lista y la ficha."
        />
        {values.exclusive && (
          <Field label="Hasta cuándo">
            <TextInput type="date" value={values.exclusiveUntil} onChange={(e) => set("exclusiveUntil", e.target.value)} />
          </Field>
        )}
      </Collapse>

      </FormLayout>
    </form>
  );
}
