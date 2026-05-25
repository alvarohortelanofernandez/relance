import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import logoUrl from "../assets/logotipo_relance.svg";

export default function ResetPassword() {
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true);
      } else if (session) {
        setHasSession(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)" }}
      className="flex items-center justify-center p-4"
    >
      <div
        style={{
          backgroundColor: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        className="rounded-2xl w-full max-w-md p-8"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8" />
        </div>

        {/* ── ÉXITO ── */}
        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-success-bg)",
                  border: "1px solid var(--color-success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                color: "var(--color-text)",
                fontFamily: "Syne, sans-serif",
              }}
              className="text-2xl font-bold mb-2"
            >
              Contraseña actualizada
            </h2>
            <p
              style={{ color: "var(--color-text-muted)" }}
              className="text-sm mb-6"
            >
              Tu contraseña se ha cambiado correctamente.
            </p>
            <a href="/" className="btn-primary block w-full text-center">
              Ir al inicio
            </a>
          </div>
        ) : /* ── ENLACE INVÁLIDO ── */
        !hasSession ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-warning-bg)",
                  border: "1px solid var(--color-warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-warning)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                color: "var(--color-text)",
                fontFamily: "Syne, sans-serif",
              }}
              className="text-xl font-bold mb-2"
            >
              Enlace inválido o expirado
            </h2>
            <p
              style={{ color: "var(--color-text-muted)" }}
              className="text-sm mb-6"
            >
              Solicita un nuevo enlace de recuperación desde la pantalla de
              inicio de sesión.
            </p>
            <a href="/" className="btn-secondary block w-full text-center">
              Volver al inicio
            </a>
          </div>
        ) : (
          /* ── FORMULARIO ── */
          <>
            <h2
              style={{
                color: "var(--color-text)",
                fontFamily: "Syne, sans-serif",
              }}
              className="text-2xl font-bold text-center mb-1"
            >
              Nueva contraseña
            </h2>
            <p
              style={{ color: "var(--color-text-muted)" }}
              className="text-sm text-center mb-6"
            >
              Elige una contraseña segura para tu cuenta
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              {/* Campo nueva contraseña */}
              <div>
                <label
                  style={{ color: "var(--color-text-secondary)" }}
                  className="block text-sm mb-1.5"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ color: "var(--color-text-subtle)" }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 640 640">
                        <use href="/icons.svg#icon-eye-slash" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 640 640">
                        <use href="/icons.svg#icon-eye" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Campo confirmar contraseña */}
              <div>
                <label
                  style={{ color: "var(--color-text-secondary)" }}
                  className="block text-sm mb-1.5"
                >
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="input-field"
                />
                {confirm && confirm !== password && (
                  <p
                    style={{ color: "var(--color-error)" }}
                    className="text-xs mt-1"
                  >
                    No coinciden
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    backgroundColor: "var(--color-error-bg)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    color: "var(--color-error)",
                  }}
                  className="rounded-lg px-4 py-3 text-sm"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
