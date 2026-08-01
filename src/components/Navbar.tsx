// Barra de navegación de las páginas públicas (Home, Pricing).
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <Link to="/" className="text-xl font-bold text-teal-700">
        InmoCRM
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/precios" className="text-gray-700 hover:text-gray-900">
          Precios
        </Link>
        <Link to="/login" className="text-gray-700 hover:text-gray-900">
          Iniciar sesión
        </Link>
        <Link
          to="/login"
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
        >
          Empezar gratis
        </Link>
      </div>
    </nav>
  );
}
