// Formulario de login y registro con email/password.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";

export function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/app");
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border border-gray-200 rounded-lg">
      <h1 className="text-xl font-bold mb-4">{mode === "login" ? "Iniciar sesión" : "Registrarme"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">{mode === "login" ? "Entrar" : "Registrarme"}</Button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <Button
        variant="ghost"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 underline"
      >
        {mode === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
      </Button>
    </div>
  );
}