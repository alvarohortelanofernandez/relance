import { useAuth, getRoleRoute } from "../../context/AuthContext";
import { useHeroStats } from "../../hooks/useHeroStats";

export default function HeroSection({ onRegisterClick }) {
  const { stats, loading } = useHeroStats();
  const { user, userRole } = useAuth();

  const scrollToNext = () => {
    const next = document.getElementById("como-funciona");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  const profileUrl = getRoleRoute(userRole);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="hero-bg" />
      {/* Fondo: cuadrícula + spotlight */}
      {/* <div
        className="absolute inset-0"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #4f4f4f2e 1px, transparent 1px), linear-gradient(to bottom, #8080800a 1px, transparent 1px)`,
            backgroundSize: "14px 24px",
          }}
        />
        <div
          className="absolute left-0 right-0 rounded-full"
          style={{
            top: "-10%",
            height: 1000,
            width: 1000,
            margin: "0 auto",
            background:
              "radial-gradient(circle 400px at 50% 300px, #fbfbfb36, var(--color-bg))",
          }}
        />
      </div> */}

      {/* ── Contenido ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Badge flotante */}
        <div
          className="animate-hero-in opacity-0"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            marginBottom: "1.5rem",
            animationDelay: "0s",
            background: "rgba(192,255,114,0.06)",
            border: "1px solid rgba(192,255,114,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#c0ff72",
              boxShadow: "0 0 8px rgba(192,255,114,0.8)",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#c0ff72",
              letterSpacing: "0.08em",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              textTransform: "uppercase",
            }}
          >
            Plataforma de prácticas profesionales
          </span>
        </div>

        {/* Título */}
        <h1
          className="animate-hero-in opacity-0"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            animationDelay: "0.1s",
          }}
        >
          Conecta talento con <br className="hidden sm:block" />
          <span
            className="text-brand"
            style={{ textShadow: "0 0 40px rgba(192,255,114,0.3)" }}
          >
            oportunidades reales
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="animate-hero-in opacity-0"
          style={{
            color: "rgba(156,163,175,0.9)",
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            maxWidth: 520,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
            animationDelay: "0.2s",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          La plataforma que une{" "}
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
              borderBottom: "1px solid rgba(192,255,114,0.3)",
              paddingBottom: 1,
            }}
          >
            estudiantes
          </span>
          ,{" "}
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
              borderBottom: "1px solid rgba(192,255,114,0.3)",
              paddingBottom: 1,
            }}
          >
            empresas
          </span>{" "}
          y{" "}
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
              borderBottom: "1px solid rgba(192,255,114,0.3)",
              paddingBottom: 1,
            }}
          >
            centros educativos
          </span>{" "}
          en un mismo lugar.
        </p>

        {/* CTAs */}
        <div
          className="animate-hero-in opacity-0"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            animationDelay: "0.35s",
          }}
        >
          {user ? (
            <a
              href={profileUrl}
              className="btn-primary"
              style={{
                fontSize: 13,
                padding: "11px 28px",
                borderRadius: 12,
                boxShadow:
                  "0 0 0 1px rgba(192,255,114,0.3), 0 8px 32px rgba(192,255,114,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                transition: "box-shadow 0.3s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(192,255,114,0.5), 0 12px 40px rgba(192,255,114,0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(192,255,114,0.3), 0 8px 32px rgba(192,255,114,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Ir a mi perfil
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          ) : (
            <button
              onClick={onRegisterClick}
              className="btn-primary"
              style={{
                fontSize: 13,
                padding: "11px 28px",
                borderRadius: 12,
                boxShadow:
                  "0 0 0 1px rgba(192,255,114,0.3), 0 8px 32px rgba(192,255,114,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                transition: "box-shadow 0.3s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(192,255,114,0.5), 0 12px 40px rgba(192,255,114,0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(192,255,114,0.3), 0 8px 32px rgba(192,255,114,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Empieza gratis
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Botón secundario: Ver ofertas */}
          {/* <a
            href="/ofertas"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              padding: "11px 22px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(8px)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            Ver ofertas
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a> */}
        </div>

        {/* Stats */}
        <div
          className="animate-hero-in opacity-0"
          style={{
            marginTop: "3.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            animationDelay: "0.5s",
          }}
        >
          {[
            {
              value: loading ? "—" : `${stats.estudiantes}+`,
              label: "Estudiantes registrados",
            },
            {
              value: loading ? "—" : `${stats.empresas}+`,
              label: "Empresas colaboradoras",
            },
            {
              value: loading ? "—" : `${stats.centros}+`,
              label: "Centros educativos",
            },
            {
              value: loading ? "—" : `${stats.tutores}+`,
              label: "Tutores confían en nosotros",
            },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                padding: "0 2rem",
                borderRight:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(107,114,128,0.9)",
                  marginTop: 3,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }
      `}</style>
    </section>
  );
}
