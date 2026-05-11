import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";
import InviteModal from "../components/InviteModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`animate-spin text-brand ${className}`}
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

function Badge({ children, color = "gray" }) {
  const colors = {
    brand: "bg-brand/10  text-brand   border-brand/20",
    green: "bg-emerald-500/10  text-emerald-400  border-emerald-500/20",
    orange: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10    text-red-400    border-red-500/20",
    blue: "bg-sky-500/10   text-sky-400   border-sky-500/20",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    gray: "bg-white/5       text-gray-400   border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, color = "brand", icon, trend }) {
  const ring = {
    brand: "ring-brand/20 bg-brand/5",
    blue: "ring-sky-500/20 bg-sky-500/5",
    purple: "ring-violet-500/20 bg-violet-500/5",
    orange: "ring-amber-500/20 bg-amber-500/5",
    green: "ring-emerald-500/20 bg-emerald-500/5",
  }[color];
  const text = {
    brand: "text-brand",
    blue: "text-sky-400",
    purple: "text-violet-400",
    orange: "text-amber-400",
    green: "text-emerald-400",
  }[color];
  return (
    <div
      className={`${ring} ring-1 rounded-2xl p-5 flex items-center gap-4 hover:ring-2 transition-all duration-200`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${ring} ring-1 flex-shrink-0`}
      >
        <svg className={`w-5 h-5 ${text}`} viewBox="0 0 640 640">
          <use href={`/icons.svg#${icon}`} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-[11px] uppercase tracking-widest font-medium truncate">
          {label}
        </p>
        <p
          className={`font-display text-3xl font-black ${text} mt-0.5 leading-none`}
        >
          {value}
        </p>
        {trend && <p className="text-gray-600 text-[11px] mt-1">{trend}</p>}
      </div>
    </div>
  );
}

function OfferField({ label, value }) {
  const empty = !value || (Array.isArray(value) && value.length === 0);
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">
        {label}
      </p>
      {empty ? (
        <p className="text-gray-600 text-sm">—</p>
      ) : Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-xs border border-white/8 bg-white/5 text-gray-300"
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-200 leading-relaxed">{value}</p>
      )}
    </div>
  );
}

// ─── Modal: Revisar Oferta ────────────────────────────────────────────────────
function ValidarOfertaModal({ oferta, onClose, onSaved }) {
  const [action, setAction] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (action === "rechazada" && !motivo.trim()) return;
    setSaving(true);
    await supabase
      .from("oferta")
      .update({
        estado: action,
        motivo_rechazo: action === "rechazada" ? motivo.trim() : null,
        fecha_modificacion: new Date().toISOString(),
      })
      .eq("id_oferta", oferta.id_oferta);
    setSaving(false);
    onSaved();
    onClose();
  };

  const modalidad_map = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
    Presencial: "Presencial",
    Remoto: "Remoto",
    Híbrido: "Híbrido",
  };
  const tipo_map = {
    practicas: "Prácticas",
    practicas_contratacion: "Prácticas + contratación",
    empleo_junior: "Empleo junior",
    contrato: "Contrato",
    beca: "Beca",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {oferta.empresa_avatar ? (
                <img
                  src={oferta.empresa_avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-building" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-white leading-tight truncate">
                {oferta.titulo}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-gray-500 text-sm">{oferta.empresa_nombre}</p>
                <Badge color="orange">Pendiente de revisión</Badge>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
              Información general
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <OfferField
                label="Tipo de oferta"
                value={tipo_map[oferta.tipo_oferta] ?? oferta.tipo_oferta}
              />
              <OfferField
                label="Modalidad"
                value={modalidad_map[oferta.modalidad] ?? oferta.modalidad}
              />
              <OfferField label="Ubicación" value={oferta.ubicacion} />
              <OfferField
                label="Fecha publicación"
                value={
                  oferta.fecha_publicacion
                    ? new Date(oferta.fecha_publicacion).toLocaleDateString(
                        "es-ES",
                        { day: "2-digit", month: "long", year: "numeric" },
                      )
                    : null
                }
              />
              <OfferField
                label="Duración"
                value={
                  oferta.duracion_semanas
                    ? `${oferta.duracion_semanas} semanas`
                    : (oferta.duracion ?? null)
                }
              />
              <OfferField
                label="Horas / semana"
                value={
                  oferta.horas_semanales ? `${oferta.horas_semanales} h` : null
                }
              />
              <OfferField
                label="Plazas"
                value={
                  oferta.num_plazas != null
                    ? `${oferta.num_plazas_restantes ?? oferta.num_plazas} disponibles de ${oferta.num_plazas}`
                    : oferta.plazas != null
                      ? `${oferta.plazas} plaza${oferta.plazas !== 1 ? "s" : ""}`
                      : null
                }
              />
              <OfferField
                label="Remuneración"
                value={
                  oferta.salario_mensual != null
                    ? oferta.salario_mensual === 0
                      ? "No remunerado"
                      : `${oferta.salario_mensual} €/mes`
                    : (oferta.salario ?? null)
                }
              />
              <OfferField label="Horario" value={oferta.horario} />
              <OfferField
                label="Cierre de solicitudes"
                value={
                  oferta.fecha_fin_solicitud
                    ? new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                        "es-ES",
                        { day: "2-digit", month: "long", year: "numeric" },
                      )
                    : null
                }
              />
              <OfferField
                label="Opción de contratación"
                value={
                  oferta.opcion_contrato != null
                    ? oferta.opcion_contrato
                      ? "Sí"
                      : "No"
                    : null
                }
              />
            </div>
          </div>

          <div className="border-t border-white/6 pt-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
              Descripción
            </p>
            {oferta.descripcion ? (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {oferta.descripcion}
              </p>
            ) : (
              <p className="text-gray-600 text-sm">—</p>
            )}
          </div>

          <div className="border-t border-white/6 pt-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
              Requisitos
            </p>
            {oferta.requisitos || oferta.requisitos_adicionales ? (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {oferta.requisitos ?? oferta.requisitos_adicionales}
              </p>
            ) : (
              <p className="text-gray-600 text-sm">—</p>
            )}
          </div>

          <div className="border-t border-white/6 pt-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
              Tecnologías requeridas
            </p>
            {oferta.tecnologias?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {oferta.tecnologias.map((t) => (
                  <span
                    key={t.id_tecnologia}
                    className="bg-brand/8 border border-brand/20 text-brand/80 text-xs px-2.5 py-1 rounded-lg font-mono"
                  >
                    {t.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">—</p>
            )}
          </div>

          <div className="border-t border-white/6 pt-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
              Beneficios
            </p>
            {oferta.beneficios ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                {oferta.beneficios}
              </p>
            ) : (
              <p className="text-gray-600 text-sm">—</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 p-6 space-y-4 flex-shrink-0 bg-white/[0.02]">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("activa")}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${action === "activa" ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Aprobar oferta
            </button>
            <button
              onClick={() => setAction("rechazada")}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${action === "rechazada" ? "border-red-500/50 bg-red-500/12 text-red-400" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Rechazar
            </button>
          </div>

          {action === "rechazada" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Motivo del rechazo <span className="text-brand">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Explica brevemente por qué se rechaza esta oferta..."
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">
                {motivo.length}/300
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                !action || (action === "rechazada" && !motivo.trim()) || saving
              }
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${
                action === "activa"
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                  : action === "rechazada"
                    ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25"
                    : "bg-white/5 text-gray-400 border border-white/10"
              }`}
            >
              {saving ? (
                <Spinner className="w-4 h-4" />
              ) : action === "activa" ? (
                "Confirmar aprobación"
              ) : action === "rechazada" ? (
                "Confirmar rechazo"
              ) : (
                "Selecciona una acción"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal AdminProfile ────────────────────────────────────────────
export default function AdminProfile() {
  const { user, avatarUrl } = useAuth();

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Admin";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
    tutores: 0,
    ofertas_pendientes: 0,
    ofertas_activas: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [ofertasPendientes, setOfertasPendientes] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [validarOferta, setValidarOferta] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cargarStats = useCallback(async () => {
    setLoadingStats(true);
    const [est, emp, cen, tut, ofPend, ofActiva] = await Promise.all([
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "estudiante"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "empresa"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "centro_educativo"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .in("rol", ["tutor_empresa", "tutor_centro"]),
      supabase
        .from("oferta")
        .select("id_oferta", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabase
        .from("oferta")
        .select("id_oferta", { count: "exact", head: true })
        .eq("estado", "activa"),
    ]);

    [est, emp, cen, tut, ofPend, ofActiva].forEach((r, i) => {
      if (r.error) console.error(`[cargarStats] query ${i}:`, r.error);
    });

    if (!mountedRef.current) return;
    setStats({
      estudiantes: est.count ?? 0,
      empresas: emp.count ?? 0,
      centros: cen.count ?? 0,
      tutores: tut.count ?? 0,
      ofertas_pendientes: ofPend.count ?? 0,
      ofertas_activas: ofActiva.count ?? 0,
    });
    setLoadingStats(false);
  }, []);

  // ── cargarOfertas: query separada a empresa para evitar problemas con FK ──
  const cargarOfertas = useCallback(async () => {
    setLoadingOfertas(true);

    const { data: ofertasData, error: ofertasError } = await supabase
      .from("oferta")
      .select(
        `id_oferta, titulo, descripcion, modalidad, ubicacion, tipo_oferta,
         salario_mensual, duracion_semanas, horas_semanales,
         num_plazas, num_plazas_restantes, beneficios, requisitos_adicionales,
         opcion_contrato, fecha_publicacion, fecha_fin_solicitud,
         estado, id_empresa`,
      )
      .eq("estado", "pendiente")
      .order("fecha_publicacion", { ascending: true });

    if (ofertasError) console.error("[cargarOfertas] ofertas:", ofertasError);

    const ofertasRaw = ofertasData ?? [];

    // ── Obtener datos de empresa por ids únicos ──
    const empresaIds = [
      ...new Set(ofertasRaw.map((o) => o.id_empresa).filter(Boolean)),
    ];
    console.log(
      "IDs empresas en ofertas:",
      ofertasRaw.map((o) => o.id_empresa),
    );
    let empresaMap = {};
    if (empresaIds.length > 0) {
      const { data: empresasData, error: empresasError } = await supabase
        .from("empresa")
        .select("id, nombre, logo_url")
        .in("id", empresaIds);

      if (empresasError)
        console.error("[cargarOfertas] empresas:", empresasError);

      empresaMap = (empresasData ?? []).reduce((acc, e) => {
        acc[e.id] = e;
        return acc;
      }, {});
      console.log("EMPRESAS DATA:", empresasData);
      console.log("EMPRESA MAP:", empresaMap);
    }

    // ── Tecnologías ──
    const ofertaIds = ofertasRaw.map((o) => o.id_oferta);
    let tecMap = {};
    if (ofertaIds.length > 0) {
      const { data: tecData, error: tecError } = await supabase
        .from("oferta_tecnologia")
        .select("id_oferta, tecnologia(id_tecnologia, nombre)")
        .in("id_oferta", ofertaIds);

      if (tecError) console.error("[cargarOfertas] tecnologias:", tecError);

      tecMap = (tecData ?? []).reduce((acc, row) => {
        if (!acc[row.id_oferta]) acc[row.id_oferta] = [];
        if (row.tecnologia) acc[row.id_oferta].push(row.tecnologia);
        return acc;
      }, {});
    }

    if (!mountedRef.current) return;
    setOfertasPendientes(
      ofertasRaw.map((o) => {
        const empresa = empresaMap[o.id_empresa] ?? null;
        return {
          ...o,
          empresa_nombre: empresa?.nombre ?? "Empresa desconocida",
          empresa_avatar: empresa?.logo_url ?? null,
          tecnologias: tecMap[o.id_oferta] ?? [],
        };
      }),
    );
    setLoadingOfertas(false);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    const { data, error } = await supabase
      .from("usuario")
      .select("id, email, nombre, rol, created_at, avatar_url")
      .not("rol", "eq", "admin")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.error("[cargarUsuarios]:", error);
    if (!mountedRef.current) return;
    setUsuarios(data ?? []);
    setLoadingUsuarios(false);
  }, []);

  const cargarAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    const { data, error } = await supabase
      .from("usuario")
      .select("id, email, nombre, created_at, avatar_url")
      .eq("rol", "admin")
      .order("created_at", { ascending: true });
    if (error) console.error("[cargarAdmins]:", error);
    if (!mountedRef.current) return;
    setAdmins(data ?? []);
    setLoadingAdmins(false);
  }, []);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  useEffect(() => {
    if (activeTab === "ofertas") cargarOfertas();
    if (activeTab === "usuarios") cargarUsuarios();
    if (activeTab === "admins") cargarAdmins();
  }, [activeTab, cargarOfertas, cargarUsuarios, cargarAdmins]);

  const handleToggleBlock = async (userId, currentRol) => {
    const nuevoRol = currentRol === "bloqueado" ? "estudiante" : "bloqueado";
    await supabase.from("usuario").update({ rol: nuevoRol }).eq("id", userId);
    cargarUsuarios();
  };

  const rolColor = {
    estudiante: "blue",
    empresa: "purple",
    centro_educativo: "orange",
    tutor_empresa: "green",
    tutor_centro: "green",
    admin: "brand",
    bloqueado: "red",
  };
  const rolLabel = {
    estudiante: "Estudiante",
    empresa: "Empresa",
    centro_educativo: "Centro",
    tutor_empresa: "Tutor empresa",
    tutor_centro: "Tutor centro",
    admin: "Admin",
    bloqueado: "Bloqueado",
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = searchUsuario.toLowerCase();
    return (
      !q ||
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const TABS = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "ofertas",
      label: "Validar ofertas",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      badge: stats.ofertas_pendientes || null,
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      id: "admins",
      label: "Administradores",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-dark font-black font-display text-lg">
                    {initials || "A"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand rounded-full border-2 border-dark flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-dark"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl font-black text-white">
                    Panel de administración
                  </h1>
                  <Badge color="brand">Admin</Badge>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setInviteModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Invitar administrador
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 bg-dark-800 border border-white/8 rounded-xl p-1 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-brand/15 text-brand border border-brand/25 shadow-sm"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/4"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d={tab.icon} />
                </svg>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-amber-500 text-dark text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ══ TAB: DASHBOARD ══ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {loadingStats ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      label="Estudiantes"
                      value={stats.estudiantes}
                      color="blue"
                      icon="icon-student"
                    />
                    <StatCard
                      label="Empresas"
                      value={stats.empresas}
                      color="purple"
                      icon="icon-company"
                    />
                    <StatCard
                      label="Centros educativos"
                      value={stats.centros}
                      color="orange"
                      icon="icon-educativeCenter"
                    />
                    <StatCard
                      label="Tutores"
                      value={stats.tutores}
                      color="green"
                      icon="icon-tutor"
                    />
                    <StatCard
                      label="Ofertas activas"
                      value={stats.ofertas_activas}
                      color="brand"
                      icon="icon-briefcase"
                    />
                    <StatCard
                      label="Pendientes de revisión"
                      value={stats.ofertas_pendientes}
                      color="orange"
                      icon="icon-clock"
                      trend={
                        stats.ofertas_pendientes > 0
                          ? "Requieren atención"
                          : "Todo al día"
                      }
                    />
                  </div>

                  <div className="bg-dark-800 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/6">
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Acciones rápidas
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
                      {[
                        {
                          onClick: () => setActiveTab("ofertas"),
                          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                          colorIcon: "text-amber-400",
                          colorBg: "bg-amber-500/10 border-amber-500/20",
                          label: "Validar ofertas",
                          sub: `${stats.ofertas_pendientes} pendientes`,
                        },
                        {
                          onClick: () => setActiveTab("usuarios"),
                          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                          colorIcon: "text-sky-400",
                          colorBg: "bg-sky-500/10 border-sky-500/20",
                          label: "Gestionar usuarios",
                          sub: `${stats.estudiantes + stats.empresas + stats.centros + stats.tutores} registrados`,
                        },
                        {
                          onClick: () => setInviteModal(true),
                          icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                          colorIcon: "text-brand",
                          colorBg: "bg-brand/10 border-brand/20",
                          label: "Invitar administrador",
                          sub: "Enlace seguro · caduca en 48 h",
                        },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.onClick}
                          className="flex items-center gap-4 p-5 hover:bg-white/3 transition-all group text-left w-full"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.colorBg}`}
                          >
                            <svg
                              className={`w-5 h-5 ${item.colorIcon}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d={item.icon} />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold group-hover:text-brand transition-colors">
                              {item.label}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">
                              {item.sub}
                            </p>
                          </div>
                          <svg
                            className="w-4 h-4 text-gray-700 ml-auto group-hover:text-brand/50 transition-colors"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ TAB: VALIDAR OFERTAS ══ */}
          {activeTab === "ofertas" && (
            <div>
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <div>
                  <h2 className="font-display text-xl font-black text-white">
                    Ofertas pendientes
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Revisa y aprueba o rechaza cada oferta antes de publicarla.
                  </p>
                </div>
                <button
                  onClick={cargarOfertas}
                  className="text-xs text-gray-500 hover:text-brand transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 border border-white/8"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Actualizar
                </button>
              </div>

              {loadingOfertas ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : ofertasPendientes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-gray-300 font-semibold">¡Todo al día!</p>
                  <p className="text-gray-600 text-sm mt-1">
                    No hay ofertas pendientes de revisión.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ofertasPendientes.map((o) => (
                    <div
                      key={o.id_oferta}
                      className="bg-dark-800 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-brand/8 border border-brand/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {o.empresa_avatar ? (
                          <img
                            src={o.empresa_avatar}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <svg
                            className="w-5 h-5 text-brand"
                            viewBox="0 0 640 640"
                          >
                            <use href="/icons.svg#icon-building" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-white text-sm truncate">
                            {o.titulo}
                          </p>
                          <Badge color="orange">Pendiente</Badge>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {o.empresa_nombre} · {o.modalidad ?? "—"} ·{" "}
                          {o.ubicacion ?? "Sin ubicación"}
                        </p>
                        {o.tecnologias.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {o.tecnologias.slice(0, 5).map((t) => (
                              <span
                                key={t.id_tecnologia}
                                className="bg-white/4 border border-white/8 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono"
                              >
                                {t.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs flex-shrink-0 hidden sm:block">
                        {o.fecha_publicacion
                          ? new Date(o.fecha_publicacion).toLocaleDateString(
                              "es-ES",
                            )
                          : ""}
                      </p>
                      <button
                        onClick={() => setValidarOferta(o)}
                        className="flex-shrink-0 btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: USUARIOS ══ */}
          {activeTab === "usuarios" && (
            <div>
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <div>
                  <h2 className="font-display text-xl font-black text-white">
                    Usuarios registrados
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {usuarios.length} usuarios (sin admins)
                  </p>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
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
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="input-field pl-8 text-sm py-2"
                  />
                </div>
              </div>

              {loadingUsuarios ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : (
                <div className="space-y-2">
                  {usuariosFiltrados.map((u) => (
                    <div
                      key={u.id}
                      className="bg-dark-800 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-white/12 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand/8 border border-brand/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-brand text-xs font-bold font-display">
                            {(u.nombre || u.email || "?")[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {u.nombre || "Sin nombre"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {u.email}
                        </p>
                      </div>
                      <Badge color={rolColor[u.rol] ?? "gray"}>
                        {rolLabel[u.rol] ?? u.rol}
                      </Badge>
                      <p className="text-gray-600 text-xs hidden sm:block flex-shrink-0">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("es-ES")
                          : ""}
                      </p>
                      <button
                        onClick={() => handleToggleBlock(u.id, u.rol)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          u.rol === "bloqueado"
                            ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15"
                            : "border-red-500/20 bg-red-500/5 text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                      >
                        {u.rol === "bloqueado" ? "Desbloquear" : "Bloquear"}
                      </button>
                    </div>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <div className="text-center py-12 text-gray-600 text-sm">
                      No se encontraron usuarios.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: ADMINISTRADORES ══ */}
          {activeTab === "admins" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-black text-white">
                    Administradores
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Usuarios con acceso total a la plataforma.
                  </p>
                </div>
                <button
                  onClick={() => setInviteModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Invitar admin
                </button>
              </div>

              {loadingAdmins ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((a) => {
                    const isMe = a.id === user?.id;
                    return (
                      <div
                        key={a.id}
                        className={`border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all ${isMe ? "bg-brand/5 border-brand/20" : "bg-dark-800 border-white/8 hover:border-white/15"}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {a.avatar_url ? (
                            <img
                              src={a.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-brand font-black font-display text-sm">
                              {(a.nombre || a.email || "A")[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-bold text-sm">
                              {a.nombre || "Sin nombre"}
                            </p>
                            {isMe && (
                              <span className="text-[10px] bg-brand/15 text-brand border border-brand/25 px-2 py-0.5 rounded-full font-semibold">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs">{a.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color="brand">Admin</Badge>
                          <p className="text-gray-600 text-xs mt-1.5">
                            Desde{" "}
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString(
                                  "es-ES",
                                  { month: "short", year: "numeric" },
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setInviteModal(true)}
                    className="w-full mt-2 bg-dark-800 border border-dashed border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-brand/30 hover:bg-brand/3 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/4 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/10 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-400 text-sm font-semibold group-hover:text-white transition-colors">
                        Añadir nuevo administrador
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Enlace de invitación seguro · caduca en 48 h
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modales ── */}
      {inviteModal && (
        <InviteModal
          user={user}
          onClose={() => setInviteModal(false)}
          entityType="admin"
          inviteRoute="/admin/registro"
          expiresInHours={48}
          title="Invitar administrador"
          description="Genera un enlace de invitación para que otra persona cree su cuenta de administrador."
          warningText="Los administradores tienen acceso total a la plataforma. Comparte este enlace solo con personas de confianza."
          roleLabel="administrador"
          inviterName="el equipo de administración"
        />
      )}
      {validarOferta && (
        <ValidarOfertaModal
          oferta={validarOferta}
          onClose={() => setValidarOferta(null)}
          onSaved={() => {
            cargarOfertas();
            cargarStats();
          }}
        />
      )}
    </MainLayout>
  );
}
