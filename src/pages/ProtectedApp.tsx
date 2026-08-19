// Layout protegido del dashboard: exige sesión iniciada; si no hay, redirige a /login.
// Arma el shell (topbar + sidebar/barra inferior + contenido) y deja que las rutas hijas
// (Properties, Leads, Matches) se rendericen en el <Outlet />.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { DashboardTopbar } from "../components/DashboardTopbar";
import { DashboardNav } from "../components/DashboardNav";
import { InstallPrompt } from "../components/InstallPrompt";
import { PushPrompt } from "../features/push/PushPrompt";

export function ProtectedApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  if (!session) return <Navigate to="/login" replace />;

  function handleLogout() {
    queryClient.clear();
    supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-white">
      <InstallPrompt />
      <PushPrompt />
      <DashboardTopbar onLogout={handleLogout} />
      <div className="flex">
        <DashboardNav />
        <main className="min-w-0 flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
