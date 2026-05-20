import { useEffect } from "react";
import React from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const TIPO_META = {
  practicas: {
    label: "Prácticas",
    color: "#63b3ed",
    bg: "rgba(99,179,237,0.08)",
    border: "rgba(99,179,237,0.2)",
  },
  practicas_contratacion: {
    label: "Prácticas + contratación",
    color: "#68d391",
    bg: "rgba(104,211,145,0.08)",
    border: "rgba(104,211,145,0.2)",
  },
  empleo_junior: {
    label: "Empleo junior",
    color: "#9f7aea",
    bg: "rgba(159,122,234,0.08)",
    border: "rgba(159,122,234,0.2)",
  },
};

function formatDate(d: string | null | undefined): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Íconos ───────────────────────────────────────────────────────────────────

const SVG: Record<string, React.ReactNode> = {
  clock: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  sun: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  users: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  euro: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  calendar: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  alert: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  pin: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  check: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  building: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
    </svg>
  ),
  close: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  globe: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  home: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  send: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  ),
  briefcase: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  ),
  star: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Oferta {
  id_oferta?: string;
  titulo: string;
  tipo_oferta?: string;
  empresa_nombre?: string | null;
  empresa_avatar?: string | null;
  modalidad?: string | null;
  ubicacion?: string | null;
  descripcion?: string | null;
  requisitos_adicionales?: string | null;
  beneficios?: string | null;
  salario_mensual?: number | null;
  num_plazas?: number | null;
  num_plazas_restantes?: number | null;
  duracion_semanas?: number | null;
  horas_semanales?: number | null;
  fecha_inicio?: string | null;
  fecha_fin_solicitud?: string | null;
  opcion_contrato?: boolean;
  estado?: string | null;
  tecnologias?: { id_tecnologia: string; nombre: string }[];
}

interface Props {
  oferta: Oferta;
  onClose: () => void;
  onPostular?: (oferta: Oferta) => void;
  yaPostulado?: boolean;
  isEstudiante?: boolean;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OfferDetailsModal({
  oferta,
  onClose,
  onPostular,
  yaPostulado,
  isEstudiante,
}: Props) {
  const meta = TIPO_META[oferta.tipo_oferta as keyof typeof TIPO_META] ?? {
    label: "Oferta",
    color: "var(--color-text-muted)",
    bg: "var(--color-surface)",
    border: "var(--color-border)",
  };
  const tecnologias = oferta.tecnologias ?? [];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const modalidadIcon: Record<string, React.ReactNode> = {
    Presencial: SVG.building,
    Remoto: SVG.globe,
    Híbrido: SVG.home,
  };

  interface QuickInfoItem {
    icon: React.ReactNode;
    text: string;
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
  }

  const quickInfoRaw: (QuickInfoItem | null)[] = [
    oferta.modalidad
      ? {
          icon: modalidadIcon[oferta.modalidad] ?? SVG.globe,
          text: oferta.modalidad,
        }
      : null,
    oferta.ubicacion ? { icon: SVG.pin, text: oferta.ubicacion } : null,
    oferta.tipo_oferta
      ? {
          icon: SVG.briefcase,
          text: meta.label,
          accentColor: meta.color,
          accentBg: meta.bg,
          accentBorder: meta.border,
        }
      : null,
    oferta.duracion_semanas
      ? {
          icon: SVG.clock,
          text: `${oferta.duracion_semanas} semanas`,
        }
      : null,
    oferta.horas_semanales
      ? {
          icon: SVG.sun,
          text: `${oferta.horas_semanales} h/semana`,
        }
      : null,
  ];
  const quickInfo: QuickInfoItem[] = quickInfoRaw.filter(
    (item): item is QuickInfoItem => item !== null,
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(3,8,15,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "om-bg 0.18s ease forwards",
        }}
      />

      {/* Contenedor centrado */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          role="dialog"
          aria-modal={true}
          aria-label={oferta.titulo}
          style={{
            width: "100%",
            maxWidth: 760,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 20,
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(192,255,114,0.05)",
            pointerEvents: "all",
            animation: "om-in 0.24s cubic-bezier(0.16,1,0.3,1) forwards",
            overflow: "hidden",
          }}
        >
          {/* ══ HERO HEADER ═══════════════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              padding: "28px 28px 24px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Fondo decorativo sutil */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 80% at 90% -10%, rgba(192,255,114,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Fila superior: logo + título + cerrar */}
            <div
              style={{
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              {/* Logo empresa */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  flexShrink: 0,
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                }}
              >
                {oferta.empresa_avatar ? (
                  <img
                    src={oferta.empresa_avatar}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "var(--color-brand)", opacity: 0.7 }}>
                    {SVG.building}
                  </span>
                )}
              </div>

              {/* Título y empresa */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    letterSpacing: "0.01em",
                  }}
                >
                  {oferta.empresa_nombre ?? "Empresa"}
                </p>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.15rem, 2.5vw, 1.45rem)",
                    color: "var(--color-text)",
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {oferta.titulo}
                </h2>

                {/* Quick info chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {quickInfo.map((item, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 11px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        color:
                          item.accentColor ?? "var(--color-text-secondary)",
                        background:
                          item.accentBg ?? "var(--color-surface-elevated)",
                        border: `1px solid ${item.accentBorder ?? "var(--color-border-strong)"}`,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <span style={{ opacity: 0.7, display: "flex" }}>
                        {item.icon}
                      </span>
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-text)";
                  e.currentTarget.style.background =
                    "var(--color-border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-text-muted)";
                  e.currentTarget.style.background =
                    "var(--color-surface-elevated)";
                }}
              >
                {SVG.close}
              </button>
            </div>

            {/* ── Stats row ── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 20,
              }}
            >
              {oferta.num_plazas_restantes != null && (
                <StatPill
                  icon={SVG.users}
                  label="Plazas libres"
                  value={`${oferta.num_plazas_restantes} / ${oferta.num_plazas ?? "?"}`}
                />
              )}
              <StatPill
                icon={SVG.euro}
                label="Remuneración"
                value={
                  oferta.salario_mensual
                    ? `${oferta.salario_mensual} €/mes`
                    : "No remunerado"
                }
                accent={!!oferta.salario_mensual}
              />
              {oferta.fecha_inicio && (
                <StatPill
                  icon={SVG.calendar}
                  label="Inicio"
                  value={formatDate(oferta.fecha_inicio) ?? ""}
                />
              )}
              {oferta.fecha_fin_solicitud && (
                <StatPill
                  icon={SVG.alert}
                  label="Cierre solicitudes"
                  value={formatDate(oferta.fecha_fin_solicitud) ?? ""}
                  warning
                />
              )}
              {oferta.opcion_contrato && (
                <StatPill
                  icon={SVG.star}
                  label=""
                  value="Opción de contratación"
                  success
                />
              )}
            </div>
          </div>

          {/* ══ CUERPO SCROLLABLE ════════════════════════════════════════════ */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {oferta.descripcion && (
              <ContentSection
                title="Descripción del puesto"
                icon={SVG.briefcase}
              >
                <RichText>{oferta.descripcion}</RichText>
              </ContentSection>
            )}

            {tecnologias.length > 0 && (
              <ContentSection title="Tecnologías requeridas" icon={SVG.check}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tecnologias.map((t) => (
                    <span
                      key={t.id_tecnologia}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "rgba(192,255,114,0.06)",
                        border: "1px solid rgba(192,255,114,0.2)",
                        color: "var(--color-brand)",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {t.nombre}
                    </span>
                  ))}
                </div>
              </ContentSection>
            )}

            {oferta.requisitos_adicionales && (
              <ContentSection title="Requisitos adicionales" icon={SVG.alert}>
                <RichText>{oferta.requisitos_adicionales}</RichText>
              </ContentSection>
            )}

            {oferta.beneficios && (
              <ContentSection title="Beneficios ofrecidos" icon={SVG.star}>
                <RichText variant="brand">{oferta.beneficios}</RichText>
              </ContentSection>
            )}

            {(oferta.num_plazas ||
              oferta.horas_semanales ||
              oferta.duracion_semanas) && (
              <ContentSection
                title="Condiciones de la posición"
                icon={SVG.clock}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 8,
                  }}
                >
                  {oferta.num_plazas && (
                    <CondRow label="Plazas totales" value={oferta.num_plazas} />
                  )}
                  {oferta.num_plazas_restantes != null && (
                    <CondRow
                      label="Plazas disponibles"
                      value={oferta.num_plazas_restantes}
                    />
                  )}
                  {oferta.duracion_semanas && (
                    <CondRow
                      label="Duración"
                      value={`${oferta.duracion_semanas} semanas`}
                    />
                  )}
                  {oferta.horas_semanales && (
                    <CondRow
                      label="Horas / semana"
                      value={`${oferta.horas_semanales} h`}
                    />
                  )}
                </div>
              </ContentSection>
            )}

            <div style={{ height: 8 }} />
          </div>

          {/* ══ FOOTER CTA ═══════════════════════════════════════════════════ */}
          {isEstudiante && (
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid var(--color-border)",
                flexShrink: 0,
                background: "var(--color-surface-strong)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {oferta.fecha_fin_solicitud && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    flex: 1,
                  }}
                >
                  Cierre:{" "}
                  <span style={{ color: "#f6ad55", fontWeight: 600 }}>
                    {formatDate(oferta.fecha_fin_solicitud)}
                  </span>
                </p>
              )}

              {yaPostulado ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "11px 22px",
                    borderRadius: 12,
                    background: "rgba(192,255,114,0.06)",
                    border: "1px solid rgba(192,255,114,0.2)",
                    marginLeft: "auto",
                  }}
                >
                  <span
                    style={{ color: "var(--color-brand)", display: "flex" }}
                  >
                    {SVG.check}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-brand)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Ya te has postulado
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onPostular?.(oferta)}
                  className="btn-primary"
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "11px 28px",
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {SVG.send}
                  Postularme a esta oferta
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes om-bg { from { opacity:0 } to { opacity:1 } }
        @keyframes om-in {
          from { opacity:0; transform:scale(0.97) translateY(16px) }
          to   { opacity:1; transform:scale(1)    translateY(0)    }
        }
      `}</style>
    </>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
  accent = false,
  warning = false,
  success = false,
}: {
  icon: React.ReactNode;
  label?: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  let color = "var(--color-text-secondary)";
  let bg = "var(--color-surface-elevated)";
  let border = "var(--color-border-strong)";

  if (accent) {
    color = "var(--color-brand)";
    bg = "rgba(192,255,114,0.07)";
    border = "rgba(192,255,114,0.2)";
  }
  if (warning) {
    color = "#f6ad55";
    bg = "rgba(246,173,85,0.07)";
    border = "rgba(246,173,85,0.2)";
  }
  if (success) {
    color = "#68d391";
    bg = "rgba(104,211,145,0.07)";
    border = "rgba(104,211,145,0.2)";
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      <span style={{ display: "flex", flexShrink: 0, opacity: 0.8 }}>
        {icon}
      </span>
      <div>
        {label && (
          <p
            style={{
              margin: 0,
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-subtle)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {label}
          </p>
        )}
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ContentSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "22px 28px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border-strong)",
            color: "var(--color-text-muted)",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function RichText({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "brand";
}) {
  const isBrand = variant === "brand";
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "16px 20px",
        background: isBrand
          ? "rgba(192,255,114,0.03)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${isBrand ? "rgba(192,255,114,0.1)" : "var(--color-border-strong)"}`,
        borderLeft: `3px solid ${isBrand ? "rgba(192,255,114,0.4)" : "var(--color-border-strong)"}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          lineHeight: 1.85,
          color: "var(--color-text-secondary)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          whiteSpace: "pre-line",
        }}
      >
        {children}
      </p>
    </div>
  );
}

function CondRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border-strong)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "Syne, sans-serif",
        }}
      >
        {value}
      </span>
    </div>
  );
}
