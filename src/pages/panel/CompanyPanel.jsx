import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";
import InviteModalRaw from "../../components/InviteModal";
const InviteModal = /** @type {any} */ (InviteModalRaw);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 0",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          border: "2px solid var(--color-border-strong)",
          borderTopColor: "var(--color-brand)",
          borderRadius: "50%",
          animation: "spin 0.75s linear infinite",
        }}
      />
    </div>
  );
}

function Avatar({ name, size = 32, square = false }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "#c0ff72",
    "#60a5fa",
    "#f59e0b",
    "#a78bfa",
    "#34d399",
    "#f87171",
  ];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: square ? 10 : "50%",
        background: `${color}18`,
        border: `1.5px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default", dot }) {
  const variants = {
    default: {
      bg: "var(--color-surface-elevated)",
      border: "var(--color-border-strong)",
      color: "var(--color-text-muted)",
    },
    brand: {
      bg: "rgba(192,255,114,0.1)",
      border: "rgba(192,255,114,0.28)",
      color: "var(--color-brand)",
    },
    success: {
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.28)",
      color: "#4ade80",
    },
    warning: {
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.28)",
      color: "#fbbf24",
    },
    danger: {
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.28)",
      color: "#f87171",
    },
    muted: {
      bg: "rgba(53,78,104,0.18)",
      border: "rgba(53,78,104,0.35)",
      color: "var(--color-text-subtle)",
    },
    info: {
      bg: "rgba(96,165,250,0.1)",
      border: "rgba(96,165,250,0.28)",
      color: "#60a5fa",
    },
  };
  const v = variants[variant] ?? variants.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 9px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: v.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, suffix = "", accent }) {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: `1px solid ${accent ? "rgba(192,255,114,0.22)" : "var(--color-border)"}`,
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, var(--color-brand), transparent)",
          }}
        />
      )}
      <p
        style={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.13em",
          color: "var(--color-text-subtle)",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--color-text)",
          margin: 0,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
        {suffix}
      </p>
      {sub && (
        <p
          style={{ fontSize: 10, color: "var(--color-text-muted)", margin: 0 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              margin: "3px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Table({ headers, children, empty }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.11em",
                  color: "var(--color-text-subtle)",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 0",
            color: "var(--color-text-subtle)",
            fontSize: 12,
          }}
        >
          {empty}
        </div>
      )}
    </div>
  );
}

function TR({ cells, last }) {
  return (
    <tr
      style={{
        borderBottom: last ? "none" : "1px solid var(--color-border-subtle)",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-surface)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: "10px 14px",
            color: "var(--color-text-secondary)",
            verticalAlign: "middle",
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", maxWidth: 240 }}>
      <span
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-subtle)",
          pointerEvents: "none",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        style={{
          paddingLeft: 30,
          paddingRight: 10,
          paddingTop: 7,
          paddingBottom: 7,
          fontSize: 11,
        }}
      />
    </div>
  );
}

const ESTADO_CAND = {
  pendiente: { label: "Pendiente", variant: "muted" },
  revisando: { label: "En revisión", variant: "warning" },
  aceptado: { label: "Aceptado", variant: "success" },
  rechazado: { label: "Rechazado", variant: "danger" },
  retirado: { label: "Retirado", variant: "muted" },
};

const ESTADO_CONVENIO = {
  activo: { label: "Activo", variant: "success" },
  pendiente: { label: "Pendiente", variant: "warning" },
  rechazado: { label: "Rechazado", variant: "danger" },
};

const TIPO_OFERTA = {
  practicas: { label: "Prácticas", accent: "#63b3ed" },
  practicas_contratacion: { label: "Prácticas + contrato", accent: "#68d391" },
  empleo_junior: { label: "Empleo junior", accent: "#9f7aea" },
};

// ─── MODAL DETALLE CANDIDATURA ────────────────────────────────────────────────

function CandidaturaModal({
  candidatura,
  empresaId,
  empresaNombre,
  onClose,
  onUpdate,
}) {
  const [estado, setEstado] = useState(candidatura.estado);
  const [comentario, setComentario] = useState(
    candidatura.comentario_empresa ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleGuardar = async (nuevoEstado) => {
    setSaving(true);
    setError(null);
    try {
      const estadoFinal = nuevoEstado ?? estado;

      // 1. Actualizar candidatura (trigger descuenta plaza si pasa a aceptado)
      const { error: candErr } = await supabase
        .from("candidatura")
        .update({ estado: estadoFinal, comentario_empresa: comentario || null })
        .eq("id_candidatura", candidatura.id_candidatura);
      if (candErr) throw candErr;

      // 2. Si se acepta: vincular empresa_estudiante + estudiante_tutor + notificación
      if (estadoFinal === "aceptado" && candidatura.estado !== "aceptado") {
        // 2a. empresa_estudiante
        const { error: eeErr } = await supabase
          .from("empresa_estudiante")
          .upsert(
            {
              id_empresa: empresaId,
              id_estudiante: candidatura.id_estudiante,
              tipo:
                candidatura.tipo_oferta === "practicas_contratacion" ||
                candidatura.tipo_oferta === "practicas"
                  ? "practicas"
                  : "contratado",
              fecha_inicio: new Date().toISOString().split("T")[0],
              fecha_fin: null,
              activo: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id_empresa,id_estudiante" },
          );
        if (eeErr) throw eeErr;

        // 2b. estudiante_tutor (tipo empresa) — buscar tutor de la empresa
        const { data: tutorRows } = await supabase
          .from("empresa_tutor")
          .select("id_tutor")
          .eq("id_empresa", empresaId)
          .limit(1);
        const idTutorEmpresa = tutorRows?.[0]?.id_tutor ?? null;

        if (idTutorEmpresa) {
          // Borrar vínculo previo de tipo empresa si existe
          await supabase
            .from("estudiante_tutor")
            .delete()
            .eq("id_estudiante", candidatura.id_estudiante)
            .eq("tipo_tutor", "empresa");

          await supabase.from("estudiante_tutor").insert({
            id_estudiante: candidatura.id_estudiante,
            id_tutor: idTutorEmpresa,
            tipo_tutor: "empresa",
          });
        }

        // 2c. Notificación al estudiante
        await supabase.from("notificacion").insert({
          id_usuario_destino: candidatura.id_estudiante,
          id_usuario_remitente: empresaId,
          tipo: "candidatura",
          titulo: "¡Tu candidatura ha sido aceptada!",
          mensaje: `${empresaNombre} ha aceptado tu candidatura para la oferta "${candidatura.oferta_titulo}".${comentario ? ` Mensaje: ${comentario}` : ""}`,
          url_destino: `/ofertas?oferta=${candidatura.id_oferta}`,
          metadata: JSON.stringify({
            candidatura_id: candidatura.id_candidatura,
            oferta_id: candidatura.id_oferta,
          }),
          leido: false,
          fecha: new Date().toISOString(),
        });
      }

      // 3. Si se rechaza: notificación
      if (estadoFinal === "rechazado" && candidatura.estado !== "rechazado") {
        await supabase.from("notificacion").insert({
          id_usuario_destino: candidatura.id_estudiante,
          id_usuario_remitente: empresaId,
          tipo: "candidatura",
          titulo: "Candidatura no seleccionada",
          mensaje: `${empresaNombre} ha revisado tu candidatura para "${candidatura.oferta_titulo}" y no ha podido seleccionarte en esta ocasión.${comentario ? ` Mensaje: ${comentario}` : ""}`,
          url_destino: `/ofertas?oferta=${candidatura.id_oferta}`,
          metadata: JSON.stringify({
            candidatura_id: candidatura.id_candidatura,
          }),
          leido: false,
          fecha: new Date().toISOString(),
        });
      }

      setEstado(estadoFinal);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border)",
          borderRadius: 18,
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <Avatar name={candidatura.estudiante_nombre} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {candidatura.estudiante_nombre}
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              {candidatura.titulacion ?? "—"}
            </p>
          </div>
          <Badge variant={ESTADO_CAND[estado]?.variant ?? "muted"} dot>
            {ESTADO_CAND[estado]?.label}
          </Badge>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Oferta */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.11em",
                color: "var(--color-text-subtle)",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Oferta
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {candidatura.oferta_titulo}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "var(--color-text-muted)",
              }}
            >
              {candidatura.modalidad && <span>{candidatura.modalidad}</span>}
              {candidatura.ubicacion && <span> · {candidatura.ubicacion}</span>}
            </p>
          </div>

          {/* Mensaje del estudiante */}
          {candidatura.comentario_estudiante && (
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.11em",
                  color: "var(--color-text-subtle)",
                  fontWeight: 700,
                }}
              >
                Mensaje del estudiante
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                {candidatura.comentario_estudiante}
              </p>
            </div>
          )}

          {/* Respuesta empresa */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.11em",
                color: "var(--color-text-subtle)",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Tu respuesta (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 400))}
              rows={3}
              placeholder="Escribe un mensaje para el estudiante…"
              className="input-field"
              style={{ resize: "none", fontSize: 12 }}
            />
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 10,
                color: "var(--color-text-subtle)",
                textAlign: "right",
              }}
            >
              {comentario.length}/400
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>

            {estado !== "rechazado" && (
              <button
                onClick={() => handleGuardar("rechazado")}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(248,113,113,0.08)",
                  color: "#f87171",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                Rechazar
              </button>
            )}

            {estado !== "revisando" && estado !== "aceptado" && (
              <button
                onClick={() => handleGuardar("revisando")}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(251,191,36,0.3)",
                  background: "rgba(251,191,36,0.08)",
                  color: "#fbbf24",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                En revisión
              </button>
            )}

            {estado !== "aceptado" && (
              <button
                onClick={() => handleGuardar("aceptado")}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(192,255,114,0.35)",
                  background: "rgba(192,255,114,0.12)",
                  color: "var(--color-brand)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Guardando…" : "✓ Aceptar"}
              </button>
            )}
          </div>

          {estado === "aceptado" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleGuardar(estado)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(192,255,114,0.35)",
                  background: "rgba(192,255,114,0.08)",
                  color: "var(--color-brand)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Guardando…" : "Guardar comentario"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ComapnyPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const [empresa, setEmpresa] = useState(null);
  const [stats, setStats] = useState({
    ofertas: 0,
    candidaturas: 0,
    estudiantes: 0,
    convenios: 0,
    aceptados: 0,
  });
  const [ofertas, setOfertas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [estudiantesActivos, setEstudiantesActivos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [convenios, setConvenios] = useState([]);

  const [searchCand, setSearchCand] = useState("");
  const [filtroCand, setFiltroCand] = useState("todos");
  const [filtroOferta, setFiltroOferta] = useState("todas");
  const [searchEst, setSearchEst] = useState("");
  const [candModal, setCandModal] = useState(null);
  const [inviteTutorModal, setInviteTutorModal] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cargarTodo = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // ── Empresa ──────────────────────────────────────────────────────────────
    const { data: empData } = await supabase
      .from("empresa")
      .select(
        "id, nombre, cif, descripcion, sector, ciudad, web, telefono, email_contacto, linkedin, verificado, tamano",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!mountedRef.current) return;
    setEmpresa(empData ?? null);
    if (!empData) {
      setLoading(false);
      return;
    }

    const idEmpresa = empData.id;

    // ── Ofertas ───────────────────────────────────────────────────────────────
    const { data: ofertasData } = await supabase
      .from("oferta")
      .select(
        `
        id_oferta, titulo, descripcion, modalidad, ubicacion,
        duracion_semanas, horas_semanales, num_plazas, num_plazas_restantes,
        opcion_contrato, estado, fecha_publicacion, fecha_fin_solicitud,
        tipo_oferta, salario_mensual, fecha_inicio
      `,
      )
      .eq("id_empresa", idEmpresa)
      .order("fecha_publicacion", { ascending: false });

    const ofertasRows = ofertasData ?? [];

    // Tecnologías de las ofertas
    const ofertaIds = ofertasRows.map((o) => o.id_oferta);
    let tecMap = {};
    if (ofertaIds.length > 0) {
      const { data: tecRows } = await supabase
        .from("oferta_tecnologia")
        .select("id_oferta, tecnologia:id_tecnologia(id_tecnologia, nombre)")
        .in("id_oferta", ofertaIds);
      (tecRows ?? []).forEach((r) => {
        if (!tecMap[r.id_oferta]) tecMap[r.id_oferta] = [];
        if (r.tecnologia) tecMap[r.id_oferta].push(r.tecnologia);
      });
    }

    const ofertasEnriquecidas = ofertasRows.map((o) => ({
      ...o,
      tecnologias: tecMap[o.id_oferta] ?? [],
    }));

    // ── Candidaturas ──────────────────────────────────────────────────────────
    const { data: candData } = await supabase
      .from("candidatura")
      .select(
        "id_candidatura, estado, fecha_envio, comentario_empresa, comentario_estudiante, id_estudiante, id_oferta",
      )
      .in(
        "id_oferta",
        ofertaIds.length > 0
          ? ofertaIds
          : ["00000000-0000-0000-0000-000000000000"],
      )
      .order("fecha_envio", { ascending: false });

    const candRows = candData ?? [];

    // Datos de estudiantes
    const estIds = [
      ...new Set(candRows.map((c) => c.id_estudiante).filter(Boolean)),
    ];
    let estMap = {};
    if (estIds.length > 0) {
      const { data: estRows } = await supabase
        .from("estudiante")
        .select("id, nombre, apellidos, titulacion, ciudad")
        .in("id", estIds);
      (estRows ?? []).forEach((e) => {
        estMap[e.id] = e;
      });
    }

    // Mapa oferta id → oferta
    const ofertaMap = {};
    ofertasEnriquecidas.forEach((o) => {
      ofertaMap[o.id_oferta] = o;
    });

    const candEnriquecidas = candRows.map((c) => ({
      ...c,
      estudiante_nombre: estMap[c.id_estudiante]
        ? [estMap[c.id_estudiante].nombre, estMap[c.id_estudiante].apellidos]
            .filter(Boolean)
            .join(" ")
        : "—",
      titulacion: estMap[c.id_estudiante]?.titulacion ?? null,
      ciudad: estMap[c.id_estudiante]?.ciudad ?? null,
      oferta_titulo: ofertaMap[c.id_oferta]?.titulo ?? "—",
      modalidad: ofertaMap[c.id_oferta]?.modalidad ?? null,
      ubicacion: ofertaMap[c.id_oferta]?.ubicacion ?? null,
      tipo_oferta: ofertaMap[c.id_oferta]?.tipo_oferta ?? null,
    }));

    // ── Estudiantes activos (empresa_estudiante) ──────────────────────────────
    const { data: eeData } = await supabase
      .from("empresa_estudiante")
      .select("id, id_estudiante, tipo, fecha_inicio, fecha_fin, activo")
      .eq("id_empresa", idEmpresa)
      .eq("activo", true);

    const eeRows = eeData ?? [];
    const eeEstIds = [
      ...new Set(eeRows.map((r) => r.id_estudiante).filter(Boolean)),
    ];
    let eeEstMap = { ...estMap };
    const missingIds = eeEstIds.filter((id) => !eeEstMap[id]);
    if (missingIds.length > 0) {
      const { data: mRows } = await supabase
        .from("estudiante")
        .select("id, nombre, apellidos, titulacion, ciudad")
        .in("id", missingIds);
      (mRows ?? []).forEach((e) => {
        eeEstMap[e.id] = e;
      });
    }

    const estActivos = eeRows.map((r) => ({
      ...r,
      nombre: eeEstMap[r.id_estudiante]
        ? [
            eeEstMap[r.id_estudiante].nombre,
            eeEstMap[r.id_estudiante].apellidos,
          ]
            .filter(Boolean)
            .join(" ")
        : "—",
      titulacion: eeEstMap[r.id_estudiante]?.titulacion ?? null,
      ciudad: eeEstMap[r.id_estudiante]?.ciudad ?? null,
    }));

    // ── Tutores de la empresa ─────────────────────────────────────────────────
    const { data: etRows } = await supabase
      .from("empresa_tutor")
      .select("id_tutor")
      .eq("id_empresa", idEmpresa);

    const tutorIds = (etRows ?? []).map((r) => r.id_tutor);
    let tutoresData = [];
    if (tutorIds.length > 0) {
      const { data: tRows } = await supabase
        .from("tutor_empresa")
        .select("id, nombre, cargo, telefono")
        .in("id", tutorIds);
      tutoresData = tRows ?? [];
    }

    // ── Convenios ─────────────────────────────────────────────────────────────
    const { data: convData } = await supabase
      .from("convenio")
      .select("id, id_centro, estado, fecha_propuesta, fecha_aceptacion")
      .eq("id_empresa", idEmpresa);

    const convRows = convData ?? [];
    const centroIds = [
      ...new Set(convRows.map((c) => c.id_centro).filter(Boolean)),
    ];
    let centroMap = {};
    if (centroIds.length > 0) {
      const { data: cRows } = await supabase
        .from("centro_educativo")
        .select("id, nombre, ciudad, provincia")
        .in("id", centroIds);
      (cRows ?? []).forEach((c) => {
        centroMap[c.id] = c;
      });
    }

    const conveniosEnriquecidos = convRows.map((c) => ({
      ...c,
      centro_nombre: centroMap[c.id_centro]?.nombre ?? "—",
      centro_ciudad: centroMap[c.id_centro]?.ciudad ?? null,
      centro_provincia: centroMap[c.id_centro]?.provincia ?? null,
    }));

    // ── Stats ─────────────────────────────────────────────────────────────────
    const aceptados = candRows.filter((c) => c.estado === "aceptado").length;

    if (!mountedRef.current) return;
    setOfertas(ofertasEnriquecidas);
    setCandidaturas(candEnriquecidas);
    setEstudiantesActivos(estActivos);
    setTutores(tutoresData);
    setConvenios(conveniosEnriquecidos);
    setStats({
      ofertas: ofertasEnriquecidas.length,
      candidaturas: candRows.length,
      estudiantes: estActivos.length,
      convenios: conveniosEnriquecidos.filter((c) => c.estado === "activo")
        .length,
      aceptados,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const ofertasFiltradas = ofertas.filter(
    (o) => filtroOferta === "todas" || o.estado === filtroOferta,
  );

  const candFiltradas = candidaturas.filter((c) => {
    const q = searchCand.toLowerCase();
    const matchSearch =
      !q ||
      c.estudiante_nombre.toLowerCase().includes(q) ||
      c.oferta_titulo.toLowerCase().includes(q);
    const matchFiltro = filtroCand === "todos" || c.estado === filtroCand;
    return matchSearch && matchFiltro;
  });

  const estFiltrados = estudiantesActivos.filter((e) => {
    const q = searchEst.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.titulacion ?? "").toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: "resumen", label: "Resumen" },
    { id: "ofertas", label: "Ofertas" },
    { id: "candidaturas", label: "Candidaturas" },
    { id: "estudiantes", label: "Estudiantes activos" },
    { id: "tutores", label: "Tutores" },
    { id: "convenios", label: "Convenios" },
  ];

  const candPendientes = candidaturas.filter(
    (c) => c.estado === "pendiente" || c.estado === "revisando",
  ).length;

  return (
    <MainLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "var(--color-text)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "32px 24px 64px",
            animation: "fadeUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--color-brand)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--color-text-muted)",
                  fontWeight: 700,
                }}
              >
                Empresa
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--color-text)",
                  letterSpacing: "-0.03em",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Panel de empresa
              </h1>
              {candPendientes > 0 && (
                <span
                  style={{
                    background: "rgba(251,191,36,0.15)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    color: "#fbbf24",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {candPendientes} candidatura{candPendientes !== 1 ? "s" : ""}{" "}
                  pendiente{candPendientes !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              {empresa
                ? `${empresa.nombre}${empresa.ciudad ? ` — ${empresa.ciudad}` : ""}${empresa.sector ? ` · ${empresa.sector}` : ""}`
                : "Cargando…"}
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 11,
              padding: 3,
              marginBottom: 24,
              overflowX: "auto",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                  background:
                    activeTab === tab.id
                      ? "var(--color-surface-elevated)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  boxShadow:
                    activeTab === tab.id
                      ? "0 1px 4px rgba(0,0,0,0.35)"
                      : "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "1px solid rgba(192,255,114,0.18)"
                      : "1px solid transparent",
                }}
              >
                {tab.label}
                {tab.id === "candidaturas" && candPendientes > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: "rgba(251,191,36,0.2)",
                      color: "#fbbf24",
                      borderRadius: 999,
                      padding: "1px 6px",
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    {candPendientes}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div style={{ animation: "fadeUp 0.22s ease" }}>
              {/* ══ RESUMEN ══ */}
              {activeTab === "resumen" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 8,
                    }}
                  >
                    <StatCard
                      label="Ofertas activas"
                      value={
                        ofertas.filter((o) => o.estado === "activa").length
                      }
                      sub="publicadas"
                      accent
                    />
                    <StatCard
                      label="Candidaturas"
                      value={stats.candidaturas}
                      sub="Total recibidas"
                    />
                    <StatCard
                      label="Aceptadas"
                      value={stats.aceptados}
                      sub="Estudiantes seleccionados"
                    />
                    <StatCard
                      label="En prácticas"
                      value={
                        estudiantesActivos.filter((e) => e.tipo === "practicas")
                          .length
                      }
                      sub="Actualmente"
                    />
                    <StatCard
                      label="Contratados"
                      value={
                        estudiantesActivos.filter(
                          (e) => e.tipo === "contratado",
                        ).length
                      }
                      sub="Actualmente"
                    />
                    <StatCard
                      label="Convenios"
                      value={stats.convenios}
                      sub="Con centros activos"
                    />
                  </div>

                  {/* Candidaturas recientes */}
                  <div>
                    <SectionHeader
                      title="Candidaturas recientes"
                      subtitle="Últimas postulaciones recibidas"
                    />
                    <Table
                      headers={["Estudiante", "Oferta", "Fecha", "Estado", ""]}
                      empty={
                        candidaturas.length === 0
                          ? "Sin candidaturas aún."
                          : undefined
                      }
                    >
                      {candidaturas.slice(0, 6).map((c, i) => (
                        <TR
                          key={c.id_candidatura}
                          last={i === Math.min(candidaturas.length, 6) - 1}
                          cells={[
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Avatar name={c.estudiante_nombre} size={28} />
                              <div>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    color: "var(--color-text)",
                                    fontSize: 11,
                                  }}
                                >
                                  {c.estudiante_nombre}
                                </p>
                                {c.titulacion && (
                                  <p
                                    style={{
                                      margin: "1px 0 0",
                                      fontSize: 10,
                                      color: "var(--color-text-subtle)",
                                    }}
                                  >
                                    {c.titulacion}
                                  </p>
                                )}
                              </div>
                            </div>,
                            <span
                              style={{
                                color: "var(--color-text-muted)",
                                fontSize: 11,
                              }}
                            >
                              {c.oferta_titulo}
                            </span>,
                            <span
                              style={{
                                color: "var(--color-text-subtle)",
                                fontSize: 10,
                              }}
                            >
                              {c.fecha_envio
                                ? new Date(c.fecha_envio).toLocaleDateString(
                                    "es-ES",
                                  )
                                : "—"}
                            </span>,
                            <Badge
                              variant={
                                ESTADO_CAND[c.estado]?.variant ?? "muted"
                              }
                              dot
                            >
                              {ESTADO_CAND[c.estado]?.label}
                            </Badge>,
                            <button
                              onClick={() => setCandModal(c)}
                              style={{
                                padding: "3px 10px",
                                borderRadius: 6,
                                border: "1px solid var(--color-border-strong)",
                                background: "transparent",
                                color: "var(--color-text-muted)",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              Gestionar
                            </button>,
                          ]}
                        />
                      ))}
                    </Table>
                  </div>
                </div>
              )}

              {/* ══ OFERTAS ══ */}
              {activeTab === "ofertas" && (
                <div>
                  <SectionHeader
                    title="Mis ofertas"
                    subtitle={`${ofertas.length} ofertas publicadas`}
                    action={
                      <div style={{ display: "flex", gap: 6 }}>
                        {["todas", "activa", "cerrada"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFiltroOferta(f)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 20,
                              fontFamily: "inherit",
                              cursor: "pointer",
                              border: `1px solid ${filtroOferta === f ? "rgba(192,255,114,0.4)" : "var(--color-border)"}`,
                              background:
                                filtroOferta === f
                                  ? "rgba(192,255,114,0.1)"
                                  : "transparent",
                              color:
                                filtroOferta === f
                                  ? "var(--color-brand)"
                                  : "var(--color-text-muted)",
                              fontSize: 10,
                              fontWeight: 600,
                              transition: "all 0.15s",
                            }}
                          >
                            {f === "todas"
                              ? "Todas"
                              : f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    }
                  />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {ofertasFiltradas.length === 0 && (
                      <p
                        style={{
                          color: "var(--color-text-subtle)",
                          fontSize: 12,
                        }}
                      >
                        No hay ofertas con ese filtro.
                      </p>
                    )}
                    {ofertasFiltradas.map((o) => {
                      const meta = TIPO_OFERTA[o.tipo_oferta] ?? {
                        label: "Oferta",
                        accent: "var(--color-text-muted)",
                      };
                      const candOferta = candidaturas.filter(
                        (c) => c.id_oferta === o.id_oferta,
                      );
                      const pendientes = candOferta.filter(
                        (c) =>
                          c.estado === "pendiente" || c.estado === "revisando",
                      ).length;
                      return (
                        <div
                          key={o.id_oferta}
                          style={{
                            background: "var(--color-surface-strong)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: 3,
                              background: `linear-gradient(90deg, ${meta.accent}99, transparent)`,
                            }}
                          />
                          <div
                            style={{
                              padding: "14px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                  marginBottom: 4,
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "var(--color-text)",
                                  }}
                                >
                                  {o.titulo}
                                </p>
                                {o.estado === "activa" ? (
                                  <Badge variant="success" dot>
                                    Activa
                                  </Badge>
                                ) : (
                                  <Badge variant="muted" dot>
                                    Cerrada
                                  </Badge>
                                )}
                                {pendientes > 0 && (
                                  <Badge variant="warning">
                                    {pendientes} pend.
                                  </Badge>
                                )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-subtle)",
                                  }}
                                >
                                  {meta.label}
                                </span>
                                {o.modalidad && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--color-text-subtle)",
                                    }}
                                  >
                                    · {o.modalidad}
                                  </span>
                                )}
                                {o.ubicacion && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--color-text-subtle)",
                                    }}
                                  >
                                    · {o.ubicacion}
                                  </span>
                                )}
                                {o.salario_mensual > 0 && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--color-brand)",
                                    }}
                                  >
                                    · {o.salario_mensual} €/mes
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-subtle)",
                                  }}
                                >
                                  · {o.num_plazas_restantes}/{o.num_plazas}{" "}
                                  plazas
                                </span>
                              </div>
                              {o.tecnologias.length > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    marginTop: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {o.tecnologias.slice(0, 6).map((t) => (
                                    <span
                                      key={t.id_tecnologia}
                                      style={{
                                        background:
                                          "var(--color-surface-elevated)",
                                        border:
                                          "1px solid var(--color-border-strong)",
                                        color: "var(--color-text-secondary)",
                                        fontSize: 9,
                                        padding: "2px 7px",
                                        borderRadius: 5,
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {t.nombre}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 4,
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 22,
                                  fontWeight: 800,
                                  color: "var(--color-brand)",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {candOferta.length}
                              </span>
                              <span
                                style={{
                                  fontSize: 9,
                                  color: "var(--color-text-subtle)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                candidatos
                              </span>
                              {o.fecha_fin_solicitud && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-subtle)",
                                  }}
                                >
                                  Cierre{" "}
                                  {new Date(
                                    o.fecha_fin_solicitud,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══ CANDIDATURAS ══ */}
              {activeTab === "candidaturas" && (
                <div>
                  <SectionHeader
                    title="Candidaturas recibidas"
                    subtitle={`${candidaturas.length} total · ${candPendientes} pendientes de revisión`}
                    action={
                      <SearchInput
                        value={searchCand}
                        onChange={setSearchCand}
                        placeholder="Buscar…"
                      />
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      { key: "todos", label: "Todas" },
                      { key: "pendiente", label: "Pendientes" },
                      { key: "revisando", label: "En revisión" },
                      { key: "aceptado", label: "Aceptadas" },
                      { key: "rechazado", label: "Rechazadas" },
                      { key: "retirado", label: "Retiradas" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFiltroCand(f.key)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          border: `1px solid ${filtroCand === f.key ? "rgba(192,255,114,0.4)" : "var(--color-border)"}`,
                          background:
                            filtroCand === f.key
                              ? "rgba(192,255,114,0.1)"
                              : "transparent",
                          color:
                            filtroCand === f.key
                              ? "var(--color-brand)"
                              : "var(--color-text-muted)",
                          fontSize: 10,
                          fontWeight: 600,
                          transition: "all 0.15s",
                        }}
                      >
                        {f.label}
                        <span style={{ marginLeft: 5, opacity: 0.7 }}>
                          {f.key === "todos"
                            ? candidaturas.length
                            : candidaturas.filter((c) => c.estado === f.key)
                                .length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Table
                    headers={[
                      "Estudiante",
                      "Oferta",
                      "Fecha",
                      "Estado",
                      "Acciones",
                    ]}
                    empty={
                      candFiltradas.length === 0
                        ? "No hay candidaturas con ese filtro."
                        : undefined
                    }
                  >
                    {candFiltradas.map((c, i) => (
                      <TR
                        key={c.id_candidatura}
                        last={i === candFiltradas.length - 1}
                        cells={[
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Avatar name={c.estudiante_nombre} size={28} />
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  fontSize: 11,
                                }}
                              >
                                {c.estudiante_nombre}
                              </p>
                              {c.titulacion && (
                                <p
                                  style={{
                                    margin: "1px 0 0",
                                    fontSize: 10,
                                    color: "var(--color-text-subtle)",
                                  }}
                                >
                                  {c.titulacion}
                                </p>
                              )}
                            </div>
                          </div>,
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: "var(--color-text-muted)",
                                fontStyle: "italic",
                              }}
                            >
                              {c.oferta_titulo}
                            </p>
                            {c.modalidad && (
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  fontSize: 9,
                                  color: "var(--color-text-subtle)",
                                }}
                              >
                                {c.modalidad}
                                {c.ubicacion ? ` · ${c.ubicacion}` : ""}
                              </p>
                            )}
                          </div>,
                          <span
                            style={{
                              color: "var(--color-text-subtle)",
                              fontSize: 10,
                            }}
                          >
                            {c.fecha_envio
                              ? new Date(c.fecha_envio).toLocaleDateString(
                                  "es-ES",
                                )
                              : "—"}
                          </span>,
                          <Badge
                            variant={ESTADO_CAND[c.estado]?.variant ?? "muted"}
                            dot
                          >
                            {ESTADO_CAND[c.estado]?.label}
                          </Badge>,
                          <div style={{ display: "flex", gap: 5 }}>
                            <button
                              onClick={() => setCandModal(c)}
                              style={{
                                padding: "3px 10px",
                                borderRadius: 6,
                                border: "1px solid var(--color-border-strong)",
                                background: "transparent",
                                color: "var(--color-text-muted)",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              {c.estado === "pendiente" ||
                              c.estado === "revisando"
                                ? "Gestionar"
                                : "Ver"}
                            </button>
                          </div>,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ ESTUDIANTES ACTIVOS ══ */}
              {activeTab === "estudiantes" && (
                <div>
                  <SectionHeader
                    title="Estudiantes activos"
                    subtitle={`${estudiantesActivos.length} vinculados actualmente`}
                    action={
                      <SearchInput
                        value={searchEst}
                        onChange={setSearchEst}
                        placeholder="Buscar alumno…"
                      />
                    }
                  />
                  <Table
                    headers={[
                      "Estudiante",
                      "Tipo",
                      "Tutor asignado",
                      "Fecha inicio",
                      "Estado",
                    ]}
                    empty={
                      estFiltrados.length === 0
                        ? "No hay estudiantes activos."
                        : undefined
                    }
                  >
                    {estFiltrados.map((e, i) => {
                      const tutor = tutores[0];
                      return (
                        <TR
                          key={e.id}
                          last={i === estFiltrados.length - 1}
                          cells={[
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Avatar name={e.nombre} size={28} />
                              <div>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    color: "var(--color-text)",
                                    fontSize: 11,
                                  }}
                                >
                                  {e.nombre}
                                </p>
                                {e.titulacion && (
                                  <p
                                    style={{
                                      margin: "1px 0 0",
                                      fontSize: 10,
                                      color: "var(--color-text-subtle)",
                                    }}
                                  >
                                    {e.titulacion}
                                  </p>
                                )}
                              </div>
                            </div>,
                            <Badge
                              variant={
                                e.tipo === "contratado" ? "success" : "info"
                              }
                              dot
                            >
                              {e.tipo === "contratado"
                                ? "Contratado"
                                : "En prácticas"}
                            </Badge>,
                            <span
                              style={{
                                color: "var(--color-text-muted)",
                                fontSize: 11,
                              }}
                            >
                              {tutor?.nombre ?? "—"}
                            </span>,
                            <span
                              style={{
                                color: "var(--color-text-subtle)",
                                fontSize: 11,
                              }}
                            >
                              {e.fecha_inicio
                                ? new Date(e.fecha_inicio).toLocaleDateString(
                                    "es-ES",
                                  )
                                : "—"}
                            </span>,
                            <Badge variant="success" dot>
                              Activo
                            </Badge>,
                          ]}
                        />
                      );
                    })}
                  </Table>
                </div>
              )}

              {/* ══ TUTORES ══ */}
              {activeTab === "tutores" && (
                <div>
                  <SectionHeader
                    title="Tutores de empresa"
                    subtitle={`${tutores.length} tutores registrados`}
                    action={
                      <button
                        onClick={() => setInviteTutorModal(true)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 9,
                          border: "1px solid rgba(192,255,114,0.3)",
                          background: "rgba(192,255,114,0.1)",
                          color: "var(--color-brand)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        + Añadir tutor
                      </button>
                    }
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {tutores.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          background: "var(--color-surface-strong)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          padding: "16px 18px",
                          transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-border-strong)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-border)")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          <Avatar name={t.nombre} size={36} />
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "var(--color-text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.nombre}
                            </p>
                            <p
                              style={{
                                margin: "1px 0 0",
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.cargo ?? "—"}
                            </p>
                          </div>
                        </div>
                        {t.telefono && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 8,
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                color: "var(--color-text-subtle)",
                                flexShrink: 0,
                              }}
                            >
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
                            </svg>
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-subtle)",
                              }}
                            >
                              {t.telefono}
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            alignItems: "baseline",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "var(--color-brand)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {estudiantesActivos.length}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            alumnos activos
                          </span>
                        </div>
                      </div>
                    ))}
                    {tutores.length === 0 && (
                      <p
                        style={{
                          color: "var(--color-text-subtle)",
                          fontSize: 12,
                        }}
                      >
                        No hay tutores registrados.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ══ CONVENIOS ══ */}
              {activeTab === "convenios" && (
                <div>
                  <SectionHeader
                    title="Convenios con centros"
                    subtitle={`${convenios.length} convenios · ${convenios.filter((c) => c.estado === "activo").length} activos`}
                  />
                  <Table
                    headers={[
                      "Centro educativo",
                      "Ciudad",
                      "Fecha propuesta",
                      "Fecha aceptación",
                      "Estado",
                    ]}
                    empty={
                      convenios.length === 0
                        ? "Sin convenios registrados."
                        : undefined
                    }
                  >
                    {convenios.map((c, i) => (
                      <TR
                        key={c.id}
                        last={i === convenios.length - 1}
                        cells={[
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Avatar name={c.centro_nombre} size={28} square />
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  fontSize: 11,
                                }}
                              >
                                {c.centro_nombre}
                              </p>
                              {c.centro_provincia && (
                                <p
                                  style={{
                                    margin: "1px 0 0",
                                    fontSize: 10,
                                    color: "var(--color-text-subtle)",
                                  }}
                                >
                                  {c.centro_provincia}
                                </p>
                              )}
                            </div>
                          </div>,
                          <span
                            style={{
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                            }}
                          >
                            {c.centro_ciudad ?? "—"}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-subtle)",
                              fontSize: 10,
                            }}
                          >
                            {c.fecha_propuesta
                              ? new Date(c.fecha_propuesta).toLocaleDateString(
                                  "es-ES",
                                )
                              : "—"}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-subtle)",
                              fontSize: 10,
                            }}
                          >
                            {c.fecha_aceptacion
                              ? new Date(c.fecha_aceptacion).toLocaleDateString(
                                  "es-ES",
                                )
                              : "—"}
                          </span>,
                          <Badge
                            variant={
                              ESTADO_CONVENIO[c.estado]?.variant ?? "muted"
                            }
                            dot
                          >
                            {ESTADO_CONVENIO[c.estado]?.label ?? c.estado}
                          </Badge>,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal candidatura */}
      {candModal && (
        <CandidaturaModal
          candidatura={candModal}
          empresaId={empresa?.id}
          empresaNombre={empresa?.nombre ?? "Empresa"}
          onClose={() => setCandModal(null)}
          onUpdate={cargarTodo}
        />
      )}
      {inviteTutorModal && (
        <InviteModal
          user={user}
          onClose={() => setInviteTutorModal(false)}
          entityType="tutor_empresa"
          inviteRoute="/tutor/registro"
          expiresInHours={48}
          title="Añadir tutor de empresa"
          description="Genera un enlace para que el tutor cree su cuenta y quede vinculado a tu empresa."
          warningText="El tutor tendrá acceso a los alumnos asignados. Comparte este enlace solo con la persona correspondiente."
          roleLabel="tutor"
          inviterName={empresa?.nombre ?? "la empresa"}
        />
      )}
    </MainLayout>
  );
}
