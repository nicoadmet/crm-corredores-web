// Formulario y lista de leads de la cuenta logueada.
import { useState } from "react";
import { trpc } from "../trpc";

export function Leads() {
  const utils = trpc.useUtils();
  const list = trpc.leads.list.useQuery();
  const create = trpc.leads.create.useMutation({
    onSuccess: () => utils.leads.list.invalidate(),
  });

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [zone, setZone] = useState("");
  const [operationType, setOperationType] = useState("alquiler");
  const [propertyType, setPropertyType] = useState("depto");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ contactName, contactPhone, operationType, propertyType, zone });
    setContactName("");
    setContactPhone("");
    setZone("");
  }

  return (
    <div>
      <h1>Leads</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        <input placeholder="Teléfono" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
        <select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="depto">Depto</option>
          <option value="casa">Casa</option>
        </select>
        <input placeholder="Zona" value={zone} onChange={(e) => setZone(e.target.value)} required />
        <button type="submit">Agregar</button>
      </form>
      {list.isLoading && <p>Cargando...</p>}
      <ul>
        {list.data?.map((l: any) => (
          <li key={l.id}>{l.contactName} — {l.contactPhone} — busca {l.operationType} en {l.zone}</li>
        ))}
      </ul>
    </div>
  );
}