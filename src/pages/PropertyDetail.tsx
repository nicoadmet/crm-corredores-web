// Página de detalle de una propiedad (solo lectura), a la que se llega desde un match.
import { Link, useParams } from "react-router-dom";
import { trpc } from "../trpc";

const OPERATION_LABELS: Record<string, string> = { venta: "Venta", alquiler: "Alquiler" };
const PROPERTY_TYPE_LABELS: Record<string, string> = { depto: "Depto", casa: "Casa" };

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, error } = trpc.properties.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id }
  );

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  if (error || !property) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-500">No se encontró la propiedad.</p>
        <Link to="/app/properties" className="text-teal-700 hover:underline text-sm">
          ← Volver a Propiedades
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Link to="/app/properties" className="text-sm text-teal-700 hover:underline">
        ← Volver a Propiedades
      </Link>

      <div className="flex flex-wrap items-center gap-2 mt-4 mb-1">
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
          {OPERATION_LABELS[property.operationType] ?? property.operationType}
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
          {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
        </span>
        {property.exclusive && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">🔒 Exclusiva</span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 break-words">{property.title}</h1>
      <p className="text-gray-600 mt-1 break-words">
        {property.zone} — {property.currency} {property.price}
      </p>

      {property.images[0] && (
        <img
          src={property.images[0].url}
          alt={property.title}
          className="w-full max-h-80 object-cover rounded-lg mt-4"
        />
      )}

      <div className="mt-4 flex flex-col gap-1 text-sm text-gray-700 break-words">
        {property.address && <p>Dirección: {property.address}</p>}
        {property.rooms != null && <p>Ambientes: {property.rooms}</p>}
        {property.bedrooms != null && <p>Dormitorios: {property.bedrooms}</p>}
        {property.bathrooms != null && <p>Baños: {property.bathrooms}</p>}
        {property.garage && <p>Cochera{property.garageSpaces ? ` (${property.garageSpaces})` : ""}</p>}
        {property.coveredArea != null && <p>M² cubiertos: {property.coveredArea}</p>}
        {property.totalArea != null && <p>M² totales: {property.totalArea}</p>}
        {property.floor && <p>Piso/unidad: {property.floor}</p>}
        {property.age != null && (
          <p>Antigüedad: {property.age === 0 ? "A estrenar" : `${property.age} años`}</p>
        )}
        {property.description && <p>Descripción: {property.description}</p>}
      </div>
    </div>
  );
}
