import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "../auth/UserMenu";
import logoUrl from "../../assets/logotipo_relance.svg";
import SearchModal, { type Role } from "../search/SearchModal";

type HeaderProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

export default function Header({
  onLoginClick,
  onRegisterClick,
}: HeaderProps): JSX.Element {
  const { user, userRole, avatarUrl } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  const roleMap: Record<string, Role> = {
    admin: "administrador",
    estudiante: "estudiante",
    empresa: "empresa",
    centro_educativo: "centro_educativo",
    tutor_centro: "tutor_centro",
    tutor_empresa: "tutor_empresa",
  };
  const role: Role = roleMap[userRole ?? ""] ?? "estudiante";
  const userId: string = user?.id ?? "";
  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "";
  const initials: string = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Detectar móvil (< 640px = breakpoint sm de Tailwind) ──────────────────
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // ── Ctrl+K / Cmd+K ────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Botón de búsqueda (reutilizado en header y bajo el header) ────────────
  const SearchTrigger = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <button
      ref={!fullWidth ? searchTriggerRef : undefined}
      onClick={() => setSearchOpen(true)}
      aria-label="Abrir buscador (Ctrl+K)"
      style={{
        width: fullWidth ? "100%" : undefined,
        flex: fullWidth ? undefined : "1 1 0",
        maxWidth: fullWidth ? undefined : 260,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 10px",
        borderRadius: 9,
        border: "1px solid var(--color-border-strong)",
        background: "rgba(255,255,255,0.025)",
        color: "var(--color-text-muted)",
        cursor: "pointer",
        transition: "all 0.18s",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 11.5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(192,255,114,0.25)";
        e.currentTarget.style.background = "rgba(192,255,114,0.04)";
        e.currentTarget.style.color = "var(--color-text-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-strong)";
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
        e.currentTarget.style.color = "var(--color-text-muted)";
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span style={{ flex: 1, textAlign: "left" }}>Buscar…</span>
      {!fullWidth && (
        <kbd
          style={{
            fontSize: 9,
            padding: "1px 5px",
            borderRadius: 4,
            border: "1px solid var(--color-border-strong)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--color-text-subtle)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            flexShrink: 0,
          }}
        >
          Ctrl+K
        </kbd>
      )}
    </button>
  );

  return (
    <>
      {/* ── Sticky wrapper ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "8px 16px 0",
          pointerEvents: "none",
        }}
      >
        <header
          style={{
            pointerEvents: "auto",
            borderRadius: 16,
            border: scrolled
              ? "1px solid rgba(192,255,114,0.14)"
              : "1px solid rgba(255,255,255,0.06)",
            background: scrolled ? "rgba(1,3,9,0.97)" : "rgba(2,5,13,0.80)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(192,255,114,0.07) inset"
              : "0 4px 24px rgba(0,0,0,0.4)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 16px",
            }}
          >
            {/* ── Fila principal ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 48,
                gap: 10,
              }}
            >
              {/* ── Logo ── */}
              <a
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                  textDecoration: "none",
                }}
              >
                <img
                  src={logoUrl}
                  alt="Relance"
                  style={{
                    height: 24,
                    width: "auto",
                    borderRadius: 6,
                    transition: "opacity 0.2s",
                  }}
                />
              </a>

              {/* ── Búsqueda: solo visible en sm+ (≥ 640px) ── */}
              {!isMobile && <SearchTrigger />}

              {/* ── Usuario / acciones ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {user ? (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="Menú de usuario"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: menuOpen
                          ? "2px solid var(--color-brand)"
                          : "2px solid rgba(255,255,255,0.1)",
                        transition: "border-color 0.2s",
                        flexShrink: 0,
                        cursor: "pointer",
                        padding: 0,
                        background: "transparent",
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--color-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#02050d",
                            fontWeight: 700,
                            fontSize: 11,
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {initials || "?"}
                        </div>
                      )}
                    </button>
                    {menuOpen && (
                      <UserMenu onClose={() => setMenuOpen(false)} />
                    )}
                  </div>
                ) : (
                  <>
                    {/* Icono de ayuda para usuarios no registrados */}
                    <a
                      href="/ayuda"
                      title="Ayuda"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-text-subtle)",
                        transition: "all 0.18s",
                        flexShrink: 0,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e: any) => {
                        e.currentTarget.style.borderColor =
                          "rgba(192,255,114,0.4)";
                        e.currentTarget.style.color = "var(--color-brand)";
                        e.currentTarget.style.background =
                          "rgba(192,255,114,0.06)";
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color =
                          "var(--color-text-subtle)";
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)";
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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

                    {/* Iniciar sesión */}
                    <button
                      onClick={onLoginClick}
                      className="btn-secondary"
                      style={{
                        fontSize: 12,
                        padding: isMobile ? "5px 9px" : "5px 12px",
                      }}
                    >
                      {isMobile ? "Entrar" : "Iniciar sesión"}
                    </button>

                    {/* Registrarse */}
                    <button
                      onClick={onRegisterClick}
                      className="btn-primary"
                      style={{
                        fontSize: 12,
                        padding: isMobile ? "5px 9px" : "5px 12px",
                      }}
                    >
                      {isMobile ? "Registro" : "Registrarse"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── Fila de búsqueda en móvil: debajo del header, centrada ── */}
            {isMobile && (
              <div
                style={{
                  padding: "0 4px 10px",
                  pointerEvents: "auto",
                }}
              >
                <SearchTrigger fullWidth />
              </div>
            )}
          </div>
        </header>
      </div>

      {/* SearchModal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        role={role}
        userId={userId}
        triggerRef={searchTriggerRef}
      />
    </>
  );
}
