import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type HeroStats = {
  estudiantes: number;
  empresas: number;
  centros: number;
  tutores: number;
};

export const useHeroStats = () => {
  const [stats, setStats] = useState<HeroStats>({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
    tutores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from("usuario").select("rol");

        if (error) throw error;

        const rows = data ?? [];
        setStats({
          estudiantes: rows.filter((u) => u.rol === "estudiante").length,
          empresas: rows.filter((u) => u.rol === "empresa").length,
          centros: rows.filter((u) => u.rol === "centro_educativo").length,
          tutores: rows.filter(
            (u) => u.rol === "tutor_empresa" || u.rol === "tutor_centro",
          ).length,
        });
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading, error };
};
