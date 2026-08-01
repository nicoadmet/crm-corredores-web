// Página de precios: planes disponibles (valores placeholder, a definir con Nico).
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function Pricing() {
  return (
    <div>
      <Navbar />
      <section className="text-center px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Planes simples, sin sorpresas</h1>
        <p className="text-gray-600">Empezá gratis. Cambiá o cancelá cuando quieras.</p>
      </section>

      <section className="flex flex-wrap justify-center gap-6 px-6 pb-16">
        <div className="border border-gray-200 rounded-xl p-8 w-full max-w-xs">
          <h3 className="font-semibold text-lg">Prueba gratis</h3>
          <p className="text-3xl my-4">$0</p>
          <p className="text-gray-600">14 días, sin tarjeta</p>
          <ul className="text-left list-disc pl-5 my-4 text-gray-700">
            <li>Propiedades ilimitadas</li>
            <li>Leads ilimitados</li>
            <li>Matching automático</li>
            <li>Ficha pública + WhatsApp</li>
          </ul>
          <Link to="/login" className="inline-block bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-gray-800">
            Empezar
          </Link>
        </div>

        <div className="border-2 border-gray-900 rounded-xl p-8 w-full max-w-xs">
          <h3 className="font-semibold text-lg">Individual</h3>
          <p className="text-3xl my-4">USD 19<span className="text-base">/mes</span></p>
          <p className="text-gray-600">Para el corredor independiente</p>
          <ul className="text-left list-disc pl-5 my-4 text-gray-700">
            <li>Todo lo de la prueba gratis</li>
            <li>Fotos de alta resolución</li>
            <li>Soporte por WhatsApp</li>
          </ul>
          <Link to="/login" className="inline-block bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-gray-800">
            Elegir plan
          </Link>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 w-full max-w-xs">
          <h3 className="font-semibold text-lg">Equipos</h3>
          <p className="text-3xl my-4">Próximamente</p>
          <p className="text-gray-600">Para agencias con varios corredores</p>
          <ul className="text-left list-disc pl-5 my-4 text-gray-700">
            <li>Todo lo del plan Individual</li>
            <li>Usuarios ilimitados</li>
            <li>Roles y permisos</li>
          </ul>
          <a href="mailto:hola@tudominio.com" className="inline-block text-gray-900 underline mt-2">
            Avisame cuando esté
          </a>
        </div>
      </section>
    </div>
  );
}