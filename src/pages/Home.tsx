import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import LoginModal from "../components/auth/LoginModal";
import MainLayout from "../components/layout/MainLayout";
import { useHomeStats } from "../hooks/useHomeStats";

// ── HOOK: contador animado ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

// ── HOOK: intersection observer ───────────────────────────────────────────────
function useInView(
  threshold = 0.2,
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
interface StatDef {
  value: number;
  suffix: string;
  label: string;
}

function StatCard({ stat, start }: { stat: StatDef; start: boolean }) {
  const count = useCountUp(stat.value, 2000, start);
  return (
    <div
      style={{
        flex: 1,
        minWidth: 160,
        padding: "0 24px",
        borderRight: "1px solid var(--color-border)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 800,
          color: "var(--color-brand)",
          margin: "0 0 6px",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          margin: 0,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}

// ── STATS ROW ─────────────────────────────────────────────────────────────────
function StatsRow() {
  const [ref, inView] = useInView(0.3);
  const { ofertasActivas, tasaColocacion, loading } = useHomeStats();

  // Los dos primeros son dinámicos, los dos últimos estáticos hasta tener tabla de valoraciones
  const stats: StatDef[] = [
    { value: ofertasActivas, suffix: "", label: "Ofertas activas" },
    { value: 4.8, suffix: "/5", label: "Valoración media" },
    { value: 93, suffix: "%", label: "Satisfacción general" },
    { value: tasaColocacion, suffix: "%", label: "Tasa de colocación" },
  ];

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0,
        justifyContent: "center",
      }}
    >
      {loading
        ? // Skeleton mientras carga
          stats.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 160,
                padding: "0 24px",
                borderRight: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  height: 48,
                  width: 80,
                  margin: "0 auto 8px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: 100,
                  margin: "0 auto",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                }}
              />
            </div>
          ))
        : stats.map((stat, i) => (
            <StatCard key={i} stat={stat} start={inView} />
          ))}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// ── ROLES ─────────────────────────────────────────────────────────────────────
const ROLE_CARDS = [
  {
    role: "Estudiante",
    icon: "icon-student",
    tagline: "Tu primer paso profesional",
    perks: [
      "Perfil público con portfolio y GitHub",
      "Candidatura con un clic a prácticas",
      "Seguimiento en tiempo real del proceso",
      "Valoraciones verificadas de empresas",
    ],
    cta: "Buscar prácticas",
    accent: "rgba(192,255,114,0.08)",
    border: "rgba(192,255,114,0.25)",
  },
  {
    role: "Empresa",
    icon: "icon-company",
    tagline: "Talento que encaja, sin ruido",
    perks: [
      "Publica ofertas en menos de 5 minutos",
      "Candidatos filtrados por habilidades reales",
      "Panel de tutores y seguimiento de prácticas",
      "Acuerdos y documentación centralizada",
    ],
    cta: "Publicar oferta",
    accent: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.2)",
  },
  {
    role: "Centro educativo",
    icon: "icon-educativeCenter",
    tagline: "Gestión sin Excel ni emails",
    perks: [
      "Vincula alumnos y tutores con QR",
      "Seguimiento de todas las prácticas activas",
      "Comunicación directa con empresas",
      "Informes de colocación exportables",
    ],
    cta: "Gestionar centro",
    accent: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.2)",
  },
];

function RolesSection({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(192,255,114,0.08)",
            border: "1px solid rgba(192,255,114,0.2)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-brand)",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
          Para cada perfil
        </span>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            margin: "0 0 14px",
          }}
        >
          Una plataforma, tres experiencias
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: 15,
            maxWidth: 460,
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          Cada perfil tiene su propio flujo. Sin pantallas genéricas ni
          funciones de relleno.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {ROLE_CARDS.map((card, i) => (
          <div
            key={i}
            style={{
              background: card.accent,
              border: `1px solid ${card.border}`,
              borderRadius: 16,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
            }}
          >
            <div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${card.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <svg
                  style={{
                    width: 20,
                    height: 20,
                    color: "var(--color-text-muted)",
                  }}
                  viewBox="0 0 640 640"
                >
                  <use href={`/icons.svg#${card.icon}`} />
                </svg>
              </div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-subtle)",
                  margin: "0 0 6px",
                }}
              >
                {card.role}
              </p>
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 16px",
                  letterSpacing: "-0.02em",
                }}
              >
                {card.tagline}
              </h3>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {card.perks.map((perk, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 12.5,
                      color: "#9ca3af",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "rgba(192,255,114,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#c0ff72"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onRegisterClick}
              style={{
                marginTop: "auto",
                padding: "9px 16px",
                background: "transparent",
                border: `1px solid ${card.border}`,
                borderRadius: 9,
                color: "var(--color-text-muted)",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(192,255,114,0.08)";
                e.currentTarget.style.color = "var(--color-brand)";
                e.currentTarget.style.borderColor = "rgba(192,255,114,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.borderColor = card.border;
              }}
            >
              {card.cta}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WHY ───────────────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    title: "Sin intermediarios innecesarios",
    desc: "Estudiantes y empresas se comunican directamente. Los centros supervisan sin ser un cuello de botella.",
  },
  {
    title: "Todo en un solo sitio",
    desc: "Ofertas, candidaturas, acuerdos de prácticas, tutores y valoraciones. Nada fuera de la plataforma.",
  },
  {
    title: "Trazabilidad real",
    desc: "Cada práctica tiene un historial completo. Las empresas y centros saben exactamente en qué punto está cada proceso.",
  },
  {
    title: "Diseñado para FP y universidad",
    desc: "No es una bolsa de empleo genérica. Está pensado para el ciclo real de las prácticas formativas en España.",
  },
];

function WhySection() {
  const [ref, inView] = useInView(0.15);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div ref={ref}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateX(-20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(192,255,114,0.08)",
              border: "1px solid rgba(192,255,114,0.2)",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-brand)",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--color-brand)",
              }}
            />
            Por qué Relance
          </span>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
              lineHeight: 1.15,
            }}
          >
            Las prácticas no deberían gestionarse por email
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: 14,
              lineHeight: 1.75,
              margin: "0 0 32px",
            }}
          >
            El proceso de prácticas en España sigue lleno de PDFs, correos sin
            respuesta y hojas de cálculo compartidas. Relance lo resuelve de
            raíz.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              border: "1px solid rgba(192,255,114,0.2)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-brand)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Activo en más de 40 centros educativos
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateX(20px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}
        >
          {WHY_ITEMS.map((item, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                padding: "20px 0",
                paddingLeft: hoveredIdx === i ? 12 : 0,
                borderBottom:
                  i < WHY_ITEMS.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
                cursor: "default",
                transition: "padding-left 0.2s ease",
              }}
            >
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: hoveredIdx === i ? "var(--color-brand)" : "white",
                  margin: "0 0 6px",
                  transition: "color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background:
                      hoveredIdx === i
                        ? "var(--color-brand)"
                        : "var(--color-border)",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                  }}
                />
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.65,
                  paddingLeft: 11,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const goToRegister = () => navigate("/registro");

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        <HeroSection onRegisterClick={goToRegister} />

        {/* ── CÓMO FUNCIONA ── */}
        <section
          id="como-funciona"
          style={{
            background: "var(--color-bg)",
            padding: "96px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 1,
              height: 80,
              background:
                "linear-gradient(to bottom, transparent, rgba(192,255,114,0.3))",
            }}
          />
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(192,255,114,0.08)",
                  border: "1px solid rgba(192,255,114,0.2)",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-brand)",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--color-brand)",
                  }}
                />
                Proceso simple
              </span>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                  margin: "0 0 16px",
                }}
              >
                Tres pasos para conectar
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 15,
                  maxWidth: 480,
                  margin: "0 auto",
                  lineHeight: 1.65,
                }}
              >
                Desde el registro hasta las prácticas confirmadas, todo ocurre
                en la misma plataforma.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 24,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 36,
                  left: "16%",
                  right: "16%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(192,255,114,0.15), rgba(192,255,114,0.15), transparent)",
                  pointerEvents: "none",
                }}
              />
              {[
                {
                  num: "01",
                  title: "Crea tu perfil",
                  desc: "Estudiantes, empresas y centros educativos se registran en minutos y configuran su perfil con toda la información relevante.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                },
                {
                  num: "02",
                  title: "Descubre oportunidades",
                  desc: "Las empresas publican ofertas de prácticas. Los estudiantes aplican con un clic y los centros hacen seguimiento en tiempo real.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  ),
                },
                {
                  num: "03",
                  title: "Gestiona y crece",
                  desc: "Tutores asignados, candidaturas centralizadas, acuerdos de colaboración y valoraciones. Todo en un único panel de control.",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-surface-strong)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 16,
                    padding: "28px 24px",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(192,255,114,0.3)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 16,
                      fontSize: 64,
                      fontWeight: 900,
                      color: "rgba(192,255,114,0.04)",
                      fontFamily: "Syne, sans-serif",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(192,255,114,0.08)",
                      border: "1px solid rgba(192,255,114,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-brand)",
                      marginBottom: 18,
                    }}
                  >
                    {step.icon}
                  </div>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--color-brand)",
                      margin: "0 0 8px",
                      opacity: 0.7,
                    }}
                  >
                    Paso {step.num}
                  </p>
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "white",
                      margin: "0 0 10px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#6b7280",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NÚMEROS ── */}
        <section
          style={{
            background: "var(--color-surface-strong)",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            padding: "64px 24px",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <StatsRow />
          </div>
        </section>

        {/* ── PARA QUIÉN ── */}
        <section
          style={{ background: "var(--color-bg)", padding: "96px 24px" }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <RolesSection onRegisterClick={goToRegister} />
          </div>
        </section>

        {/* ── POR QUÉ RELANCE ── */}
        <section
          style={{
            background: "var(--color-surface-strong)",
            borderTop: "1px solid var(--color-border)",
            padding: "96px 24px",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <WhySection />
          </div>
        </section>

        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              goToRegister();
            }}
          />
        )}

        <a
          href="/ayuda"
          title="Ayuda"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 50,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#02050d",
            boxShadow:
              "0 4px 20px rgba(192,255,114,0.3), 0 2px 8px rgba(0,0,0,0.4)",
            textDecoration: "none",
            transition: "transform 0.18s, box-shadow 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 6px 28px rgba(192,255,114,0.45), 0 2px 8px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(192,255,114,0.3), 0 2px 8px rgba(0,0,0,0.4)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </a>
      </div>
    </MainLayout>
  );
}
