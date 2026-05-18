import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Ahora mismo";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function groupByDay(notificaciones) {
  const groups = {};
  notificaciones.forEach((n) => {
    const d = new Date(n.fecha);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let key;
    if (d.toDateString() === today.toDateString()) key = "Hoy";
    else if (d.toDateString() === yesterday.toDateString()) key = "Ayer";
    else
      key = d.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

function tipoIcon(tipo) {
  switch (tipo) {
    case "recomendacion_oferta":
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      );
    case "candidatura":
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    default:
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

function tipoBg(tipo) {
  switch (tipo) {
    case "recomendacion_oferta":
      return "bg-brand/10 border-brand/20 text-brand";
    case "candidatura":
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    default:
      return "bg-white/5 border-[var(--color-border)] text-[var(--color-text-secondary)]";
  }
}

// ── Detail panel for offer recommendation ─────────────────────────────────

function OfertaDetailInline({ oferta, onPostular, yaPostulado, onVerOferta }) {
  if (!oferta) return null;

  const TIPO_META = {
    practicas: {
      label: "Prácticas",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    practicas_contratacion: {
      label: "Prácticas + contratación",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    empleo_junior: {
      label: "Empleo junior",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  };
  const meta = TIPO_META[oferta.tipo_oferta] ?? {
    label: "Oferta",
    color: "bg-white/5 text-[var(--color-text-secondary)] border-[var(--color-border)]",
  };

  return (
    <div className="mt-6 border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="bg-[var(--color-surface-strong)] px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-building" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base leading-tight">
              {oferta.titulo}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm">{oferta.empresa_nombre}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span
            className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}
          >
            {meta.label}
          </span>
          {oferta.modalidad && (
            <span className="inline-flex items-center border border-[var(--color-border)] rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/5 text-[var(--color-text-secondary)]">
              {oferta.modalidad}
            </span>
          )}
          {oferta.ubicacion && (
            <span className="inline-flex items-center border border-[var(--color-border)] rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/5 text-[var(--color-text-secondary)]">
              {oferta.ubicacion}
            </span>
          )}
          {oferta.salario_mensual ? (
            <span className="inline-flex items-center border border-brand/20 rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand/10 text-brand">
              {oferta.salario_mensual} €/mes
            </span>
          ) : (
            <span className="inline-flex items-center border border-[var(--color-border)] rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/5 text-[var(--color-text-secondary)]">
              No remunerado
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Duración",
              val: oferta.duracion_semanas
                ? `${oferta.duracion_semanas} sem.`
                : "-",
            },
            {
              label: "Horas/sem.",
              val: oferta.horas_semanales ? `${oferta.horas_semanales} h` : "-",
            },
            {
              label: "Plazas",
              val:
                oferta.num_plazas_restantes != null
                  ? `${oferta.num_plazas_restantes} disp.`
                  : "-",
            },
            {
              label: "Cierre",
              val: oferta.fecha_fin_solicitud
                ? new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                    "es-ES",
                  )
                : "-",
            },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="bg-[var(--color-bg)] border border-white/8 rounded-xl p-3 text-center"
            >
              <p className="text-[var(--color-text-subtle)] text-xs mb-1">{label}</p>
              <p className="text-white text-sm font-semibold font-display">
                {val}
              </p>
            </div>
          ))}
        </div>

        {oferta.descripcion && (
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Descripción
            </p>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">
              {oferta.descripcion}
            </p>
          </div>
        )}

        {oferta.tecnologias?.length > 0 && (
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Tecnologías
            </p>
            <div className="flex flex-wrap gap-1.5">
              {oferta.tecnologias.map((t) => (
                <span
                  key={t.id_tecnologia}
                  className="bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
                >
                  {t.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onVerOferta}
            className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:border-white/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver oferta
          </button>
          {yaPostulado ? (
            <div className="flex-1 py-2.5 px-4 rounded-xl bg-brand/5 border border-brand/20 text-brand text-sm font-medium flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ya postulado
            </div>
          ) : (
            <button
              onClick={onPostular}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand/90 text-dark text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
              Postularme
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PostulacionModal inline ───────────────────────────────────────────────

function PostulacionModal({ oferta, onClose, onSuccess }) {
  const { user } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handlePostular = async () => {
    setSending(true);
    setError(null);
    try {
      const { error: err } = await supabase.from("candidatura").insert({
        id_oferta: oferta.id_oferta,
        id_estudiante: user.id,
        comentario_estudiante: mensaje.trim() || null,
        estado: "pendiente",
      });
      if (err) throw err;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--color-surface-strong)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold text-white mb-1">
          Postularme
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm mb-5">
          Vas a postularte a{" "}
          <strong className="text-white">{oferta.titulo}</strong> en{" "}
          <strong className="text-white">{oferta.empresa_nombre}</strong>.
        </p>
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
            Mensaje de presentación (opcional)
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
            className="input-field resize-none"
          />
          <p className="text-xs text-[var(--color-text-subtle)] mt-1 text-right">
            {mensaje.length}/500
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handlePostular}
            disabled={sending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Confirmar postulación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function NotificacionesPage() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [ofertaDetalle, setOfertaDetalle] = useState(null);
  const [postulaciones, setPostulaciones] = useState(new Set());
  const [loadingOferta, setLoadingOferta] = useState(false);
  const [postulacionModal, setPostulacionModal] = useState(null);

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notificacion")
      .select("*")
      .eq("id_usuario", user.id)
      .order("fecha", { ascending: false });
    setNotificaciones(data ?? []);
    setLoading(false);
  }, [user]);

  const cargarPostulaciones = useCallback(async () => {
    if (!user || userRole !== "estudiante") return;
    const { data } = await supabase
      .from("candidatura")
      .select("id_oferta")
      .eq("id_estudiante", user.id);
    setPostulaciones(new Set((data ?? []).map((c) => c.id_oferta)));
  }, [user, userRole]);

  useEffect(() => {
    cargar();
    cargarPostulaciones();
  }, [cargar, cargarPostulaciones]);

  const marcarLeida = useCallback(async (notif) => {
    if (notif.leido) return;
    await supabase
      .from("notificacion")
      .update({ leido: true })
      .eq("id_notificacion", notif.id_notificacion);
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === notif.id_notificacion ? { ...n, leido: true } : n,
      ),
    );
  }, []);

  const handleSelect = useCallback(
    async (notif) => {
      setSelected(notif);
      setOfertaDetalle(null);
      await marcarLeida(notif);

      // Si es recomendación de oferta, cargar los detalles
      if (notif.tipo === "recomendacion_oferta" && notif.url_destino) {
        // url_destino tiene el formato /ofertas?id=UUID
        const match = notif.url_destino.match(/id=([a-f0-9-]+)/i);
        if (match) {
          const idOferta = match[1];
          setLoadingOferta(true);
          const { data } = await supabase
            .from("oferta")
            .select(
              `id_oferta, titulo, descripcion, modalidad, ubicacion,
               duracion_semanas, horas_semanales, num_plazas, num_plazas_restantes,
               opcion_contrato, estado, fecha_publicacion, fecha_fin_solicitud,
               tipo_oferta, salario_mensual, requisitos_adicionales, beneficios,
               empresa:empresa(id, nombre),
               oferta_tecnologia(tecnologia(id_tecnologia, nombre))`,
            )
            .eq("id_oferta", idOferta)
            .maybeSingle();

          if (data) {
            setOfertaDetalle({
              ...data,
              empresa_nombre: data.empresa?.nombre ?? "Empresa",
              tecnologias:
                data.oferta_tecnologia
                  ?.map((ot) => ot.tecnologia)
                  .filter(Boolean) ?? [],
            });
          }
          setLoadingOferta(false);
        }
      }
    },
    [marcarLeida],
  );

  const marcarTodasLeidas = async () => {
    const ids = notificaciones
      .filter((n) => !n.leido)
      .map((n) => n.id_notificacion);
    if (!ids.length) return;
    await supabase
      .from("notificacion")
      .update({ leido: true })
      .in("id_notificacion", ids);
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const grupos = groupByDay(notificaciones);
  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <main className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-9">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
                Notificaciones
                {noLeidas > 0 && (
                  <span className="text-sm px-2.5 py-1 rounded-full bg-brand/20 text-brand border border-brand/30 font-semibold">
                    {noLeidas} nueva{noLeidas !== 1 ? "s" : ""}
                  </span>
                )}
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                {notificaciones.length} notificación
                {notificaciones.length !== 1 ? "es" : ""} en total
              </p>
            </div>
            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-sm text-[var(--color-text-secondary)] hover:text-white px-4 py-2 rounded-xl border border-[var(--color-border)] hover:border-white/20 transition-all flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg
                className="animate-spin w-8 h-8 text-brand"
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
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[var(--color-border)] rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[var(--color-text-subtle)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <p className="text-[var(--color-text-muted)] font-medium">
                No tienes notificaciones aún
              </p>
              <p className="text-[var(--color-text-subtle)] text-sm mt-1">
                Aquí aparecerán las recomendaciones y avisos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-4 items-start">
              {/* ── Sidebar izquierda ── */}
              <div className="bg-[var(--color-surface-strong)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                    Bandeja de entrada
                  </p>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {Object.entries(grupos).map(([day, items]) => (
                    <div key={day}>
                      <div className="px-4 py-2 bg-white/2 border-b border-white/5">
                        <p className="text-[10px] text-[var(--color-text-subtle)] uppercase tracking-widest font-semibold">
                          {day}
                        </p>
                      </div>
                      {items.map((notif) => {
                        const isActive =
                          selected?.id_notificacion === notif.id_notificacion;
                        return (
                          <button
                            key={notif.id_notificacion}
                            onClick={() => handleSelect(notif)}
                            className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-all flex items-start gap-3 group ${
                              isActive
                                ? "bg-brand/5 border-l-2 border-l-[#C0FF72]"
                                : "hover:bg-white/3 border-l-2 border-l-transparent"
                            }`}
                          >
                            {/* Icono tipo */}
                            <div
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${tipoBg(notif.tipo)}`}
                            >
                              {tipoIcon(notif.tipo)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm leading-snug font-medium truncate ${
                                    notif.leido ? "text-[var(--color-text-secondary)]" : "text-white"
                                  }`}
                                >
                                  {notif.titulo}
                                </p>
                                {!notif.leido && (
                                  <span className="w-2 h-2 rounded-full bg-[#C0FF72] flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-[var(--color-text-subtle)] mt-0.5 line-clamp-1">
                                {notif.mensaje}
                              </p>
                              <p className="text-[10px] text-gray-700 mt-1">
                                {timeAgo(notif.fecha)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Panel derecho ── */}
              <div className="bg-[var(--color-surface-strong)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                {!selected ? (
                  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--color-border)] flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-[var(--color-text-subtle)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                      </svg>
                    </div>
                    <p className="text-[var(--color-text-muted)] font-medium">
                      Selecciona una notificación
                    </p>
                    <p className="text-[var(--color-text-subtle)] text-sm mt-1">
                      para ver todos los detalles
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Header de la notificación */}
                    <div className="flex items-start gap-4 pb-5 border-b border-[var(--color-border)]">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${tipoBg(selected.tipo)}`}
                      >
                        {tipoIcon(selected.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display font-bold text-white text-xl leading-tight">
                          {selected.titulo}
                        </h2>
                        <p className="text-[var(--color-text-muted)] text-xs mt-1">
                          {new Date(selected.fecha).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="py-5">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {selected.mensaje}
                      </p>

                      {/* Oferta detalle si aplica */}
                      {selected.tipo === "recomendacion_oferta" &&
                        (loadingOferta ? (
                          <div className="mt-6 border border-[var(--color-border)] rounded-2xl p-8 flex items-center justify-center">
                            <svg
                              className="animate-spin w-6 h-6 text-brand"
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
                          </div>
                        ) : ofertaDetalle ? (
                          <OfertaDetailInline
                            oferta={ofertaDetalle}
                            yaPostulado={postulaciones.has(
                              ofertaDetalle.id_oferta,
                            )}
                            onVerOferta={() => navigate(selected.url_destino)}
                            onPostular={() =>
                              setPostulacionModal(ofertaDetalle)
                            }
                          />
                        ) : (
                          <div className="mt-6 border border-[var(--color-border)] rounded-2xl p-6 text-center">
                            <p className="text-[var(--color-text-muted)] text-sm">
                              La oferta ya no está disponible
                            </p>
                          </div>
                        ))}

                      {/* Botón genérico si hay url_destino y no es oferta */}
                      {selected.url_destino &&
                        selected.tipo !== "recomendacion_oferta" && (
                          <button
                            onClick={() => navigate(selected.url_destino)}
                            className="mt-5 btn-primary flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            Ver más
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Postulación modal */}
      {postulacionModal && (
        <PostulacionModal
          oferta={postulacionModal}
          onClose={() => setPostulacionModal(null)}
          onSuccess={() => {
            setPostulaciones(
              (prev) => new Set([...prev, postulacionModal.id_oferta]),
            );
          }}
        />
      )}
    </MainLayout>
  );
}
