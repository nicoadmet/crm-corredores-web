// Supabase devuelve los errores de autenticación en inglés y con jerga ("Invalid login credentials").
// Acá se traducen a algo que el corredor pueda entender y, sobre todo, accionar: qué hacer ahora.
// Lo que no está mapeado cae en un mensaje genérico — nunca se muestra el texto crudo en inglés.
export function authErrorMessage(raw: string | undefined): string {
  const message = (raw ?? "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "El email o la contraseña no coinciden. Revisá los dos y probá de nuevo.";
  }
  if (message.includes("email not confirmed")) {
    return "Todavía no confirmaste tu email. Buscá el mail que te mandamos al registrarte (mirá también en correo no deseado).";
  }
  if (message.includes("user already registered") || message.includes("already been registered")) {
    return "Ya existe una cuenta con ese email. Probá iniciar sesión.";
  }
  if (message.includes("password should be at least")) {
    return "La contraseña es muy corta: tiene que tener al menos 6 caracteres.";
  }
  if (message.includes("unable to validate email") || message.includes("invalid email")) {
    return "Ese email no parece válido. Revisá que esté bien escrito.";
  }
  if (message.includes("email rate limit") || message.includes("for security purposes")) {
    return "Probaste varias veces seguidas. Esperá un minuto y volvé a intentar.";
  }
  if (message.includes("provider is not enabled")) {
    return "Entrar con Google todavía no está habilitado en esta cuenta.";
  }
  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.";
  }
  return "No pudimos completar la operación. Probá de nuevo en un momento.";
}

// Fuerza de la contraseña, con criterios simples y explicables. No es un medidor de entropía:
// es una guía para que la persona sepa qué le falta.
export type PasswordStrength = { score: 0 | 1 | 2 | 3; label: string; hint: string };

export function passwordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: "", hint: "Al menos 6 caracteres." };
  if (password.length < 6) return { score: 0, label: "Muy corta", hint: "Le faltan caracteres: el mínimo son 6." };

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isLong = password.length >= 10;

  if (isLong && hasNumber && hasLetter) return { score: 3, label: "Fuerte", hint: "Buena contraseña." };
  if (hasNumber && hasLetter) return { score: 2, label: "Aceptable", hint: "Con 10 caracteres o más queda fuerte." };
  return { score: 1, label: "Débil", hint: "Sumale un número para que sea más difícil de adivinar." };
}
