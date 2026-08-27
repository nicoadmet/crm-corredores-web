// Datos de la cuenta. Es una pantalla chica pero no es cosmética: el nombre y el teléfono de acá
// son los que aparecen como firma y botón de WhatsApp en las páginas que ve el cliente.
import { useEffect, useState } from "react";
import { trpc } from "../../trpc";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Field, FormLayout, TextInput } from "../../components/form";
import { useToast } from "../../lib/toast";

export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const toast = useToast();
  const account = trpc.account.get.useQuery(undefined, { enabled: open });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Los campos se llenan cuando llegan los datos, no antes: si se inicializaran en el useState,
  // quedarían vacíos para siempre porque el primer render ocurre antes de la respuesta.
  useEffect(() => {
    if (!account.data) return;
    setName(account.data.name);
    setPhone(account.data.phone ?? "");
  }, [account.data]);

  const update = trpc.account.update.useMutation({
    onSuccess: () => {
      utils.account.get.invalidate();
      toast("Datos guardados.");
      onClose();
    },
    onError: () => toast("No se pudieron guardar los datos.", "error"),
  });

  const looksLikeEmail = name.includes("@");

  return (
    <Modal open={open} onClose={onClose} title="Mi cuenta">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({ name, phone: phone.trim() || null });
        }}
        className="flex flex-col"
      >
        <FormLayout
          actions={
            <Button type="submit" size="lg" className="w-full sm:w-auto" loading={update.isPending} disabled={!name.trim()}>
              {update.isPending ? "Guardando..." : "Guardar"}
            </Button>
          }
        >
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3">
            <p className="text-[12.5px] leading-relaxed text-teal-900">
              Estos datos aparecen en las fichas y catálogos que compartís por WhatsApp: tu nombre como firma y
              tu teléfono como botón de contacto. <strong className="font-semibold">Sin teléfono cargado, el
              cliente que abre el link no tiene cómo responderte.</strong>
            </p>
          </div>

          <Field
            label="Nombre o inmobiliaria"
            hint={looksLikeEmail ? "Es tu email. Mientras siga así no se muestra ninguna firma en las páginas públicas." : undefined}
          >
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Nicolás Admet" required />
          </Field>

          <Field label="WhatsApp" hint="Con código de país y de área, sin espacios ni signos. Ej: 5491144552211">
            <TextInput
              type="tel"
              inputMode="tel"
              className="tabular-nums"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5491144552211"
            />
          </Field>
        </FormLayout>
      </form>
    </Modal>
  );
}
