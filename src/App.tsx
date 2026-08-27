// Define las rutas de toda la app: páginas públicas (Home, Login) y el área protegida (/app) con sus subrutas
// (Hoy, Properties, Leads, Matches, Agenda, Catálogos, Estadísticas, y el detalle de cada uno).
// Precios ya no es una página propia: es la sección #precios del Home (ver src/pages/Home.tsx).
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Auth } from "./features/auth/Auth";
import { ResetPassword } from "./features/auth/ResetPassword";
import { ProtectedApp } from "./pages/ProtectedApp";
import { Properties } from "./features/properties/Properties";
import { PropertyDetail } from "./features/properties/PropertyDetail";
import { Leads } from "./features/leads/Leads";
import { LeadDetail } from "./features/leads/LeadDetail";
import { Matches } from "./features/matches/Matches";
import { Agenda } from "./features/agenda/Agenda";
import { Catalogs } from "./features/catalogs/Catalogs";
import { Stats } from "./features/stats/Stats";
import { Today } from "./features/today/Today";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/precios" element={<Navigate to="/#precios" replace />} />
        <Route path="/login" element={<Auth />} />
        {/* Adonde vuelve el corredor desde el mail de recuperar contraseña. */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={<ProtectedApp />}>
          <Route index element={<Today />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="matches" element={<Matches />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
