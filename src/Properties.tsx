// Formulario y lista de propiedades de la cuenta logueada.
import { useState } from "react";
import { trpc } from "./trpc";

export function Properties() {
  const utils = trpc.useUtils();
  const list = trpc.properties.list.useQuery();
  const create = trpc.properties.create.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  });

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [zone, setZone] = useState("");
  const [operationType, setOperationType] = useState("venta");
  const [propertyType, setPropertyType] = useState("depto");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ title, operationType, propertyType, price: Number(price), zone });
    setTitle("");
    setPrice("");
    setZone("");
  }

  return (
    <div>
      <h1>Propiedades</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="depto">Depto</option>
          <option value="casa">Casa</option>
        </select>
        <input placeholder="Precio" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input placeholder="Zona" value={zone} onChange={(e) => setZone(e.target.value)} required />
        <button type="submit">Agregar</button>
      </form>
      {list.isLoading && <p>Cargando...</p>}
      <ul>
        {list.data?.map((p) => (
          <li key={p.id}>{p.title} — {p.zone} — {p.currency} {p.price}</li>
        ))}
      </ul>
    </div>
  );
}