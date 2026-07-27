// Botón para generar matches y lista de los matches sugeridos.
import { trpc } from "./trpc";

export function Matches() {
  const utils = trpc.useUtils();
  const list = trpc.matches.list.useQuery();
  const generate = trpc.matches.generate.useMutation({
    onSuccess: () => utils.matches.list.invalidate(),
  });

  return (
    <div>
      <h1>Matches</h1>
      <button onClick={() => generate.mutate()}>Generar matches</button>
      {list.isLoading && <p>Cargando...</p>}
      <ul>
        {list.data?.map((m: any) => (
          <li key={m.id}>
            {m.lead.contactName} ({m.lead.zone}) — {m.property.title} ({m.property.zone}) — puntaje: {m.score}
          </li>
        ))}
      </ul>
    </div>
  );
}