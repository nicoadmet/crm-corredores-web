// Pantalla principal: login si no hay sesión, o el resto de la app si ya estás logueado.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

import { Auth } from "./pages/Auth";
import { Properties } from "./pages/Properties";
import { Leads } from "./pages/Leads";
import { Matches } from "./pages/Matches";
import { InstallPrompt } from "./components/InstallPrompt";

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
    <>
      <InstallPrompt />
      {!session ? (
        <Auth />
      ) : (
        <div>
          <button onClick={() => { queryClient.clear(); supabase.auth.signOut(); }}>Salir</button>
          <Properties />
          <Leads />
          <Matches />
        </div>
      )}
    </>
  );
}

export default App;