// Define las rutas de toda la app: páginas públicas (Home, Pricing, Login)
// y el área protegida (/app) que exige sesión iniciada.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Pricing } from "./pages/Pricing";
import { Auth } from "./pages/Auth";
import { ProtectedApp } from "./pages/ProtectedApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/precios" element={<Pricing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/app" element={<ProtectedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;