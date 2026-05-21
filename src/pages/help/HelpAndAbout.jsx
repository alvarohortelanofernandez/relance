import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import logoUrl from "../../assets/icon_relance.svg";

const faqs = [
  {
    categoria: "Cuenta y acceso",
    items: [
      {
        pregunta: "¿Cómo creo mi cuenta en Relance?",
        respuesta:
          "Puedes registrarte desde la página de inicio seleccionando tu perfil: estudiante, empresa o centro educativo. Completa el formulario con tus datos y recibirás un correo de confirmación para activar tu cuenta.",
      },
      {
        pregunta: "He olvidado mi contraseña, ¿qué hago?",
        respuesta:
          'Haz clic en "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión. Introduce tu correo electrónico y recibirás un enlace para restablecerla en menos de 5 minutos. Revisa también la carpeta de spam si no lo ves.',
      },
      {
        pregunta: "¿Puedo tener más de un tipo de perfil?",
        respuesta:
          "Cada cuenta está asociada a un único rol: estudiante, empresa, centro educativo, tutor de empresa o tutor de centro. Si necesitas acceder con otro rol, deberás crear una cuenta distinta con un correo diferente.",
      },
    ],
  },
  {
    categoria: "Estudiantes",
    items: [
      {
        pregunta: "¿Cómo me vinculo a mi centro educativo?",
        respuesta:
          "Ve a tu perfil y busca la sección «Mi centro». Introduce el código de tu instituto o búscalo por nombre. Una vez enviada la solicitud, el tutor del centro deberá aceptarla para completar la vinculación.",
      },
      {
        pregunta: "¿Cómo envío una candidatura a una oferta de prácticas?",
        respuesta:
          'Accede a la sección "Ofertas", filtra por titulación, modalidad o ubicación y abre la oferta que te interese. Pulsa "Solicitar plaza" y escribe un mensaje de presentación. Puedes ver el estado de todas tus candidaturas en tu panel personal.',
      },
      {
        pregunta: "¿Puedo retirar una candidatura enviada?",
        respuesta:
          'Sí. Ve a tu panel → "Mis candidaturas" y selecciona la candidatura que quieras retirar. Esta opción solo está disponible mientras la empresa no haya tomado una decisión final.',
      },
      {
        pregunta: "¿Qué significa cada estado de candidatura?",
        respuesta:
          "Pendiente: la empresa aún no la ha revisado. En revisión: está siendo evaluada. Aceptada: ¡enhorabuena, tienes plaza! Rechazada: la empresa ha seleccionado otro perfil. Retirada: la cancelaste tú mismo.",
      },
    ],
  },
  {
    categoria: "Empresas",
    items: [
      {
        pregunta: "¿Cómo publico una oferta de prácticas?",
        respuesta:
          'Desde tu panel de empresa, accede a "Ofertas" y pulsa "Nueva oferta". Rellena el formulario con el título, descripción, requisitos, modalidad y fechas. La oferta quedará visible para los estudiantes una vez publicada.',
      },
      {
        pregunta: "¿Cómo gestiono las candidaturas recibidas?",
        respuesta:
          'En tu panel, accede a "Candidaturas". Puedes filtrarlas por oferta o estado, revisar el perfil completo de cada candidato y cambiar el estado a "En revisión", "Aceptada" o "Rechazada". También puedes dejar un comentario para el estudiante.',
      },
      {
        pregunta: "¿Cómo firmo un convenio con un centro educativo?",
        respuesta:
          'Ve a la sección "Convenios" y envía una solicitud al centro que te interese. El centro recibirá la petición y podrá aceptarla o rechazarla. Una vez activo el convenio, podréis gestionar las prácticas de forma coordinada.',
      },
    ],
  },
  {
    categoria: "Centros educativos",
    items: [
      {
        pregunta: "¿Cómo asigno un tutor a un alumno?",
        respuesta:
          'En tu panel ve a "Tutores" → sección de asignación. Puedes arrastrar y soltar a cada alumno en la columna del tutor correspondiente. Los cambios se guardan automáticamente.',
      },
      {
        pregunta: "¿Cómo verifico la vinculación de un estudiante?",
        respuesta:
          'En la pestaña "Estudiantes" verás todas las solicitudes pendientes de verificación. Puedes aceptar o rechazar cada una individualmente. Los estudiantes aceptados quedan vinculados oficialmente al centro.',
      },
      {
        pregunta: "¿Cómo invito a un tutor al sistema?",
        respuesta:
          'Ve a "Tutores" y pulsa "Invitar tutor". Se generará un enlace único con una validez de 48 horas que puedes enviar al tutor por correo. Al acceder al enlace, el tutor creará su cuenta ya vinculada a tu centro.',
      },
    ],
  },
  {
    categoria: "Privacidad y datos",
    items: [
      {
        pregunta: "¿Quién puede ver mi perfil de estudiante?",
        respuesta:
          "Si tienes el perfil configurado como público, las empresas registradas pueden ver tu información profesional: titulación, habilidades y presentación. Tus datos de contacto (teléfono, email) solo los ven las empresas con las que tienes una candidatura activa.",
      },
      {
        pregunta: "¿Puedo eliminar mi cuenta?",
        respuesta:
          "Sí. Ve a Ajustes → Cuenta → Eliminar cuenta. Esta acción es irreversible y eliminará todos tus datos del sistema. Si tienes prácticas activas, te recomendamos esperar a finalizarlas antes de proceder.",
      },
    ],
  },
];

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FaqItem({ pregunta, respuesta }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom:
          "1px solid var(--color-border-subtle, rgba(255,255,255,0.06))",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: open
            ? "var(--color-brand, #c0ff72)"
            : "var(--color-text, #f0ede6)",
          transition: "color 0.2s",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          {pregunta}
        </span>
        <ChevronIcon open={open} />
      </button>
      <div
        style={{
          maxHeight: open ? 300 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.7,
            color: "var(--color-text-muted, #8a9bb0)",
            paddingBottom: 16,
            margin: 0,
          }}
        >
          {respuesta}
        </p>
      </div>
    </div>
  );
}

function AboutModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface-strong, #0f1923)",
          border: "1px solid var(--color-border, rgba(255,255,255,0.1))",
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
          position: "relative",
          animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          textAlign: "center",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(192,255,114,0.1)",
            border: "1.5px solid rgba(192,255,114,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {/* <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 24L16 8L24 24"
              stroke="#c0ff72"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 19h11"
              stroke="#c0ff72"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg> */}

          <img
            src={logoUrl}
            alt="Relance"
            style={{ width: 28, height: "auto" }}
          />
        </div>

        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--color-text, #f0ede6)",
            margin: "0 0 4px",
            letterSpacing: "-0.04em",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Relance
        </h2>
        <p
          style={{
            fontSize: 11,
            color: "var(--color-brand, #c0ff72)",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}
        >
          Versión 1.0.0
        </p>

        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted, #8a9bb0)",
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}
        >
          Plataforma de gestión de prácticas en empresa para Formación
          Profesional. Conecta estudiantes, centros educativos y empresas en un
          único espacio.
        </p>

        <div
          style={{
            background: "var(--color-surface, rgba(255,255,255,0.03))",
            border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.13em",
              color: "var(--color-text-subtle, #4a5568)",
              fontWeight: 700,
              margin: "0 0 12px",
            }}
          >
            Desarrollado por
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--color-text, #f0ede6)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Álvaro Hortelano Fernández
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              padding: "5px 12px",
              borderRadius: 20,
              background: "rgba(192,255,114,0.08)",
              border: "1px solid rgba(192,255,114,0.2)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c0ff72"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-brand, #c0ff72)",
              }}
            >
              IES Trassierra
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {["React", "Supabase", "PostgreSQL"].map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--color-text-subtle, #4a5568)",
                background:
                  "var(--color-surface-elevated, rgba(255,255,255,0.04))",
                border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
                borderRadius: 20,
                padding: "3px 10px",
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        <p
          style={{
            fontSize: 10,
            color: "var(--color-text-subtle, #4a5568)",
            margin: "0 0 20px",
          }}
        >
          © {new Date().getFullYear()} Relance · Proyecto de Formación
          Profesional
        </p>

        <button
          onClick={onClose}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "1px solid rgba(192,255,114,0.3)",
            background: "rgba(192,255,114,0.1)",
            color: "var(--color-brand, #c0ff72)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(192,255,114,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(192,255,114,0.1)";
          }}
        >
          Cerrar
        </button>

        {/* Close X */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
            background: "var(--color-surface-elevated, rgba(255,255,255,0.04))",
            color: "var(--color-text-subtle, #4a5568)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text, #f0ede6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-subtle, #4a5568)";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function HelpAndAbout() {
  const [activeTab, setActiveTab] = useState("ayuda");
  const [openCategoria, setOpenCategoria] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [search, setSearch] = useState("");

  const faqsFiltradas = search.trim()
    ? faqs
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.pregunta.toLowerCase().includes(search.toLowerCase()) ||
              item.respuesta.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : faqs;

  return (
    <MainLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg, #080f18)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "var(--color-text, #f0ede6)",
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "32px 24px 64px",
            animation: "fadeUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--color-brand, #c0ff72)",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "var(--color-text-muted, #8a9bb0)",
                      fontWeight: 700,
                    }}
                  >
                    Soporte
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--color-text, #f0ede6)",
                    letterSpacing: "-0.03em",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {activeTab === "ayuda"
                    ? "Centro de ayuda"
                    : "Acerca de Relance"}
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "var(--color-text-muted, #8a9bb0)",
                  }}
                >
                  {activeTab === "ayuda"
                    ? "Encuentra respuestas a las preguntas más frecuentes"
                    : "Información sobre la aplicación y su desarrollo"}
                </p>
              </div>

              {/* Acerca de button */}
              <button
                onClick={() => setShowAbout(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border:
                    "1px solid var(--color-border, rgba(255,255,255,0.1))",
                  background:
                    "var(--color-surface-strong, rgba(255,255,255,0.04))",
                  color: "var(--color-text-secondary, #c0cad6)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(192,255,114,0.3)";
                  e.currentTarget.style.color = "var(--color-brand, #c0ff72)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border, rgba(255,255,255,0.1))";
                  e.currentTarget.style.color =
                    "var(--color-text-secondary, #c0cad6)";
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Acerca de…
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-subtle, #4a5568)",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en la ayuda…"
              style={{
                width: "100%",
                padding: "11px 14px 11px 38px",
                borderRadius: 12,
                border: "1px solid var(--color-border, rgba(255,255,255,0.1))",
                background:
                  "var(--color-surface-strong, rgba(255,255,255,0.04))",
                color: "var(--color-text, #f0ede6)",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(192,255,114,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-border, rgba(255,255,255,0.1))";
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-subtle, #4a5568)",
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  padding: 4,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* FAQ content */}
          {search.trim() ? (
            // Search results
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {faqsFiltradas.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--color-text-subtle, #4a5568)",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{
                      margin: "0 auto 12px",
                      display: "block",
                      opacity: 0.4,
                    }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p style={{ fontSize: 13, margin: 0 }}>
                    No se encontraron resultados para «{search}»
                  </p>
                </div>
              ) : (
                faqsFiltradas.map((cat) => (
                  <div
                    key={cat.categoria}
                    style={{
                      background:
                        "var(--color-surface-strong, rgba(255,255,255,0.03))",
                      border:
                        "1px solid var(--color-border, rgba(255,255,255,0.08))",
                      borderRadius: 14,
                      padding: "4px 20px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.13em",
                        color: "var(--color-brand, #c0ff72)",
                        fontWeight: 700,
                        margin: "16px 0 0",
                      }}
                    >
                      {cat.categoria}
                    </p>
                    {cat.items.map((item) => (
                      <FaqItem key={item.pregunta} {...item} />
                    ))}
                  </div>
                ))
              )}
            </div>
          ) : (
            // Category tabs
            <div style={{ display: "flex", gap: 16 }}>
              {/* Sidebar */}
              <div
                style={{
                  width: 200,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {faqs.map((cat, i) => (
                  <button
                    key={cat.categoria}
                    onClick={() => setOpenCategoria(i)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 9,
                      border: "1px solid",
                      borderColor:
                        openCategoria === i
                          ? "rgba(192,255,114,0.25)"
                          : "transparent",
                      background:
                        openCategoria === i
                          ? "rgba(192,255,114,0.08)"
                          : "transparent",
                      color:
                        openCategoria === i
                          ? "var(--color-brand, #c0ff72)"
                          : "var(--color-text-muted, #8a9bb0)",
                      fontSize: 12,
                      fontWeight: openCategoria === i ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (openCategoria !== i) {
                        e.currentTarget.style.color =
                          "var(--color-text-secondary, #c0cad6)";
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (openCategoria !== i) {
                        e.currentTarget.style.color =
                          "var(--color-text-muted, #8a9bb0)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span>{cat.categoria}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          openCategoria === i
                            ? "var(--color-brand, #c0ff72)"
                            : "var(--color-text-subtle, #4a5568)",
                        background:
                          openCategoria === i
                            ? "rgba(192,255,114,0.12)"
                            : "rgba(255,255,255,0.04)",
                        borderRadius: 20,
                        padding: "1px 7px",
                        minWidth: 22,
                        textAlign: "center",
                      }}
                    >
                      {cat.items.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* FAQ panel */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    background:
                      "var(--color-surface-strong, rgba(255,255,255,0.03))",
                    border:
                      "1px solid var(--color-border, rgba(255,255,255,0.08))",
                    borderRadius: 14,
                    padding: "4px 24px",
                    animation: "fadeUp 0.2s ease",
                    key: openCategoria,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.13em",
                      color: "var(--color-brand, #c0ff72)",
                      fontWeight: 700,
                      margin: "20px 0 0",
                    }}
                  >
                    {faqs[openCategoria].categoria}
                  </p>
                  {faqs[openCategoria].items.map((item) => (
                    <FaqItem key={item.pregunta} {...item} />
                  ))}
                </div>

                {/* Contact banner */}
                <div
                  style={{
                    marginTop: 16,
                    background: "rgba(192,255,114,0.05)",
                    border: "1px solid rgba(192,255,114,0.15)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(192,255,114,0.1)",
                      border: "1px solid rgba(192,255,114,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c0ff72"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--color-text, #f0ede6)",
                      }}
                    >
                      ¿No encuentras lo que buscas?
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 11,
                        color: "var(--color-text-muted, #8a9bb0)",
                      }}
                    >
                      Contacta con el administrador del centro para obtener
                      ayuda personalizada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </MainLayout>
  );
}
