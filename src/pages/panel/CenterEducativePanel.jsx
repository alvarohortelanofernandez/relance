import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

import InviteModalRaw from "../../components/InviteModal";
const InviteModal = /** @type {any} */ (InviteModalRaw);

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid var(--color-border-strong)",
          borderTopColor: "var(--color-brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

const ESTADO_EST = {
  en_practicas: {
    label: "En prácticas",
    dot: "var(--color-info)",
    badge: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.25)",
  },
  contratado: {
    label: "Contratado",
    dot: "var(--color-success)",
    badge: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.25)",
  },
  buscando: {
    label: "Buscando",
    dot: "var(--color-warning)",
    badge: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
  },
  pendiente: {
    label: "Pendiente",
    dot: "var(--color-text-subtle)",
    badge: "rgba(53,78,104,0.2)",
    border: "rgba(53,78,104,0.35)",
  },
};

const ESTADO_VINCULO = {
  pendiente: {
    label: "Pendiente",
    dot: "var(--color-warning)",
    badge: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
  },
  aceptado: {
    label: "Verificado",
    dot: "var(--color-success)",
    badge: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.25)",
  },
  rechazado: {
    label: "Rechazado",
    dot: "var(--color-error)",
    badge: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.25)",
  },
};

const ESTADO_CAND = {
  aceptado: {
    label: "Aceptada",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  rechazado: {
    label: "Rechazada",
    color: "var(--color-error)",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
  },
  revisando: {
    label: "En revisión",
    color: "var(--color-warning)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  retirado: {
    label: "Retirado",
    color: "var(--color-text-subtle)",
    bg: "rgba(53,78,104,0.15)",
    border: "rgba(53,78,104,0.3)",
  },
  pendiente: {
    label: "Pendiente",
    color: "var(--color-text-subtle)",
    bg: "rgba(53,78,104,0.15)",
    border: "rgba(53,78,104,0.3)",
  },
};

const ESTADO_ACUERDO = {
  activo: {
    label: "Activo",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  inactivo: {
    label: "Inactivo",
    color: "var(--color-text-subtle)",
    bg: "rgba(53,78,104,0.15)",
    border: "rgba(53,78,104,0.3)",
  },
  pendiente: {
    label: "Pendiente",
    color: "var(--color-warning)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  rechazado: {
    label: "Rechazado",
    color: "var(--color-error)",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
  },
};

function IconSearch() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}
function IconHandshake() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconGrid() {
  return (
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
  );
}
function IconChevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconDrag() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      {[0, 4, 8].map((y) => (
        <g key={y}>
          <circle cx="2" cy={y + 3} r="1" fill="currentColor" />
          <circle cx="7" cy={y + 3} r="1" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

function StatusBadge({ estado, map = ESTADO_EST }) {
  const cfg = map[estado] ?? map["pendiente"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 600,
        color: cfg.dot ?? cfg.color,
        background: cfg.badge ?? cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 20,
        padding: "2px 9px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
          }}
        />
      )}
      {cfg.label}
    </span>
  );
}

function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      <span style={{ color: "var(--color-brand)" }}>
        {"★".repeat(Math.round(r))}
      </span>
      <span style={{ color: "var(--color-text-subtle)" }}>
        {"☆".repeat(5 - Math.round(r))}
      </span>
      <span
        style={{
          color: "var(--color-text-muted)",
          marginLeft: 5,
          fontSize: 10,
        }}
      >
        {r.toFixed(1)}
      </span>
    </span>
  );
}

function Avatar({ name, size = 32 }) {
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
  const color = colors[name?.charCodeAt(0) % colors.length] ?? "#c0ff72";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
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

function StatCard({ label, value, sub, suffix = "", accent = false }) {
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
          fontSize: 30,
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
          display: "flex",
        }}
      >
        <IconSearch />
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

function AcuerdosTable({ acuerdos, loading }) {
  const [search, setSearch] = useState("");
  const filtrados = acuerdos.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.empresa.toLowerCase().includes(q) ||
      (a.sector ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <SectionHeader
        title="Acuerdos de colaboración"
        subtitle={`${acuerdos.length} empresas con acuerdo de prácticas`}
        action={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar empresa…"
          />
        }
      />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          headers={[
            "Empresa",
            "Sector",
            "Plazas ofertadas",
            "Alumnos activos",
            "Vigencia",
            "Estado",
          ]}
          empty={
            filtrados.length === 0 ? "No se encontraron acuerdos." : undefined
          }
        >
          {filtrados.map((a, i) => (
            <TR
              key={a.id}
              last={i === filtrados.length - 1}
              cells={[
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={a.empresa} size={28} />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: "var(--color-text)",
                        fontSize: 11,
                      }}
                    >
                      {a.empresa}
                    </p>
                    {a.contacto && (
                      <p
                        style={{
                          margin: "1px 0 0",
                          fontSize: 10,
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        {a.contacto}
                      </p>
                    )}
                  </div>
                </div>,
                <span
                  style={{ color: "var(--color-text-muted)", fontSize: 11 }}
                >
                  {a.sector ?? "—"}
                </span>,
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-text-muted)",
                    fontSize: 11,
                  }}
                >
                  {a.plazas ?? "—"}
                </span>,
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color:
                      a.alumnos_activos > 0
                        ? "var(--color-brand)"
                        : "var(--color-text-subtle)",
                    fontSize: 11,
                    fontWeight: a.alumnos_activos > 0 ? 700 : 400,
                  }}
                >
                  {a.alumnos_activos}
                </span>,
                <span
                  style={{ color: "var(--color-text-subtle)", fontSize: 10 }}
                >
                  {a.fecha_inicio && a.fecha_fin
                    ? `${new Date(a.fecha_inicio).toLocaleDateString("es-ES")} – ${new Date(a.fecha_fin).toLocaleDateString("es-ES")}`
                    : a.fecha_inicio
                      ? `Desde ${new Date(a.fecha_inicio).toLocaleDateString("es-ES")}`
                      : "—"}
                </span>,
                <StatusBadge
                  estado={a.estado ?? "activo"}
                  map={ESTADO_ACUERDO}
                />,
              ]}
            />
          ))}
        </Table>
      )}
    </div>
  );
}

// function DraggableStudent({ estudiante, fromTutorId, onDragStart, dragging }) {
//   const isBeingDragged = dragging?.estudiante?.id === estudiante.id;
//   const est = ESTADO_EST[estudiante.estado] ?? ESTADO_EST["pendiente"];
//   return (
//     <div
//       draggable
//       onDragStart={(e) => onDragStart(e, estudiante, fromTutorId)}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 7,
//         padding: "7px 9px",
//         borderRadius: 8,
//         background: isBeingDragged
//           ? "rgba(192,255,114,0.08)"
//           : "var(--color-surface-elevated)",
//         border: `1px solid ${isBeingDragged ? "rgba(192,255,114,0.28)" : "var(--color-border-subtle)"}`,
//         cursor: "grab",
//         opacity: isBeingDragged ? 0.5 : 1,
//         transition: "all 0.12s",
//         userSelect: "none",
//       }}
//       onMouseEnter={(e) => {
//         if (!isBeingDragged)
//           e.currentTarget.style.borderColor = "var(--color-border-strong)";
//       }}
//       onMouseLeave={(e) => {
//         if (!isBeingDragged)
//           e.currentTarget.style.borderColor = "var(--color-border-subtle)";
//       }}
//     >
//       <span
//         style={{
//           color: "var(--color-text-subtle)",
//           display: "flex",
//           flexShrink: 0,
//         }}
//       >
//         <IconDrag />
//       </span>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p
//           style={{
//             margin: 0,
//             fontSize: 11,
//             fontWeight: 600,
//             color: "var(--color-text)",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {estudiante.nombre}
//         </p>
//         <p
//           style={{
//             margin: "1px 0 0",
//             fontSize: 9,
//             color: "var(--color-text-muted)",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {estudiante.titulacion}
//         </p>
//       </div>
//       <span
//         style={{
//           width: 6,
//           height: 6,
//           borderRadius: "50%",
//           background: est.dot,
//           flexShrink: 0,
//         }}
//       />
//     </div>
//   );
// }

// ─── TUTOR ASSIGNMENT — actualiza centro_estudiante.id_tutor ──────────────────
// function TutorAssignment({ tutores, estudiantes, idCentro, onUpdate }) {
//   const [dragging, setDragging] = useState(null);
//   const [dragOver, setDragOver] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState(null);

//   const sinTutor = estudiantes.filter((e) => !e.id_tutor);
//   const porTutor = tutores.map((t) => ({
//     ...t,
//     alumnos: estudiantes.filter((e) => e.id_tutor === t.id),
//   }));

//   const showToast = (msg, ok = true) => {
//     setToast({ msg, ok });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleDragStart = (e, estudiante, fromTutorId) => {
//     setDragging({ estudiante, fromTutorId });
//     e.dataTransfer.effectAllowed = "move";
//   };

//   // ── Drop: actualiza id_tutor en centro_estudiante ─────────────────────────
//   const handleDrop = async (e, toTutorId) => {
//     e.preventDefault();
//     setDragOver(null);
//     if (!dragging) return;
//     if (dragging.fromTutorId === toTutorId) return;
//     setSaving(true);
//     try {
//       const estudianteId = dragging.estudiante.id;
//       const nuevoTutor = toTutorId === "sin_tutor" ? null : toTutorId;

//       const { error } = await supabase
//         .from("centro_estudiante")
//         .update({ id_tutor: nuevoTutor })
//         .eq("id_estudiante", estudianteId)
//         .eq("id_centro", idCentro);

//       if (error) throw error;

//       showToast(`${dragging.estudiante.nombre} reasignado correctamente`);
//       onUpdate();
//     } catch (err) {
//       showToast(err.message ?? "Error al reasignar", false);
//     } finally {
//       setSaving(false);
//       setDragging(null);
//     }
//   };

//   const DropZone = ({ id, label, alumnos, icon }) => (
//     <div
//       onDragOver={(e) => {
//         e.preventDefault();
//         setDragOver(id);
//       }}
//       onDragLeave={() => setDragOver(null)}
//       onDrop={(e) => handleDrop(e, id)}
//       style={{
//         background:
//           dragOver === id
//             ? "rgba(192,255,114,0.05)"
//             : "var(--color-surface-strong)",
//         border: `1.5px ${dragOver === id ? "solid rgba(192,255,114,0.35)" : "solid var(--color-border)"}`,
//         borderRadius: 12,
//         padding: "14px",
//         transition: "all 0.15s",
//         minHeight: 110,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//           marginBottom: 10,
//         }}
//       >
//         {icon}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p
//             style={{
//               margin: 0,
//               fontSize: 12,
//               fontWeight: 700,
//               color: "var(--color-text)",
//             }}
//           >
//             {label}
//           </p>
//           <p
//             style={{
//               margin: "1px 0 0",
//               fontSize: 10,
//               color: "var(--color-text-muted)",
//             }}
//           >
//             {alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}
//           </p>
//         </div>
//         <span
//           style={{
//             fontSize: 18,
//             fontWeight: 800,
//             color:
//               alumnos.length > 0
//                 ? "var(--color-brand)"
//                 : "var(--color-text-subtle)",
//             fontVariantNumeric: "tabular-nums",
//           }}
//         >
//           {alumnos.length}
//         </span>
//       </div>
//       {dragOver === id && (
//         <div
//           style={{
//             border: "1.5px dashed rgba(192,255,114,0.4)",
//             borderRadius: 8,
//             padding: "8px",
//             marginBottom: 6,
//             textAlign: "center",
//             fontSize: 10,
//             color: "var(--color-brand)",
//           }}
//         >
//           Soltar aquí
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
//         {alumnos.map((al) => (
//           <DraggableStudent
//             key={al.id}
//             estudiante={al}
//             fromTutorId={id}
//             onDragStart={handleDragStart}
//             dragging={dragging}
//           />
//         ))}
//         {alumnos.length === 0 && dragOver !== id && (
//           <p
//             style={{
//               fontSize: 10,
//               color: "var(--color-text-subtle)",
//               textAlign: "center",
//               padding: "10px 0",
//               margin: 0,
//             }}
//           >
//             Sin alumnos asignados
//           </p>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       {toast && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: 20,
//             right: 20,
//             zIndex: 999,
//             background: toast.ok
//               ? "rgba(74,222,128,0.14)"
//               : "rgba(248,113,113,0.14)",
//             border: `1px solid ${toast.ok ? "rgba(74,222,128,0.28)" : "rgba(248,113,113,0.28)"}`,
//             borderRadius: 10,
//             padding: "10px 16px",
//             fontSize: 12,
//             fontWeight: 600,
//             color: toast.ok ? "var(--color-success)" : "var(--color-error)",
//             backdropFilter: "blur(12px)",
//             display: "flex",
//             alignItems: "center",
//             gap: 7,
//           }}
//         >
//           <svg
//             width="12"
//             height="12"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="3"
//           >
//             {toast.ok ? (
//               <polyline points="20 6 9 17 4 12" />
//             ) : (
//               <>
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </>
//             )}
//           </svg>
//           {toast.msg}
//         </div>
//       )}
//       {saving && (
//         <div
//           style={{
//             position: "fixed",
//             top: 16,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 999,
//             background: "var(--color-surface-elevated)",
//             border: "1px solid var(--color-border-strong)",
//             borderRadius: 20,
//             padding: "6px 16px",
//             fontSize: 11,
//             color: "var(--color-text-secondary)",
//             backdropFilter: "blur(12px)",
//           }}
//         >
//           Guardando…
//         </div>
//       )}
//       <p
//         style={{
//           fontSize: 11,
//           color: "var(--color-text-muted)",
//           margin: "0 0 14px",
//         }}
//       >
//         Arrastra y suelta los alumnos entre tutores para reasignarlos.
//       </p>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
//           gap: 10,
//         }}
//       >
//         <DropZone
//           id="sin_tutor"
//           label="Sin tutor asignado"
//           alumnos={sinTutor}
//           icon={
//             <div
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: "50%",
//                 background: "var(--color-surface-elevated)",
//                 border: "1.5px dashed var(--color-border-strong)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <svg
//                 width="14"
//                 height="14"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 style={{ color: "var(--color-text-subtle)" }}
//               >
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="8" x2="12" y2="12" />
//                 <line x1="12" y1="16" x2="12.01" y2="16" />
//               </svg>
//             </div>
//           }
//         />
//         {porTutor.map((t) => (
//           <DropZone
//             key={t.id}
//             id={t.id}
//             label={t.nombre}
//             alumnos={t.alumnos}
//             icon={<Avatar name={t.nombre} size={32} />}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// ─── DRAGGABLE STUDENT ────────────────────────────────────────────────────────
function DraggableStudent({
  estudiante,
  fromContainerId,
  onDragStart,
  isSelected,
  isDisabled,
  isDimmed,
  onToggleSelect,
}) {
  const est = ESTADO_EST[estudiante.estado] ?? ESTADO_EST["pendiente"];

  return (
    <div
      draggable={!isDisabled}
      onDragStart={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", estudiante.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(estudiante.id, fromContainerId);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 9px",
        borderRadius: 8,
        background: isSelected
          ? "rgba(192,255,114,0.08)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${isSelected ? "rgba(192,255,114,0.4)" : "var(--color-border-subtle)"}`,
        cursor: isDisabled ? "not-allowed" : "grab",
        opacity: isDisabled ? 0.28 : isDimmed ? 0.52 : 1,
        transition: "all 0.12s",
        userSelect: "none",
        boxShadow: isSelected
          ? "0 0 0 1px rgba(192,255,114,0.15) inset"
          : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isDisabled)
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isDisabled)
          e.currentTarget.style.borderColor = "var(--color-border-subtle)";
      }}
    >
      {/* Checkbox */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleSelect(estudiante.id, fromContainerId);
        }}
        style={{
          width: 15,
          height: 15,
          borderRadius: 4,
          border: `1.5px solid ${isSelected ? "var(--color-brand)" : "var(--color-border-strong)"}`,
          background: isSelected ? "var(--color-brand)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
      >
        {isSelected && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0d1117"
            strokeWidth="3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Drag handle */}
      <span
        style={{
          color: "var(--color-text-subtle)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <IconDrag />
      </span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {estudiante.nombre}
        </p>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: 9,
            color: "var(--color-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {estudiante.titulacion}
        </p>
      </div>

      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: est.dot,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── DROP ZONE — definida FUERA de TutorAssignment para evitar remounts ───────
function DropZone({
  id,
  label,
  icon,
  alumnos,
  dragOverId,
  draggingInfo,
  selectedIds,
  selectionSource,
  hasSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onToggleSelect,
  onSelectAll,
}) {
  const dragCounterRef = useRef(0);
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      onDragOver(id); // solo activa al entrar de verdad
    }
  };

  const handleDragLeave = (e) => {
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      onDragLeave(); // solo desactiva al salir de verdad
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0; // reset al soltar
    onDrop(id);
  };

  const containerSelectedCount = alumnos.filter((a) =>
    selectedIds.has(a.id),
  ).length;
  const allSelectedInContainer =
    alumnos.length > 0 && alumnos.every((a) => selectedIds.has(a.id));
  const isDragTarget = dragOverId === id;
  const dragCount = draggingInfo?.studentIds?.length ?? 0;

  return (
    <div
      onDragEnter={handleDragEnter} // ← sustituye onDragOver para la activación
      onDragOver={(e) => e.preventDefault()} // ← solo para permitir el drop
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragTarget
          ? "rgba(192,255,114,0.05)"
          : "var(--color-surface-strong)",
        border: `1.5px solid ${isDragTarget ? "rgba(192,255,114,0.35)" : "var(--color-border)"}`,
        borderRadius: 12,
        padding: "14px",
        transition: "all 0.15s",
        minHeight: 110,
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {icon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: "1px 0 0",
              fontSize: 10,
              color: "var(--color-text-muted)",
            }}
          >
            {alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}
            {containerSelectedCount > 0 && (
              <span
                style={{
                  color: "var(--color-brand)",
                  fontWeight: 700,
                  marginLeft: 5,
                }}
              >
                · {containerSelectedCount} sel.
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color:
                alumnos.length > 0
                  ? "var(--color-brand)"
                  : "var(--color-text-subtle)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {alumnos.length}
          </span>
          {alumnos.length > 0 && (
            <button
              onClick={() => onSelectAll(id, alumnos)}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: `1px solid ${allSelectedInContainer ? "rgba(192,255,114,0.4)" : "var(--color-border)"}`,
                background: allSelectedInContainer
                  ? "rgba(192,255,114,0.1)"
                  : "transparent",
                color: allSelectedInContainer
                  ? "var(--color-brand)"
                  : "var(--color-text-muted)",
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {allSelectedInContainer ? "✓ Todos" : "Sel. todos"}
            </button>
          )}
        </div>
      </div>

      {/* Indicador drop */}
      {isDragTarget && (
        <div
          style={{
            border: "1.5px dashed rgba(192,255,114,0.4)",
            borderRadius: 8,
            padding: "8px",
            marginBottom: 6,
            textAlign: "center",
            fontSize: 10,
            color: "var(--color-brand)",
            fontWeight: 600,
          }}
        >
          Soltar aquí{dragCount > 1 ? ` (${dragCount} alumnos)` : ""}
        </div>
      )}

      {/* Alumnos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {alumnos.map((al) => {
          const isSelected = selectedIds.has(al.id);
          const isDisabled =
            hasSelection && selectionSource !== id && !isSelected;
          const isDimmed =
            hasSelection && selectionSource === id && !isSelected;
          return (
            <DraggableStudent
              key={al.id}
              estudiante={al}
              fromContainerId={id}
              onDragStart={onDragStart}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isDimmed={isDimmed}
              onToggleSelect={onToggleSelect}
            />
          );
        })}
        {alumnos.length === 0 && !isDragTarget && (
          <p
            style={{
              fontSize: 10,
              color: "var(--color-text-subtle)",
              textAlign: "center",
              padding: "10px 0",
              margin: 0,
            }}
          >
            Sin alumnos asignados
          </p>
        )}
      </div>
    </div>
  );
}

// ─── TUTOR ASSIGNMENT ─────────────────────────────────────────────────────────
function TutorAssignment({ tutores, estudiantes, idCentro, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionSource, setSelectionSource] = useState(null);
  const [crossWarning, setCrossWarning] = useState(null);
  const [draggingInfo, setDraggingInfo] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const sinTutor = estudiantes.filter((e) => !e.id_tutor);
  const porTutor = tutores.map((t) => ({
    ...t,
    alumnos: estudiantes.filter((e) => e.id_tutor === t.id),
  }));

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionSource(null);
  };

  const handleToggleSelect = (studentId, containerId) => {
    if (
      selectionSource &&
      selectionSource !== containerId &&
      selectedIds.size > 0
    ) {
      setCrossWarning({ studentId, containerId });
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
        if (next.size === 0) setSelectionSource(null);
      } else {
        next.add(studentId);
        setSelectionSource(containerId);
      }
      return next;
    });
  };

  const handleSelectAll = (containerId, alumnos) => {
    const allIds = alumnos.map((a) => a.id);
    const allSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
    if (
      selectionSource &&
      selectionSource !== containerId &&
      selectedIds.size > 0
    ) {
      setSelectedIds(new Set(allIds));
      setSelectionSource(containerId);
      return;
    }
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        if (next.size === 0) setSelectionSource(null);
        return next;
      });
    } else {
      setSelectedIds(new Set(allIds));
      setSelectionSource(containerId);
    }
  };

  // ── Drag — usamos ref para no perder estado durante el drag ───────────────
  const draggingRef = useRef(null);

  const handleDragStart = (studentId, fromContainerId) => {
    const studentIds =
      selectionSource === fromContainerId && selectedIds.size > 0
        ? [...selectedIds]
        : [studentId];
    const info = { studentIds, fromContainerId };
    draggingRef.current = info;
    setDraggingInfo(info);
  };

  const handleDragOver = (id) => setDragOverId(id);
  const handleDragLeave = () => setDragOverId(null);

  // const handleDragLeave = () => {
  //   setDragOverId(null);
  // };

  const handleDrop = async (toContainerId) => {
    setDragOverId(null);
    const info = draggingRef.current;
    if (!info) return;
    if (info.fromContainerId === toContainerId) {
      draggingRef.current = null;
      setDraggingInfo(null);
      return;
    }

    const draggedFrom = info.fromContainerId;
    const movedIds = info.studentIds;
    draggingRef.current = null;
    setDraggingInfo(null);

    setSaving(true);
    try {
      const nuevoTutor = toContainerId === "sin_tutor" ? null : toContainerId;

      for (const estudianteId of movedIds) {
        // 1. Actualiza centro_estudiante.id_tutor
        const { error: ceError } = await supabase
          .from("centro_estudiante")
          .update({ id_tutor: nuevoTutor })
          .eq("id_estudiante", estudianteId)
          .eq("id_centro", idCentro);
        if (ceError) throw ceError;

        // 2. Borra solo el vínculo de tipo "centro" en estudiante_tutor
        const { error: delError } = await supabase
          .from("estudiante_tutor")
          .delete()
          .eq("id_estudiante", estudianteId)
          .eq("tipo_tutor", "centro"); // ← solo el de centro, no toca empresa
        if (delError) throw delError;

        // 3. Si hay tutor destino, inserta el nuevo vínculo
        if (nuevoTutor !== null) {
          const { error: insError } = await supabase
            .from("estudiante_tutor")
            .insert({
              id_estudiante: estudianteId,
              id_tutor: nuevoTutor,
              tipo_tutor: "centro",
            });
          if (insError) throw insError;
        }
        // Si nuevoTutor === null, solo se hizo el delete → queda sin tutor de centro
      }

      const n = movedIds.length;
      showToast(
        `${n} ${n === 1 ? "alumno reasignado" : "alumnos reasignados"} correctamente`,
      );
      if (selectionSource === draggedFrom) setSelectionSource(toContainerId);
      onUpdate();
    } catch (err) {
      showToast(err.message ?? "Error al reasignar", false);
    } finally {
      setSaving(false);
    }
  };

  const handleCrossWarningSwitch = () => {
    if (!crossWarning) return;
    setSelectedIds(new Set([crossWarning.studentId]));
    setSelectionSource(crossWarning.containerId);
    setCrossWarning(null);
  };

  const hasSelection = selectedIds.size > 0;

  const sinTutorIcon = (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--color-surface-elevated)",
        border: "1.5px dashed var(--color-border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: "var(--color-text-subtle)" }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
  );

  const dropZoneProps = {
    dragOverId,
    draggingInfo,
    selectedIds,
    selectionSource,
    hasSelection,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDragStart: handleDragStart,
    onToggleSelect: handleToggleSelect,
    onSelectAll: handleSelectAll,
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 999,
            background: toast.ok
              ? "rgba(74,222,128,0.14)"
              : "rgba(248,113,113,0.14)",
            border: `1px solid ${toast.ok ? "rgba(74,222,128,0.28)" : "rgba(248,113,113,0.28)"}`,
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: toast.ok ? "var(--color-success)" : "var(--color-error)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            {toast.ok ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            )}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* Saving */}
      {saving && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 11,
            color: "var(--color-text-secondary)",
            backdropFilter: "blur(12px)",
          }}
        >
          Guardando…
        </div>
      )}

      {/* Aviso selección cruzada */}
      {crossWarning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setCrossWarning(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface-strong)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 16,
              padding: "24px 28px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--color-warning-bg)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
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
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-text)",
                  }}
                >
                  Selección en otro contenedor
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                  }}
                >
                  Tienes {selectedIds.size} alumno
                  {selectedIds.size > 1 ? "s" : ""} seleccionado
                  {selectedIds.size > 1 ? "s" : ""} en otro contenedor.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={handleCrossWarningSwitch}
                style={{
                  padding: "10px 16px",
                  borderRadius: 9,
                  border: "1px solid rgba(192,255,114,0.3)",
                  background: "rgba(192,255,114,0.08)",
                  color: "var(--color-brand)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                Deseleccionar los anteriores y seleccionar este
              </button>
              <button
                onClick={() => setCrossWarning(null)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 9,
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                Cancelar — primero muevo los seleccionados actuales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra selección activa */}
      {hasSelection && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            marginBottom: 12,
            background: "rgba(192,255,114,0.06)",
            border: "1px solid rgba(192,255,114,0.2)",
            borderRadius: 10,
            fontSize: 11,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(192,255,114,0.12)",
              border: "1px solid rgba(192,255,114,0.25)",
              borderRadius: 20,
              padding: "2px 10px",
              color: "var(--color-brand)",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}
          </span>
          <span style={{ color: "var(--color-text-muted)", flex: 1 }}>
            Arrastra cualquier carta del contenedor para moverlos todos al
            destino.
          </span>
          <button
            onClick={clearSelection}
            style={{
              padding: "4px 12px",
              borderRadius: 7,
              border: "1px solid var(--color-border-strong)",
              background: "transparent",
              color: "var(--color-text-muted)",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Deseleccionar todo
          </button>
        </div>
      )}

      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          margin: "0 0 14px",
        }}
      >
        Marca los checkboxes para seleccionar varios alumnos y arrástralos
        juntos. Usa "Sel. todos" para seleccionar todos de un contenedor.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 10,
        }}
      >
        <DropZone
          id="sin_tutor"
          label="Sin tutor asignado"
          icon={sinTutorIcon}
          alumnos={sinTutor}
          {...dropZoneProps}
        />
        {porTutor.map((t) => (
          <DropZone
            key={t.id}
            id={t.id}
            label={t.nombre}
            icon={<Avatar name={t.nombre} size={32} />}
            alumnos={t.alumnos}
            {...dropZoneProps}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CenterEducativePanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");
  const [searchEst, setSearchEst] = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [filtroVinculo, setFiltroVinculo] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [loadingAcuerdos, setLoadingAcuerdos] = useState(false);
  const [inviteTutorModal, setInviteTutorModal] = useState(false);

  const [centro, setCentro] = useState(null);
  const [stats, setStats] = useState({
    estudiantes: 0,
    tutores: 0,
    empresas: 0,
    candidaturas: 0,
    tasa_contrato: 0,
    valoracion_media: 0,
  });
  const [estadosDistribucion, setEstadosDistribucion] = useState([]);
  const [topEmpresas, setTopEmpresas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cargarAcuerdos = useCallback(
    async (idCentro, empresasEnriquecidas, alumnosActivosMap) => {
      setLoadingAcuerdos(true);
      try {
        const { data: acuerdosData, error } = await supabase
          .from("centro_empresa_acuerdo")
          .select(
            "id, id_empresa, estado, fecha_inicio, fecha_fin, plazas_acordadas, notas",
          )
          .eq("id_centro", idCentro);

        if (!error && acuerdosData && acuerdosData.length > 0) {
          const empIds = [
            ...new Set(acuerdosData.map((a) => a.id_empresa).filter(Boolean)),
          ];
          let empMap = {};
          if (empIds.length > 0) {
            const { data: empRows } = await supabase
              .from("empresa")
              .select("id, nombre, sector")
              .in("id", empIds);
            (empRows ?? []).forEach((e) => {
              empMap[e.id] = e;
            });
          }
          const enriquecidos = acuerdosData.map((a) => ({
            id: a.id,
            empresa: empMap[a.id_empresa]?.nombre ?? "—",
            sector: empMap[a.id_empresa]?.sector ?? null,
            plazas: a.plazas_acordadas,
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            estado: a.estado ?? "pendiente",
            contacto: a.notas ?? null,
            alumnos_activos: alumnosActivosMap[a.id_empresa] ?? 0,
          }));
          if (mountedRef.current) setAcuerdos(enriquecidos);
          if (mountedRef.current)
            setStats((prev) => ({ ...prev, empresas: enriquecidos.length }));
        } else {
          console.warn(
            "[acuerdos] Sin datos en centro_empresa_acuerdo, error:",
            error,
          );
          const derivados = empresasEnriquecidas.map((e) => ({
            id: e.id,
            empresa: e.nombre,
            sector: e.sector ?? null,
            plazas: null,
            fecha_inicio: null,
            fecha_fin: null,
            estado: e.alumnos_activos > 0 ? "activo" : "pendiente",
            contacto: null,
            alumnos_activos: alumnosActivosMap[e.id] ?? 0,
          }));
          if (mountedRef.current) setAcuerdos(derivados);
          if (mountedRef.current)
            setStats((prev) => ({ ...prev, empresas: derivados.length }));
        }
      } catch {
        const derivados = empresasEnriquecidas.map((e) => ({
          id: e.id,
          empresa: e.nombre,
          sector: e.sector ?? null,
          plazas: null,
          fecha_inicio: null,
          fecha_fin: null,
          estado: e.alumnos_activos > 0 ? "activo" : "pendiente",
          contacto: null,
          alumnos_activos: alumnosActivosMap[e.id] ?? 0,
        }));
        if (mountedRef.current) setAcuerdos(derivados);
      }
      setLoadingAcuerdos(false);
    },
    [],
  );

  const cargarTodo = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // ── 1. Buscar centro por id del usuario ──────────────────────────────────
    const { data: centroData } = await supabase
      .from("centro_educativo")
      .select("id, nombre, ciudad, provincia, email_contacto, num_alumnos")
      .eq("id", user.id)
      .maybeSingle();

    if (!mountedRef.current) return;
    setCentro(centroData ?? null);

    if (!centroData) {
      console.warn("[centro] No encontrado para user:", user.id);
      setLoading(false);
      return;
    }

    const idCentro = centroData.id;

    // ── 2. Tutores: centro_tutor → tutor_centro ──────────────────────────────
    const { data: ctRows, error: ctErr } = await supabase
      .from("centro_tutor")
      .select("id_tutor")
      .eq("id_centro", idCentro);
    if (ctErr) console.error("[centro_tutor]:", ctErr);

    const tutorIds = (ctRows ?? []).map((r) => r.id_tutor);

    let tutoresData = [];
    if (tutorIds.length > 0) {
      const { data: tutoresRows, error: tutoresErr } = await supabase
        .from("tutor_centro")
        .select("id, nombre, departamento, telefono, usuario_id")
        .in("id", tutorIds);
      if (tutoresErr) console.error("[tutor_centro]:", tutoresErr);
      tutoresData = tutoresRows ?? [];
    }

    const tutoresEnriquecidos = tutoresData.map((t) => ({ ...t }));

    // ── 3. Estudiantes del centro + id_tutor desde centro_estudiante ─────────
    const { data: ceRows, error: ceErr } = await supabase
      .from("centro_estudiante")
      .select(
        "id_tutor, estado, estudiante:id_estudiante(id, nombre, apellidos, titulacion)",
      )
      .eq("id_centro", idCentro);
    if (ceErr) console.error("[centro_estudiante]:", ceErr);

    console.log(
      "[DEBUG centro_estudiante] filas:",
      ceRows?.length,
      "| primer item:",
      ceRows?.[0],
    );

    const ceData = ceRows ?? [];
    const estudianteIds = ceData.map((r) => r.estudiante?.id).filter(Boolean);
    const filasHuerfanas = ceData.filter((r) => !r.estudiante?.id);
    if (filasHuerfanas.length > 0) {
      console.warn(
        "[HUERFANOS] centro_estudiante sin estudiante válido:",
        filasHuerfanas.length,
        "filas",
      );
    }

    // Mapa id_estudiante → id_tutor (viene directo de centro_estudiante)
    const estudianteTutorMap = {};
    ceData.forEach((r) => {
      if (r.estudiante?.id && r.id_tutor) {
        estudianteTutorMap[r.estudiante.id] = r.id_tutor;
      }
    });

    const estadoVinculoMap = {};
    ceData.forEach((r) => {
      if (r.estudiante?.id) {
        estadoVinculoMap[r.estudiante.id] = r.estado ?? "pendiente";
      }
    });

    // ── 4. Estado y empresa actual desde empresa_estudiante ──────────────────
    // (reemplaza la tabla estudiante_estado que no existe)
    let estadoMap = {};
    let empresaEstudianteMap = {};

    if (estudianteIds.length > 0) {
      const { data: empEstRows, error: empEstErr } = await supabase
        .from("empresa_estudiante")
        .select("id_estudiante, id_empresa, activo, tipo")
        .in("id_estudiante", estudianteIds);
      if (empEstErr) console.error("[empresa_estudiante]:", empEstErr);

      // console.log(
      //   "[DEBUG centro_estudiante] filas:",
      //   ceRows?.length,
      //   "| primer item:",
      //   ceRows?.[0],
      // );

      (empEstRows ?? []).forEach((r) => {
        if (r.activo) {
          estadoMap[r.id_estudiante] =
            r.tipo === "contratado" ? "contratado" : "en_practicas";
          empresaEstudianteMap[r.id_estudiante] = r.id_empresa;
        } else {
          // Solo asigna "buscando" si no tiene ya un estado activo
          if (!estadoMap[r.id_estudiante]) {
            estadoMap[r.id_estudiante] = "buscando";
          }
        }
      });
    }

    // ── 5. Nombres de empresas ────────────────────────────────────────────────
    const empresaIds = [...new Set(Object.values(empresaEstudianteMap))];
    let empresaNombreMap = {};
    if (empresaIds.length > 0) {
      const { data: empNames } = await supabase
        .from("empresa")
        .select("id, nombre")
        .in("id", empresaIds);
      (empNames ?? []).forEach((e) => {
        empresaNombreMap[e.id] = e.nombre;
      });
    }

    // ── 6. Candidaturas ───────────────────────────────────────────────────────
    let candidaturasData = [];
    if (estudianteIds.length > 0) {
      const { data: candRows, error: candErr } = await supabase
        .from("candidatura")
        .select(
          "id_candidatura, estado, fecha_envio, id_estudiante, id_oferta, comentario_empresa, comentario_estudiante",
        )
        .in("id_estudiante", estudianteIds)
        .order("fecha_envio", { ascending: false });
      // console.log(
      //   "[DEBUG centro_estudiante] filas:",
      //   ceRows?.length,
      //   "| primer item:",
      //   ceRows?.[0],
      // );

      if (candErr) console.error("[candidatura]:", candErr);
      candidaturasData = candRows ?? [];
    }

    // Fetch de ofertas de esas candidaturas
    const ofertaIdsCand = [
      ...new Set(candidaturasData.map((c) => c.id_oferta).filter(Boolean)),
    ];
    let ofertaMap = {};
    if (ofertaIdsCand.length > 0) {
      const { data: ofertaRows } = await supabase
        .from("oferta")
        .select("id_oferta, titulo, id_empresa, modalidad, ubicacion")
        .in("id_oferta", ofertaIdsCand);
      (ofertaRows ?? []).forEach((o) => {
        ofertaMap[o.id_oferta] = o;
      });
    }

    // Mapa id_estudiante → nombre completo
    const estudianteNombreMap = {};
    ceData.forEach((r) => {
      if (r.estudiante) {
        estudianteNombreMap[r.estudiante.id] =
          [r.estudiante.nombre, r.estudiante.apellidos]
            .filter(Boolean)
            .join(" ") || "—";
      }
    });

    // ── 7. Empresas colaboradoras (desde candidaturas aceptadas) ─────────────
    const empresaIdsCand = [
      ...new Set(
        Object.values(ofertaMap)
          .map((o) => o.id_empresa)
          .filter(Boolean),
      ),
    ];

    // También cargamos las empresas que tienen acuerdo directo con el centro
    const { data: acuerdoEmpRows } = await supabase
      .from("centro_empresa_acuerdo")
      .select("id_empresa")
      .eq("id_centro", idCentro);
    const empresaIdsAcuerdo = (acuerdoEmpRows ?? []).map((r) => r.id_empresa);

    const todasEmpresaIds = [
      ...new Set([...empresaIdsCand, ...empresaIdsAcuerdo]),
    ];

    let empresasColaboradoras = [];
    if (todasEmpresaIds.length > 0) {
      const { data: empRows } = await supabase
        .from("empresa")
        .select("id, nombre, sector, logo_url")
        .in("id", todasEmpresaIds);
      empresasColaboradoras = empRows ?? [];
    }

    // Colaboraciones por empresa (candidaturas aceptadas)
    const colaboracionesMap = {};
    candidaturasData.forEach((c) => {
      const empId = ofertaMap[c.id_oferta]?.id_empresa;
      if (!empId) return;
      if (!colaboracionesMap[empId]) colaboracionesMap[empId] = 0;
      if (c.estado === "aceptado") colaboracionesMap[empId]++;
    });

    // Alumnos activos por empresa
    const alumnosActivosMap = {};
    Object.entries(empresaEstudianteMap).forEach(([_estId, empId]) => {
      alumnosActivosMap[empId] = (alumnosActivosMap[empId] ?? 0) + 1;
    });

    // ── 8. Enriquecer datos ───────────────────────────────────────────────────
    const estudiantesEnriquecidos = ceData.map((r) => {
      const est = r.estudiante ?? {};
      const estado = estadoMap[est.id] ?? "pendiente";
      const idEmp = empresaEstudianteMap[est.id] ?? null;
      const idTutor = estudianteTutorMap[est.id] ?? null;
      const tutor = tutoresEnriquecidos.find((t) => t.id === idTutor);
      return {
        id: est.id,
        nombre: [est.nombre, est.apellidos].filter(Boolean).join(" ") || "—",
        titulacion: est.titulacion ?? "—",
        estado,
        estadoVinculo: estadoVinculoMap[est.id] ?? "pendiente",
        empresa: idEmp ? (empresaNombreMap[idEmp] ?? null) : null,
        tutor: tutor?.nombre ?? "—",
        id_tutor: idTutor,
        candidaturas: candidaturasData.filter((c) => c.id_estudiante === est.id)
          .length,
      };
    });

    const empresasEnriquecidas = empresasColaboradoras.map((e) => ({
      ...e,
      alumnos_activos: alumnosActivosMap[e.id] ?? 0,
      valoracion: 0, // sin tabla valoracion_empresa por ahora
      colaboraciones: colaboracionesMap[e.id] ?? 0,
    }));

    const empresaCandMap = {};
    empresasColaboradoras.forEach((e) => {
      empresaCandMap[e.id] = e;
    });

    const candidaturasEnriquecidas = candidaturasData.map((c) => {
      const oferta = ofertaMap[c.id_oferta];
      const empresa = oferta ? empresaCandMap[oferta.id_empresa] : null;
      return {
        id: c.id_candidatura,
        estudiante: estudianteNombreMap[c.id_estudiante] ?? "—",
        empresa: empresa?.nombre ?? "—",
        oferta: oferta?.titulo ?? "—",
        modalidad: oferta?.modalidad ?? null,
        ubicacion: oferta?.ubicacion ?? null,
        fecha: c.fecha_envio,
        estado: c.estado ?? "pendiente",
        comentario: c.comentario_empresa ?? null,
      };
    });

    const tutoresConAlumnos = tutoresEnriquecidos.map((t) => ({
      ...t,
      lista: estudiantesEnriquecidos.filter((e) => e.id_tutor === t.id),
    }));

    // ── 9. Stats ──────────────────────────────────────────────────────────────
    const totalEst = estudiantesEnriquecidos.length;
    const aceptados = estudiantesEnriquecidos.filter(
      (e) => e.estadoVinculo === "aceptado",
    ).length;
    const contratados = estudiantesEnriquecidos.filter(
      (e) => e.estado === "contratado",
    ).length;
    const enPracticas = estudiantesEnriquecidos.filter(
      (e) => e.estado === "en_practicas",
    ).length;
    const tasaContrato =
      aceptados > 0 ? Math.round((contratados / aceptados) * 100) : 0;

    if (!mountedRef.current) return;

    setStats({
      estudiantes: totalEst,
      tutores: tutoresData.length,
      empresas: empresasEnriquecidas.length,
      candidaturas: candidaturasData.length,
      tasa_contrato: tasaContrato,
      valoracion_media: 0,
    });
    setEstadosDistribucion([
      { label: "En prácticas", count: enPracticas, color: "var(--color-info)" },
      {
        label: "Contratados",
        count: contratados,
        color: "var(--color-success)",
      },
      {
        label: "Buscando",
        count: estudiantesEnriquecidos.filter((e) => e.estado === "buscando")
          .length,
        color: "var(--color-warning)",
      },
      {
        label: "Sin actividad",
        count: estudiantesEnriquecidos.filter(
          (e) =>
            e.estado !== "en_practicas" &&
            e.estado !== "contratado" &&
            e.estado !== "buscando",
        ).length,
        color: "var(--color-text-subtle)",
      },
    ]);
    setTopEmpresas(
      [...empresasEnriquecidas].sort(
        (a, b) => b.colaboraciones - a.colaboraciones,
      ),
    );
    setEstudiantes(estudiantesEnriquecidos);
    setEmpresas(empresasEnriquecidas);
    setCandidaturas(candidaturasEnriquecidas);
    setTutores(tutoresConAlumnos);
    setLoading(false);

    await cargarAcuerdos(idCentro, empresasEnriquecidas, alumnosActivosMap);
  }, [user, cargarAcuerdos]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const handleVinculo = async (estudianteId, nuevoEstado) => {
    await supabase
      .from("centro_estudiante")
      .update({ estado: nuevoEstado })
      .eq("id_estudiante", estudianteId)
      .eq("id_centro", centro?.id);
    await cargarTodo();
  };

  const estudiantesFiltrados = estudiantes.filter((e) => {
    const q = searchEst.toLowerCase();
    const matchSearch =
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.empresa ?? "").toLowerCase().includes(q) ||
      e.titulacion.toLowerCase().includes(q);
    const matchFiltro =
      filtroVinculo === "todos" || e.estadoVinculo === filtroVinculo;
    return matchSearch && matchFiltro;
  });
  const empresasFiltradas = empresas.filter((e) => {
    const q = searchEmp.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.sector ?? "").toLowerCase().includes(q)
    );
  });
  const acuerdosFiltrados = acuerdos.filter((a) => {
    const q = searchEmp.toLowerCase();
    return (
      !q ||
      a.empresa.toLowerCase().includes(q) ||
      (a.sector ?? "").toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: "resumen", label: "Resumen", icon: <IconGrid /> },
    { id: "estudiantes", label: "Estudiantes", icon: <IconUsers /> },
    { id: "acuerdos", label: "Acuerdos", icon: <IconHandshake /> },
    { id: "candidaturas", label: "Candidaturas", icon: <IconChevron /> },
    { id: "tutores", label: "Tutores", icon: <IconUsers /> },
  ];

  return (
    <MainLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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
          {/* ── Header ── */}
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
                Centro educativo
              </span>
            </div>
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
              Panel de supervisión
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              {centro
                ? `${centro.nombre}${centro.ciudad ? ` — ${centro.ciudad}` : ""}${centro.provincia ? `, ${centro.provincia}` : ""}`
                : "Cargando centro…"}
            </p>
          </div>

          {/* ── Tabs ── */}
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
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
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
                      ? "0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
                      : "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "1px solid rgba(192,255,114,0.18)"
                      : "1px solid transparent",
                }}
              >
                <span style={{ opacity: activeTab === tab.id ? 1 : 0.5 }}>
                  {tab.icon}
                </span>
                {tab.label}
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
                        // "repeat(auto-fill, minmax(160px, 1fr))",
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 8,
                    }}
                  >
                    <StatCard
                      label="Estudiantes"
                      value={stats.estudiantes}
                      sub="En el centro"
                      accent
                    />
                    <StatCard
                      label="Tutores"
                      value={stats.tutores}
                      sub="Asignados al centro"
                    />
                    <StatCard
                      label="Empresas"
                      value={stats.empresas}
                      sub="Colaboradoras"
                    />
                    <StatCard
                      label="Candidaturas"
                      value={stats.candidaturas}
                      sub="Total enviadas"
                    />
                    <StatCard
                      label="Conversión"
                      value={stats.tasa_contrato}
                      suffix="%"
                      sub="Prácticas → contrato"
                    />
                    {/* <StatCard
                      label="Valoración"
                      value={stats.valoracion_media}
                      suffix=" ★"
                      sub="Media empresas"
                    /> */}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "var(--color-surface-strong)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        padding: "18px 20px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: "var(--color-text-subtle)",
                          fontWeight: 700,
                        }}
                      >
                        Estado de estudiantes
                      </p>
                      {estadosDistribucion.map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 9,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              width: 82,
                              flexShrink: 0,
                            }}
                          >
                            {item.label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 4,
                              background: "var(--color-border)",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width:
                                  stats.estudiantes > 0
                                    ? `${(item.count / stats.estudiantes) * 100}%`
                                    : "0%",
                                background: item.color,
                                borderRadius: 4,
                                transition:
                                  "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              width: 22,
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        background: "var(--color-surface-strong)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        padding: "18px 20px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: "var(--color-text-subtle)",
                          fontWeight: 700,
                        }}
                      >
                        Empresas más colaboradoras
                      </p>
                      {topEmpresas.length === 0 ? (
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-subtle)",
                          }}
                        >
                          Sin datos aún.
                        </p>
                      ) : (
                        topEmpresas.slice(0, 5).map((e, i) => (
                          <div
                            key={e.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 0",
                              borderBottom:
                                i < 4
                                  ? "1px solid var(--color-border-subtle)"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-subtle)",
                                fontWeight: 700,
                                width: 18,
                                textAlign: "center",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              #{i + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                }}
                              >
                                {e.nombre}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {e.sector ?? "—"}
                              </p>
                            </div>
                            {e.valoracion > 0 && (
                              <Stars rating={e.valoracion} />
                            )}
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                                fontVariantNumeric: "tabular-nums",
                                flexShrink: 0,
                              }}
                            >
                              {e.colaboraciones} col.
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ ESTUDIANTES ══ */}
              {activeTab === "estudiantes" && (
                <div>
                  <SectionHeader
                    title="Estudiantes registrados"
                    subtitle={`${estudiantes.filter((e) => e.estadoVinculo === "aceptado").length} verificados · ${estudiantes.filter((e) => e.estadoVinculo === "pendiente").length} pendientes`}
                    action={
                      <SearchInput
                        value={searchEst}
                        onChange={setSearchEst}
                        placeholder="Buscar alumno…"
                      />
                    }
                  />

                  {/* Filtro por estado de vínculo */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {[
                      { key: "todos", label: "Todos" },
                      { key: "pendiente", label: "Pendientes" },
                      { key: "aceptado", label: "Verificados" },
                      { key: "rechazado", label: "Rechazados" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFiltroVinculo(f.key)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: `1px solid ${filtroVinculo === f.key ? "rgba(192,255,114,0.4)" : "var(--color-border)"}`,
                          background:
                            filtroVinculo === f.key
                              ? "rgba(192,255,114,0.1)"
                              : "transparent",
                          color:
                            filtroVinculo === f.key
                              ? "var(--color-brand)"
                              : "var(--color-text-muted)",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        {f.label}
                        <span style={{ marginLeft: 5, opacity: 0.7 }}>
                          {f.key === "todos"
                            ? estudiantes.length
                            : estudiantes.filter(
                                (e) => e.estadoVinculo === f.key,
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Table
                    headers={[
                      "Alumno",
                      "Tutor asignado",
                      "Empresa",
                      "Solicitud",
                      "Acciones",
                    ]}
                    empty={
                      estudiantesFiltrados.length === 0
                        ? "No se encontraron alumnos."
                        : undefined
                    }
                  >
                    {estudiantesFiltrados.map((e, i) => (
                      <TR
                        key={e.id}
                        last={i === estudiantesFiltrados.length - 1}
                        cells={[
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
                            <p
                              style={{
                                margin: "2px 0 0",
                                color: "var(--color-text-subtle)",
                                fontSize: 10,
                              }}
                            >
                              {e.titulacion}
                            </p>
                          </div>,
                          <span
                            style={{
                              color: "var(--color-text-secondary)",
                              fontSize: 11,
                            }}
                          >
                            {e.tutor}
                          </span>,
                          <span
                            style={{
                              color: e.empresa
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-subtle)",
                              fontSize: 11,
                            }}
                          >
                            {e.empresa ?? "—"}
                          </span>,
                          <StatusBadge
                            estado={e.estadoVinculo}
                            map={ESTADO_VINCULO}
                          />,
                          <div style={{ display: "flex", gap: 5 }}>
                            {e.estadoVinculo !== "aceptado" && (
                              <button
                                onClick={() => handleVinculo(e.id, "aceptado")}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 6,
                                  border: "1px solid rgba(74,222,128,0.3)",
                                  background: "rgba(74,222,128,0.08)",
                                  color: "var(--color-success)",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  transition: "all 0.15s",
                                }}
                              >
                                Aceptar
                              </button>
                            )}
                            {e.estadoVinculo !== "rechazado" && (
                              <button
                                onClick={() => handleVinculo(e.id, "rechazado")}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 6,
                                  border: "1px solid rgba(248,113,113,0.3)",
                                  background: "rgba(248,113,113,0.08)",
                                  color: "var(--color-error)",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  transition: "all 0.15s",
                                }}
                              >
                                Rechazar
                              </button>
                            )}
                          </div>,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ ACUERDOS ══ */}
              {activeTab === "acuerdos" && (
                <AcuerdosTable acuerdos={acuerdos} loading={loadingAcuerdos} />
              )}

              {/* ══ CANDIDATURAS ══ */}
              {activeTab === "candidaturas" && (
                <div>
                  <SectionHeader
                    title="Candidaturas enviadas"
                    subtitle={`${candidaturas.length} candidaturas registradas`}
                  />
                  <Table
                    headers={[
                      "Estudiante",
                      "Empresa",
                      "Oferta",
                      "Fecha",
                      "Estado",
                    ]}
                    empty={
                      candidaturas.length === 0
                        ? "No hay candidaturas registradas."
                        : undefined
                    }
                  >
                    {candidaturas.map((c, i) => (
                      <TR
                        key={c.id}
                        last={i === candidaturas.length - 1}
                        cells={[
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--color-text)",
                              fontSize: 11,
                            }}
                          >
                            {c.estudiante}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-secondary)",
                              fontSize: 11,
                            }}
                          >
                            {c.empresa}
                          </span>,
                          <div>
                            <p
                              style={{
                                margin: 0,
                                color: "var(--color-text-muted)",
                                fontSize: 11,
                                fontStyle: "italic",
                              }}
                            >
                              {c.oferta}
                            </p>
                            {c.modalidad && (
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  color: "var(--color-text-subtle)",
                                  fontSize: 9,
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
                            {c.fecha
                              ? new Date(c.fecha).toLocaleDateString("es-ES")
                              : "—"}
                          </span>,
                          <StatusBadge estado={c.estado} map={ESTADO_CAND} />,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ TUTORES ══ */}
              {activeTab === "tutores" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div>
                    <SectionHeader
                      title="Tutores del centro"
                      subtitle={`${tutores.length} tutores asignados`}
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
                          + Invitar tutor
                        </button>
                      }
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
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
                              gap: 9,
                              marginBottom: 10,
                            }}
                          >
                            <Avatar name={t.nombre} size={34} />
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
                                {t.departamento || "—"}
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: "var(--color-brand)",
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "-0.03em",
                              }}
                            >
                              {t.lista?.length ?? 0}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              alumnos
                            </span>
                          </div>
                        </div>
                      ))}
                      {tutores.length === 0 && (
                        <p
                          style={{
                            color: "var(--color-text-subtle)",
                            fontSize: 12,
                            gridColumn: "1/-1",
                          }}
                        >
                          No hay tutores asignados al centro.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        marginBottom: 14,
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text)",
                          margin: "0 0 3px",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Asignación de tutores
                      </h2>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        Arrastra y suelta alumnos entre tutores para
                        reasignarlos
                      </p>
                    </div>
                    <TutorAssignment
                      tutores={tutores}
                      estudiantes={estudiantes}
                      idCentro={centro?.id}
                      onUpdate={cargarTodo}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {inviteTutorModal && (
        <InviteModal
          user={user}
          onClose={() => setInviteTutorModal(false)}
          entityType="tutor_centro"
          inviteRoute="/tutor/registro"
          expiresInHours={48}
          title="Invitar tutor"
          description="Genera un enlace para que un tutor cree su cuenta y quede vinculado a este centro."
          warningText="El tutor tendrá acceso a los alumnos asignados. Comparte este enlace solo con la persona correspondiente."
          roleLabel="tutor"
          inviterName={centro?.nombre ?? "el centro"}
        />
      )}
    </MainLayout>
  );
}
