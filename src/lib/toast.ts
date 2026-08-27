// Contexto y hook de los avisos breves ("toasts"). Vive aparte del provider para que ese archivo exporte sólo componentes.
import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "info";
export type ShowToast = (message: string, variant?: ToastVariant) => void;

export const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast() tiene que usarse adentro de <ToastProvider>");
  return showToast;
}
