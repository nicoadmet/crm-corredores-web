// Área protegida de la app: exige sesión iniciada; si no hay, redirige a /login.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Properties } from "./Properties";
import { Leads } from "./Leads";
import { Matches } from "./Matches";
import { InstallPrompt } from "../components/InstallPrompt";

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

  if (loading) return <p>Cargando...</p>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <>
      <InstallPrompt />
      <div>
        <button onClick={() => { queryClient.clear(); supabase.auth.signOut(); }}>Salir</button>
        <Properties />
        <Leads />
        <Matches />
      </div>
    </>
  );
}