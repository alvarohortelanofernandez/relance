import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import logoUrl from "../../assets/logo_relance.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
type InviteRole = "admin" | "tutor_empresa" | "tutor_centro";

interface InviteContext {
  token: string; // UUID del token
  entity: string; // UUID de la entidad (empresa o centro)
  type: string; // "admin" | "empresa" | "centro_educativo"
}

interface TokenData {
  id: string;
  entity_id: string;
  entity_type: string;
}

interface Props {
  user: User;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────────────────────────────────────
function Spinner({
  className = "w-4 h-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg className={`animate-spin ${className}`} style={style}>
      <use href="/icons.svg#icon-spinner" />
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
    <div
      className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
      style={{
        color: "var(--color-error)",
        background: "var(--color-error-bg)",
        border: "1px solid rgba(248,113,113,0.2)",
      }}
    >
      <svg className="flex-shrink-0 mt-0.5" width="14" height="14">
        <use href="/icons.svg#icon-warning" />
      </svg>
      {msg}
    </div>
  );
}

function SubmitBtn({
  loading,
  disabled,
  label,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="btn-primary w-full flex justify-center items-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Spinner />
          Guardando...
        </>
      ) : (
        label
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulario ADMIN
// Solo necesita nombre y teléfono — el email viene de Google y no se puede cambiar
// ─────────────────────────────────────────────────────────────────────────────
interface AdminFormState {
  nombre: string;
  telefono: string;
}

function AdminForm({
  email,
  defaultName,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  defaultName: string;
  onSubmit: (d: AdminFormState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<AdminFormState>({
    nombre: defaultName,
    telefono: "",
  });
  useEffect(() => {
    console.log("useEffect defaultName:", JSON.stringify(defaultName));

    if (defaultName) {
      setForm((f) => ({ ...f, nombre: defaultName }));
    }
  }, [defaultName]);
  const set = (k: keyof AdminFormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Field label="Nombre completo" required>
        <input
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Tu nombre y apellidos"
          className="input-field"
          required
        />
      </Field>

      <Field label="Correo electrónico">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>

      <Field label="Teléfono">
        <input
          type="tel"
          value={form.telefono}
          onChange={set("telefono")}
          placeholder="+34 600 000 000"
          className="input-field"
        />
      </Field>

      {/* Aviso acceso total */}
      <div
        className="rounded-xl px-4 py-3 flex gap-3 items-start"
        style={{
          background: "var(--color-warning-bg)",
          border: "1px solid rgba(251,191,36,0.15)",
        }}
      >
        <svg className="flex-shrink-0 mt-0.5" width="14" height="14">
          <use href="/icons.svg#icon-info" />
        </svg>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--color-warning)" }}
        >
          Los administradores tienen acceso total a la plataforma. Asegúrate de
          que este registro es legítimo.
        </p>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim()}
        label="Completar registro como administrador"
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulario TUTOR EMPRESA
// ─────────────────────────────────────────────────────────────────────────────
interface TutorEmpresaFormState {
  nombre: string;
  cargo: string;
  telefono: string;
}

function TutorEmpresaForm({
  email,
  defaultName,
  entityName,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  defaultName: string;
  entityName: string;
  onSubmit: (d: TutorEmpresaFormState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<TutorEmpresaFormState>({
    nombre: defaultName,
    cargo: "",
    telefono: "",
  });
  useEffect(() => {
    console.log("useEffect defaultName:", JSON.stringify(defaultName));

    if (defaultName) {
      setForm((f) => ({ ...f, nombre: defaultName }));
    }
  }, [defaultName]);
  const set =
    (k: keyof TutorEmpresaFormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Field label="Nombre completo" required>
        <input
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Tu nombre y apellidos"
          className="input-field"
          required
        />
      </Field>

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
        <Field label="Cargo / Puesto">
          <input
            type="text"
            value={form.cargo}
            onChange={set("cargo")}
            placeholder="Ej: Jefe de Proyecto"
            className="input-field"
          />
        </Field>
        <Field label="Teléfono">
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="+34 600 000 000"
            className="input-field"
          />
        </Field>
      </div>

      {/* Entidad vinculada */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.15)",
          }}
        >
          <svg width="14" height="14">
            <use href="/icons.svg#icon-company" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
            Vinculado a
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text)" }}
          >
            {entityName}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
          style={{
            background: "rgba(192,255,114,0.08)",
            color: "var(--color-brand)",
            border: "1px solid rgba(192,255,114,0.15)",
          }}
        >
          Válida
        </span>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim()}
        label="Completar registro como tutor de empresa"
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulario TUTOR CENTRO
// ─────────────────────────────────────────────────────────────────────────────
interface TutorCentroFormState {
  nombre: string;
  departamento: string;
  telefono: string;
}

function TutorCentroForm({
  email,
  defaultName,
  entityName,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  defaultName: string;
  entityName: string;
  onSubmit: (d: TutorCentroFormState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<TutorCentroFormState>({
    nombre: defaultName,
    departamento: "",
    telefono: "",
  });
  useEffect(() => {
    if (defaultName) {
      console.log("useEffect defaultName:", JSON.stringify(defaultName));

      setForm((f) => ({ ...f, nombre: defaultName }));
    }
  }, [defaultName]);
  const set =
    (k: keyof TutorCentroFormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Field label="Nombre completo" required>
        <input
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Tu nombre y apellidos"
          className="input-field"
          required
        />
      </Field>

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
        <Field label="Departamento">
          <input
            type="text"
            value={form.departamento}
            onChange={set("departamento")}
            placeholder="Ej: Informática"
            className="input-field"
          />
        </Field>
        <Field label="Teléfono">
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="+34 600 000 000"
            className="input-field"
          />
        </Field>
      </div>

      {/* Entidad vinculada */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.15)",
          }}
        >
          <svg width="14" height="14">
            <use href="/icons.svg#icon-educativeCenter" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
            Vinculado a
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text)" }}
          >
            {entityName}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
          style={{
            background: "rgba(192,255,114,0.08)",
            color: "var(--color-brand)",
            border: "1px solid rgba(192,255,114,0.15)",
          }}
        >
          Válida
        </span>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={!form.nombre.trim()}
        label="Completar registro como tutor de centro"
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla de token inválido/caducado
// ─────────────────────────────────────────────────────────────────────────────
function InvalidTokenScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-8 py-10 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "var(--color-warning-bg)",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        <svg width="22" height="22">
          <use href="/icons.svg#icon-warning" />
        </svg>
      </div>
      <h3
        className="font-display text-lg font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Invitación inválida o caducada
      </h3>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        El enlace de invitación no es válido, ya fue usado o ha caducado. Pide
        que generen uno nuevo.
      </p>
      <button onClick={onClose} className="btn-secondary w-full">
        Cerrar
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla de éxito
// ─────────────────────────────────────────────────────────────────────────────
function SuccessScreen({
  role,
  entityName,
  onClose,
}: {
  role: InviteRole;
  entityName: string;
  onClose: () => void;
}) {
  const messages: Record<InviteRole, { title: string; desc: string }> = {
    admin: {
      title: "¡Bienvenido al equipo!",
      desc: "Tu cuenta de administrador ha sido configurada correctamente.",
    },
    tutor_empresa: {
      title: "¡Ya eres parte del equipo!",
      desc: `Tu cuenta de tutor ha sido vinculada a ${entityName}.`,
    },
    tutor_centro: {
      title: "¡Ya eres parte del equipo!",
      desc: `Tu cuenta de tutor ha sido vinculada a ${entityName}.`,
    },
  };
  const { title, desc } = messages[role];

  return (
    <div className="px-8 py-10 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "rgba(192,255,114,0.08)",
          border: "1px solid rgba(192,255,114,0.2)",
        }}
      >
        <svg width="26" height="26">
          <use href="/icons.svg#icon-check" />
        </svg>
      </div>
      <h3
        className="font-display text-xl font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h3>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        {desc}
      </p>
      <button
        onClick={() => {
          console.log("onClose called");
          onClose();
        }}
        className="btn-primary w-full"
      >
        Ir a la plataforma
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

// Determina el rol a partir del entity_type del token
function resolveRole(entityType: string): InviteRole {
  if (entityType === "admin") return "admin";
  if (entityType === "empresa") return "tutor_empresa";
  return "tutor_centro";
}

// Lee el contexto de invitación: primero sessionStorage (flujo Google),
// luego los query params actuales (por si acaso el componente se abre en la misma URL del invite)
function readInviteContext(): InviteContext | null {
  try {
    const stored = sessionStorage.getItem("invite_context");
    if (stored) {
      const parsed = JSON.parse(stored) as InviteContext;
      if (parsed.token && parsed.entity && parsed.type) return parsed;
    }
  } catch {
    // sessionStorage vacío o malformado
  }

  // Fallback: params en la URL actual
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const entity = params.get("entity");
  const type = params.get("type");
  if (token && entity && type) return { token, entity, type };

  return null;
}

type PageState = "loading" | "invalid" | "form" | "success";

export default function OnboardingInviteModal({ user, onClose }: Props) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [inviteRole, setInviteRole] = useState<InviteRole>("admin");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [entityName, setEntityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultName = (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
  const email = user.email ?? "";

  // ── Inicialización: validar token ───────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const ctx = readInviteContext();
      console.log("invite ctx:", ctx);
      if (!ctx) {
        setPageState("invalid");
        return;
      }

      // Validar token en BD
      let query = supabase
        .from("invite_tokens")
        .select("id, entity_id, entity_type, used, expires_at")
        .eq("token", ctx.token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString());

      if (ctx.entity) {
        query = query.eq("entity_id", ctx.entity);
      }

      const { data, error: dbError } = await query.maybeSingle();

      console.log("token query result:", { data, dbError });
      if (dbError || !data) {
        setPageState("invalid");
        return;
      }

      const role = resolveRole(data.entity_type);
      setInviteRole(role);
      setTokenData({
        id: data.id,
        entity_id: data.entity_id,
        entity_type: data.entity_type,
      });

      // Obtener nombre de la entidad
      if (role === "tutor_empresa") {
        const { data: emp } = await supabase
          .from("empresa")
          .select("nombre")
          .eq("id_usuario", data.entity_id)
          .maybeSingle();
        setEntityName(emp?.nombre || "la empresa");
      } else if (role === "tutor_centro") {
        const { data: centro } = await supabase
          .from("centro_educativo")
          .select("nombre")
          .eq("id", data.entity_id)
          .maybeSingle();
        setEntityName(centro?.nombre || "el centro");
      }

      setPageState("form");
    };

    init();
  }, []);

  // ── Guardar en Supabase ─────────────────────────────────────────────────
  type AnyFormState =
    | AdminFormState
    | TutorEmpresaFormState
    | TutorCentroFormState;

  const save = async (roleData: AnyFormState) => {
    if (!tokenData) return;
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("usuario")
        .update({ is_profile_completed: true, rol: inviteRole })
        .eq("id", user.id);
      if (updateError) throw updateError;

      if (inviteRole === "admin") {
        const { error: e } = await supabase
          .from("administrador")
          .upsert({ id_usuario: user.id }, { onConflict: "id_usuario" });
        if (e) throw e;
      }

      if (inviteRole === "tutor_empresa") {
        const d = roleData as TutorEmpresaFormState; // ← narrowing
        const { error: e } = await supabase.from("tutor_empresa").upsert(
          {
            usuario_id: user.id,
            nombre: d.nombre,
            cargo: d.cargo || null,
            telefono: d.telefono || null,
          },
          { onConflict: "usuario_id" },
        );
        if (e) throw e;
      }

      if (inviteRole === "tutor_centro") {
        const d = roleData as TutorCentroFormState; // ← narrowing
        const { error: e } = await supabase.from("tutor_centro").upsert(
          {
            usuario_id: user.id,
            nombre: d.nombre,
            departamento: d.departamento || null,
            telefono: d.telefono || null,
          },
          { onConflict: "usuario_id" },
        );
        if (e) throw e;
      }

      // 3. Marcar token como usado
      await supabase
        .from("invite_tokens")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("id", tokenData.id);

      // 4. Limpiar sessionStorage
      sessionStorage.removeItem("invite_context");

      // 5. Actualizar user_metadata para que AuthContext lo lea en la próxima sesión
      await supabase.auth.updateUser({
        data: { role: inviteRole, full_name: roleData.nombre },
      });
      await supabase.auth.refreshSession();

      setPageState("success");
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; hint?: string };
      const msg = e?.message ?? "Error desconocido";
      const detail = e?.details || e?.hint || "";
      console.error("OnboardingInviteModal save:", err);
      setError(`${msg}${detail ? ` — ${detail}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Etiquetas de rol para el header ────────────────────────────────────
  const roleLabels: Record<InviteRole, string> = {
    admin: "Administrador",
    tutor_empresa: "Tutor de empresa",
    tutor_centro: "Tutor de centro educativo",
  };

  const roleBadgeIcon = {
    admin: (
      <svg width="12" height="12">
        <use href="/icons.svg#icon-shield" />
      </svg>
    ),
    tutor_empresa: (
      <svg width="12" height="12">
        <use href="/icons.svg#icon-company" />
      </svg>
    ),
    tutor_centro: (
      <svg width="12" height="12">
        <use href="/icons.svg#icon-educativeCenter" />
      </svg>
    ),
  };

  console.log("user_metadata:", user.user_metadata);
  console.log("defaultName:", JSON.stringify(defaultName));
  // ── Render ──────────────────────────────────────────────────────────────
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
      {/* Estado: cargando */}
      {pageState === "loading" && (
        <div className="flex items-center justify-center py-20">
          <Spinner
            className="w-7 h-7"
            style={{ color: "var(--color-brand)" } as React.CSSProperties}
          />
        </div>
      )}

      {/* Estado: token inválido */}
      {pageState === "invalid" && <InvalidTokenScreen onClose={onClose} />}

      {/* Estado: éxito */}
      {pageState === "success" && (
        <SuccessScreen
          role={inviteRole}
          entityName={entityName}
          onClose={onClose}
        />
      )}

      {/* Estado: formulario */}
      {pageState === "form" && (
        <>
          {/* Cabecera */}
          <div
            className="px-8 pt-8 pb-6"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex justify-center mb-5">
              <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
            </div>

            {/* Badge de rol */}
            <div className="flex justify-center mb-4">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase"
                style={{
                  background: "rgba(192,255,114,0.06)",
                  border: "1px solid rgba(192,255,114,0.15)",
                  color: "var(--color-brand)",
                  letterSpacing: "0.08em",
                }}
              >
                {roleBadgeIcon[inviteRole]}
                {roleLabels[inviteRole]}
              </div>
            </div>

            <h2
              className="font-display text-xl font-bold text-center mb-1"
              style={{ color: "var(--color-text)" }}
            >
              Completa tu perfil
            </h2>
            <p
              className="text-sm text-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              {inviteRole === "admin"
                ? "Confirma tus datos para activar tu cuenta de administrador."
                : `Confirma tus datos para vincularte a ${entityName}.`}
            </p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-6 max-h-[65vh] overflow-y-auto">
            {inviteRole === "admin" && (
              <AdminForm
                email={email}
                defaultName={defaultName}
                onSubmit={save}
                loading={loading}
                error={error}
              />
            )}
            {inviteRole === "tutor_empresa" && (
              <TutorEmpresaForm
                email={email}
                defaultName={defaultName}
                entityName={entityName}
                onSubmit={save}
                loading={loading}
                error={error}
              />
            )}
            {inviteRole === "tutor_centro" && (
              <TutorCentroForm
                key={defaultName}
                email={email}
                defaultName={defaultName}
                entityName={entityName}
                onSubmit={save}
                loading={loading}
                error={error}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
