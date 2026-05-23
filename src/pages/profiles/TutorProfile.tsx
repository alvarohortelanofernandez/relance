import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS COMPARTIDOS
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "var(--color-text-muted)",
  marginBottom: 5,
  fontFamily: "Plus Jakarta Sans, sans-serif",
};

const inputSmall: React.CSSProperties = {
  fontSize: 12,
  padding: "8px 11px",
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONOS
// ─────────────────────────────────────────────────────────────────────────────
interface IconProps {
  size?: number;
}

function IconCamera({ size = 12 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconCheck({ size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      style={{ width: 14, height: 14 }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        style={{ opacity: 0.25 }}
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        style={{ opacity: 0.75 }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 11,
              marginTop: 3,
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function TutorProfile() {
  const { user, userRole, avatarUrl: ctxAvatarUrl, refreshAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(ctxAvatarUrl);
  const [fullName, setFullName] = useState<string>(meta.full_name ?? "");
  const [phone, setPhone] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>(meta.specialty ?? "");
  const [entityInfo, setEntityInfo] = useState<{ name: string } | null>(null);

  const role = userRole ?? meta.role ?? "";
  const isCompanyTutor = role === "tutor_empresa";
  const roleLabel = isCompanyTutor
    ? "Tutor de empresa"
    : "Tutor de centro educativo";

  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    setAvatarUrl(ctxAvatarUrl);
  }, [ctxAvatarUrl]);

  useEffect(() => {
    if (!user?.id || !role) return;
    if (role !== "tutor_empresa" && role !== "tutor_centro" && role !== "tutor")
      return;

    const isEmpresa = role === "tutor_empresa";
    const tutorTable = isEmpresa ? "tutor_empresa" : "tutor_centro";

    const load = async () => {
      const { data } = await supabase
        .from(tutorTable)
        .select("*")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.nombre ?? meta.full_name ?? "");
        setPhone(data.telefono ?? "");
        setSpecialty(
          isEmpresa ? (data.cargo ?? "") : (data.departamento ?? ""),
        );

        if (isEmpresa) {
          const { data: empresaTutorRow } = await supabase
            .from("empresa_tutor")
            .select("id_empresa")
            .eq("id_tutor", data.id)
            .maybeSingle();
          if (empresaTutorRow?.id_empresa) {
            const { data: emp } = await supabase
              .from("empresa")
              .select("nombre")
              .eq("id", empresaTutorRow.id_empresa)
              .maybeSingle();
            if (emp) setEntityInfo({ name: emp.nombre || "Empresa" });
          }
        } else {
          const { data: centroTutorRow } = await supabase
            .from("centro_tutor")
            .select("id_centro")
            .eq("id_tutor", data.id)
            .maybeSingle();
          if (centroTutorRow?.id_centro) {
            const { data: cen } = await supabase
              .from("centro_educativo")
              .select("nombre")
              .eq("id", centroTutorRow.id_centro)
              .maybeSingle();
            if (cen) setEntityInfo({ name: cen.nombre || "Centro" });
          }
        }
      } else {
        setFullName(meta.full_name ?? "");
        setSpecialty(meta.specialty ?? "");
      }
    };

    load();
  }, [user?.id, role]);

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 2 MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Formato no válido. Usa JPG, PNG o WebP.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUploadError("Error al subir: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("profiles").getPublicUrl(path);
    const freshUrl = `${data.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(freshUrl);
    await supabase
      .from("usuario")
      .update({ avatar_url: freshUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    await refreshAvatar();
    setUploading(false);
  };

  const handleSave = async (): Promise<void> => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const isEmpresa = role === "tutor_empresa";
    const tutorTable = isEmpresa ? "tutor_empresa" : "tutor_centro";

    const payload = isEmpresa
      ? {
          nombre: fullName,
          telefono: phone,
          cargo: specialty,
        }
      : {
          nombre: fullName,
          telefono: phone,
          departamento: specialty,
        };

    // Comprobamos si ya existe un registro para este usuario
    const { data: existing } = await supabase
      .from(tutorTable)
      .select("id")
      .eq("usuario_id", user.id)
      .maybeSingle();

    let errorMsg: string | null = null;

    if (existing?.id) {
      // Ya existe → UPDATE
      const { error } = await supabase
        .from(tutorTable)
        .update(payload)
        .eq("usuario_id", user.id);
      if (error) errorMsg = error.message;
    } else {
      // No existe → INSERT
      const { error } = await supabase
        .from(tutorTable)
        .insert({ ...payload, usuario_id: user.id });
      if (error) errorMsg = error.message;
    }

    // Actualizamos también la tabla usuario
    await supabase
      .from("usuario")
      .update({ nombre: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setSaving(false);
    if (errorMsg) setSaveError("Error al guardar: " + errorMsg);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // Colores unificados con StudentProfile — siempre brand verde
  const accentColor = "var(--color-brand)";
  const accentBg = "rgba(192,255,114,0.08)";
  const accentBorder = "rgba(192,255,114,0.2)";

  return (
    <MainLayout>
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
          {/* ── CABECERA ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                Mi perfil
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accentColor,
                    display: "inline-block",
                  }}
                />
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: 11,
                    margin: 0,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {roleLabel}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "7px 14px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck /> Guardado
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>

          {saveError && (
            <div
              style={{
                marginBottom: 16,
                background: "var(--color-error-bg)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#f87171",
                fontSize: 12,
              }}
            >
              {saveError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ── ENTIDAD VINCULADA ── */}
            {entityInfo && (
              <div
                style={{
                  background: "var(--color-surface-strong)",
                  border: `1px solid ${accentBorder}`,
                  borderRadius: 14,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isCompanyTutor ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 9,
                      color: "var(--color-text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      margin: "0 0 2px",
                    }}
                  >
                    Vinculado a
                  </p>
                  <p
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      fontSize: "0.95rem",
                      margin: "0 0 2px",
                    }}
                  >
                    {entityInfo.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: accentColor,
                      margin: 0,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {roleLabel}
                  </p>
                </div>
              </div>
            )}

            {/* ── 1. INFORMACIÓN PERSONAL (incluye foto) ── */}
            <SectionCard title="Información personal">
              {/* Foto de perfil */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        objectFit: "cover",
                        border: "2px solid var(--color-border-strong)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        background: accentBg,
                        border: `1px solid ${accentBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 800,
                        fontSize: "1.4rem",
                        color: accentColor,
                      }}
                    >
                      {initials || "?"}
                    </div>
                  )}
                  {uploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Spinner />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    style={{
                      position: "absolute",
                      bottom: -6,
                      right: -6,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#02050d",
                      border: "2px solid var(--color-surface-strong)",
                      cursor: "pointer",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    <IconCamera size={12} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      fontSize: "1rem",
                      margin: "0 0 2px",
                    }}
                  >
                    {fullName || "Sin nombre"}
                  </p>
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.75rem",
                      margin: "0 0 4px",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {user?.email}
                  </p>
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: 10,
                      margin: 0,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    JPG, PNG o WebP · Máx. 2 MB
                  </p>
                  {uploadError && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: 10,
                        margin: "4px 0 0",
                      }}
                    >
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>

              {/* Campos */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Tu nombre y apellidos"
                    className="input-field"
                    style={inputSmall}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>
                      {isCompanyTutor ? "Cargo" : "Departamento"}
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSpecialty(e.target.value)
                      }
                      placeholder="Desarrollo Web, Diseño…"
                      className="input-field"
                      style={inputSmall}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPhone(e.target.value)
                      }
                      placeholder="+34 600 000 000"
                      className="input-field"
                      style={inputSmall}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── BOTÓN GUARDAR FINAL ── */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                display: "flex",
                gap: 6,
                padding: "11px 0",
                fontSize: 13,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck /> Perfil guardado
                </>
              ) : (
                "Guardar perfil"
              )}
            </button>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
