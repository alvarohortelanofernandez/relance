import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logotipo_relance.svg";
import { User } from "@supabase/supabase-js";

// ── Constantes ────────────────────────────────────────────────────────────────
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

const TAMANIOS = [
  "1–10 empleados",
  "11–50 empleados",
  "51–200 empleados",
  "201–500 empleados",
  "500+ empleados",
];

const TIPOS_CENTRO = [
  "IES — Instituto de Educación Secundaria",
  "FP — Formación Profesional",
  "Universidad",
  "Centro privado",
  "Academia",
  "Otro",
];

// ── Validaciones ──────────────────────────────────────────────────────────────
const isValidUrl = (v: string) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};
const isValidCif = (v: string) => /^[A-Z0-9]{8,9}$/i.test(v.trim());
const isValidPhone = (v: string) => /^[+\d\s\-().]{7,20}$/.test(v.trim());

// ── Atoms ─────────────────────────────────────────────────────────────────────
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
    <svg className="animate-spin size-4">
      <use href="/icons.svg#icon-spinner" />
    </svg>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <p style={{ fontSize: 11.5, color: "var(--color-error)", marginTop: 4 }}>
      {msg}
    </p>
  ) : null;
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
      <svg className="flex-shrink-0 mt-0.5" width="14" height="14">
        <use href="/icons.svg#icon-warning" />
      </svg>
      {msg}
    </p>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "var(--color-info-bg)",
        border: "1px solid rgba(96,165,250,0.15)",
      }}
    >
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {children}
      </p>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: "var(--color-text-muted)",
        marginBottom: 10,
        marginTop: 4,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      {label}
    </p>
  );
}

function SubmitBtn({
  loading,
  disabled,
  label = "Completar registro",
}: {
  loading: boolean;
  disabled: boolean;
  label?: string;
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
        label
      )}
    </button>
  );
}

// ── PasswordField ─────────────────────────────────────────────────────────────
function PasswordField({
  value,
  onChange,
  placeholder = "Mínimo 8 caracteres",
  showStrength = true,
  hasError = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showStrength?: boolean;
  hasError?: boolean;
}) {
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
  const colors = ["", "#f87171", "#fb923c", "#facc15", "#c0ff72"];
  const labels = ["", "Muy débil", "Débil", "Media", "Fuerte"];

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field"
          style={{
            paddingRight: 44,
            ...(hasError ? { borderColor: "rgba(248,113,113,0.5)" } : {}),
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            padding: 4,
            display: "flex",
          }}
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
      {showStrength && value && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 3,
                background:
                  score >= lvl ? colors[score] : "rgba(255,255,255,0.06)",
                transition: "background 0.3s",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 10.5,
              color: "var(--color-text-muted)",
              width: 60,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
            {labels[score]}
          </span>
        </div>
      )}
    </div>
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
    centerId: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [centers, setCenters] = useState<
    { id: string; nombre: string; ciudad: string }[]
  >([]);
  const [centerQuery, setCenterQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCenters = centers.filter((c) =>
    c.nombre?.toLowerCase().includes(centerQuery.toLowerCase()),
  );

  useEffect(() => {
    supabase
      .from("centro_educativo")
      .select("id, nombre, ciudad")
      .order("nombre", { ascending: true })
      .then(({ data }) => {
        if (data) setCenters(data as any);
      });
  }, []);

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrs((p) => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios.";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else if (!isValidPhone(form.telefono)) e.telefono = "Teléfono no válido.";
    if (!form.ciudad.trim()) e.ciudad = "La ciudad es obligatoria.";
    if (!form.centerId) e.centerId = "El instituto es obligatorio.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
      }}
      className="space-y-3"
      noValidate
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre" required>
          <input
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Tu nombre"
            className="input-field"
          />
          <FieldError msg={errs.nombre} />
        </Field>
        <Field label="Apellidos" required>
          <input
            type="text"
            value={form.apellidos}
            onChange={set("apellidos")}
            placeholder="Tus apellidos"
            className="input-field"
          />
          <FieldError msg={errs.apellidos} />
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
        <Field label="Teléfono" required>
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="+34 600 000 000"
            className="input-field"
            style={
              errs.telefono ? { borderColor: "rgba(248,113,113,0.5)" } : {}
            }
          />
          <FieldError msg={errs.telefono} />
        </Field>
        <Field label="Ciudad" required>
          <input
            type="text"
            value={form.ciudad}
            onChange={set("ciudad")}
            placeholder="Córdoba"
            className="input-field"
            style={errs.ciudad ? { borderColor: "rgba(248,113,113,0.5)" } : {}}
          />
          <FieldError msg={errs.ciudad} />
        </Field>
      </div>

      {/* Buscador de centro */}
      <Field label="Instituto" required>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={centerQuery}
            onChange={(e) => {
              setCenterQuery(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) setForm((f) => ({ ...f, centerId: "" }));
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Busca tu instituto..."
            className="input-field"
            style={
              errs.centerId ? { borderColor: "rgba(248,113,113,0.5)" } : {}
            }
          />
          {showDropdown &&
            centerQuery.length >= 1 &&
            filteredCenters.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  zIndex: 50,
                  width: "100%",
                  marginTop: 4,
                  border: "1px solid rgba(192,255,114,0.2)",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  maxHeight: 180,
                  overflowY: "auto",
                  backgroundColor: "var(--color-bg)",
                }}
              >
                {filteredCenters.map((c) => (
                  <li
                    key={c.id}
                    onMouseDown={() => {
                      setForm((f) => ({ ...f, centerId: c.id }));
                      setCenterQuery(c.nombre);
                      setShowDropdown(false);
                      setErrs((p) => ({ ...p, centerId: "" }));
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: 13,
                      color: "var(--color-text)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(192,255,114,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontWeight: 500 }}>{c.nombre}</span>
                    {c.ciudad && (
                      <span
                        style={{ fontSize: 11, color: "rgba(192,255,114,0.6)" }}
                      >
                        {c.ciudad}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          {showDropdown &&
            centerQuery.length >= 2 &&
            filteredCenters.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 50,
                  width: "100%",
                  marginTop: 4,
                  background: "var(--color-bg)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                No se encontró ningún centro con ese nombre.
              </div>
            )}
        </div>
        <FieldError msg={errs.centerId} />
      </Field>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={false}
        label="Completar registro"
      />
    </form>
  );
}

// ================================
// FORMULARIO EMPRESA
// ================================
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
    tamanio: "",
    ciudad: "",
    web: "",
    telefono: "",
    descripcion: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrs((p) => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim())
      e.nombre = "El nombre de la empresa es obligatorio.";
    if (!form.cif.trim()) e.cif = "El CIF es obligatorio.";
    else if (!isValidCif(form.cif))
      e.cif = "Formato de CIF inválido (ej: B12345678).";
    if (form.web && !isValidUrl(form.web)) e.web = "Introduce una URL válida.";
    if (form.telefono && !isValidPhone(form.telefono))
      e.telefono = "Teléfono no válido.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const errStyle = (k: string) =>
    errs[k] ? { borderColor: "rgba(248,113,113,0.5)" } : {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
      }}
      className="space-y-3"
      noValidate
    >
      <Field label="Correo electrónico de contacto">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>

      <div
        style={{ paddingTop: 10, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionDivider label="Datos de la empresa" />
        <div className="space-y-3">
          <Field label="Nombre de la empresa" required>
            <input
              type="text"
              value={form.nombre}
              onChange={set("nombre")}
              placeholder="Mi Empresa S.L."
              className="input-field"
              style={errStyle("nombre")}
            />
            <FieldError msg={errs.nombre} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CIF" required>
              <input
                type="text"
                value={form.cif}
                onChange={set("cif")}
                placeholder="B12345678"
                className="input-field"
                style={errStyle("cif")}
              />
              <FieldError msg={errs.cif} />
            </Field>
            <Field label="Sector">
              <select
                value={form.sector}
                onChange={set("sector")}
                className="input-field"
              >
                <option value="">Seleccionar sector</option>
                {SECTORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tamaño de empresa">
              <select
                value={form.tamanio}
                onChange={set("tamanio")}
                className="input-field"
              >
                <option value="">Seleccionar tamaño</option>
                {TAMANIOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.telefono}
                onChange={set("telefono")}
                placeholder="+34 900 000 000"
                className="input-field"
                style={errStyle("telefono")}
              />
              <FieldError msg={errs.telefono} />
            </Field>
            <Field label="Sitio web">
              <input
                type="url"
                value={form.web}
                onChange={set("web")}
                placeholder="https://miempresa.com"
                className="input-field"
                style={errStyle("web")}
              />
              <FieldError msg={errs.web} />
            </Field>
          </div>

          <Field label="Descripción de la empresa">
            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 500),
                }))
              }
              rows={3}
              placeholder="Describe tu empresa, cultura y qué tipo de perfiles buscáis..."
              className="input-field"
              style={{ resize: "none", lineHeight: 1.6 }}
            />
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 4,
                textAlign: "right",
              }}
            >
              {form.descripcion.length}/500
            </p>
          </Field>

          <InfoNote>
            El CIF será verificado por el equipo de Relance en un plazo de 24–48
            h antes de activar la cuenta plenamente.
          </InfoNote>
        </div>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={false}
        label="Completar registro"
      />
    </form>
  );
}

// ================================
// FORMULARIO CENTRO EDUCATIVO
// ================================
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
    provincia: "",
    web: "",
    num_alumnos: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrs((p) => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre del centro es obligatorio.";
    if (!form.codigo_centro.trim())
      e.codigo_centro = "El código institucional es obligatorio.";
    else if (form.codigo_centro.trim().length < 3)
      e.codigo_centro = "El código debe tener al menos 3 caracteres.";
    if (!form.ciudad.trim()) e.ciudad = "La ciudad es obligatoria.";
    if (form.web && !isValidUrl(form.web)) e.web = "Introduce una URL válida.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const errStyle = (k: string) =>
    errs[k] ? { borderColor: "rgba(248,113,113,0.5)" } : {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
      }}
      className="space-y-3"
      noValidate
    >
      <Field label="Correo electrónico institucional">
        <input
          type="email"
          value={email}
          disabled
          className="input-field cursor-not-allowed"
          style={{ opacity: 0.45 }}
        />
      </Field>

      <div
        style={{ paddingTop: 10, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionDivider label="Datos del centro" />
        <div className="space-y-3">
          <Field label="Nombre del centro" required>
            <input
              type="text"
              value={form.nombre}
              onChange={set("nombre")}
              placeholder="IES Nombre del Centro"
              className="input-field"
              style={errStyle("nombre")}
            />
            <FieldError msg={errs.nombre} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Código institucional" required>
              <input
                type="text"
                value={form.codigo_centro}
                onChange={set("codigo_centro")}
                placeholder="IES-COR-2026"
                className="input-field"
                style={errStyle("codigo_centro")}
              />
              <FieldError msg={errs.codigo_centro} />
            </Field>
            <Field label="Tipo de centro">
              <select
                value={form.tipo}
                onChange={set("tipo")}
                className="input-field"
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_CENTRO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad" required>
              <input
                type="text"
                value={form.ciudad}
                onChange={set("ciudad")}
                placeholder="Córdoba"
                className="input-field"
                style={errStyle("ciudad")}
              />
              <FieldError msg={errs.ciudad} />
            </Field>
            <Field label="Provincia">
              <input
                type="text"
                value={form.provincia}
                onChange={set("provincia")}
                placeholder="Córdoba"
                className="input-field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sitio web del centro">
              <input
                type="url"
                value={form.web}
                onChange={set("web")}
                placeholder="https://iesejemplo.edu.es"
                className="input-field"
                style={errStyle("web")}
              />
              <FieldError msg={errs.web} />
            </Field>
            <Field label="Número de alumnos">
              <input
                type="number"
                value={form.num_alumnos}
                onChange={set("num_alumnos")}
                placeholder="Ej: 350"
                min="1"
                className="input-field"
              />
            </Field>
          </div>

          <InfoNote>
            El código institucional será verificado por el equipo de Relance
            antes de activar la cuenta.
          </InfoNote>
        </div>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn
        loading={loading}
        disabled={false}
        label="Completar registro"
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
      // 1. Upsert tabla usuario
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

      // 2. Tabla específica por rol
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

        // Relación con centro
        if (roleData.centerId) {
          await supabase
            .from("centro_estudiante")
            .upsert(
              { estudiante_id: user.id, centro_id: roleData.centerId },
              { onConflict: "estudiante_id" },
            );
        }
      }

      if (role === "empresa") {
        const { error: e } = await supabase.from("empresa").upsert(
          {
            id_usuario: user.id,
            nombre: roleData.nombre,
            cif: roleData.cif,
            sector: roleData.sector || null,
            tamanio: roleData.tamanio || null,
            ciudad: roleData.ciudad || null,
            web: roleData.web || null,
            telefono: roleData.telefono || null,
            descripcion: roleData.descripcion || null,
          },
          { onConflict: "id_usuario" },
        );
        if (e) throw e;
      }

      if (role === "centro_educativo") {
        const { error: e } = await supabase.from("centro_educativo").upsert(
          {
            id_centro: user.id,
            nombre: roleData.nombre,
            codigo_centro: roleData.codigo_centro,
            tipo: roleData.tipo || null,
            ciudad: roleData.ciudad || null,
            provincia: roleData.provincia || null,
            web: roleData.web || null,
            num_alumnos: roleData.num_alumnos
              ? parseInt(roleData.num_alumnos)
              : null,
          },
          { onConflict: "id_centro" },
        );
        if (e) throw e;
      }

      // 3. Actualizar metadata de auth
      await supabase.auth.updateUser({
        data: {
          role,
          full_name: roleData.nombre,
          // Metadatos adicionales por rol (espejo de RegisterPage)
          ...(role === "estudiante" && {
            ciudad: roleData.ciudad ?? "",
            telefono: roleData.telefono ?? "",
            center_id: roleData.centerId ?? "",
          }),
          ...(role === "empresa" && {
            companyName: roleData.nombre ?? "",
            cif: roleData.cif ?? "",
            sector: roleData.sector ?? "",
            tamano: roleData.tamanio ?? "",
            ciudad: roleData.ciudad ?? "",
            telefono: roleData.telefono ?? "",
            web: roleData.web ?? "",
            descripcion: roleData.descripcion ?? "",
          }),
          ...(role === "centro_educativo" && {
            centerName: roleData.nombre ?? "",
            institutionalCode: roleData.codigo_centro ?? "",
            centerType: roleData.tipo ?? "",
            city: roleData.ciudad ?? "",
            province: roleData.provincia ?? "",
            website: roleData.web ?? "",
            num_alumnos: roleData.num_alumnos ?? "",
          }),
        },
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
      className="w-full max-w-lg mx-4 rounded-2xl animate-slide-down flex flex-col"
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
        // Altura máxima fija — el scroll es interno
        maxHeight: "90vh",
        overflow: "hidden",
      }}
    >
      {/* ── Cabecera (fija, no hace scroll) ── */}
      <div
        className="px-8 pt-8 pb-6 flex-shrink-0"
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

      {/* ── Contenido con scroll interno ── */}
      <div
        className="px-8 py-6 overflow-y-auto flex-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(192,255,114,0.2) transparent",
        }}
      >
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
                      stroke="#c0ff72"
                    >
                      <use href="/icons.svg#icon-check" />
                    </svg>
                  )}
                </button>
              );
            })}

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

        {/* Paso 2: formularios */}
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
        {step === 2 && role === "centro_educativo" && (
          <CentroForm
            email={email}
            onSubmit={saveToSupabase}
            loading={loading}
            error={error}
          />
        )}
      </div>

      {/* ── Footer con botón "Volver" (fijo abajo, solo paso 2) ── */}
      {step === 2 && (
        <div
          className="px-8 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
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
