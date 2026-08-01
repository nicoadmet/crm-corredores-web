// Barra superior fija del dashboard: marca de la app y botón de salir.
import { Link } from "react-router-dom";

export function DashboardTopbar({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <Link to="/app/properties" className="text-lg font-bold text-teal-700">
        InmoCRM
      </Link>
      <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-800 underline">
        Salir
      </button>
    </header>
  );
}
