import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
export default function ConvenioDetailInline({
  notif,
  onAccept,
  onReject,
  loading,
}) {
  const meta = notif.metadata ? JSON.parse(notif.metadata) : {};
  const solicitanteNombre = meta.solicitante_nombre ?? "Entidad desconocida";
  const isEmpresa = notif.url_destino?.startsWith("/empresa/");
  const entityId = notif.url_destino?.split("/").pop();

  const [entityData, setEntityData] = useState(null);

  useEffect(() => {
    if (!entityId) return;
    const tabla = isEmpresa ? "empresa" : "centro_educativo";
    const campos = isEmpresa
      ? "id, nombre, sector, ciudad, tamano, logo_url, verificado"
      : "id, nombre, tipo_centro, ciudad, provincia, avatar_url, verificado";
    supabase
      .from(tabla)
      .select(campos)
      .eq("id", entityId)
      .maybeSingle()
      .then(({ data }) => setEntityData(data));
  }, [entityId, isEmpresa]);

  const initials = solicitanteNombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const avatarUrl = entityData?.logo_url ?? entityData?.avatar_url;
  const subtitle = isEmpresa
    ? [entityData?.sector, entityData?.ciudad, entityData?.tamano]
        .filter(Boolean)
        .join(" · ")
    : [entityData?.tipo_centro, entityData?.ciudad, entityData?.provincia]
        .filter(Boolean)
        .join(" · ");

  const isPending = notif.tipo === "propuesta_convenio";

  return (
    <div className="mt-6 border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="bg-[var(--color-surface-strong)] px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={solicitanteNombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white/70">
                {initials}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white text-base leading-tight">
                {solicitanteNombre}
              </h3>
              {entityData?.verificado && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold">
                  Verificado
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="bg-[var(--color-bg)] border border-white/8 rounded-xl p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Propuesta de convenio de colaboración
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {isEmpresa
              ? `${solicitanteNombre} quiere establecer un acuerdo formal de colaboración contigo para gestionar prácticas y facilitar la inserción laboral de tus estudiantes.`
              : `${solicitanteNombre} propone un convenio de colaboración para que sus estudiantes puedan realizar prácticas en tu empresa.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "ti-file-certificate", label: "Acuerdo formal" },
            { icon: "ti-users", label: "Gestión de prácticas" },
            { icon: "ti-building-community", label: "Red de colaboración" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-[var(--color-bg)] border border-white/8 rounded-xl p-3"
            >
              <i
                className={`ti ${icon} text-[var(--color-text-secondary)] block mb-1`}
                style={{ fontSize: 20 }}
                aria-hidden="true"
              />
              <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            </div>
          ))}
        </div>

        {isPending && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={onReject}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:border-white/30 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            <button
              onClick={onAccept}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand/90 text-dark text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <svg
                  className="animate-spin w-4 h-4"
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
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              Aceptar convenio
            </button>
          </div>
        )}

        {notif.tipo === "convenio_aceptado" && (
          <div className="flex items-center gap-2 py-3 px-4 bg-green-500/8 border border-green-500/20 rounded-xl">
            <svg
              className="w-4 h-4 text-green-400 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-green-400 text-sm font-medium">
              Convenio aceptado — relación activa
            </p>
          </div>
        )}

        {notif.tipo === "convenio_rechazado" && (
          <div className="flex items-center gap-2 py-3 px-4 bg-red-500/8 border border-red-500/20 rounded-xl">
            <svg
              className="w-4 h-4 text-red-400 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-red-400 text-sm font-medium">
              Propuesta rechazada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
