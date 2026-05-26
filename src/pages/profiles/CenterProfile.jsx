import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";
import InviteModal from "../../components/InviteModal";

// ── Send Invite Email Modal ───────────────────────────────────────────────────

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <section
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <h2
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.13em",
          margin: "0 0 14px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Label + Input helper ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          color: "var(--color-text-muted)",
          marginBottom: 5,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CenterProfile() {
  const { user, avatarUrl, refreshAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [centerName, setCenterName] = useState(meta.centerName ?? "");
  const [institutionalCode, setInstitutionalCode] = useState(
    meta.institutionalCode ?? "",
  );
  const [centerType, setCenterType] = useState(meta.centerType ?? "");
  const [city, setCity] = useState(meta.city ?? "");
  const [province, setProvince] = useState(meta.province ?? "");
  const [website, setWebsite] = useState(meta.website ?? "");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [degreesOffered, setDegreesOffered] = useState([]);
  const [degreeInput, setDegreeInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("centro_educativo")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) console.error("[CenterProfile]:", error);
      if (data) {
        setCenterName(data.nombre ?? meta.centerName ?? "");
        setInstitutionalCode(
          data.codigo_institucional ?? meta.institutionalCode ?? "",
        );
        setCenterType(data.tipo_centro ?? meta.centerType ?? "");
        setCity(data.ciudad ?? meta.city ?? "");
        setProvince(data.provincia ?? "");
        setWebsite(data.sitio_web ?? meta.website ?? "");
        setDescription(data.descripcion ?? "");
        setEmail(data.email_contacto ?? user.email ?? "");
        setPhone(data.telefono ?? "");
        setStudentsCount(data.num_alumnos ?? "");
        setDegreesOffered(data.titulaciones ?? []);
      } else {
        setCenterName(meta.centerName ?? "");
        setInstitutionalCode(meta.institutionalCode ?? "");
        setCenterType(meta.centerType ?? "");
        setCity(meta.city ?? "");
        setProvince(meta.province ?? "");
        setEmail(user.email ?? "");
      }
    };
    load();
  }, [user]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      await supabase
        .from("usuario")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      await refreshAvatar();
    }
    setUploading(false);
  };

  const handleDegreeKey = (e) => {
    if (e.key === "Enter" && degreeInput.trim()) {
      e.preventDefault();
      if (!degreesOffered.includes(degreeInput.trim()))
        setDegreesOffered([...degreesOffered, degreeInput.trim()]);
      setDegreeInput("");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error: centroError } = await supabase
      .from("centro_educativo")
      .upsert(
        {
          id: user.id,
          nombre: centerName,
          codigo_institucional: institutionalCode,
          tipo_centro: centerType,
          ciudad: city,
          provincia: province,
          sitio_web: website,
          descripcion: description,
          email_contacto: email,
          telefono: phone,
          num_alumnos: studentsCount !== "" ? Number(studentsCount) : null,
          titulaciones: degreesOffered,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (centroError)
      console.error("[CenterProfile] Error guardando:", centroError);
    await supabase
      .from("usuario")
      .update({ nombre: centerName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGenerateQR = async () => {
    setGeneratingToken(true);
    const token = crypto.randomUUID();
    await supabase.from("invite_tokens").insert({
      token,
      entity_id: user.id,
      entity_type: "centro_educativo",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    });
    setInviteUrl(
      `${window.location.origin}/registro-tutor?token=${token}&entity=${user.id}&type=centro_educativo`,
    );
    setGeneratingToken(false);
    setShowQR(true);
  };

  const inputStyle = { fontSize: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      <main
        style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 64px" }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
                margin: "0 0 4px",
                letterSpacing: "-0.03em",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Perfil del centro
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Configura la información de tu centro educativo
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              padding: "9px 18px",
              whiteSpace: "nowrap",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "#0A0A0A",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Guardando…
              </>
            ) : saved ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Logo */}
          <SectionCard title="Logo del centro">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={centerName}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      style={{
                        width: 32,
                        height: 32,
                        color: "var(--color-text-subtle)",
                      }}
                      viewBox="0 0 640 640"
                    >
                      <use href="/icons.svg#icon-school" />
                    </svg>
                  </div>
                )}
                {uploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderTopColor: "var(--color-brand)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {centerName || "Tu centro"}
                </p>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {user?.email}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "6px 12px" }}
                >
                  Cambiar logo
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Info */}
          <SectionCard title="Información del centro">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Nombre del centro *">
                  <input
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="IES Nombre del Centro"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
              </div>
              <Field label="Código institucional">
                <input
                  type="text"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  placeholder="IES-MAD-2024"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Tipo de centro">
                <select
                  value={centerType}
                  onChange={(e) => setCenterType(e.target.value)}
                  className="input-field"
                  style={inputStyle}
                >
                  <option value="">Seleccionar</option>
                  {[
                    "IES",
                    "FP",
                    "Universidad",
                    "Centro privado",
                    "Academia",
                    "Otro",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ciudad">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Madrid"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Provincia">
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Madrid"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="N.º de alumnos aprox.">
                <input
                  type="number"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(e.target.value)}
                  placeholder="300"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Sitio web">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://iesejemplo.edu.es"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Titulaciones */}
          <SectionCard title="Ciclos / Titulaciones ofertadas">
            <input
              type="text"
              value={degreeInput}
              onChange={(e) => setDegreeInput(e.target.value)}
              onKeyDown={handleDegreeKey}
              placeholder="Escribe una titulación y pulsa Enter (DAM, DAW, ASIR...)"
              className="input-field"
              style={{ ...inputStyle, marginBottom: 10 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {degreesOffered.map((d) => (
                <span
                  key={d}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(192,255,114,0.1)",
                    border: "1px solid rgba(192,255,114,0.22)",
                    color: "var(--color-brand)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  {d}
                  <button
                    onClick={() =>
                      setDegreesOffered(degreesOffered.filter((x) => x !== d))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(192,255,114,0.6)",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {degreesOffered.length === 0 && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    margin: 0,
                  }}
                >
                  Aún no has añadido titulaciones
                </p>
              )}
            </div>
          </SectionCard>

          {/* Descripción */}
          <SectionCard title="Descripción del centro">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Describe el centro, su especialización, proyectos destacados y qué tipo de empresas suelen colaborar..."
              className="input-field"
              style={{ ...inputStyle, resize: "none" }}
            />
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                textAlign: "right",
                margin: "4px 0 0",
              }}
            >
              {description.length}/500
            </p>
          </SectionCard>

          {/* Contacto */}
          <SectionCard title="Datos de contacto">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="Email de contacto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="secretaria@centro.edu.es"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 900 000 000"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
            </div>
          </SectionCard>

          {/* QR Invitación */}
          <SectionCard title="Invitar tutores de centro">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "rgba(192,255,114,0.1)",
                  border: "1px solid rgba(192,255,114,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  style={{ width: 22, height: 22, color: "var(--color-brand)" }}
                  viewBox="0 0 640 640"
                >
                  <use href="/icons.svg#icon-qrcode" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--color-text)",
                  }}
                >
                  Código QR de invitación para tutores
                </p>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  Genera un enlace QR único que los tutores puedan escanear para
                  registrarse vinculados automáticamente a tu centro. Caduca a
                  los 7 días.
                </p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    padding: "8px 16px",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Generar QR de invitación
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>

      {showInviteModal && (
        <InviteModal
          user={user}
          onClose={() => setShowInviteModal(false)}
          entityType="centro_educativo"
          inviteRoute="/registro-tutor"
          expiresInHours={168}
          title="Invitar tutores de centro"
          description="Genera un enlace QR para que los tutores se registren vinculados automáticamente a tu centro educativo."
          roleLabel="tutor de centro educativo"
          inviterName={centerName || "tu centro"}
          extraParams={{ type: "centro_educativo" }}
        />
      )}
    </div>
  );
}
