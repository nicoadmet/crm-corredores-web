// Formulario de login y registro con email/password.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
    <div>
      <h1>{mode === "login" ? "Iniciar sesión" : "Registrarme"}</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{mode === "login" ? "Entrar" : "Registrarme"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
      </button>
    </div>
  );
}