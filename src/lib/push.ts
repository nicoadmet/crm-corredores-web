// Suscribe (o reutiliza la suscripción existente) al navegador para recibir notificaciones push
// del backend (Web Push API + VAPID). Devuelve null si el navegador no soporta push o si la
// persona no dio permiso.
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

// La Push API pide la clave pública en un formato binario particular; "web-push generate-vapid-keys"
// la entrega como texto base64url, hay que convertirla antes de pasarla. Se arma con "new Uint8Array(n)"
// (en vez de "Uint8Array.from(...)") a propósito: así queda tipado como respaldado por un ArrayBuffer
// común, que es lo que pide "applicationServerKey" — con ".from()" TypeScript no puede garantizar eso.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
