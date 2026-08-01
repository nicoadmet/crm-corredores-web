// Cliente de tRPC integrado con TanStack Query: cachea y deduplica pedidos automáticamente.
import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../crm-corredores-api/src/routers";
import { supabase } from "./lib/supabase";

export const API_URL = import.meta.env.VITE_API_URL;

export const trpc = createTRPCReact<AppRouter>();

// Tipos de las respuestas de cada endpoint, inferidos directamente del backend
// (evita tener que re-declarar a mano los tipos de Property/Lead/Match en el frontend).
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${API_URL}/trpc`,
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      },
    }),
  ],
});
