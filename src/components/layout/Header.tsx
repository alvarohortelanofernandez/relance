import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "../auth/UserMenu";
import logoUrl from "../../assets/logo_relance.jpg";
import { supabase } from "../../lib/supabase";
import SearchModal, { type Role } from "../search/SearchModal";

type HeaderProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

const navLinks = [{ label: "Inicio", href: "/" }];

export default function Header({
  onLoginClick,
  onRegisterClick,
}: HeaderProps): JSX.Element {
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.user_metadata?.avatar_url,
  );

  const role: Role = (user?.user_metadata?.rol as Role) ?? "estudiante";
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

  // ── Avatar desde BD ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from("usuario")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

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

  return (
    <>
      <div
        className="sticky top-0 z-40 pointer-events-none"
        style={{ padding: "10px 20px 0" }}
      >
        <header
          className="pointer-events-auto"
          style={{
            borderRadius: 20,
            border: scrolled
              ? "1px solid rgba(192,255,114,0.14)"
              : "1px solid rgba(255,255,255,0.06)",
            background: scrolled ? "rgba(1,3,9,0.96)" : "rgba(2,5,13,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(192,255,114,0.07) inset, 0 0 0 1px rgba(192,255,114,0.04)"
              : "0 4px 24px rgba(0,0,0,0.4)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex items-center justify-between h-14 gap-3">
              {/* ── Logo ── */}
              <a
                href="/"
                className="flex items-center gap-2.5 flex-shrink-0 group"
              >
                <img
                  src={logoUrl}
                  alt="Relance"
                  style={{
                    height: 28,
                    width: "auto",
                    borderRadius: 7,
                    transition: "opacity 0.2s",
                  }}
                />
              </a>

              {/* ── Nav ── */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      padding: "6px 13px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text-muted)",
                      borderRadius: 9,
                      textDecoration: "none",
                      transition: "color 0.15s, background 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-text)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* ── Search trigger ── */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir buscador (Ctrl+K)"
                className="hidden md:flex"
                style={{
                  flex: "1 1 0",
                  maxWidth: 300,
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 11,
                  border: "1px solid var(--color-border-strong)",
                  background: "rgba(255,255,255,0.025)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 12.5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(192,255,114,0.25)";
                  e.currentTarget.style.background = "rgba(192,255,114,0.04)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-strong)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <svg
                  width="13"
                  height="13"
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
                <kbd
                  style={{
                    fontSize: 9.5,
                    padding: "2px 6px",
                    borderRadius: 5,
                    border: "1px solid var(--color-border-strong)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  ⌘K
                </kbd>
              </button>

              {/* ── Usuario / acciones ── */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="Menú de usuario"
                      style={{
                        width: 34,
                        height: 34,
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
                            fontSize: 12,
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
                    <button
                      onClick={onLoginClick}
                      className="hidden sm:flex btn-secondary"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={onRegisterClick}
                      className="hidden md:flex btn-primary"
                    >
                      Registrarse
                    </button>
                    <button
                      onClick={onLoginClick}
                      className="md:hidden"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        border: "1px solid var(--color-border-strong)",
                        background: "transparent",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Entrar
                    </button>
                    <button
                      onClick={onRegisterClick}
                      className="md:hidden"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        border: "none",
                        background: "var(--color-brand)",
                        color: "#02050d",
                        cursor: "pointer",
                      }}
                    >
                      Registro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* SearchModal: toda la lógica de búsqueda vive en él */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        role={role}
        userId={userId}
      />
    </>
  );
}
