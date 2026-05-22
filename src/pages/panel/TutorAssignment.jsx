// ─── REEMPLAZA los dos componentes en tu CenterEducativePanel.jsx ────────────
// Sustituye DraggableStudent y TutorAssignment por estos dos.
// El resto del archivo (imports, otros componentes, etc.) no cambia.

import { supabase } from "../lib/supabase"; // ajusta la ruta si es necesario

// ─── DRAGGABLE STUDENT ────────────────────────────────────────────────────────
function DraggableStudent({
  estudiante,
  fromContainerId,
  onDragStart,
  isSelected,
  isDisabled, // otro contenedor tiene selección → no se puede interactuar
  isDimmed, // mismo contenedor, no seleccionado → semi-transparente pero arrastrable
  onToggleSelect,
}) {
  const est = ESTADO_EST[estudiante.estado] ?? ESTADO_EST["pendiente"];

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onDragStart(e, estudiante.id, fromContainerId);
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
        border: `1px solid ${
          isSelected ? "rgba(192,255,114,0.4)" : "var(--color-border-subtle)"
        }`,
        cursor: isDisabled ? "not-allowed" : "grab",
        opacity: isDisabled ? 0.28 : isDimmed ? 0.52 : 1,
        transition: "all 0.12s",
        userSelect: "none",
        outline: isSelected ? "none" : undefined,
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
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(estudiante.id, fromContainerId);
        }}
        style={{
          width: 15,
          height: 15,
          borderRadius: 4,
          border: `1.5px solid ${
            isSelected ? "var(--color-brand)" : "var(--color-border-strong)"
          }`,
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

      {/* Estado dot */}
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

// ─── TUTOR ASSIGNMENT ─────────────────────────────────────────────────────────
function TutorAssignment({ tutores, estudiantes, idCentro, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionSource, setSelectionSource] = useState(null);
  const [crossWarning, setCrossWarning] = useState(null); // { studentId, containerId }
  const [dragging, setDragging] = useState(null); // { studentIds[], fromContainerId }
  const [dragOver, setDragOver] = useState(null);
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

  // ── Selección ──────────────────────────────────────────────────────────────
  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionSource(null);
  };

  const handleToggleSelect = (studentId, containerId) => {
    // Intento de selección cruzada (otro contenedor ya tiene selección)
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

  // Seleccionar / deseleccionar todos de un contenedor
  const handleSelectAll = (containerId, alumnos) => {
    const allIds = alumnos.map((a) => a.id);
    const allSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

    if (
      selectionSource &&
      selectionSource !== containerId &&
      selectedIds.size > 0
    ) {
      // Selección cruzada: limpiar y seleccionar todos del nuevo contenedor
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

  // ── Drag ───────────────────────────────────────────────────────────────────
  const handleDragStart = (e, studentId, fromContainerId) => {
    // Si hay selección en este contenedor → arrastra todos los seleccionados
    const studentIds =
      selectionSource === fromContainerId && selectedIds.size > 0
        ? [...selectedIds]
        : [studentId];

    setDragging({ studentIds, fromContainerId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, toContainerId) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    if (dragging.fromContainerId === toContainerId) {
      setDragging(null);
      return;
    }

    const draggedFrom = dragging.fromContainerId;
    const movedIds = [...dragging.studentIds];

    setSaving(true);
    try {
      const nuevoTutor = toContainerId === "sin_tutor" ? null : toContainerId;

      for (const estudianteId of movedIds) {
        const { error } = await supabase
          .from("centro_estudiante")
          .update({ id_tutor: nuevoTutor })
          .eq("id_estudiante", estudianteId)
          .eq("id_centro", idCentro);
        if (error) throw error;
      }

      const n = movedIds.length;
      showToast(
        `${n} ${n === 1 ? "alumno reasignado" : "alumnos reasignados"} correctamente`,
      );

      // Mantener selección pero actualizar el contenedor fuente
      if (selectionSource === draggedFrom) {
        setSelectionSource(toContainerId);
      }

      onUpdate();
    } catch (err) {
      showToast(err.message ?? "Error al reasignar", false);
    } finally {
      setSaving(false);
      setDragging(null);
    }
  };

  // ── Aviso cross-container ──────────────────────────────────────────────────
  const handleCrossWarningSwitch = () => {
    if (!crossWarning) return;
    const { studentId, containerId } = crossWarning;
    setSelectedIds(new Set([studentId]));
    setSelectionSource(containerId);
    setCrossWarning(null);
  };

  const handleCrossWarningKeep = () => setCrossWarning(null);

  // ── DropZone ───────────────────────────────────────────────────────────────
  const hasSelection = selectedIds.size > 0;

  const DropZone = ({ id, label, alumnos, icon }) => {
    const containerSelectedCount = alumnos.filter((a) =>
      selectedIds.has(a.id),
    ).length;
    const allSelectedInContainer =
      alumnos.length > 0 && alumnos.every((a) => selectedIds.has(a.id));
    const isDragTarget = dragOver === id;
    const dragCount = dragging?.studentIds?.length ?? 0;

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(id);
        }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => handleDrop(e, id)}
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
        {/* Cabecera del contenedor */}
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

            {/* Botón seleccionar todos del contenedor */}
            {alumnos.length > 0 && (
              <button
                onClick={() => handleSelectAll(id, alumnos)}
                title={
                  allSelectedInContainer
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"
                }
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

        {/* Indicador de drop */}
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

        {/* Lista de alumnos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {alumnos.map((al) => {
            const isSelected = selectedIds.has(al.id);
            // Deshabilitado: hay selección en OTRO contenedor
            const isDisabled =
              hasSelection && selectionSource !== id && !isSelected;
            // Atenuado: mismo contenedor, no seleccionado, pero hay seleccionados aquí
            const isDimmed =
              hasSelection && selectionSource === id && !isSelected;

            return (
              <DraggableStudent
                key={al.id}
                estudiante={al}
                fromContainerId={id}
                onDragStart={handleDragStart}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isDimmed={isDimmed}
                onToggleSelect={handleToggleSelect}
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
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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

      {/* ── Aviso selección cruzada ────────────────────────────────────────── */}
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
          onClick={handleCrossWarningKeep}
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
                onClick={handleCrossWarningKeep}
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

      {/* ── Barra de selección activa ──────────────────────────────────────── */}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.borderColor = "var(--color-text-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.borderColor = "var(--color-border-strong)";
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
        juntos. Usa "Sel. todos" para seleccionar todos los de un contenedor de
        golpe.
      </p>

      {/* ── Grid de contenedores ──────────────────────────────────────────── */}
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
          alumnos={sinTutor}
          icon={
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
          }
        />

        {porTutor.map((t) => (
          <DropZone
            key={t.id}
            id={t.id}
            label={t.nombre}
            alumnos={t.alumnos}
            icon={<Avatar name={t.nombre} size={32} />}
          />
        ))}
      </div>
    </div>
  );
}
