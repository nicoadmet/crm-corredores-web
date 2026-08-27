// Bloques grises con pulso que ocupan el lugar del contenido mientras carga, en vez de un "Cargando..." pelado.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

// Imita la forma de una tarjeta de lista (badges + título + subtítulo) para que la pantalla no "salte" al llegar los datos.
export function SkeletonCard({ withImage = false }: { withImage?: boolean }) {
  return (
    <div className="flex gap-4 rounded-lg border border-gray-200 p-4">
      {withImage && <Skeleton className="h-24 w-24 flex-shrink-0 rounded-md" />}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, withImage = false }: { count?: number; withImage?: boolean }) {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <SkeletonCard withImage={withImage} />
        </li>
      ))}
    </ul>
  );
}
