// Estado vacío con guía: en vez de una pantalla en blanco, explica qué va acá y ofrece la acción para arrancar.
import type { ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-10 text-center">
      {icon && (
        <div className="mb-3 text-3xl" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="font-semibold text-gray-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
