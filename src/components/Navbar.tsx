// Barra de navegación pública: la Home es una sola página con secciones, por eso los links de contenido son anclas (#seccion) en vez de rutas separadas.
import { useState } from "react";
import { Link } from "react-router-dom";

const sections = [
  { href: "#pilares", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-teal-700" onClick={() => setOpen(false)}>
          InmoCRM
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Iniciar sesión
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Empezar gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-slate-700 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              {section.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
            Iniciar sesión
          </Link>
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="rounded-full bg-teal-600 px-5 py-2 text-center text-sm font-semibold text-white hover:bg-teal-700"
          >
            Empezar gratis
          </Link>
        </div>
      )}
    </header>
  );
}
