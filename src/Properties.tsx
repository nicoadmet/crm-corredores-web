// Formulario y lista de propiedades de la cuenta logueada.
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { trpc, API_URL } from "./trpc";
import { supabase } from "./supabase";

export function Properties() {
  const utils = trpc.useUtils();
  const list = trpc.properties.list.useQuery();
  const create = trpc.properties.create.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  });
  const addImage = trpc.propertyImages.create.useMutation({
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

  // Comprime la foto en el navegador, la sube a Supabase Storage, y guarda la URL en la base.
  async function handlePhoto(propertyId: string, file: File) {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const path = `${propertyId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("property-images").upload(path, compressed);
    if (error) {
      console.error(error);
      return;
    }

    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    addImage.mutate({ propertyId, url: data.publicUrl });
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
        {list.data?.map((p) => {
          const link = `${API_URL}/p/${p.id}`;
          const texto = encodeURIComponent(`${p.title} — ${p.currency} ${p.price}\n${link}`);
          return (
            <li key={p.id}>
              {p.images[0] && (
                <div>
                  <img src={p.images[0].url} alt={p.title} style={{ width: 120 }} />
                </div>
              )}
              {p.title} — {p.zone} — {p.currency} {p.price}{" "}
              <a href={`https://wa.me/?text=${texto}`} target="_blank" rel="noopener noreferrer">
                Compartir por WhatsApp
              </a>{" "}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhoto(p.id, file);
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}