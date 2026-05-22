import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type HeroStats = {
  estudiantes: number;
  empresas: number;
  centros: number;
};

export const useHeroStats = () => {
  const [stats, setStats] = useState<HeroStats>({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc("get_hero_stats");
        if (error) throw error;
        setStats({
          estudiantes: data?.estudiantes ?? 0,
          empresas: data?.empresas ?? 0,
          centros: data?.centros ?? 0,
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