// Pantalla principal: login si no hay sesión, o el resto de la app si ya estás logueado.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useQueryClient } from "@tanstack/react-query";

import { Auth } from "./Auth";
import { Properties } from "./Properties";
import { Leads } from "./Leads";
import { Matches } from "./Matches";

function App() {
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
  if (!session) return <Auth />;

  return (
    <div>
      <button onClick={() => { queryClient.clear(); supabase.auth.signOut(); }}>Salir</button>
      <Properties />
      <Leads />
      <Matches />
    </div>
  );
}

export default App;