// Define las rutas de toda la app: páginas públicas (Home, Pricing, Login)
// y el área protegida (/app) con sus subrutas (Properties, Leads, Matches, Agenda, Catálogos,
// Estadísticas, y el detalle de cada uno).
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Pricing } from "./pages/Pricing";
import { Auth } from "./pages/Auth";
import { ProtectedApp } from "./pages/ProtectedApp";
import { Properties } from "./pages/Properties";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Leads } from "./pages/Leads";
import { LeadDetail } from "./pages/LeadDetail";
import { Matches } from "./pages/Matches";
import { Agenda } from "./pages/Agenda";
import { Catalogs } from "./pages/Catalogs";
import { Stats } from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/precios" element={<Pricing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/app" element={<ProtectedApp />}>
          <Route index element={<Navigate to="properties" replace />} />
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
