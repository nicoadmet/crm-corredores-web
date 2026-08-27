// Vista previa de un link antes de mandarlo. Muestra las dos cosas que el corredor no puede ver de
// otra manera: cómo queda la tarjeta cuando pega el link en un chat, y cómo se ve la página real en
// un celular. Los datos de la tarjeta salen del mismo helper del backend que arma las meta tags,
// así que lo que se ve acá es literalmente lo que va a ver el cliente.
import { useState } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { useToast } from "../lib/toast";

export function SharePreview({
  open,
  onClose,
  url,
  meta,
  whatsappText,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  meta?: { title: string; description: string; image?: string | null };
  whatsappText: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("No se pudo copiar el link.", "error");
    }
  }

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();

  return (
    <Modal open={open} onClose={onClose} title="Cómo lo ve el cliente">
      <div className="flex flex-col gap-4 p-5">

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] text-ink-faint">EN EL CHAT</h3>
          {/* Fondo verdoso y burbuja: no es WhatsApp, es una representación de cómo queda ahí. */}
          <div className="rounded-xl bg-[#e6ddd4] p-3">
            <div className="ml-auto w-full max-w-[290px] overflow-hidden rounded-lg rounded-tr-sm bg-[#d9fdd3] shadow-sm">
              <div className="m-1 overflow-hidden rounded-md bg-black/5">
                {meta?.image ? (
                  <img src={meta.image} alt="" className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center text-[11px] text-black/30">
                    Sin foto de portada
                  </div>
                )}
                <div className="flex flex-col gap-0.5 px-2.5 py-2">
                  <span className="line-clamp-2 text-[12.5px] font-semibold text-black/85">
                    {meta?.title ?? "Cargando..."}
                  </span>
                  <span className="line-clamp-2 text-[11.5px] text-black/55">{meta?.description ?? ""}</span>
                  <span className="text-[10.5px] text-black/40">{domain}</span>
                </div>
              </div>
              <p className="break-all px-2.5 pb-2 text-[11.5px] text-[#027eb5]">{url}</p>
            </div>
          </div>
          {!meta?.image && (
            <p className="text-[11.5px] text-ink-mute">
              Sin una foto cargada, la tarjeta del chat sale sin imagen y llama bastante menos la atención.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] text-ink-faint">LA PÁGINA, EN UN CELULAR</h3>
          <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-hairline bg-canvas">
            {open && (
              <iframe
                src={url}
                title="Vista previa de la página pública"
                className="block h-[440px] w-full border-0 bg-white"
                loading="lazy"
              />
            )}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-divider bg-surface px-5 py-3">
        <Button variant="secondary" size="lg" onClick={copyLink} className="flex-1">
          {copied ? "¡Copiado!" : "Copiar link"}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.3A8.5 8.5 0 1 1 20.5 11.5z" />
          </svg>
          Compartir
        </a>
      </div>
    </Modal>
  );
}
