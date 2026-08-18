// @ts-nocheck
// Service Worker de la PWA: cachea los archivos de la app para que funcione offline (igual que
// antes, cuando esto lo generaba solo vite-plugin-pwa) y además muestra las notificaciones push
// que manda el backend (ver routes/internalNotifications.ts en el repo del backend).
// "@ts-nocheck" es a propósito (atajo temporal): los tipos globales de "webworker" (self, PushEvent,
// etc.) chocan con los tipos "dom" que usa el resto de la app en el mismo proyecto de TypeScript;
// la forma prolija de resolver esto es un tsconfig separado sólo para este archivo — se puede sumar
// más adelante si este archivo crece, por ahora no vale la pena la complejidad extra.
import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = {};
  }

  const title = data.title ?? "CRM Corredores";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body,
      icon: "/pwa-192x192.png",
      data: { url: data.url ?? "/app" },
    })
  );
});

// Al tocar la notificación: si ya hay una pestaña de la app abierta, la enfoca; si no, abre una nueva.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
