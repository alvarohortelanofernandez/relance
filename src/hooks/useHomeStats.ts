import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // ajusta la ruta a tu cliente

interface HomeStats {
  ofertasActivas: number;
  tasaColocacion: number;
  loading: boolean;
}

export function useHomeStats(): HomeStats {
  const [ofertasActivas, setOfertasActivas] = useState(0);
  const [tasaColocacion, setTasaColocacion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Ofertas activas
        const { count: ofertasCount } = await supabase
          .from("oferta")
          .select("*", { count: "exact", head: true })
          .eq("estado", "activa");

        // 2. Total estudiantes registrados
        const { count: totalEstudiantes } = await supabase
          .from("estudiante")
          .select("*", { count: "exact", head: true });

        // 3. Estudiantes únicos con colocación activa
        const { data: colocaciones } = await supabase
          .from("empresa_estudiante")
          .select("id_estudiante")
          .eq("activo", true);

        const estudiantesColocados = new Set(
          (colocaciones ?? []).map((c) => c.id_estudiante),
        ).size;

        const tasa =
          totalEstudiantes && totalEstudiantes > 0
            ? Math.round((estudiantesColocados / totalEstudiantes) * 100)
            : 0;

        const { data: debug, error } = await supabase
          .from("oferta")
          .select("estado")
          .limit(5);
        console.log("DEBUG ofertas:", debug, error);

        const { data: debugCol, error: errorCol } = await supabase
          .from("empresa_estudiante")
          .select("id_estudiante, activo")
          .limit(5);
        console.log("DEBUG colocaciones:", debugCol, errorCol);

        setOfertasActivas(ofertasCount ?? 0);
        setTasaColocacion(tasa);
      } catch (err) {
        console.error("Error fetching home stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { ofertasActivas, tasaColocacion, loading };
}
