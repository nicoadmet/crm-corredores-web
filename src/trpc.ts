// Cliente de tRPC integrado con TanStack Query: cachea y deduplica pedidos automáticamente.
import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "../../crm-corredores-api/src/router";
import { supabase } from "./supabase";

export const API_URL = import.meta.env.VITE_API_URL;

export const trpc = createTRPCReact<AppRouter>();

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