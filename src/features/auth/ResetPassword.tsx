// Pantalla a la que llega el corredor desde el mail de "recuperar contraseña". Supabase manda el
// token en el hash de la URL y el cliente lo canjea solo por una sesión temporal (detectSessionInUrl,
// que viene activado por defecto): por eso acá alcanza con pedir la contraseña nueva.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { Field, TextInput } from "../../components/form";
import { authErrorMessage, passwordStrength } from "./authErrors";

export function ResetPassword() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  const strength = passwordStrength(password);
  const mismatch = repeat.length > 0 && password !== repeat;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== repeat) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(authErrorMessage(error.message));
        return;
      }
      navigate("/app");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="flex w-full max-w-[380px] flex-col gap-5 rounded-2xl border border-hairline bg-surface p-6 sm:p-7">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-ink">InmoCRM</span>
        </Link>

        {checking && <p className="text-[13px] text-ink-mute">Verificando el link...</p>}

        {!checking && !hasSession && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[22px] font-bold tracking-tight text-ink">El link no es válido</h1>
              <p className="text-[13.5px] leading-relaxed text-ink-mute">
                Puede haber vencido o ya haberse usado. Los links de recuperación duran poco a propósito.
                Pedí uno nuevo desde la pantalla de ingreso.
              </p>
            </div>
            <Link
              to="/login"
              className="flex h-11 items-center justify-center rounded-xl bg-teal-600 text-[15px] font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Volver a la pantalla de ingreso
            </Link>
          </>
        )}

        {!checking && hasSession && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[22px] font-bold tracking-tight text-ink">Elegí una contraseña nueva</h1>
              <p className="text-[13.5px] text-ink-mute">Después de guardarla entrás directo a tu cartera.</p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <Field label="Contraseña nueva">
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex flex-1 gap-1">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-colors ${strength.score >= step ? "bg-teal-600" : "bg-gray-200"}`}
                      />
                    ))}
                  </span>
                  {strength.label && <span className="text-[11px] font-medium text-ink-mute">{strength.label}</span>}
                </div>
                <span className="text-[11px] text-ink-faint">{strength.hint}</span>
              </div>

              <Field label="Repetila" hint={mismatch ? "Las dos contraseñas no coinciden." : undefined}>
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  required
                />
              </Field>

              <Button type="submit" size="lg" className="w-full" loading={busy} disabled={mismatch || password.length === 0}>
                Guardar y entrar
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
