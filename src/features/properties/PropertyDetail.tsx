// Ficha completa de una propiedad. Dos columnas a propósito: a la izquierda lo que se le muestra al
// cliente (fotos, características, descripción) y a la derecha lo interno del corredor (precio con su
// historial, matches y datos del propietario, que nunca salen en la ficha pública /p/:id).
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { trpc, API_URL } from "../../trpc";
import { supabase } from "../../lib/supabase";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { SharePreview } from "../../components/SharePreview";
import { useToast } from "../../lib/toast";
import { usePageChrome } from "../../lib/pageChrome";

const OPERATION_LABELS: Record<string, string> = { venta: "Venta", alquiler: "Alquiler" };
const PROPERTY_TYPE_LABELS: Record<string, string> = { depto: "Depto", casa: "Casa" };
const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  pausada: "Pausada",
};

function Card({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
      <header className="flex items-center gap-2 border-b border-divider px-3 py-2.5">
        <h2 className="text-xs font-semibold text-ink-soft">{title}</h2>
        {aside && <span className="ml-auto text-[10.5px] text-ink-faint">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-[10.5px] text-ink-faint">{label}</span>
      <span className="text-[12.5px] font-medium text-ink">{value}</span>
    </span>
  );
}

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: property, isLoading, error } = trpc.properties.getById.useQuery({ id: id ?? "" }, { enabled: !!id });
  const matches = trpc.matches.list.useQuery();
  const previewMeta = trpc.properties.shareInfo.useQuery({ id: id ?? "" }, { enabled: previewOpen && !!id });

  const addImage = trpc.propertyImages.create.useMutation({
    onSuccess: () => {
      utils.properties.getById.invalidate({ id: id ?? "" });
      utils.properties.list.invalidate();
      toast("Foto agregada.");
    },
    onError: () => toast("No se pudo agregar la foto.", "error"),
  });

  usePageChrome(property?.title ?? "Propiedad", property ? `${property.zone} · ${STATUS_LABELS[property.status] ?? property.status}` : undefined);

  async function handlePhoto(file: File) {
    if (!id) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
      const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      // Nunca el nombre original del archivo: se rompe con emojis y acentos.
      const path = `${id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("property-images").upload(path, compressed);
      if (uploadError) {
        console.error(uploadError);
        toast("No se pudo subir la foto.", "error");
        return;
      }

      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      addImage.mutate({ propertyId: id, url: data.publicUrl });
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-3 p-4 sm:p-5" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-5">
        <EmptyState icon="🔎" title="No se encontró la propiedad" description="Puede que la hayas eliminado o que el link esté desactualizado." />
        <div className="mt-4 text-center">
          <Link to="/app/properties" className="rounded-sm text-sm text-teal-700 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            ← Volver a Propiedades
          </Link>
        </div>
      </div>
    );
  }

  const propertyMatches = (matches.data ?? []).filter((m) => m.propertyId === property.id);
  const cover = property.images[activeImage] ?? property.images[0];
  const whatsappText = encodeURIComponent(`${property.title} — ${property.currency} ${property.price}\n${API_URL}/p/${property.id}`);
  const pricePerM2 = property.coveredArea ? Math.round(Number(property.price) / property.coveredArea) : null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link to="/app/properties" className="rounded-sm text-[12.5px] text-ink-mute transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
          ← Propiedades
        </Link>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-semibold text-teal-700">
          {OPERATION_LABELS[property.operationType] ?? property.operationType}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
          {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
        </span>
        {property.exclusive && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">Exclusiva</span>
        )}

        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex h-8 items-center gap-2 rounded-lg bg-teal-600 px-3 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.3A8.5 8.5 0 1 1 20.5 11.5z" />
          </svg>
          Compartir por WhatsApp
        </a>
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_340px]">

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2">
            {cover ? (
              <img src={cover.url} alt={property.title} className="h-56 w-full rounded-xl border border-hairline object-cover sm:h-72" />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-xl border border-dashed border-hairline bg-gray-50 text-gray-300 sm:h-72">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9">
                  <path d="M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 3-3L20 17" />
                  <circle cx="9" cy="9" r="1.4" />
                </svg>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {property.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === activeImage ? "border-teal-600" : "border-transparent hover:border-hairline"
                  }`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}

              <label className="flex h-14 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline text-ink-faint transition-colors hover:border-teal-300 hover:text-teal-700 focus-within:ring-2 focus-within:ring-teal-500">
                {uploading ? (
                  <span className="text-[10.5px] font-medium">Subiendo…</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-[10.5px] font-medium">Agregar</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhoto(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <Card title="Ficha">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 p-3.5 sm:grid-cols-3 xl:grid-cols-4">
              {property.address && <Fact label="Dirección" value={property.address} />}
              <Fact label="Zona" value={property.zone} />
              <Fact label="Operación" value={OPERATION_LABELS[property.operationType] ?? property.operationType} />
              <Fact label="Tipo" value={PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType} />
              {property.coveredArea != null && <Fact label="M² cubiertos" value={property.coveredArea} />}
              {property.totalArea != null && <Fact label="M² totales" value={property.totalArea} />}
              {property.rooms != null && <Fact label="Ambientes" value={property.rooms} />}
              {property.bedrooms != null && <Fact label="Dormitorios" value={property.bedrooms} />}
              {property.bathrooms != null && <Fact label="Baños" value={property.bathrooms} />}
              {property.garage && <Fact label="Cochera" value={property.garageSpaces ? `Sí (${property.garageSpaces})` : "Sí"} />}
              {property.floor && <Fact label="Piso / unidad" value={property.floor} />}
              {property.age != null && <Fact label="Antigüedad" value={property.age === 0 ? "A estrenar" : `${property.age} años`} />}
              {property.exclusive && (
                <Fact
                  label="Exclusividad"
                  value={property.exclusiveUntil ? `hasta ${new Date(property.exclusiveUntil).toLocaleDateString("es-AR")}` : "Sí"}
                />
              )}
            </div>
          </Card>

          {(property.description || property.tags.length > 0) && (
            <Card title="Descripción">
              <div className="flex flex-col gap-2.5 p-3.5">
                {property.description && (
                  <p className="text-[12.5px] leading-relaxed text-ink-soft" style={{ textWrap: "pretty" }}>
                    {property.description}
                  </p>
                )}
                {property.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {property.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] text-ink-soft">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="Precio">
            <div className="flex flex-col gap-0.5 px-3.5 pb-2.5 pt-3">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-ink">
                {property.currency} {property.price}
              </span>
              {pricePerM2 != null && (
                <span className="text-[11.5px] tabular-nums text-ink-faint">
                  {property.currency} {pricePerM2} por m² cubierto
                </span>
              )}
            </div>

            {property.priceHistory.length > 0 && (
              <div className="flex flex-col border-t border-divider">
                {[...property.priceHistory].reverse().map((entry, index, all) => {
                  // El historial viene del más viejo al más nuevo; acá se muestra al revés, así que
                  // el anterior en el tiempo es el SIGUIENTE de esta lista.
                  const previous = all[index + 1];
                  const previousPrice = previous ? Number(previous.price) : null;
                  const current = Number(entry.price);
                  const wentUp = previousPrice != null && current > previousPrice;
                  const wentDown = previousPrice != null && current < previousPrice;
                  return (
                    <span key={entry.id} className="flex items-center gap-2.5 px-3.5 py-2">
                      <span className="w-14 flex-shrink-0 text-[11px] tabular-nums text-ink-faint">
                        {new Date(entry.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                      </span>
                      <span className="text-[12.5px] font-medium tabular-nums text-ink">
                        {entry.currency} {entry.price}
                      </span>
                      {/* Sin semáforo: que un precio suba o baje no es bueno ni malo por sí solo. */}
                      {wentUp && <span className="ml-auto text-[11px] text-ink-mute">↑ subió</span>}
                      {wentDown && <span className="ml-auto text-[11px] text-ink-mute">↓ bajó</span>}
                      {previousPrice == null && <span className="ml-auto text-[11px] text-ink-faint">inicial</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </Card>

          {propertyMatches.length > 0 && (
            <Card title="Matches" aside={`${propertyMatches.length}`}>
              {propertyMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/app/leads/${match.leadId}`}
                  className="flex items-center gap-3 border-b border-divider-soft px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink">{match.lead.contactName}</span>
                    {match.reasons.length > 0 && (
                      <span className="block truncate text-[11px] text-ink-mute">{match.reasons.join(" · ")}</span>
                    )}
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-teal-800">
                    {match.score}
                  </span>
                </Link>
              ))}
            </Card>
          )}

          {(property.ownerName || property.ownerPhone || property.ownerNotes) && (
            <Card title="Propietario" aside="uso interno">
              <div className="flex flex-col gap-3 p-3.5">
                {property.ownerName && <Fact label="Nombre" value={property.ownerName} />}
                {property.ownerPhone && <Fact label="Teléfono" value={property.ownerPhone} />}
                {property.ownerNotes && (
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[10.5px] text-ink-faint">Notas</span>
                    <span className="text-xs leading-relaxed text-ink-soft">{property.ownerNotes}</span>
                  </span>
                )}
              </div>
            </Card>
          )}

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface py-2.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink-faint">
              <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
            Ver cómo lo ve el cliente
          </button>

          <SharePreview
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            url={`${API_URL}/p/${property.id}`}
            meta={previewMeta.data}
            whatsappText={`${property.title} — ${property.currency} ${property.price}\n${API_URL}/p/${property.id}`}
          />
        </div>
      </div>
    </div>
  );
}
