/**
 * CandidatosModal
 * Muestra los estudiantes que han postulado a una oferta concreta.
 * Al clicar en un candidato abre el StudentProfileDrawer.
 *
 * Props:
 *  - oferta: objeto de la oferta
 *  - onClose: () => void
 *  - supabase: supabaseClient
 */

import { useState, useEffect } from "react";
import StudentProfileDrawer from "../profiles/StudentProfileDrawer";

function Spinner() {
  return (
    <svg
      className="animate-spin w-5 h-5 text-[#C0FF72]"
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

const ESTADO_META = {
  pendiente: {
    label: "Pendiente",
    cls: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  revisado: {
    label: "Revisado",
    cls: "bg-blue-500/10   text-blue-400   border-blue-500/20",
  },
  aceptado: {
    label: "Aceptado",
    cls: "bg-green-500/10  text-green-400  border-green-500/20",
  },
  rechazado: {
    label: "Rechazado",
    cls: "bg-red-500/10    text-red-400    border-red-500/20",
  },
};

function Avatar({ src, nombre }) {
  const initial = nombre?.[0]?.toUpperCase() ?? "?";
  return src ? (
    <img
      src={src}
      alt={nombre}
      className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-xl bg-[#C0FF72]/10 border border-[#C0FF72]/20 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-[#C0FF72] font-display">
        {initial}
      </span>
    </div>
  );
}

export default function CandidatesModal({ oferta, onClose, supabase }) {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfilId, setPerfilId] = useState(null); // id del estudiante a ver

  useEffect(() => {
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("candidatura")
          .select(
            `
            id_candidatura,
            estado,
            fecha_solicitud,
            mensaje,
            id_estudiante,
            estudiante:estudiante!candidatura_id_estudiante_fkey(
              id,
              nombre,
              apellidos,
              especialidad,
              usuario:usuario!estudiante_id_fkey(avatar_url, email)
            )
          `,
          )
          .eq("id_oferta", oferta.id_oferta)
          .order("fecha_solicitud", { ascending: false });

        if (err) throw err;

        setCandidatos(
          (data ?? []).map((c) => ({
            ...c,
            nombre: c.estudiante?.nombre ?? "—",
            apellidos: c.estudiante?.apellidos ?? "",
            especialidad: c.estudiante?.especialidad ?? null,
            email: c.estudiante?.usuario?.email ?? null,
            avatar: c.estudiante?.usuario?.avatar_url ?? null,
          })),
        );
      } catch (e) {
        setError(e.message ?? "Error al cargar candidatos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [oferta.id_oferta, supabase]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-[#0e0e0e] border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-display text-lg font-bold text-white leading-tight">
                Candidatos
              </h2>
              <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[280px]">
                {oferta.titulo}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!loading && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C0FF72]/10 text-[#C0FF72] border border-[#C0FF72]/20">
                  {candidatos.length} postulación
                  {candidatos.length !== 1 ? "es" : ""}
                </span>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/8 transition-all"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 px-8 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : candidatos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  Sin candidatos aún
                </p>
                <p className="text-gray-700 text-xs mt-1">
                  Los estudiantes que se postulen aparecerán aquí
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {candidatos.map((c) => {
                  const estado = ESTADO_META[c.estado] ?? ESTADO_META.pendiente;
                  return (
                    <li key={c.id_candidatura}>
                      <button
                        onClick={() => setPerfilId(c.id_estudiante)}
                        className="w-full flex items-start gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                      >
                        <Avatar src={c.avatar} nombre={c.nombre} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-white text-sm group-hover:text-[#C0FF72] transition-colors">
                              {c.nombre} {c.apellidos}
                            </p>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${estado.cls}`}
                            >
                              {estado.label}
                            </span>
                          </div>
                          {c.especialidad && (
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                              {c.especialidad}
                            </p>
                          )}
                          {c.mensaje && (
                            <p className="text-gray-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                              "{c.mensaje}"
                            </p>
                          )}
                          <p className="text-gray-700 text-[10px] mt-1.5">
                            {new Date(c.fecha_solicitud).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        {/* Flecha indicador */}
                        <svg
                          className="w-4 h-4 text-gray-700 group-hover:text-[#C0FF72] transition-colors flex-shrink-0 mt-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Perfil del estudiante en drawer lateral */}
      {perfilId && (
        <StudentProfileDrawer
          estudianteId={perfilId}
          onClose={() => setPerfilId(null)}
          supabase={supabase}
        />
      )}
    </>
  );
}
