import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import logoUrl from "../../assets/logo_relance.jpg";

// ── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function PasswordField({ value, onChange, error }) {
  const [show, setShow] = useState(false);
  const score = !value
    ? 0
    : value.length < 6
      ? 1
      : value.length < 8
        ? 2
        : /[A-Z]/.test(value) && /[0-9]/.test(value)
          ? 4
          : 3;
  const colors = [
    "",
    "bg-[var(--color-error)]",
    "bg-orange-500",
    "bg-[var(--color-warning)]",
    "bg-[var(--color-brand)]",
  ];
  const labels = ["", "Muy débil", "Débil", "Media", "Fuerte"];
  const labelColors = [
    "",
    "text-[var(--color-error)]",
    "text-orange-400",
    "text-[var(--color-warning)]",
    "text-[var(--color-brand)]",
  ];

  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          className="input-field pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "var(--color-text-subtle)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-subtle)")
          }
        >
          {show ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${score >= lvl ? colors[score] : "bg-white/8"}`}
            />
          ))}
          <span
            className={`text-xs w-14 text-right font-medium ${labelColors[score]}`}
          >
            {labels[score]}
          </span>
        </div>
      )}
      {error && (
        <p
          className="text-xs mt-1.5 flex items-center gap-1"
          style={{ color: "var(--color-error)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Pantallas auxiliares ─────────────────────────────────────────────────────
function StateScreen({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-full max-w-md p-10 text-center rounded-2xl"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AlreadyLoggedIn({ userName, onSignOut }) {
  return (
    <StateScreen>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "rgba(192,255,114,0.08)",
          border: "1px solid rgba(192,255,114,0.15)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      </div>
      <h2
        className="font-display text-lg font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Ya tienes sesión iniciada
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Estás conectado como{" "}
        <strong style={{ color: "var(--color-text)" }}>{userName}</strong>. Para
        registrarte con esta invitación, cierra tu sesión primero.
      </p>
      <button onClick={onSignOut} className="btn-primary w-full mb-3">
        Cerrar sesión y continuar
      </button>
      <a href="/" className="btn-secondary block w-full text-center">
        Volver al inicio
      </a>
    </StateScreen>
  );
}

function InvalidToken() {
  return (
    <StateScreen>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "var(--color-warning-bg)",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-warning)"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h2
        className="font-display text-lg font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Enlace inválido o caducado
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Este enlace de invitación no es válido, ya ha sido usado o ha caducado
        (validez: 48 horas). Pide al equipo de administración que genere un
        nuevo enlace.
      </p>
      <a href="/" className="btn-secondary block w-full text-center">
        Volver al inicio
      </a>
    </StateScreen>
  );
}

function SuccessScreen({ navigate }) {
  return (
    <StateScreen>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "rgba(192,255,114,0.08)",
          border: "1px solid rgba(192,255,114,0.2)",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      </div>
      <h2
        className="font-display text-2xl font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        ¡Bienvenido al equipo!
      </h2>
      <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>
        Tu cuenta de tutor ha sido creada correctamente.
      </p>
      <p className="text-xs mb-8" style={{ color: "var(--color-text-subtle)" }}>
        Revisa tu correo para verificar tu cuenta antes de iniciar sesión.
      </p>
      <button onClick={() => navigate("/")} className="btn-primary w-full">
        Ir al inicio
      </button>
    </StateScreen>
  );
}

// ── Formulario principal ─────────────────────────────────────────────────────
export default function AdminRegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const token = params.get("token");
  const entityId = params.get("entity");
  const entityType = params.get("type");

  const [pageState, setPageState] = useState("loading");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateToken = async () => {
    if (!token || !entityId || !entityType) return null;
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("id, entity_id, entity_type, used, expires_at")
      .eq("token", token)
      .eq("entity_id", entityId)
      // .eq("entity_type", entityType)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    console.log("validateToken params:", { token, entityId, entityType });

    if (error) {
      console.error(error.message);
      return null;
    }
    return data;
  };

  useEffect(() => {
    if (authLoading) return;
    const init = async () => {
      if (user) {
        setPageState("logged_in");
        return;
      }
      const tokenData = await validateToken();
      if (!tokenData) {
        setPageState("invalid");
        return;
      }
      setPageState("form");
    };
    init();
  }, [authLoading, user]);

  const handleSignOut = async () => {
    setPageState("loading");
    await signOut();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "El nombre completo es obligatorio.";
    } else if (form.fullName.trim().length < 3) {
      errors.fullName = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!form.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Introduce un correo electrónico válido.";
    }

    if (!form.password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (form.password.length < 8) {
      errors.password = "La contraseña debe tener mínimo 8 caracteres.";
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = "Debe contener al menos una letra mayúscula.";
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = "Debe contener al menos un número.";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Por favor, confirma tu contraseña.";
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    fieldErrors && setFieldErrors({});
    setSubmitting(true);
    setSubmitError(null);
    try {
      console.log("entityType:", entityType);

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              role: entityType,
              entity_id: entityId,
            },
          },
        });
      if (signUpError) throw signUpError;

      // Vincular tutor con la empresa
      if (entityType === "tutor_empresa" && signUpData?.user) {
        const { error: linkError } = await supabase
          .from("empresa_tutor")
          .insert({
            empresa_id: entityId,
            tutor_id: signUpData.user.id,
          });

        if (linkError)
          console.error("No se pudo vincular el tutor:", linkError.message);
      }

      const { error: tokenError } = await supabase
        .from("invite_tokens")
        .update({ used: true })
        .eq("token", token)
        .eq("entity_id", entityId);

      if (tokenError)
        console.error("No se pudo marcar el token:", tokenError.message);

      sessionStorage.setItem(
        "invite_context",
        JSON.stringify({ token, entity: entityId, type: entityType }),
      );
      setPageState("success");
    } catch (err) {
      setSubmitError(
        err.message || "Error al crear la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (pageState === "loading")
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <Spinner className="w-7 h-7 text-[var(--color-brand)]" />
      </div>
    );
  if (pageState === "logged_in") {
    const displayName =
      user?.user_metadata?.full_name || user?.email || "tu cuenta actual";
    return <AlreadyLoggedIn userName={displayName} onSignOut={handleSignOut} />;
  }
  if (pageState === "invalid") return <InvalidToken />;
  if (pageState === "success") return <SuccessScreen navigate={navigate} />;

  return (
    <div
      className="min-h-screen py-14 px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/">
            <img
              src={logoUrl}
              alt="Relance"
              className="h-8 rounded-lg mx-auto"
            />
          </a>
        </div>

        {/* Badge de rol */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{
              background: "rgba(192,255,114,0.06)",
              border: "1px solid rgba(192,255,114,0.15)",
              color: "var(--color-brand)",
              letterSpacing: "0.08em",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Invitación de Tutor
          </div>
        </div>

        {/* Card principal */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* Header de la card */}
          <div
            className="px-8 pt-8 pb-6"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <h1
              className="font-display text-xl font-bold mb-1"
              style={{ color: "var(--color-text)" }}
            >
              Completa tu registro
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Estás a punto de crear tu cuenta como tutor en la plataforma
              Relance.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Nombre */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Nombre completo
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => {
                  s("fullName")(e);
                  setFieldErrors((fe) => ({ ...fe, fullName: null }));
                }}
                placeholder="Tu nombre y apellidos"
                className={`input-field ${fieldErrors.fullName ? "border-[var(--color-error)]" : ""}`}
              />
              {fieldErrors.fullName && (
                <p
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: "var(--color-error)" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  s("email")(e);
                  setFieldErrors((fe) => ({ ...fe, email: null }));
                }}
                placeholder="tutor@relance.com"
                className={`input-field ${fieldErrors.email ? "border-[var(--color-error)]" : ""}`}
              />
              {fieldErrors.email && (
                <p
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: "var(--color-error)" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Contraseña
              </label>
              <PasswordField
                value={form.password}
                onChange={(e) => {
                  s("password")(e);
                  setFieldErrors((fe) => ({ ...fe, password: null }));
                }}
                error={fieldErrors.password}
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => {
                  s("confirmPassword")(e);
                  setFieldErrors((fe) => ({ ...fe, confirmPassword: null }));
                }}
                placeholder="Repite la contraseña"
                className={`input-field ${fieldErrors.confirmPassword ? "border-[var(--color-error)]" : ""}`}
              />
              {fieldErrors.confirmPassword && (
                <p
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: "var(--color-error)" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {fieldErrors.confirmPassword}
                </p>
              )}
              {!fieldErrors.confirmPassword &&
                form.confirmPassword &&
                form.confirmPassword === form.password &&
                form.password.length >= 8 && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: "var(--color-brand)" }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Coinciden
                  </p>
                )}
            </div>

            {/* Error */}
            {submitError && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
                style={{
                  background: "var(--color-error-bg)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  color: "var(--color-error)",
                }}
              >
                <svg
                  className="flex-shrink-0 mt-0.5"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-40"
              style={{
                paddingTop: "0.875rem",
                paddingBottom: "0.875rem",
                fontSize: "0.9375rem",
              }}
            >
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4 text-current" />
                  Creando cuenta...
                </>
              ) : (
                "Registrarme como tutor"
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-5"
          style={{ color: "var(--color-text-subtle)" }}
        >
          ¿Ya tienes cuenta?{" "}
          <a
            href="/"
            className="underline transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-muted)")
            }
          >
            Inicia sesión desde el inicio
          </a>
        </p>
      </div>
    </div>
  );
}
