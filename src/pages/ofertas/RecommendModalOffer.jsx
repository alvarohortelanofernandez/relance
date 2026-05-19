import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

/**
 * RecomendarOfertaModal
 * Aparece cuando un tutor_centro pulsa "Recomendar" en una oferta.
 * Permite buscar y seleccionar uno o varios alumnos del centro
 * y enviarles una notificación de recomendación.
 *
 * Props:
 *  - oferta: objeto oferta completo
 *  - onClose: fn para cerrar
 */

function Spinner({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`animate-spin text-[#C0FF72] ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function RecomendarOfertaModal({ oferta, onClose }) {
  const { user } = useAuth();

  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  // Cargar alumnos del tutor_centro
  // Intentamos obtener los estudiantes que tiene asignados este tutor.
  // Dependiendo del esquema real puede variar, aquí cubrimos dos casos comunes:
  // 1) tabla "tutoria" con (id_tutor, id_estudiante)
  // 2) tabla "estudiante" con campo id_tutor_centro
  const cargarAlumnos = useCallback(async () => {
    if (!user) return;
    setLoadingAlumnos(true);

    const { data: relaciones, error: errR } = await supabase
      .from("estudiante_tutor")
      .select("id_estudiante")
      .eq("id_tutor", user.id);

    const ids = (relaciones ?? []).map((r) => r.id_estudiante);
    // const ids = (relaciones ?? []).map((r) => r.id_estudiante).filter(Boolean);

    // if (ids.length === 0) {
    //   setAlumnos([]);
    //   setLoadingAlumnos(false);
    //   return;
    // }

    let estudiantes = [];

    if (!errR && ids.length > 0) {
      const { data: estudData, error: estudErr } = await supabase
        .from("estudiante")
        .select("id, nombre, apellidos, avatar_url")
        .in("id", ids);

      estudiantes = (estudData ?? []).map((e) => ({
        id: e.id,
        nombre: `${e.nombre ?? ""} ${e.apellidos ?? ""}`.trim() || "Estudiante",
        email: "",
        avatar: e.avatar_url ?? null,
      }));
    }

    setAlumnos(estudiantes);
    setLoadingAlumnos(false);
  }, [user]);

  useEffect(() => {
    cargarAlumnos();
  }, [cargarAlumnos]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    const filtrados = alumnosFiltrados.map((a) => a.id);
    const todosSeleccionados = filtrados.every((id) => seleccionados.has(id));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosSeleccionados) filtrados.forEach((id) => next.delete(id));
      else filtrados.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleEnviar = async () => {
    if (seleccionados.size === 0) {
      setError("Selecciona al menos un alumno.");
      return;
    }
    setSending(true);
    setError(null);

    try {
      const notificaciones = alumnos
        .filter((a) => seleccionados.has(a.id))
        .map((alumno) => ({
          id_usuario_destino: alumno.id,
          id_usuario_remitente: user.id,
          tipo: "recomendacion_oferta",
          titulo: `Oferta recomendada: ${oferta.titulo}`,
          mensaje: `Tu tutor te ha recomendado la oferta "${oferta.titulo}" de ${oferta.empresa_nombre ?? "una empresa"}. Échale un vistazo, ¡podría ser una gran oportunidad para ti!`,
          url_destino: `/ofertas?oferta=${oferta.id_oferta}`,
          leido: false,
          fecha: new Date().toISOString(),
        }));

      const { error: insErr } = await supabase
        .from("notificacion")
        .insert(notificaciones);

      if (insErr) throw insErr;

      setExito(true);
    } catch (err) {
      setError(err.message ?? "Error al enviar las notificaciones.");
    } finally {
      setSending(false);
    }
  };

  const alumnosFiltrados = alumnos.filter(
    (a) =>
      !search ||
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  const todosSeleccionados =
    alumnosFiltrados.length > 0 &&
    alumnosFiltrados.every((a) => seleccionados.has(a.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          background: "var(--color-surface-strong)",
          borderColor: "var(--color-border-strong)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "var(--color-border-strong)" }}
        >
          <div>
            <h2
              className="font-display text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Recomendar oferta
            </h2>
            <p
              className="text-sm mt-0.5 truncate max-w-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {oferta.titulo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {exito ? (
          /* ── Estado éxito ── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C0FF72]/10 border border-[#C0FF72]/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#C0FF72]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p
                className="font-display font-bold text-lg"
                style={{ color: "var(--color-text)" }}
              >
                ¡Recomendación enviada!
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {seleccionados.size} alumno{seleccionados.size !== 1 ? "s" : ""}{" "}
                recibirá{seleccionados.size !== 1 ? "n" : ""} la notificación en
                su bandeja.
              </p>
              {error && <p className="text-yellow-400 text-xs mt-2">{error}</p>}
            </div>
            <button onClick={onClose} className="btn-primary mt-2 px-8">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Info de la oferta resumida */}
              <div className="flex items-center gap-3 p-3 bg-[#C0FF72]/5 border border-[#C0FF72]/15 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-[#C0FF72]/10 border border-[#C0FF72]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-[#C0FF72]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {oferta.titulo}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {oferta.empresa_nombre ?? "Empresa"} ·{" "}
                    {oferta.modalidad ?? "Sin modalidad"}
                  </p>
                </div>
              </div>

              {/* Buscador alumnos */}
              <div>
                <label
                  className="block text-xs mb-1.5 uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Seleccionar alumnos
                </label>
                <div className="relative mb-3">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-text-muted)" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar alumno..."
                    className="input-field pl-9"
                  />
                </div>

                {loadingAlumnos ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : alumnosFiltrados.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {alumnos.length === 0
                        ? "No tienes alumnos asignados"
                        : "Ningún alumno coincide con la búsqueda"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Toggle todos */}
                    <button
                      type="button"
                      onClick={toggleTodos}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1 text-left"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--color-surface-strong)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          todosSeleccionados
                            ? "bg-[#C0FF72] border-[#C0FF72]"
                            : "border-white/20"
                        }`}
                      >
                        {todosSeleccionados && (
                          <svg
                            className="w-3 h-3 text-dark"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Seleccionar todos ({alumnosFiltrados.length})
                      </span>
                    </button>

                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {alumnosFiltrados.map((alumno) => {
                        const sel = seleccionados.has(alumno.id);
                        return (
                          <button
                            key={alumno.id}
                            type="button"
                            onClick={() => toggleSeleccion(alumno.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border ${
                              sel
                                ? "bg-[#C0FF72]/5 border-[#C0FF72]/15"
                                : "border-transparent"
                            }`}
                            onMouseEnter={(e) => {
                              if (!sel) {
                                e.currentTarget.style.background =
                                  "var(--color-surface-strong)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!sel) {
                                e.currentTarget.style.background =
                                  "transparent";
                              }
                            }}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                sel
                                  ? "bg-[#C0FF72] border-[#C0FF72]"
                                  : "border-white/20"
                              }`}
                            >
                              {sel && (
                                <svg
                                  className="w-3 h-3 text-dark"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>

                            {alumno.avatar ? (
                              <img
                                src={alumno.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                // style={{ color: "var(--color-text-secondary)" }}
                                style={{
                                  background: "var(--color-surface-elevated)",
                                  borderColor: "var(--color-border-strong)",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {alumno.nombre.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium truncate"
                                style={{
                                  color: sel
                                    ? "var(--color-text)"
                                    : "var(--color-text-subtle)",
                                }}
                              >
                                {alumno.nombre}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: "var(--color-text-subtle)" }}
                              >
                                {alumno.email}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex-shrink-0 flex items-center gap-3"
              style={{ borderColor: "var(--color-border-strong)" }}
            >
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={sending || seleccionados.size === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Enviando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                    </svg>
                    Recomendar
                    {seleccionados.size > 0 && (
                      <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {seleccionados.size}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
