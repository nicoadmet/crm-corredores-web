// Landing page: todo el sitio público vive en una sola página (hero, pilares, cómo funciona, precios).
// Los links de la navbar y el redirect de /precios apuntan a anclas (#pilares, #como-funciona, #precios);
// el useEffect de acá abajo hace scroll suave hasta la sección cuando la URL trae un hash.
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import heroProperty1 from "../assets/hero-property-1.jpg";
import heroProperty2 from "../assets/hero-property-2.jpg";

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polygon strokeLinecap="round" strokeLinejoin="round" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line strokeLinecap="round" x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line strokeLinecap="round" x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polygon strokeLinecap="round" strokeLinejoin="round" points="12 2 2 7 12 12 22 7 12 2" />
      <polyline strokeLinecap="round" strokeLinejoin="round" points="2 17 12 22 22 17" />
      <polyline strokeLinecap="round" strokeLinejoin="round" points="2 12 12 17 22 12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line strokeLinecap="round" x1="16" y1="2" x2="16" y2="6" />
      <line strokeLinecap="round" x1="8" y1="2" x2="8" y2="6" />
      <line strokeLinecap="round" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line strokeLinecap="round" x1="2" y1="12" x2="22" y2="12" />
      <path strokeLinecap="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function Home() {
  const location = useLocation();

  // Cuando se llega con hash desde otra ruta (ej. /terminos -> /#precios) el Home recién se monta,
  // así que el scroll se difiere un frame para que la sección ya esté maquetada.
  useEffect(() => {
    if (!location.hash) return;
    const hash = location.hash;
    const frame = requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <div>
      <Navbar />

      <section className="bg-grain relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-teal-200 opacity-40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-teal-100 opacity-60 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="animate-fade-up inline-block rounded-full bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700">
              CRM para corredores independientes
            </span>

            <h1 className="animate-fade-up [animation-delay:100ms] mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Todos tus clientes y propiedades,{" "}
              <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h1>

            <p className="animate-fade-up [animation-delay:200ms] mt-6 max-w-lg text-lg text-slate-600 md:text-xl">
              Dejá los papelitos y los Excels ilegibles. InmoCRM unifica tu cartera y tus leads,
              y te avisa apenas hay un match — antes de que el cliente se enfríe.
            </p>

            <div className="animate-fade-up [animation-delay:300ms] mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="rounded-full bg-teal-600 px-7 py-3 text-lg font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl"
              >
                Empezá gratis 30 días
              </Link>
              <a
                href="#como-funciona"
                className="text-lg font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                Ver cómo funciona →
              </a>
            </div>

            <p className="animate-fade-up [animation-delay:400ms] mt-4 text-sm text-slate-500">
              Sin tarjeta · Cancelá cuando quieras
            </p>

            <div className="animate-fade-up [animation-delay:500ms] mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <CheckIcon /> Compartís con un click
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Sin logos de la competencia
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Alertas en tiempo real
              </span>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:300ms] relative mx-auto w-full max-w-sm">
            {/* Card de atrás, solo para dar sensación de profundidad (pila de fichas) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-3xl bg-teal-100"
            />

            <div className="relative rounded-3xl border border-slate-100 bg-white p-4 shadow-xl">
              {/* "Chrome" de ventana, para que se lea como preview de la app */}
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              </div>

              <div className="relative">
                <img
                  src={heroProperty1}
                  alt="Living moderno de una propiedad publicada en InmoCRM"
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                  1/8
                </span>
              </div>

              <div className="mt-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Depto 2 amb. en Palermo</p>
                  <p className="text-xs text-slate-500">Palermo, CABA</p>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                  Disponible
                </span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-900">USD 145.000</p>

              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                <img
                  src={heroProperty2}
                  alt="Casa moderna publicada en InmoCRM"
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Casa 3 amb. en Belgrano</p>
                  <p className="text-xs text-slate-500">USD 210.000</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Reservada
                </span>
              </div>
            </div>

            <div
              className="animate-float absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <BellIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Nuevo match</p>
                <p className="text-xs text-slate-500">92% de compatibilidad</p>
              </div>
            </div>

            <div
              className="animate-float absolute -top-4 -right-4 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="text-xs font-semibold leading-tight text-slate-900">
                Compartido
                <br />
                por WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:absolute md:inset-x-0 md:bottom-6 md:flex md:justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-bounce text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section id="pilares" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700">
            Funcionalidades
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Todo lo que necesitás para vender más rápido
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pensado para el corredor que labura solo, en la calle, con el celular como oficina.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <ZapIcon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Cargá una propiedad en 30 segundos</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sacás la foto, completás lo esencial y listo — sin formularios eternos ni planillas que se te desordenan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <ShareIcon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Fichas listas para WhatsApp</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Vista previa prolija y carga instantánea, sin logos de la competencia — se ve profesional apenas se abre el link.
            </p>
          </div>

          <div className="rounded-2xl bg-teal-600 p-6 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <BellIcon />
            </div>
            <h3 className="mt-4 font-semibold text-white">Te avisa antes que se enfríe</h3>
            <p className="mt-2 text-sm leading-relaxed text-teal-50">
              El sistema cruza tu cartera con tus leads solo, y te manda una notificación real al celular apenas aparece un match fuerte.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <LayersIcon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Armá catálogos con un click</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Agrupá varias propiedades en un solo link y mandale a cada cliente justo lo que le interesa.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <CalendarIcon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Nunca se te pasa un seguimiento</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Recordatorios, historial de cada cliente y agenda de visitas — todo en un solo lugar, no en tu cabeza.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <GlobeIcon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Publicá en varios portales con un click</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Cargás una vez y se actualiza en Zonaprop, Argenprop y los portales que uses — sin repetir el trabajo dos veces.
            </p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-slate-50 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700">
              Cómo funciona
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              De la calle al cliente, en tres pasos
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sin curva de aprendizaje: si sabés usar WhatsApp, ya sabés usar InmoCRM.
            </p>
          </div>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-7 hidden border-t-2 border-dashed border-teal-200 md:block"
            />

            <div className="relative text-center md:text-left">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/20 md:mx-0">
                1
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Cargá tu propiedad</h3>
              <p className="mt-2 text-slate-600">
                Sacás la foto y completás lo esencial. Menos de 30 segundos, desde el celular, en la calle.
              </p>
            </div>

            <div className="relative text-center md:text-left">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/20 md:mx-0">
                2
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Compartila por WhatsApp</h3>
              <p className="mt-2 text-slate-600">
                Un link liviano, con vista previa cuidada, listo para mandarle a cualquier cliente al toque.
              </p>
            </div>

            <div className="relative text-center md:text-left">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/20 md:mx-0">
                3
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Recibí el aviso del match</h3>
              <p className="mt-2 text-slate-600">
                El sistema cruza tu cartera con tus leads solo y te notifica al celular ni bien aparece uno fuerte.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700">
              Precios
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Empezá gratis 30 días. Cambiá o cancelá cuando quieras.
            </p>
          </div>

          <div className="mx-auto mt-14 flex max-w-3xl flex-col items-stretch justify-center gap-8 md:flex-row">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="font-semibold text-slate-900">Prueba gratis</h3>
              <p className="mt-4 text-4xl font-bold text-slate-900">$0</p>
              <p className="mt-1 text-sm text-slate-500">30 días, sin tarjeta</p>

              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckIcon /> Propiedades y leads ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Matching automático
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Ficha pública + WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Catálogos, agenda y estadísticas
                </li>
              </ul>

              <Link
                to="/login"
                className="mt-8 block rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Empezar gratis
              </Link>
            </div>

            <div className="relative flex-1 rounded-2xl border-2 border-teal-600 bg-white p-8 shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-4 py-1 text-xs font-semibold text-white">
                Recomendado
              </span>

              <h3 className="font-semibold text-slate-900">Individual</h3>
              <p className="mt-4 text-4xl font-bold text-slate-900">
                AR$ 17.000<span className="text-base font-normal text-slate-500">/mes</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">Para el corredor independiente, todo incluido</p>

              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckIcon /> Todo lo de la prueba gratis
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Notificaciones push
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Soporte por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Actualizaciones constantes
                </li>
              </ul>

              <Link
                to="/login"
                className="mt-8 block rounded-full bg-teal-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl"
              >
                Elegir plan
              </Link>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            ¿Sos una agencia con varios corredores?{" "}
            <a href="mailto:hola@inmocrm.com" className="font-medium text-teal-700 hover:text-teal-800">
              Contanos
            </a>
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="bg-grain relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-teal-600 px-6 py-16 text-center shadow-xl md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-teal-500 opacity-50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-400 opacity-40 blur-3xl"
          />

          <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-4xl">
            Dejá de perder clientes por llegar tarde
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-teal-50">
            Empezá gratis hoy y probá InmoCRM con tu propia cartera, sin compromiso.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="rounded-full bg-white px-7 py-3 text-lg font-semibold text-teal-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Empezá gratis 30 días
            </Link>
          </div>

          <p className="relative mt-4 text-sm text-teal-100">Sin tarjeta · Cancelá cuando quieras</p>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <Link to="/" className="text-xl font-bold text-teal-700">
                InmoCRM
              </Link>
              <p className="mt-3 text-sm text-slate-500">
                El asistente de bolsillo para el corredor inmobiliario independiente.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 sm:gap-16">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Producto</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  <li>
                    <a href="#pilares" className="hover:text-slate-900">
                      Funcionalidades
                    </a>
                  </li>
                  <li>
                    <a href="#como-funciona" className="hover:text-slate-900">
                      Cómo funciona
                    </a>
                  </li>
                  <li>
                    <a href="#precios" className="hover:text-slate-900">
                      Precios
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">Cuenta</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  <li>
                    <Link to="/login" className="hover:text-slate-900">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-slate-900">
                      Empezar gratis
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  <li>
                    <Link to="/privacidad" className="hover:text-slate-900">
                      Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link to="/terminos" className="hover:text-slate-900">
                      Términos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} InmoCRM. Hecho en Argentina.</p>
            <a href="mailto:hola@inmocrm.com" className="hover:text-slate-900">
              hola@inmocrm.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
