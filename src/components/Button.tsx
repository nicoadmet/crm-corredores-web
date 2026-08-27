// Botón único de toda la app: una sola definición de estilo por variante, en vez de repetir las clases en cada pantalla.
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "link" | "linkDanger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:bg-teal-800 disabled:bg-teal-600/50",
  secondary:
    "border border-gray-300 bg-surface text-ink-soft hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:opacity-50",
  ghost: "text-ink-mute hover:bg-gray-100 hover:text-ink disabled:opacity-50",
  link: "text-teal-700 hover:underline disabled:text-gray-300 disabled:no-underline",
  linkDanger: "text-red-600 hover:underline disabled:text-gray-300 disabled:no-underline",
};

// sm: barras de herramientas y filtros del escritorio. md: uso general. lg: acciones principales en el celular,
// donde nada puede bajar de 44px de alto sin volverse difícil de tocar.
const SIZES: Record<Size, string> = {
  sm: "h-7 rounded-md px-2.5 text-xs",
  md: "h-9 rounded-lg px-3.5 text-sm",
  lg: "h-11 rounded-xl px-4 text-[15px]",
};

// Las variantes "link" se ven como texto, así que no llevan alto fijo ni padding: sólo tamaño de texto.
const LINK_SIZES: Record<Size, string> = {
  sm: "rounded-sm text-xs",
  md: "rounded-sm text-sm",
  lg: "rounded-sm text-[15px]",
};

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}) {
  const isLink = variant === "link" || variant === "linkDanger";
  const sizeClass = isLink ? LINK_SIZES[size] : SIZES[size];

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${sizeClass} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
