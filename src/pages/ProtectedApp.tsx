// Layout protegido del dashboard: exige sesión iniciada; si no hay, redirige a /login.
// Arma el shell (barra lateral + barra superior + contenido), el buscador global (⌘K) y el
// contexto del título de pantalla que usa la barra superior.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { DashboardTopbar } from "../components/DashboardTopbar";
import { DashboardNav } from "../components/DashboardNav";
import { InstallPrompt } from "../components/InstallPrompt";
import { PushPrompt } from "../features/push/PushPrompt";
import { CommandPalette } from "../features/search/CommandPalette";
import { AccountModal } from "../features/account/AccountModal";
import { PageChromeContext } from "../lib/pageChrome";
import type { PageChrome } from "../lib/pageChrome";

export function ProtectedApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [chrome, setChrome] = useState<PageChrome | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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

  // ⌘K en Mac, Ctrl+K en Windows/Linux. Se escucha en toda la ventana para que funcione desde
  // cualquier pantalla del dashboard, sin importar dónde esté el foco.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const chromeStore = useMemo(() => ({ chrome, setChrome }), [chrome]);
  const handleLogout = useCallback(() => {
    queryClient.clear();
    supabase.auth.signOut();
  }, [queryClient]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
        <p className="text-sm text-ink-mute">Abriendo tu cartera...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  const email = session.user.email ?? "Mi cuenta";

  return (
    <PageChromeContext.Provider value={chromeStore}>
      <div className="flex min-h-screen bg-canvas">
        <DashboardNav email={email} onLogout={handleLogout} onOpenAccount={() => setAccountOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar
            email={email}
            onLogout={handleLogout}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenAccount={() => setAccountOpen(true)}
          />
          <main className="min-w-0 flex-1 pb-24 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <InstallPrompt />
      <PushPrompt />
    </PageChromeContext.Provider>
  );
}
