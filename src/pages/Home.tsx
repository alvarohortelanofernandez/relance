import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import HeroSection from "../components/home/HeroSection";
import LoginModal from "../components/auth/LoginModal";
import MainLayout from "../components/layout/MainLayout";

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
              width: "1px",
              height: "80px",
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
                  fontFamily: "Plus Jakarta Sans, sans-serif",
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
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modal login */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              goToRegister();
            }}
          />
        )}
        {/* Botón flotante de ayuda */}
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
