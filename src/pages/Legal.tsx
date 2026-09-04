// Páginas legales públicas (/privacidad y /terminos). Google exige ambas URLs, servidas en el mismo
// dominio autorizado del proyecto OAuth, para poder publicar la app fuera del estado "Prueba".
// Las dos comparten el mismo layout: Navbar del sitio público + contenido en prosa + footer mínimo.
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const CONTACT_EMAIL = "hola@inmocrm.com";
const LAST_UPDATE = "4 de septiembre de 2026";

function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} · InmoCRM`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <p className="text-sm font-medium text-teal-700">InmoCRM</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base text-slate-600">{subtitle}</p>
        <p className="mt-1 text-sm text-slate-400">Última actualización: {LAST_UPDATE}</p>

        <div className="mt-10 space-y-9">{children}</div>

        <div className="mt-14 border-t border-slate-200 pt-8 text-sm text-slate-500">
          <p>
            ¿Dudas sobre este documento? Escribinos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal-700 hover:text-teal-800">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/" className="hover:text-slate-900">
              Volver al inicio
            </Link>
            <Link to="/privacidad" className="hover:text-slate-900">
              Política de Privacidad
            </Link>
            <Link to="/terminos" className="hover:text-slate-900">
              Términos del Servicio
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Privacidad() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      subtitle="Qué datos recolecta InmoCRM, para qué los usa y qué control tenés sobre ellos."
    >
      <Section title="1. Quiénes somos">
        <p>
          InmoCRM es un servicio de software (SaaS) que ayuda a corredores inmobiliarios independientes a
          administrar sus propiedades, sus contactos interesados y los cruces entre ambos. Somos responsables
          del tratamiento de los datos personales que se cargan en la plataforma.
        </p>
      </Section>

      <Section title="2. Qué datos recolectamos">
        <p>Recolectamos únicamente los datos necesarios para que el servicio funcione:</p>
        <Bullets
          items={[
            <>
              <strong className="font-medium text-slate-800">Datos de tu cuenta:</strong> nombre, dirección de
              correo electrónico y, opcionalmente, un teléfono de contacto.
            </>,
            <>
              <strong className="font-medium text-slate-800">Datos que vos cargás:</strong> propiedades (título,
              precio, zona, características, fotos y descripción), contactos interesados (nombre, teléfono,
              presupuesto, notas), recordatorios y catálogos.
            </>,
            <>
              <strong className="font-medium text-slate-800">Datos técnicos mínimos:</strong> registros de acceso
              y errores para operar y asegurar el servicio, y —si activás las notificaciones— la suscripción push
              que emite tu navegador.
            </>,
          ]}
        />
        <p>
          No usamos cookies de publicidad ni de seguimiento de terceros, y no vendemos ni cedemos datos a
          anunciantes.
        </p>
      </Section>

      <Section title="3. Ingreso con Google">
        <p>
          Si elegís iniciar sesión con Google, pedimos a Google únicamente tu dirección de correo electrónico,
          tu nombre y tu foto de perfil (permisos <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">email</code>,{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">profile</code> y{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">openid</code>).
        </p>
        <p>
          Esos datos se usan sólo para crear e identificar tu cuenta dentro de InmoCRM. No accedemos a tu Gmail,
          a tus contactos, a tu Drive ni a tu calendario, y no transferimos esa información a terceros salvo a los
          proveedores de infraestructura descritos más abajo. El uso de la información recibida de las APIs de
          Google se ajusta a la{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            Política de Datos de Usuario de los Servicios de API de Google
          </a>
          , incluidos sus requisitos de uso limitado. Podés revocar el acceso en cualquier momento desde{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            la configuración de tu cuenta de Google
          </a>
          .
        </p>
      </Section>

      <Section title="4. Para qué usamos los datos">
        <Bullets
          items={[
            "Prestar el servicio: guardar tu cartera, mostrarte tus contactos y sugerirte cruces entre ambos.",
            "Generar las fichas públicas de propiedad y los catálogos que vos decidís compartir.",
            "Enviarte avisos operativos (recordatorios, nuevos cruces) si habilitás las notificaciones.",
            "Sostener la seguridad del servicio: prevenir accesos indebidos, abusos y pérdida de información.",
          ]}
        />
        <p>
          No usamos tus datos ni los de tus contactos para entrenar modelos, ni para perfilamiento comercial, ni
          para ningún fin ajeno a la prestación del servicio.
        </p>
      </Section>

      <Section title="5. Datos de terceros que vos cargás">
        <p>
          Cuando cargás un contacto interesado, estás cargando datos personales de otra persona. Sos responsable
          de contar con una base legítima para tratarlos y de informar a esa persona cuando corresponda. InmoCRM
          los trata por tu cuenta y orden, no los usa para contactar a esas personas por su lado y los elimina
          cuando vos los eliminás.
        </p>
      </Section>

      <Section title="6. Con quién los compartimos">
        <p>
          Sólo con los proveedores de infraestructura necesarios para operar, que actúan como encargados de
          tratamiento y no pueden usar los datos para fines propios:
        </p>
        <Bullets
          items={[
            "Supabase — base de datos, autenticación y almacenamiento de imágenes.",
            "Cloudflare y Render — alojamiento y entrega de la aplicación.",
          ]}
        />
        <p>
          También podemos divulgar información si una autoridad competente lo requiere legalmente. Fuera de esos
          casos, no compartimos tus datos con nadie.
        </p>
      </Section>

      <Section title="7. Contenido que decidís hacer público">
        <p>
          Las fichas de propiedad y los catálogos que compartís generan un enlace público: cualquier persona con
          ese enlace puede ver la información de esa publicación (incluidos tu nombre y tu teléfono de contacto,
          si lo cargaste). Es una decisión tuya en cada caso, y podés dar de baja la publicación cuando quieras.
        </p>
      </Section>

      <Section title="8. Seguridad y aislamiento">
        <p>
          Cada cuenta está aislada a nivel de base de datos mediante políticas de seguridad por fila: los datos de
          un corredor no son accesibles desde la cuenta de otro. Toda la comunicación viaja cifrada (HTTPS) y las
          contraseñas se almacenan con funciones de hash, nunca en texto plano.
        </p>
      </Section>

      <Section title="9. Cuánto tiempo los conservamos">
        <p>
          Mientras tu cuenta esté activa. Si eliminás una propiedad o un contacto, se elimina de nuestros sistemas
          activos. Si cerrás tu cuenta, eliminamos tus datos dentro de los 30 días siguientes, salvo lo que una
          obligación legal nos exija conservar.
        </p>
      </Section>

      <Section title="10. Tus derechos">
        <p>
          Podés acceder, rectificar, actualizar y suprimir tus datos personales, y oponerte a determinados
          tratamientos. Casi todo eso lo podés hacer vos mismo desde la aplicación; para el resto, escribinos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal-700 hover:text-teal-800">
            {CONTACT_EMAIL}
          </a>{" "}
          y respondemos dentro de los 10 días corridos.
        </p>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso en forma gratuita a
          intervalos no inferiores a seis meses, salvo que acredite un interés legítimo (art. 14, inc. 3, Ley
          25.326). La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley
          25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten
          afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos
          personales.
        </p>
      </Section>

      <Section title="11. Menores de edad">
        <p>El servicio está dirigido a profesionales y no está destinado a personas menores de 18 años.</p>
      </Section>

      <Section title="12. Cambios en esta política">
        <p>
          Si modificamos esta política, actualizamos la fecha del encabezado y, cuando el cambio sea relevante, te
          avisamos por correo o dentro de la aplicación antes de que entre en vigencia.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Terminos() {
  return (
    <LegalLayout
      title="Términos del Servicio"
      subtitle="Las condiciones bajo las que podés usar InmoCRM."
    >
      <Section title="1. Aceptación">
        <p>
          Al crear una cuenta o usar InmoCRM aceptás estos términos. Si no estás de acuerdo con ellos, no uses el
          servicio.
        </p>
      </Section>

      <Section title="2. Qué es el servicio">
        <p>
          InmoCRM es una herramienta de gestión para corredores inmobiliarios independientes: permite cargar
          propiedades, registrar contactos interesados, obtener sugerencias de cruce entre ambos, y compartir
          fichas y catálogos mediante enlaces públicos. Es una herramienta de organización: no intermediamos en
          operaciones inmobiliarias, no somos parte de ningún contrato entre vos y tus clientes, y no cobramos
          comisiones sobre tus operaciones.
        </p>
      </Section>

      <Section title="3. Tu cuenta">
        <p>
          Necesitás una cuenta para usar el servicio. Sos responsable de la veracidad de los datos que registrás,
          de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra bajo tu cuenta.
          Avisanos de inmediato si detectás un uso no autorizado.
        </p>
      </Section>

      <Section title="4. Uso aceptable">
        <p>Al usar InmoCRM te comprometés a no:</p>
        <Bullets
          items={[
            "Publicar propiedades inexistentes, información engañosa o precios falsos.",
            "Cargar datos personales de terceros sin una base legítima para tratarlos.",
            "Usar el servicio para enviar comunicaciones no solicitadas de forma masiva (spam).",
            "Intentar acceder a datos de otras cuentas, vulnerar la seguridad del servicio o sobrecargarlo deliberadamente.",
            "Revender o redistribuir el servicio sin nuestro acuerdo previo por escrito.",
          ]}
        />
        <p>Podemos suspender o cerrar cuentas que incumplan estas condiciones.</p>
      </Section>

      <Section title="5. Tu contenido">
        <p>
          Todo lo que cargás —propiedades, fotos, contactos, notas— sigue siendo tuyo. Nos otorgás únicamente la
          licencia necesaria para almacenarlo, procesarlo y mostrarlo con el fin de prestarte el servicio,
          incluida su publicación en las fichas y catálogos que vos decidas compartir. Esa licencia termina cuando
          eliminás el contenido o cerrás tu cuenta.
        </p>
        <p>
          Sos responsable de tener los derechos sobre las imágenes y textos que subís, en especial sobre las
          fotografías de las propiedades.
        </p>
      </Section>

      <Section title="6. Planes y pagos">
        <p>
          Durante la etapa actual el servicio se ofrece sin costo. Si en el futuro incorporamos planes pagos, te
          avisaremos con antelación razonable y ningún cargo se aplicará sin tu consentimiento expreso.
        </p>
      </Section>

      <Section title="7. Disponibilidad">
        <p>
          Trabajamos para que el servicio esté disponible de forma continua, pero puede haber interrupciones por
          mantenimiento, fallas de proveedores o causas ajenas a nosotros. No garantizamos disponibilidad
          ininterrumpida ni ausencia total de errores. Te recomendamos conservar tu propia copia de la información
          crítica de tu negocio.
        </p>
      </Section>

      <Section title="8. Limitación de responsabilidad">
        <p>
          El servicio se provee "tal cual". En la máxima medida permitida por la ley, no respondemos por lucro
          cesante, pérdida de oportunidades comerciales ni daños indirectos derivados del uso o de la
          imposibilidad de uso del servicio. Nada en estos términos limita la responsabilidad que no puede
          excluirse legalmente, incluida la derivada de dolo o culpa grave.
        </p>
      </Section>

      <Section title="9. Baja del servicio">
        <p>
          Podés dejar de usar InmoCRM y solicitar la baja de tu cuenta cuando quieras. Nosotros podemos
          discontinuar el servicio avisándote con una antelación razonable y dándote la posibilidad de exportar tu
          información.
        </p>
      </Section>

      <Section title="10. Cambios en los términos">
        <p>
          Podemos actualizar estos términos. Si el cambio es relevante, te avisamos por correo o dentro de la
          aplicación antes de que entre en vigencia; si seguís usando el servicio después de esa fecha, los
          cambios se consideran aceptados.
        </p>
      </Section>

      <Section title="11. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a
          los tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires.
        </p>
      </Section>

      <Section title="12. Contacto">
        <p>
          Por cualquier consulta sobre estos términos, escribinos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal-700 hover:text-teal-800">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
