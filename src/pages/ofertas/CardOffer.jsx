// ─── OfertaCard.jsx ──────────────────────────────────────────────────────────
// Componente reutilizable para mostrar una tarjeta de oferta.
//
// Props:
//   oferta        – objeto normalizado con los campos de la oferta
//   onVerDetalle  – fn(oferta)    → abre modal de detalle
//   isEmpresa     – boolean       → muestra acciones de editar/eliminar
//   onEdit        – fn(oferta)    → abre modal de edición
//   onDelete      – fn(id_oferta) → elimina la oferta
//   yaPostulado   – boolean       → badge "Postulado" para estudiantes

const TIPO_META = {
  practicas:               { label: "Prácticas",           color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  practicas_contratacion:  { label: "Prácticas + contrato", color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  empleo_junior:           { label: "Junior",               color: "#a855f7", bg: "rgba(168,85,247,0.12)"  },
};

const ESTADO_META = {
  activa:    { label: "Activa",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: "✓"  },
  pendiente: { label: "Pendiente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: "⏳" },
  rechazada: { label: "Rechazada", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: "✗"  },
  cerrada:   { label: "Cerrada",   color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: "●"  },
};

const MODALIDAD_ICON = { Presencial: "🏢", Remoto: "🌐", Híbrido: "⚡" };

// ── Pequeños helpers de estilo ───────────────────────────────────────────────
const pill = (color, bg) => ({
  display: "inline-flex", alignItems: "center",
  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
  borderRadius: "100px", color, background: bg,
  border: `1px solid ${color}33`, whiteSpace: "nowrap",
  lineHeight: 1.4,
});

const metaItem = {
  display: "flex", alignItems: "center", gap: "5px",
  fontSize: "12px", color: "rgba(156,163,175,0.9)",
};

// ── Ícono de reloj ────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function CardOffer({
  oferta,
  onVerDetalle,
  isEmpresa   = false,
  onEdit,
  onDelete,
  yaPostulado = false,
}) {
  const tipo    = TIPO_META[oferta.tipo_oferta]  ?? { label: "Oferta",   color: "#6b7280", bg: "rgba(107,114,128,0.12)" };
  const estado  = ESTADO_META[oferta.estado]     ?? null;
  const techs   = oferta.tecnologias             ?? [];
  const empresa = oferta.empresa_nombre          ?? "Empresa";

  // Días restantes para el cierre de solicitudes
  let diasRestantes = null;
  if (oferta.fecha_fin_solicitud) {
    diasRestantes = Math.ceil(
      (new Date(oferta.fecha_fin_solicitud) - new Date()) / (1000 * 60 * 60 * 24)
    );
  }

  return (
    <article
      style={{
        position: "relative",
        background: "rgba(17,24,39,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${tipo.color}55`;
        e.currentTarget.style.boxShadow   = `0 8px 30px ${tipo.color}14`;
        e.currentTarget.style.transform   = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow   = "none";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      {/* Franja de color superior según tipo de oferta */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${tipo.color}, ${tipo.color}55)`, flexShrink: 0 }} />

      {/* ── Cuerpo principal ── */}
      <div
        onClick={() => onVerDetalle(oferta)}
        style={{ padding: "18px 18px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* Header: logo empresa + título + badges de estado */}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {/* Avatar empresa */}
          <div style={{
            width: "42px", height: "42px", borderRadius: "11px", flexShrink: 0,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {oferta.empresa_avatar
              ? <img src={oferta.empresa_avatar} alt={empresa} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "20px" }}>🏢</span>
            }
          </div>

          {/* Título + empresa */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0, fontSize: "14px", fontWeight: 700,
              color: "#f9fafb", lineHeight: 1.35,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {oferta.titulo}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(156,163,175,0.9)", fontWeight: 500 }}>
              {empresa}
            </p>
          </div>
        </div>

        {/* Badges: tipo + modalidad + ubicación + opción contrato */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          <span style={pill(tipo.color, tipo.bg)}>{tipo.label}</span>

          {oferta.modalidad && (
            <span style={pill("rgba(156,163,175,0.85)", "rgba(255,255,255,0.05)")}>
              {MODALIDAD_ICON[oferta.modalidad]} {oferta.modalidad}
            </span>
          )}

          {oferta.ubicacion && (
            <span style={pill("rgba(156,163,175,0.85)", "rgba(255,255,255,0.05)")}>
              📍 {oferta.ubicacion}
            </span>
          )}

          {oferta.opcion_contrato && (
            <span style={pill("#22c55e", "rgba(34,197,94,0.10)")}>💼 Con contrato</span>
          )}
        </div>

        {/* Descripción (2 líneas) */}
        {oferta.descripcion && (
          <p style={{
            margin: 0, fontSize: "12.5px", color: "rgba(107,114,128,0.9)",
            lineHeight: 1.55, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {oferta.descripcion}
          </p>
        )}

        {/* Tecnologías */}
        {techs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {techs.slice(0, 5).map(t => (
              <span key={t.id_tecnologia ?? t} style={{
                fontSize: "11px", fontWeight: 500, padding: "2px 8px",
                borderRadius: "6px", color: "rgba(156,163,175,0.85)",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}>
                {t.nombre ?? t}
              </span>
            ))}
            {techs.length > 5 && (
              <span style={{ fontSize: "11px", color: "rgba(107,114,128,0.7)", padding: "2px 4px", alignSelf: "center" }}>
                +{techs.length - 5} más
              </span>
            )}
          </div>
        )}

        {/* Meta info: duración, plazas, salario, días restantes */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "10px",
          paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: "auto",
        }}>
          {oferta.duracion_semanas && (
            <span style={metaItem}><IconClock />{oferta.duracion_semanas} sem.</span>
          )}
          {oferta.horas_semanales && (
            <span style={metaItem}>⏱ {oferta.horas_semanales}h/sem.</span>
          )}
          {oferta.num_plazas_restantes != null && (
            <span style={metaItem}><IconUsers />{oferta.num_plazas_restantes} plaza{oferta.num_plazas_restantes !== 1 ? "s" : ""}</span>
          )}
          {oferta.salario_mensual
            ? <span style={{ ...metaItem, color: "#818cf8", fontWeight: 700 }}>💶 {oferta.salario_mensual}€/mes</span>
            : <span style={{ ...metaItem, opacity: 0.6 }}>No remunerado</span>
          }

          {/* Días restantes (alineado a la derecha) */}
          {diasRestantes !== null && diasRestantes > 0 && (
            <span style={{
              ...metaItem, marginLeft: "auto",
              color: diasRestantes <= 7 ? "#f59e0b" : "rgba(107,114,128,0.7)",
              fontWeight: diasRestantes <= 7 ? 700 : 400,
            }}>
              {diasRestantes <= 7 ? "⚡" : "📅"} {diasRestantes}d
            </span>
          )}
          {diasRestantes !== null && diasRestantes <= 0 && (
            <span style={{ ...metaItem, marginLeft: "auto", color: "#ef4444", fontWeight: 700 }}>Plazo cerrado</span>
          )}
        </div>
      </div>

      {/* Badge estado (empresa) – posición absoluta sobre la tarjeta */}
      {isEmpresa && estado && (
        <span style={{
          ...pill(estado.color, estado.bg),
          position: "absolute", top: "14px", right: "14px",
          zIndex: 1,
        }}>
          {estado.icon} {estado.label}
        </span>
      )}

      {/* Badge "Ya postulado" (estudiante) */}
      {!isEmpresa && yaPostulado && (
        <span style={{
          ...pill("#22c55e", "rgba(34,197,94,0.12)"),
          position: "absolute", top: "14px", right: "14px",
          zIndex: 1,
        }}>
          ✓ Postulado
        </span>
      )}

      {/* ── Barra de acciones para empresa ── */}
      {isEmpresa && (
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(oferta); }}
            style={{
              flex: 1, padding: "9px 0", fontSize: "12px", fontWeight: 500,
              color: "rgba(156,163,175,0.8)", background: "transparent", border: "none",
              borderRight: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#f9fafb"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(156,163,175,0.8)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(oferta.id_oferta); }}
            style={{
              flex: 1, padding: "9px 0", fontSize: "12px", fontWeight: 500,
              color: "rgba(239,68,68,0.55)", background: "transparent", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.55)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}