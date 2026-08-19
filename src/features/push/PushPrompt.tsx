// Banner para activar notificaciones push (seguimiento vencido / match nuevo). En iPhone/iPad,
// Apple sólo permite Web Push si la app ya fue agregada a la pantalla de inicio — si todavía no lo
// está, no mostramos este banner (pedir el permiso no serviría de nada); dejamos que primero
// aparezca el banner de instalación (InstallPrompt.tsx) y este aparece en una visita posterior,
// una vez instalada.
import { useEffect, useState } from "react";
import { trpc } from "../../trpc";
import { subscribeToPush } from "./push";

const DISMISSED_KEY = "pushPromptDismissed";

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const subscribeMutation = trpc.pushSubscriptions.subscribe.useMutation();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isIOS && !isStandalone) return; // en iPhone sin instalar, pedir el permiso no serviría de nada

    setVisible(true);
  }, []);

  if (!visible) return null;

  async function handleActivate() {
    const subscription = await subscribeToPush();
    if (subscription) {
      const json = subscription.toJSON();
      if (json.keys?.p256dh && json.keys?.auth) {
        subscribeMutation.mutate({
          endpoint: subscription.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        });
      }
    }
    setVisible(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-teal-600 px-4 py-3 text-sm text-white">
      <span>Activá las notificaciones para enterarte al instante de seguimientos vencidos y matches nuevos</span>
      <div className="flex flex-shrink-0 gap-2">
        <button onClick={handleActivate} className="rounded-md bg-white px-3 py-1 font-medium text-teal-700">
          Activar
        </button>
        <button onClick={handleDismiss} className="text-white/80 hover:text-white">
          Ahora no
        </button>
      </div>
    </div>
  );
}
