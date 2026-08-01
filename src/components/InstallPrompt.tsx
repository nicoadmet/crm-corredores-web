// Banner para invitar a instalar la app: en Android muestra un botón real, en iPhone muestra instrucciones (Apple no permite el botón automático).
import { useEffect, useState } from "react";

// El evento "beforeinstallprompt" todavía no está en los tipos estándar de TypeScript.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const bannerStyle: React.CSSProperties = {
    padding: 12,
    background: "#0D9488",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  };

  if (installEvent) {
    return (
      <div style={bannerStyle}>
        <span>Instalá el CRM en tu celular para acceder más rápido</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={async () => {
              await installEvent.prompt();
              setInstallEvent(null);
            }}
          >
            Instalar
          </button>
          <button onClick={() => setDismissed(true)}>Ahora no</button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div style={bannerStyle}>
        <span>Para instalar: tocá Compartir (ícono con flecha) y elegí "Agregar a inicio"</span>
        <button onClick={() => setDismissed(true)}>Entendido</button>
      </div>
    );
  }

  return null;
}