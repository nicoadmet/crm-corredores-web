// Entrada al producto: iniciar sesión, crear cuenta y recuperar contraseña, en una sola pantalla.
// La mitad izquierda usa el lenguaje visual del sitio público (que es de donde viene la persona) y
// la derecha el del dashboard (que es a donde va): la puerta se parece a las dos cosas que conecta.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { Field, TextInput } from "../../components/form";
import { authErrorMessage, passwordStrength } from "./authErrors";

type Mode = "login" | "signup" | "forgot";

const TITLES: Record<Mode, { title: string; subtitle: string }> = {
  login: { title: "Entrar", subtitle: "Seguí donde lo dejaste." },
  signup: { title: "Creá tu cuenta", subtitle: "Gratis, sin tarjeta. Cargá tu primera propiedad en un minuto." },
  forgot: { title: "Recuperar contraseña", subtitle: "Te mandamos un link para elegir una nueva." },
};

const PILLARS = [
  "Alta de propiedad en cinco campos",
  "Ficha para WhatsApp, sin competencia al lado",
  "Avisos cuando un cliente está por enfriarse",
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.67-.06-1.32-.17-1.94H12v3.67h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.3 2.98-7.25" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22" />
      <path fill="#FBBC05" d="M6.41 13.9a6 6 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.72 9.4 5.98 12 5.98" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-11"
        required
      />
      {/* Mostrar la contraseña es lo que evita el tercer intento fallido por una tecla mal apretada. */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-mute transition-colors hover:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M3 3l18 18M10.6 10.7a2.6 2.6 0 0 0 3.6 3.7M6.5 6.6C4.2 8.1 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M17.9 15.3c2-1.5 3.6-3.3 3.6-3.3s-3.5-6-9.5-6c-.7 0-1.4.1-2 .2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6" />
            <circle cx="12" cy="12" r="2.6" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const strength = passwordStrength(password);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function handleGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) setError(authErrorMessage(error.message));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setError(authErrorMessage(error.message));
          return;
        }
        // No se confirma si el email existe o no, a propósito: sería una forma de averiguar
        // qué direcciones tienen cuenta.
        setNotice(`Si hay una cuenta con ${email}, te va a llegar un mail con el link para cambiar la contraseña.`);
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // El nombre viaja en los metadatos del usuario. El backend lo usa al crear la cuenta,
          // así la firma de las páginas públicas no queda siendo el email.
          options: { data: { name: name.trim() } },
        });
        if (error) {
          setError(authErrorMessage(error.message));
          return;
        }
        // Si el proyecto pide confirmar el mail, signUp no devuelve sesión: no hay que redirigir
        // a /app porque rebotaría contra el login.
        if (!data.session) {
          setNotice(`Te mandamos un mail a ${email} para confirmar la cuenta. Abrilo y volvé a entrar.`);
          return;
        }
        navigate("/app");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(authErrorMessage(error.message));
        return;
      }
      navigate("/app");
    } finally {
      setBusy(false);
    }
  }

  const { title, subtitle } = TITLES[mode];
  const canSubmit = mode !== "signup" || acceptedTerms;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Panel de marca: se esconde en pantallas chicas, donde lo único que importa es el formulario. */}
      <aside className="relative hidden w-[46%] max-w-[620px] flex-col justify-between overflow-hidden border-r border-hairline bg-teal-50/40 p-12 lg:flex">
        <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-teal-200 opacity-40 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-28 h-[360px] w-[360px] rounded-full bg-teal-100 opacity-60 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" />
            </svg>
          </span>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">InmoCRM</span>
        </Link>

        <div className="relative flex max-w-md flex-col gap-6">
          <h2 className="text-[38px] font-extrabold leading-[1.12] tracking-tight text-slate-900" style={{ textWrap: "pretty" }}>
            Tu cartera y tus clientes, en el bolsillo
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-600" style={{ textWrap: "pretty" }}>
            Cargá una propiedad en menos de 30 segundos, compartila por WhatsApp con un link liviano, y enterate
            apenas matchea con un cliente.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {PILLARS.map((pillar) => (
              <li key={pillar} className="flex items-center gap-2.5 text-sm text-slate-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {pillar}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M8 12h8M13 7l5 5-5 5M11 17l-5-5 5-5" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-semibold text-slate-900">Match nuevo · puntaje 92</span>
            <span className="text-xs text-slate-500">Un lead tuyo encaja con una propiedad de tu cartera</span>
          </span>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="flex w-full max-w-[380px] flex-col gap-5">

          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight text-ink">InmoCRM</span>
          </Link>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-bold tracking-tight text-ink">{title}</h1>
            <p className="text-[13.5px] text-ink-mute">{subtitle}</p>
          </div>

          {notice && (
            <p className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-teal-900">
              {notice}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <Field label="Tu nombre o inmobiliaria" hint="Es la firma que ve tu cliente en las fichas que compartís.">
                <TextInput
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
            )}

            <Field label="Email">
              <TextInput
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="vos@inmobiliaria.com.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            {mode !== "forgot" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline">
                  <span className="text-[11.5px] font-medium text-ink-soft">Contraseña</span>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="ml-auto rounded-sm text-[11.5px] font-medium text-teal-700 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                      ¿La olvidaste?
                    </button>
                  )}
                </div>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                {mode === "signup" && (
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex flex-1 gap-1">
                        {[1, 2, 3].map((step) => (
                          <span
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              strength.score >= step ? "bg-teal-600" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </span>
                      {strength.label && (
                        <span className="text-[11px] font-medium text-ink-mute">{strength.label}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-faint">{strength.hint}</span>
                  </div>
                )}
              </div>
            )}

            {mode === "signup" && (
              <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-teal-600"
                />
                <span className="text-[12.5px] leading-relaxed text-ink-soft">
                  Acepto los <span className="font-medium text-teal-700">términos</span> y la{" "}
                  <span className="font-medium text-teal-700">política de privacidad</span>.
                </span>
              </label>
            )}

            <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!canSubmit}>
              {mode === "login" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Enviarme el link"}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-[11.5px] text-ink-faint">o</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-surface text-sm font-medium text-ink-soft transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <GoogleIcon />
                {mode === "login" ? "Entrar con Google" : "Seguir con Google"}
              </button>
            </>
          )}

          <p className="text-center text-[13px] text-ink-mute">
            {mode === "login" && (
              <>
                ¿Todavía no tenés cuenta?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-teal-700 hover:underline">
                  Creá una gratis
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                ¿Ya tenés cuenta?{" "}
                <button type="button" onClick={() => switchMode("login")} className="font-semibold text-teal-700 hover:underline">
                  Entrá
                </button>
              </>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => switchMode("login")} className="font-semibold text-teal-700 hover:underline">
                ← Volver a entrar
              </button>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
