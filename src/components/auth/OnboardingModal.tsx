import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";
import { User } from "@supabase/supabase-js";

const ROLES = [
  {
    id: "estudiante",
    label: "Estudiante",
    desc: "Busco prácticas o mi primer empleo",
    icon: "icon-student",
  },
  {
    id: "empresa",
    label: "Empresa",
    desc: "Publico ofertas y encuentro talento",
    icon: "icon-company",
  },
  {
    id: "centro_educativo",
    label: "Centro educativo",
    desc: "Gestiono las prácticas de mis alumnos",
    icon: "icon-educativeCenter",
  },
];

function Icon({
  id,
  className = "w-5 h-5",
  style,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 640 640"
      aria-hidden="true"
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-text-subtle)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-brand)" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function ErrorBlock({ msg }: { msg: string }) {
  return (
    <p
      className="text-sm px-4 py-3 rounded-xl flex items-start gap-2"
      style={{
        color: "var(--color-error)",
        background: "var(--color-error-bg)",
        border: "1px solid rgba(248,113,113,0.2)",
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
      {msg}
    </p>
  );
}

function SubmitBtn({
  loading,
  disabled,
}: {
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="btn-primary w-full flex justify-center items-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Spinner /> Guardando...
        </>
      ) : (
        "Completar registro"
      )}
    </button>
  );
}

// ================================
// FORMULARIO ESTUDIANTE
// ================================
function EstudianteForm({
  email,
  defaultName,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  defaultName: string;
  onSubmit: (d: any) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState({
    nombre: defaultName.split(" ")[0] ?? "",
    apellidos: defaultName.split(" ").slice(1).join(" ") ?? "",
    telefono: "",
    ciudad: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre" required>
          <input
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Tu nombre"
            className="input-field"
            required
          />
        </Field>
        <Field label="Apellidos" required>
          <input
            type="text"
            value={form.apellidos}
            onChange={set("apellidos")}
            placeholder="Tus apellidos"
            className="input-field"
            required
          />
        </Field>
      </div>
      <Field label="Correo electrónico">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono">
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="+34 600 000 000"
            className="input-field"
          />
        </Field>
        <Field label="Ciudad">
          <input
            type="text"
            value={form.ciudad}
            onChange={set("ciudad")}
            placeholder="Madrid"
            className="input-field"
          />
        </Field>
      </div>
      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim() || !form.apellidos.trim()}
      />
    </form>
  );
}

// ================================
// FORMULARIO EMPRESA
// ================================
const SECTORES = [
  "Tecnología",
  "Marketing",
  "Diseño",
  "Finanzas",
  "Salud",
  "Educación",
  "Comercio",
  "Industria",
  "Otro",
];

function EmpresaForm({
  email,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  onSubmit: (d: any) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState({
    nombre: "",
    cif: "",
    sector: "",
    ciudad: "",
    web: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Field label="Nombre de la empresa" required>
        <input
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Mi Empresa S.L."
          className="input-field"
          required
        />
      </Field>
      <Field label="Correo electrónico de contacto">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CIF" required>
          <input
            type="text"
            value={form.cif}
            onChange={set("cif")}
            placeholder="B12345678"
            className="input-field"
            required
          />
        </Field>
        <Field label="Sector">
          <select
            value={form.sector}
            onChange={set("sector")}
            className="input-field"
          >
            <option value="">Seleccionar</option>
            {SECTORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ciudad">
          <input
            type="text"
            value={form.ciudad}
            onChange={set("ciudad")}
            placeholder="Madrid"
            className="input-field"
          />
        </Field>
        <Field label="Sitio web">
          <input
            type="url"
            value={form.web}
            onChange={set("web")}
            placeholder="https://miempresa.com"
            className="input-field"
          />
        </Field>
      </div>
      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: "var(--color-info-bg)",
          border: "1px solid rgba(96,165,250,0.15)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          El CIF será verificado por el equipo de Relance en un plazo de 24–48 h
          antes de activar la cuenta plenamente.
        </p>
      </div>
      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim() || !form.cif.trim()}
      />
    </form>
  );
}

// ================================
// FORMULARIO CENTRO EDUCATIVO
// ================================
const TIPOS_CENTRO = [
  "IES — Instituto de Educación Secundaria",
  "FP — Formación Profesional",
  "Universidad",
  "Centro privado",
  "Academia",
  "Otro",
];

function CentroForm({
  email,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  onSubmit: (d: any) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState({
    nombre: "",
    codigo_centro: "",
    tipo: "",
    ciudad: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Field label="Nombre del centro" required>
        <input
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="IES Nombre del Centro"
          className="input-field"
          required
        />
      </Field>
      <Field label="Correo electrónico institucional">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Código de centro" required>
          <input
            type="text"
            value={form.codigo_centro}
            onChange={set("codigo_centro")}
            placeholder="IES-MAD-2024"
            className="input-field"
            required
          />
        </Field>
        <Field label="Tipo de centro">
          <select
            value={form.tipo}
            onChange={set("tipo")}
            className="input-field"
          >
            <option value="">Seleccionar</option>
            {TIPOS_CENTRO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Ciudad">
        <input
          type="text"
          value={form.ciudad}
          onChange={set("ciudad")}
          placeholder="Madrid"
          className="input-field"
        />
      </Field>
      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: "var(--color-info-bg)",
          border: "1px solid rgba(96,165,250,0.15)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          El código de centro será verificado por el equipo de Relance antes de
          activar la cuenta plenamente.
        </p>
      </div>
      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim() || !form.codigo_centro.trim()}
      />
    </form>
  );
}

// ================================
// MODAL PRINCIPAL — dos pasos
// ================================
export default function OnboardingModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultName =
    user.user_metadata?.full_name || user.user_metadata?.name || "";
  const email = user.email ?? "";

  const saveToSupabase = async (roleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { error: usuarioError } = await supabase.from("usuario").upsert(
        {
          id: user.id,
          email,
          nombre: roleData.nombre ?? defaultName,
          rol: role,
          is_profile_completed: true,
        },
        { onConflict: "id" },
      );
      if (usuarioError) throw usuarioError;

      if (role === "estudiante") {
        const { error: e } = await supabase.from("estudiante").upsert(
          {
            id: user.id,
            nombre: roleData.nombre,
            apellidos: roleData.apellidos,
            telefono: roleData.telefono || null,
            ciudad: roleData.ciudad || null,
          },
          { onConflict: "id" },
        );
        if (e) throw e;
      }
      if (role === "empresa") {
        const { error: e } = await supabase.from("empresa").upsert(
          {
            id_usuario: user.id,
            nombre: roleData.nombre,
            cif: roleData.cif,
            sector: roleData.sector || null,
            ciudad: roleData.ciudad || null,
            web: roleData.web || null,
          },
          { onConflict: "id_usuario" },
        );
        if (e) throw e;
      }
      if (role === "centro") {
        const { error: e } = await supabase.from("centro_educativo").upsert(
          {
            id_centro: user.id,
            nombre: roleData.nombre,
            codigo_centro: roleData.codigo_centro,
            tipo: roleData.tipo || null,
            ciudad: roleData.ciudad || null,
          },
          { onConflict: "id_centro" },
        );
        if (e) throw e;
      }

      await supabase.auth.updateUser({
        data: { role, full_name: roleData.nombre },
      });
      await supabase.auth.refreshSession();
      onClose();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ??
        (typeof err === "string" ? err : "Error desconocido");

      const detail =
        (err as { details?: string; hint?: string })?.details ||
        (err as { hint?: string })?.hint ||
        "";
      setError(`${msg}${detail ? ` — ${detail}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-lg mx-4 rounded-2xl animate-slide-down overflow-hidden"
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Cabecera */}
      <div
        className="px-8 pt-8 pb-6"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex justify-center mb-5">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>
        <h2
          className="font-display text-xl font-bold text-center mb-1"
          style={{ color: "var(--color-text)" }}
        >
          {step === 1
            ? "Bienvenido a Relance"
            : `Registro como ${ROLES.find((r) => r.id === role)?.label}`}
        </h2>
        <p
          className="text-sm text-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          {step === 1
            ? "Selecciona el tipo de cuenta para configurar tu perfil"
            : "Completa los datos básicos para empezar"}
        </p>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: n === step ? 28 : 14,
                background:
                  n === step
                    ? "var(--color-brand)"
                    : n < step
                      ? "rgba(192,255,114,0.35)"
                      : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
        {/* Paso 1: selector de rol */}
        {step === 1 && (
          <div className="space-y-3">
            {ROLES.map((r) => {
              const selected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    border: selected
                      ? "1px solid rgba(192,255,114,0.35)"
                      : "1px solid var(--color-border-strong)",
                    background: selected
                      ? "rgba(192,255,114,0.05)"
                      : "transparent",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) =>
                    (e.currentTarget.style.color = "var(--color-text-muted)")
                  }
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) =>
                    (e.currentTarget.style.color = "var(--color-text-subtle)")
                  }
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: selected
                        ? "rgba(192,255,114,0.1)"
                        : "rgba(255,255,255,0.04)",
                      color: selected
                        ? "var(--color-brand)"
                        : "var(--color-text-subtle)",
                    }}
                  >
                    <Icon id={r.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold font-display"
                      style={{
                        color: selected
                          ? "var(--color-text)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {r.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      {r.desc}
                    </p>
                  </div>
                  {selected && (
                    <svg
                      className="flex-shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-brand)"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Aviso tutores */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Icon
                id="icon-info"
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-text-subtle)" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Los tutores se registran mediante el enlace de invitación
                generado por su empresa o centro educativo.
              </p>
            </div>

            <button
              onClick={() => role && setStep(2)}
              disabled={!role}
              className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Paso 2: formularios por rol */}
        {step === 2 && role === "estudiante" && (
          <EstudianteForm
            email={email}
            defaultName={defaultName}
            onSubmit={saveToSupabase}
            loading={loading}
            error={error}
          />
        )}
        {step === 2 && role === "empresa" && (
          <EmpresaForm
            email={email}
            onSubmit={saveToSupabase}
            loading={loading}
            error={error}
          />
        )}
        {step === 2 && role === "centro" && (
          <CentroForm
            email={email}
            onSubmit={saveToSupabase}
            loading={loading}
            error={error}
          />
        )}
      </div>

      {/* Volver — solo paso 2 */}
      {step === 2 && (
        <div className="px-8 pb-6">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            className="flex items-center gap-1.5 text-sm transition-colors mx-auto"
            style={{ color: "var(--color-text-subtle)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-text-muted)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-subtle)")
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver a elegir tipo de cuenta
          </button>
        </div>
      )}
    </div>
  );
}
