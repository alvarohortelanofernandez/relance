import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// ── Constantes ────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "estudiante",
    icon: "icon-student",
    label: "Estudiante",
    desc: "Busca prácticas o tu primer empleo",
  },
  {
    id: "empresa",
    icon: "icon-company",
    label: "Empresa",
    desc: "Publica ofertas y encuentra talento",
  },
  {
    id: "centro_educativo",
    icon: "icon-educativeCenter",
    label: "Centro educativo",
    desc: "Gestiona las prácticas de tus alumnos",
  },
];

// ── Validaciones ──────────────────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidUrl = (v) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};
const isValidCif = (v) => /^[A-Z0-9]{8,9}$/i.test(v.trim());
const isValidPhone = (v) => /^[+\d\s\-().]{7,20}$/.test(v.trim());

function validateCommon(form) {
  const e = {};
  if (!form.fullName?.trim()) e.fullName = "El nombre es obligatorio.";
  if (!form.email.trim()) e.email = "El correo es obligatorio.";
  else if (!isValidEmail(form.email)) e.email = "Introduce un correo válido.";
  if (!form.password) e.password = "La contraseña es obligatoria.";
  else if (form.password.length < 8) e.password = "Mínimo 8 caracteres.";
  else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
    e.password = "Debe tener al menos una mayúscula y un número.";
  if (!form.confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
  else if (form.password !== form.confirmPassword)
    e.confirmPassword = "Las contraseñas no coinciden.";
  return e;
}

// ── Estilos compartidos ───────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "var(--color-text-muted)",
  marginBottom: 6,
  fontWeight: 500,
};
const formGrid = { display: "flex", flexDirection: "column", gap: 12 };
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

const inputStyle = (hasError = false, focused = false) => ({
  width: "100%",
  boxSizing: "border-box",
  background: "var(--color-surface)",
  border: `1px solid ${hasError ? "rgba(248,113,113,0.5)" : focused ? "rgba(192,255,114,0.45)" : "var(--color-border-strong)"}`,
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 12,
  color: "var(--color-text)",
  fontFamily: "inherit",
  outline: "none",
  transition: "all 0.18s",
  boxShadow: focused ? "0 0 0 3px rgba(192,255,114,0.10)" : "none",
});

// ── Atoms ─────────────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  return msg ? (
    <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{msg}</p>
  ) : null;
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  hasError = false,
  min,
  max,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(hasError, focused)}
    />
  );
}

function SelectField({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(false, focused),
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a9ab8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: 32,
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(false, focused), resize: "none", lineHeight: 1.6 }}
    />
  );
}

function PasswordField({
  value,
  onChange,
  placeholder = "Mínimo 8 caracteres",
  showStrength = true,
  hasError = false,
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle(hasError, focused), paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            padding: 4,
          }}
        >
          {show ? (
            <svg
              width="15"
              height="15"
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
              width="15"
              height="15"
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
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 5,
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
              fontSize: 10,
              color: "var(--color-text-muted)",
              width: 55,
              textAlign: "right",
            }}
          >
            {labels[score]}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: "var(--color-text-muted)",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 700,
      }}
    >
      {children}
    </p>
  );
}

function InfoNote({ children }) {
  return (
    <div
      style={{
        marginTop: 10,
        background: "rgba(192,255,114,0.04)",
        border: "1px solid rgba(192,255,114,0.12)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "flex-start",
          gap: 7,
          lineHeight: 1.6,
        }}
      >
        <svg
          width="13"
          height="13"
          style={{ flexShrink: 0, marginTop: 2, color: "var(--color-brand)" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {children}
      </p>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.25)",
        borderRadius: 10,
        padding: "10px 12px",
        color: "#f87171",
        fontSize: 12,
      }}
    >
      {msg}
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: "11px 20px",
        background: loading ? "rgba(192,255,114,0.5)" : "var(--color-brand)",
        color: "#010a00",
        border: "none",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "-0.02em",
      }}
    >
      {loading ? (
        <>
          <svg
            style={{
              width: 15,
              height: 15,
              animation: "spin 0.8s linear infinite",
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Creando cuenta...
        </>
      ) : (
        label
      )}
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </button>
  );
}

// ── STUDENT FORM ──────────────────────────────────────────────────────────────
function StudentForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    centerId: "",
    telefono: "",
    ciudad: "",
  });
  const [errs, setErrs] = useState({});
  const [centers, setCenters] = useState([]);
  const [centerQuery, setCenterQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCenters = centers.filter((c) =>
    c.nombre?.toLowerCase().includes(centerQuery.toLowerCase()),
  );

  useEffect(() => {
    supabase
      .from("centro_educativo")
      .select("id, nombre, ciudad")
      .order("nombre")
      .then(({ data }) => {
        if (data) setCenters(data);
      });
  }, []);

  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = validateCommon(form);
    if (!form.centerId) e.centerId = "El instituto es obligatorio.";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else if (!isValidPhone(form.telefono)) e.telefono = "Teléfono no válido.";
    if (!form.ciudad.trim()) e.ciudad = "La ciudad es obligatoria.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "estudiante" });
      }}
      style={formGrid}
      noValidate
    >
      <div>
        <label style={labelStyle}>Nombre completo *</label>
        <Input
          value={form.fullName}
          onChange={s("fullName")}
          placeholder="Tu nombre y apellidos"
          hasError={!!errs.fullName}
        />
        <FieldError msg={errs.fullName} />
      </div>
      <div>
        <label style={labelStyle}>Correo electrónico *</label>
        <Input
          type="email"
          value={form.email}
          onChange={s("email")}
          placeholder="tu@correo.com"
          hasError={!!errs.email}
        />
        <FieldError msg={errs.email} />
      </div>
      <div style={twoCol}>
        <div>
          <label style={labelStyle}>Contraseña *</label>
          <PasswordField
            value={form.password}
            onChange={s("password")}
            hasError={!!errs.password}
          />
          <FieldError msg={errs.password} />
        </div>
        <div>
          <label style={labelStyle}>Confirmar contraseña *</label>
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
        </div>
      </div>

      {/* Instituto */}
      <div style={{ position: "relative" }}>
        <label style={labelStyle}>Instituto *</label>
        <Input
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
          hasError={!!errs.centerId}
        />
        <FieldError msg={errs.centerId} />
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
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                maxHeight: 180,
                overflowY: "auto",
                backgroundColor: "var(--color-bg)",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {filteredCenters.map((c) => (
                <li
                  key={c.id}
                  onMouseDown={() => {
                    setForm((f) => ({ ...f, centerId: c.id }));
                    setCenterQuery(c.nombre);
                    setShowDropdown(false);
                    setErrs((p) => ({ ...p, centerId: undefined }));
                  }}
                  style={{
                    padding: "9px 14px",
                    fontSize: 12,
                    color: "var(--color-text)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
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
                      style={{ fontSize: 10, color: "rgba(192,255,114,0.6)" }}
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
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              No se encontró ningún centro.
            </div>
          )}
      </div>

      <div style={twoCol}>
        <div>
          <label style={labelStyle}>Teléfono *</label>
          <Input
            type="tel"
            value={form.telefono}
            onChange={s("telefono")}
            placeholder="+34 600 000 000"
            hasError={!!errs.telefono}
          />
          <FieldError msg={errs.telefono} />
        </div>
        <div>
          <label style={labelStyle}>Ciudad *</label>
          <Input
            value={form.ciudad}
            onChange={s("ciudad")}
            placeholder="Ej: Córdoba"
            hasError={!!errs.ciudad}
          />
          <FieldError msg={errs.ciudad} />
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton loading={loading} label="Crear cuenta de estudiante" />
    </form>
  );
}

// ── COMPANY FORM ──────────────────────────────────────────────────────────────
function CompanyForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    cif: "",
    sector: "",
    tamanio: "",
    ciudad: "",
    web: "",
    telefono: "",
    descripcion: "",
  });
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = validateCommon(form);
    if (!form.companyName.trim())
      e.companyName = "El nombre de la empresa es obligatorio.";
    if (!form.cif.trim()) e.cif = "El CIF es obligatorio.";
    else if (!isValidCif(form.cif))
      e.cif = "Formato de CIF inválido (ej: B12345678).";
    if (form.web && !isValidUrl(form.web)) e.web = "Introduce una URL válida.";
    if (form.telefono && !isValidPhone(form.telefono))
      e.telefono = "Teléfono no válido.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "empresa" });
      }}
      style={formGrid}
      noValidate
    >
      <div>
        <label style={labelStyle}>Tu nombre completo (representante) *</label>
        <Input
          value={form.fullName}
          onChange={s("fullName")}
          placeholder="Nombre del representante"
          hasError={!!errs.fullName}
        />
        <FieldError msg={errs.fullName} />
      </div>
      <div>
        <label style={labelStyle}>Correo electrónico corporativo *</label>
        <Input
          type="email"
          value={form.email}
          onChange={s("email")}
          placeholder="contacto@empresa.com"
          hasError={!!errs.email}
        />
        <FieldError msg={errs.email} />
      </div>
      <div style={twoCol}>
        <div>
          <label style={labelStyle}>Contraseña *</label>
          <PasswordField
            value={form.password}
            onChange={s("password")}
            hasError={!!errs.password}
          />
          <FieldError msg={errs.password} />
        </div>
        <div>
          <label style={labelStyle}>Confirmar contraseña *</label>
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
        </div>
      </div>

      <div
        style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionLabel>Datos de la empresa</SectionLabel>
        <div style={formGrid}>
          <div>
            <label style={labelStyle}>Nombre de la empresa *</label>
            <Input
              value={form.companyName}
              onChange={s("companyName")}
              placeholder="Mi Empresa S.L."
              hasError={!!errs.companyName}
            />
            <FieldError msg={errs.companyName} />
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>CIF *</label>
              <Input
                value={form.cif}
                onChange={s("cif")}
                placeholder="B12345678"
                hasError={!!errs.cif}
              />
              <FieldError msg={errs.cif} />
            </div>
            <div>
              <label style={labelStyle}>Sector</label>
              <SelectField value={form.sector} onChange={s("sector")}>
                <option value="">Seleccionar sector</option>
                {[
                  "Tecnología",
                  "Marketing",
                  "Diseño",
                  "Finanzas",
                  "Salud",
                  "Educación",
                  "Comercio",
                  "Industria",
                  "Otro",
                ].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Tamaño</label>
              <SelectField value={form.tamanio} onChange={s("tamanio")}>
                <option value="">Seleccionar tamaño</option>
                {[
                  "1–10 empleados",
                  "11–50 empleados",
                  "51–200 empleados",
                  "201–500 empleados",
                  "500+ empleados",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <Input
                value={form.ciudad}
                onChange={s("ciudad")}
                placeholder="Madrid"
              />
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <Input
                type="tel"
                value={form.telefono}
                onChange={s("telefono")}
                placeholder="+34 900 000 000"
                hasError={!!errs.telefono}
              />
              <FieldError msg={errs.telefono} />
            </div>
            <div>
              <label style={labelStyle}>Sitio web</label>
              <Input
                type="url"
                value={form.web}
                onChange={s("web")}
                placeholder="https://miempresa.com"
                hasError={!!errs.web}
              />
              <FieldError msg={errs.web} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <Textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 500),
                }))
              }
              placeholder="Describe tu empresa, cultura y qué perfiles buscáis..."
            />
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                marginTop: 3,
                textAlign: "right",
              }}
            >
              {form.descripcion.length}/500
            </p>
          </div>
          <InfoNote>
            El CIF será verificado por el equipo de Relance en un plazo de 24–48
            h antes de activar la cuenta plenamente.
          </InfoNote>
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton loading={loading} label="Crear cuenta de empresa" />
    </form>
  );
}

// ── CENTER FORM ───────────────────────────────────────────────────────────────
function CenterForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    centerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institutionalCode: "",
    centerType: "",
    num_alumnos: "",
    city: "",
    province: "",
    website: "",
  });
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "El correo es obligatorio.";
    else if (!isValidEmail(form.email)) e.email = "Introduce un correo válido.";
    if (!form.password) e.password = "La contraseña es obligatoria.";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres.";
    else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = "Debe tener al menos una mayúscula y un número.";
    if (!form.confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden.";
    if (!form.centerName.trim())
      e.centerName = "El nombre del centro es obligatorio.";
    if (!form.institutionalCode.trim())
      e.institutionalCode = "El código institucional es obligatorio.";
    else if (form.institutionalCode.trim().length < 3)
      e.institutionalCode = "El código debe tener al menos 3 caracteres.";
    if (!form.city.trim()) e.city = "La ciudad es obligatoria.";
    if (form.website && !isValidUrl(form.website))
      e.website = "Introduce una URL válida.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "centro_educativo" });
      }}
      style={formGrid}
      noValidate
    >
      <div>
        <label style={labelStyle}>Nombre del centro *</label>
        <Input
          value={form.centerName}
          onChange={s("centerName")}
          placeholder="IES Nombre del Centro"
          hasError={!!errs.centerName}
        />
        <FieldError msg={errs.centerName} />
      </div>
      <div>
        <label style={labelStyle}>Correo electrónico institucional *</label>
        <Input
          type="email"
          value={form.email}
          onChange={s("email")}
          placeholder="responsable@centro.edu.es"
          hasError={!!errs.email}
        />
        <FieldError msg={errs.email} />
      </div>
      <div style={twoCol}>
        <div>
          <label style={labelStyle}>Contraseña *</label>
          <PasswordField
            value={form.password}
            onChange={s("password")}
            hasError={!!errs.password}
          />
          <FieldError msg={errs.password} />
        </div>
        <div>
          <label style={labelStyle}>Confirmar contraseña *</label>
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
        </div>
      </div>

      <div
        style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionLabel>Datos del centro</SectionLabel>
        <div style={formGrid}>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Código institucional *</label>
              <Input
                value={form.institutionalCode}
                onChange={s("institutionalCode")}
                placeholder="Ej: IES-COR-2026"
                hasError={!!errs.institutionalCode}
              />
              <FieldError msg={errs.institutionalCode} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de centro</label>
              <SelectField value={form.centerType} onChange={s("centerType")}>
                <option value="">Seleccionar tipo</option>
                {[
                  "IES — Instituto de Educación Secundaria",
                  "FP — Formación Profesional",
                  "Universidad",
                  "Centro privado",
                  "Academia",
                  "Otro",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Ciudad *</label>
              <Input
                value={form.city}
                onChange={s("city")}
                placeholder="Córdoba"
                hasError={!!errs.city}
              />
              <FieldError msg={errs.city} />
            </div>
            <div>
              <label style={labelStyle}>Provincia</label>
              <Input
                value={form.province}
                onChange={s("province")}
                placeholder="Córdoba"
              />
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Sitio web</label>
              <Input
                type="url"
                value={form.website}
                onChange={s("website")}
                placeholder="https://iesejemplo.edu.es"
                hasError={!!errs.website}
              />
              <FieldError msg={errs.website} />
            </div>
            <div>
              <label style={labelStyle}>Nº de alumnos</label>
              <Input
                type="number"
                value={form.num_alumnos}
                onChange={s("num_alumnos")}
                placeholder="Ej: 350"
                min="1"
              />
            </div>
          </div>
          <InfoNote>
            El código institucional será verificado por el equipo de Relance
            antes de activar la cuenta.
          </InfoNote>
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton
        loading={loading}
        label="Crear cuenta de centro educativo"
      />
    </form>
  );
}

// ── MODAL PRINCIPAL ───────────────────────────────────────────────────────────
export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    const { fullName, email, password, role, ...extra } = formData;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            full_name: fullName ?? extra.centerName ?? "",
            role,
            ...(role === "estudiante" && {
              ciudad: extra.ciudad ?? "",
              telefono: extra.telefono ?? "",
              center_id: extra.centerId ?? "",
            }),
            ...(role === "empresa" && {
              companyName: extra.companyName ?? "",
              cif: extra.cif ?? "",
              sector: extra.sector ?? "",
              tamano: extra.tamanio ?? "",
              ciudad: extra.ciudad ?? "",
              telefono: extra.telefono ?? "",
              web: extra.web ?? "",
              descripcion: extra.descripcion ?? "",
            }),
            ...(role === "centro_educativo" && {
              centerName: extra.centerName ?? "",
              institutionalCode: extra.institutionalCode ?? "",
              centerType: extra.centerType ?? "",
              city: extra.city ?? "",
              province: extra.province ?? "",
              website: extra.website ?? "",
              num_alumnos: extra.num_alumnos ?? "",
            }),
          },
        },
      },
    );

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message === "User already registered"
          ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
          : signUpError.message,
      );
      return;
    }

    const newUserId = signUpData?.user?.id;
    const hasSession = !!signUpData?.session;

    if (newUserId && hasSession) {
      await supabase.from("usuario").upsert(
        {
          id: newUserId,
          email,
          nombre: fullName ?? extra.centerName ?? "",
          rol: role,
          is_profile_completed: true,
        },
        { onConflict: "id" },
      );

      if (role === "estudiante") {
        const parts = (fullName ?? "").trim().split(" ");
        await supabase.from("estudiante").upsert(
          {
            id: newUserId,
            nombre: parts[0] ?? fullName,
            apellidos: parts.slice(1).join(" ") || null,
            ciudad: extra.ciudad || null,
            telefono: extra.telefono || null,
          },
          { onConflict: "id" },
        );
        if (extra.centerId) {
          await supabase
            .from("centro_estudiante")
            .insert({ id_estudiante: newUserId, id_centro: extra.centerId });
        }
      }

      if (role === "empresa") {
        await supabase.from("empresa").upsert(
          {
            id_usuario: newUserId,
            nombre: extra.companyName,
            cif: extra.cif ?? "",
            sector: extra.sector || null,
            tamano: extra.tamanio || null,
            ciudad: extra.ciudad || null,
            telefono: extra.telefono || null,
            web: extra.web || null,
            descripcion: extra.descripcion || null,
          },
          { onConflict: "id_usuario" },
        );
      }

      if (role === "centro_educativo") {
        await supabase.from("centro_educativo").upsert(
          {
            id: newUserId,
            nombre: extra.centerName,
            codigo_centro: extra.institutionalCode ?? "",
            tipo_centro: extra.centerType || null,
            ciudad: extra.city || null,
            provincia: extra.province || null,
            sitio_web: extra.website || null,
            num_alumnos: extra.num_alumnos ? parseInt(extra.num_alumnos) : null,
          },
          { onConflict: "id" },
        );
      }
    }

    setLoading(false);
    setRegisteredEmail(email);
    setSuccess(true);
  };

  // ── Éxito ──
  if (success) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          padding: 16,
        }}
      >
        <div
          style={{
            background: "var(--color-surface-strong)",
            border: "1px solid rgba(192,255,114,0.25)",
            borderRadius: 18,
            width: "100%",
            maxWidth: 420,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(192,255,114,0.12)",
          }}
        >
          <div
            style={{
              marginBottom: 18,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(192,255,114,0.08)",
                border: "1px solid rgba(192,255,114,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12l5 5l10-10" />
              </svg>
            </div>
          </div>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: 8,
              letterSpacing: "-0.04em",
            }}
          >
            ¡Cuenta creada!
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Hemos enviado un correo de verificación a:
          </p>
          <p
            style={{
              color: "var(--color-brand)",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {registeredEmail}
          </p>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 12,
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu
            cuenta.
            {(selectedRole === "empresa" ||
              selectedRole === "centro_educativo") && (
              <span style={{ display: "block", marginTop: 6 }}>
                El equipo de Relance verificará tus datos en 24–48 h.
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px 20px",
              background: "var(--color-brand)",
              color: "#010a00",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // ── Modal principal ──
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header fijo */}
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: "-0.04em",
            }}
          >
            Crea tu cuenta
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 4,
              display: "flex",
              borderRadius: 6,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div style={{ overflowY: "auto", padding: "18px 22px", flex: 1 }}>
          {/* Selector de rol */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {ROLES.map((role) => {
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setError(null);
                  }}
                  style={{
                    position: "relative",
                    padding: "12px 10px",
                    borderRadius: 10,
                    border: `1px solid ${active ? "rgba(192,255,114,0.35)" : "var(--color-border-strong)"}`,
                    background: active
                      ? "rgba(192,255,114,0.06)"
                      : "var(--color-surface)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    outline: "none",
                  }}
                >
                  {active && (
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#c0ff72"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <span style={{ display: "block", marginBottom: 6 }}>
                    <svg
                      style={{
                        width: 16,
                        height: 16,
                        color: active
                          ? "var(--color-brand)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      <use href={`/icons.svg#${role.icon}`} />
                    </svg>
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: active
                        ? "var(--color-text)"
                        : "var(--color-text-secondary)",
                      marginBottom: 2,
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    {role.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {role.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Aviso tutores */}
          <div
            style={{
              marginBottom: 14,
              background: "rgba(192,255,114,0.04)",
              border: "1px solid rgba(192,255,114,0.14)",
              borderRadius: 10,
              padding: "11px 14px",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ flexShrink: 0, color: "var(--color-brand)" }}>
              <svg style={{ width: 15, height: 15 }}>
                <use href="/icons.svg#icon-tutor" />
              </svg>
            </span>
            <div>
              <p
                style={{
                  color: "var(--color-brand)",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 3,
                }}
              >
                ¿Eres tutor?
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                Los tutores se registran únicamente a través del{" "}
                <strong style={{ color: "var(--color-text-secondary)" }}>
                  enlace de invitación QR
                </strong>{" "}
                generado por su empresa o centro.
              </p>
            </div>
          </div>

          {/* Formulario */}
          {selectedRole && (
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <svg
                  style={{
                    width: 16,
                    height: 16,
                    color: "var(--color-text-muted)",
                  }}
                >
                  <use
                    href={`/icons.svg#${ROLES.find((r) => r.id === selectedRole)?.icon}`}
                  />
                </svg>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    fontSize: 14,
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Registro como{" "}
                  {ROLES.find((r) => r.id === selectedRole)?.label}
                </h3>
              </div>
              {selectedRole === "estudiante" && (
                <StudentForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              )}
              {selectedRole === "empresa" && (
                <CompanyForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              )}
              {selectedRole === "centro_educativo" && (
                <CenterForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              )}
            </div>
          )}

          {!selectedRole && (
            <div
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: 12,
                padding: "20px 0",
              }}
            >
              Selecciona un tipo de cuenta para continuar
            </div>
          )}

          {/* Link login */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginTop: 16,
            }}
          >
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={onSwitchToLogin}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-brand)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
                padding: 0,
              }}
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
