/**
 * UserProfilePage.tsx — v2
 *
 * Rediseño completo con:
 * - Layout más rico (hero expandido, stats, timeline de actividad)
 * - Sección de candidaturas y valoraciones según rol
 * - Sugerencias inteligentes al pie:
 *   • Estudiante → compañeros del mismo centro, o similares por habilidades/titulación
 *   • Empresa → empresas del mismo sector / ciudad
 *   • Centro → centros de la misma ciudad / tipo
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerRole =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";

interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  titulacion?: string;
  ciudad?: string;
  telefono?: string;
  sobre_mi?: string;
  disponibilidad?: string;
  tipo_busqueda?: string;
  modalidad?: string;
  habilidades?: string[];
  avatar_url?: string;
  perfil_publico?: boolean;
  github_username?: string;
  formaciones?: unknown[];
  proyectos?: unknown[];
  redes_sociales?: Record<string, string>;
  created_at?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  sector?: string;
  ciudad?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  web?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  logo_url?: string;
  verificado?: boolean;
  tamano?: string;
  cif?: string;
  created_at?: string;
}

interface CentroEducativo {
  id: string;
  nombre: string;
  tipo_centro?: string;
  ciudad?: string;
  provincia?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  sitio_web?: string;
  avatar_url?: string;
  verificado?: boolean;
  num_alumnos?: number;
  titulaciones?: string[];
  created_at?: string;
}

type ProfileData = Estudiante | Empresa | CentroEducativo;

interface ActionState {
  loading: boolean;
  success: string | null;
  error: string | null;
}

interface SuggestedProfile {
  id: string;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  href: string;
  type: EntityType;
  reason: string; // por qué se sugiere
}

interface Candidatura {
  id_candidatura: number;
  estado: string;
  fecha_envio: string;
  comentario_empresa?: string;
  id_oferta: string;
  titulo_oferta?: string;
}

interface Valoracion {
  id: string;
  puntuacion: number;
  created_at: string;
}

interface UserProfilePageProps {
  entityType: EntityType;
  entityId: string;
  onBack?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro Educativo",
  estudiante: "Estudiante",
  oferta: "Oferta",
};

const ENTITY_COLOR: Record<
  EntityType,
  { bg: string; text: string; border: string; glow: string }
> = {
  empresa: {
    bg: "rgba(192,255,114,0.08)",
    text: "#c0ff72",
    border: "rgba(192,255,114,0.18)",
    glow: "rgba(192,255,114,0.12)",
  },
  centro_educativo: {
    bg: "rgba(99,179,237,0.08)",
    text: "#63b3ed",
    border: "rgba(99,179,237,0.18)",
    glow: "rgba(99,179,237,0.12)",
  },
  estudiante: {
    bg: "rgba(246,173,85,0.08)",
    text: "#f6ad55",
    border: "rgba(246,173,85,0.18)",
    glow: "rgba(246,173,85,0.12)",
  },
  oferta: {
    bg: "rgba(159,122,234,0.08)",
    text: "#9f7aea",
    border: "rgba(159,122,234,0.18)",
    glow: "rgba(159,122,234,0.12)",
  },
};

const DISPONIBILIDAD_COLOR: Record<string, { bg: string; text: string }> = {
  inmediata: { bg: "rgba(74,222,128,0.1)", text: "#4ade80" },
  "1_mes": { bg: "rgba(250,204,21,0.1)", text: "#facc15" },
  "3_meses": { bg: "rgba(251,146,60,0.1)", text: "#fb923c" },
  no_disponible: { bg: "rgba(239,68,68,0.1)", text: "#f87171" },
};

const CANDIDATURA_COLOR: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: "rgba(250,204,21,0.1)", text: "#facc15" },
  aceptada: { bg: "rgba(74,222,128,0.1)", text: "#4ade80" },
  rechazada: { bg: "rgba(239,68,68,0.1)", text: "#f87171" },
  en_proceso: { bg: "rgba(99,179,237,0.1)", text: "#63b3ed" },
};

// ─── Atom Components ──────────────────────────────────────────────────────────

function Avatar({
  url,
  name,
  size = 80,
  entityType,
}: {
  url?: string;
  name: string;
  size?: number;
  entityType?: EntityType;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const ec = entityType ? ENTITY_COLOR[entityType] : ENTITY_COLOR.estudiante;
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: size / 5,
          objectFit: "cover",
          border: `2px solid ${ec.border}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 5,
        background: ec.bg,
        border: `2px solid ${ec.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.3,
        fontWeight: 700,
        color: ec.text,
        fontFamily: "Syne, sans-serif",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color?: { bg: string; text: string; border: string };
}) {
  const c = color ?? {
    bg: "rgba(255,255,255,0.06)",
    text: "var(--color-text-muted)",
    border: "var(--color-border-strong)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 6,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        fontSize: 12,
        padding: "4px 11px",
        borderRadius: 20,
        background: accent
          ? "rgba(192,255,114,0.07)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${accent ? "rgba(192,255,114,0.18)" : "var(--color-border-strong)"}`,
        color: accent ? "#c0ff72" : "var(--color-text-secondary)",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: accent ? 600 : 400,
      }}
    >
      {label}
    </span>
  );
}

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--color-border)", margin: "0" }}
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          fontSize: 14,
          width: 18,
          flexShrink: 0,
          textAlign: "center",
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 12,
          minWidth: 88,
          color: "var(--color-text-subtle)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: "var(--color-brand)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            wordBreak: "break-word",
            textDecoration: "none",
          }}
        >
          {value} →
        </a>
      ) : (
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            wordBreak: "break-word",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  noPad,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 20px 12px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {title}
        </span>
      </div>
      <div style={noPad ? {} : { padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "14px 16px",
        textAlign: "center",
        flex: 1,
        minWidth: 80,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: color ?? "var(--color-text)",
          fontFamily: "Syne, sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-subtle)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  variant = "secondary",
  onClick,
  loading,
  disabled,
  danger,
  icon,
}: {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "1px solid",
    transition: "all 0.15s",
    opacity: disabled || loading ? 0.5 : 1,
  };
  const styles: React.CSSProperties =
    variant === "primary"
      ? {
          ...base,
          background: danger ? "rgba(239,68,68,0.12)" : "var(--color-brand)",
          color: danger ? "#f87171" : "#03080f",
          borderColor: danger ? "rgba(239,68,68,0.3)" : "transparent",
        }
      : {
          ...base,
          background: "transparent",
          color: danger ? "#f87171" : "var(--color-text-secondary)",
          borderColor: danger
            ? "rgba(239,68,68,0.25)"
            : "var(--color-border-strong)",
        };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={styles}>
      {loading ? (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
          }}
        />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: 12,
        background:
          type === "success"
            ? "rgba(192,255,114,0.12)"
            : "rgba(239,68,68,0.12)",
        border: `1px solid ${type === "success" ? "rgba(192,255,114,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: type === "success" ? "#c0ff72" : "#f87171",
        fontSize: 13,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "fade-up 0.2s ease forwards",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

// ─── Suggested Profile Card ───────────────────────────────────────────────────

function SuggestedCard({ profile }: { profile: SuggestedProfile }) {
  const ec = ENTITY_COLOR[profile.type];
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <a
      href={profile.href}
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = ec.border;
        (e.currentTarget as HTMLElement).style.background = ec.bg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "var(--color-border)";
        (e.currentTarget as HTMLElement).style.background =
          "var(--color-surface-strong)";
      }}
    >
      <div
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "16px",
          transition: "all 0.18s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                objectFit: "cover",
                border: `1px solid ${ec.border}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: ec.bg,
                border: `1px solid ${ec.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: ec.text,
                fontFamily: "Syne, sans-serif",
                flexShrink: 0,
              }}
            >
              {initials || "?"}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.name}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--color-text-muted)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.subtitle}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: ec.text,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            background: ec.bg,
            padding: "3px 8px",
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: ec.text,
              flexShrink: 0,
            }}
          />
          {profile.reason}
        </div>
      </div>
    </a>
  );
}

// ─── Candidatura Card ─────────────────────────────────────────────────────────

function CandidaturaCard({ c }: { c: Candidatura }) {
  const col = CANDIDATURA_COLOR[c.estado] ?? {
    bg: "rgba(255,255,255,0.06)",
    text: "var(--color-text-muted)",
  };
  const date = new Date(c.fecha_envio).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--color-text)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {c.titulo_oferta ?? `Oferta #${c.id_candidatura}`}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--color-text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            marginTop: 2,
          }}
        >
          {date}
        </div>
      </div>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "3px 9px",
          borderRadius: 6,
          background: col.bg,
          color: col.text,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          flexShrink: 0,
        }}
      >
        {c.estado}
      </span>
    </div>
  );
}

// ─── Skills Radar (simple bar chart) ──────────────────────────────────────────

function SkillsRadar({ habilidades }: { habilidades: string[] }) {
  // Muestra las primeras 6 skills con una barra decorativa aleatoria-determinista
  const topSkills = habilidades.slice(0, 6);
  const hashStr = (s: string) =>
    s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {topSkills.map((skill) => {
        const pct = 45 + (hashStr(skill) % 50); // 45–94%
        return (
          <div key={skill}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {skill}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-subtle)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {pct}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #c0ff72, #63b3ed)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline item ────────────────────────────────────────────────────────────

function TimelineItem({
  icon,
  text,
  date,
  accent,
}: {
  icon: string;
  text: string;
  date: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: accent
            ? "rgba(192,255,114,0.1)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${accent ? "rgba(192,255,114,0.2)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            marginTop: 2,
          }}
        >
          {date}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserProfilePage({
  entityType,
  entityId,
  onBack,
}: UserProfilePageProps) {
  const { user } = useAuth();
  const viewerRole: ViewerRole =
    (user?.user_metadata?.rol as ViewerRole) ?? "estudiante";
  const viewerId = user?.id ?? "";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    loading: false,
    success: null,
    error: null,
  });
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [stats, setStats] = useState<{
    candidaturas: number;
    ofertas: number;
    estudiantes: number;
    valoracion?: number;
  }>({ candidaturas: 0, ofertas: 0, estudiantes: 0 });

  const [viewerContext, setViewerContext] = useState<{
    centroId?: string;
    empresaId?: string;
    centroEstudiante?: string;
    isMiEstudiante?: boolean;
    isEnrolledEstudiante?: boolean;
    isMyPracticasStudent?: boolean;
  }>({});

  const [userBlock, setUserBlock] = useState<{ blocked: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "info" | "candidaturas" | "actividad"
  >("info");

  // ── Load profile ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const table =
          entityType === "empresa"
            ? "empresa"
            : entityType === "centro_educativo"
              ? "centro_educativo"
              : "estudiante";
        const { data, error: e } = await supabase
          .from(table)
          .select("*")
          .eq("id", entityId)
          .maybeSingle();
        if (e || !data) {
          setError(e?.message ?? "No encontrado");
          return;
        }
        setProfile(data as ProfileData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityType, entityId]);

  // ── Load extra data (stats, candidaturas, valoraciones, suggestions) ──
  useEffect(() => {
    if (!profile) return;

    const loadExtras = async () => {
      const loads: Promise<void>[] = [];

      // ─ Stats según tipo ─
      if (entityType === "estudiante") {
        loads.push(
          (async () => {
            const [{ count: nCand }, { count: nVal }] = await Promise.all([
              supabase
                .from("candidatura")
                .select("id_candidatura", { count: "exact", head: true })
                .eq("id_estudiante", entityId),
              supabase
                .from("valoracion_empresa")
                .select("id", { count: "exact", head: true })
                .eq("id_estudiante", entityId),
            ]);
            // candidaturas detail
            const { data: candData } = await supabase
              .from("candidatura")
              .select(
                "id_candidatura, estado, fecha_envio, comentario_empresa, id_oferta",
              )
              .eq("id_estudiante", entityId)
              .order("fecha_envio", { ascending: false })
              .limit(10);

            // Enrich with oferta titles
            const enriched: Candidatura[] = await Promise.all(
              (candData ?? []).map(async (c) => {
                const { data: oferta } = await supabase
                  .from("oferta")
                  .select("titulo")
                  .eq("id_oferta", c.id_oferta)
                  .maybeSingle();
                return { ...c, titulo_oferta: oferta?.titulo };
              }),
            );
            setCandidaturas(enriched);
            setStats((s) => ({ ...s, candidaturas: nCand ?? 0 }));
          })(),
        );
      }

      if (entityType === "empresa") {
        loads.push(
          (async () => {
            const [{ count: nOfertas }, { count: nCand }, valData] =
              await Promise.all([
                supabase
                  .from("oferta")
                  .select("id_oferta", { count: "exact", head: true })
                  .eq("id_empresa", entityId),
                supabase
                  .from("candidatura")
                  .select("id_candidatura", { count: "exact", head: true })
                  .eq("id_oferta", entityId as any),
                supabase
                  .from("valoracion_empresa")
                  .select("puntuacion")
                  .eq("id_empresa", entityId),
              ]);
            const vals = valData.data ?? [];
            const avg = vals.length
              ? vals.reduce((a, v) => a + Number(v.puntuacion), 0) / vals.length
              : undefined;
            setValoraciones(vals as Valoracion[]);
            setStats((s) => ({
              ...s,
              ofertas: nOfertas ?? 0,
              candidaturas: nCand ?? 0,
              valoracion: avg ? parseFloat(avg.toFixed(1)) : undefined,
            }));
          })(),
        );
      }

      if (entityType === "centro_educativo") {
        loads.push(
          (async () => {
            const { count: nEst } = await supabase
              .from("centro_estudiante")
              .select("id", { count: "exact", head: true })
              .eq("id_centro", entityId);
            setStats((s) => ({ ...s, estudiantes: nEst ?? 0 }));
          })(),
        );
      }

      // ─ Suggestions ─
      loads.push(
        (async () => {
          const sugs: SuggestedProfile[] = [];

          if (entityType === "estudiante") {
            const est = profile as Estudiante;

            // 1. Compañeros del mismo centro
            const { data: centroLink } = await supabase
              .from("centro_estudiante")
              .select("id_centro")
              .eq("id_estudiante", entityId)
              .maybeSingle();

            if (centroLink?.id_centro) {
              const { data: compañeros } = await supabase
                .from("centro_estudiante")
                .select("id_estudiante")
                .eq("id_centro", centroLink.id_centro)
                .neq("id_estudiante", entityId)
                .limit(4);

              if (compañeros?.length) {
                const ids = compañeros.map((c) => c.id_estudiante);
                const { data: profiles } = await supabase
                  .from("estudiante")
                  .select(
                    "id, nombre, apellidos, titulacion, ciudad, avatar_url",
                  )
                  .in("id", ids);
                (profiles ?? []).forEach((p) => {
                  sugs.push({
                    id: p.id,
                    type: "estudiante",
                    name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                    subtitle: [p.titulacion, p.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: p.avatar_url,
                    href: `/estudiantes/${p.id}`,
                    reason: "Mismo centro",
                  });
                });
              }
            }

            // 2. Estudiantes con misma titulación (si no hay suficientes del centro)
            if (sugs.length < 4 && est.titulacion) {
              const existing = new Set(sugs.map((s) => s.id));
              existing.add(entityId);
              const { data: mismosTitulo } = await supabase
                .from("estudiante")
                .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
                .ilike("titulacion", `%${est.titulacion.split(" ")[0]}%`)
                .neq("id", entityId)
                .limit(6);
              (mismosTitulo ?? [])
                .filter((p) => !existing.has(p.id))
                .slice(0, 4 - sugs.length)
                .forEach((p) => {
                  sugs.push({
                    id: p.id,
                    type: "estudiante",
                    name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                    subtitle: [p.titulacion, p.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: p.avatar_url,
                    href: `/estudiantes/${p.id}`,
                    reason: "Misma titulación",
                  });
                });
            }

            // 3. Si aún faltan, buscar por ciudad
            if (sugs.length < 4 && est.ciudad) {
              const existing = new Set(sugs.map((s) => s.id));
              existing.add(entityId);
              const { data: mismaCiudad } = await supabase
                .from("estudiante")
                .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
                .ilike("ciudad", `%${est.ciudad}%`)
                .neq("id", entityId)
                .limit(6);
              (mismaCiudad ?? [])
                .filter((p) => !existing.has(p.id))
                .slice(0, 4 - sugs.length)
                .forEach((p) => {
                  sugs.push({
                    id: p.id,
                    type: "estudiante",
                    name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                    subtitle: [p.titulacion, p.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: p.avatar_url,
                    href: `/estudiantes/${p.id}`,
                    reason: `En ${est.ciudad}`,
                  });
                });
            }
          }

          if (entityType === "empresa") {
            const emp = profile as Empresa;
            const filters: Promise<void>[] = [];

            if (emp.sector) {
              filters.push(
                (async () => {
                  const { data } = await supabase
                    .from("empresa")
                    .select("id, nombre, sector, ciudad, logo_url")
                    .ilike("sector", `%${emp.sector}%`)
                    .neq("id", entityId)
                    .limit(4);
                  (data ?? []).forEach((e) => {
                    sugs.push({
                      id: e.id,
                      type: "empresa",
                      name: e.nombre,
                      subtitle: [e.sector, e.ciudad]
                        .filter(Boolean)
                        .join(" · "),
                      avatarUrl: e.logo_url,
                      href: `/empresas/${e.id}`,
                      reason: `Sector: ${emp.sector}`,
                    });
                  });
                })(),
              );
            }
            await Promise.all(filters);
          }

          if (entityType === "centro_educativo") {
            const centro = profile as CentroEducativo;
            if (centro.ciudad) {
              const { data } = await supabase
                .from("centro_educativo")
                .select("id, nombre, tipo_centro, ciudad, avatar_url")
                .ilike("ciudad", `%${centro.ciudad}%`)
                .neq("id", entityId)
                .limit(4);
              (data ?? []).forEach((c) => {
                sugs.push({
                  id: c.id,
                  type: "centro_educativo",
                  name: c.nombre,
                  subtitle: [c.tipo_centro, c.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: c.avatar_url,
                  href: `/centros/${c.id}`,
                  reason: `En ${centro.ciudad}`,
                });
              });
            }
          }

          setSuggestions(sugs.slice(0, 4));
        })(),
      );

      await Promise.all(loads);
    };

    loadExtras();
  }, [profile, entityType, entityId]);

  // ── Load viewer context ──
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const ctx: typeof viewerContext = {};
      const loads: Promise<void>[] = [];

      if (viewerRole === "tutor_centro") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_centro")
              .select("centro_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();
            if (data) ctx.centroId = data.centro_id;
          })(),
        );
        if (entityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("centro_estudiante")
                .select("id, id_tutor")
                .eq("id_estudiante", entityId)
                .maybeSingle();
              if (data) {
                ctx.centroEstudiante = data.id;
                ctx.isMiEstudiante = data.id_tutor === viewerId;
              }
            })(),
          );
        }
      }

      if (viewerRole === "tutor_empresa") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_empresa")
              .select("empresa_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();
            if (data) ctx.empresaId = data.empresa_id;
          })(),
        );
        if (entityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("estudiante_estado")
                .select("id, estado")
                .eq("id_estudiante", entityId)
                .maybeSingle();
              ctx.isMyPracticasStudent = data?.estado === "en_practicas";
            })(),
          );
        }
      }

      if (viewerRole === "centro_educativo" && entityType === "estudiante") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("centro_estudiante")
              .select("id")
              .eq("id_estudiante", entityId)
              .maybeSingle();
            ctx.isEnrolledEstudiante = !!data;
          })(),
        );
      }

      if (viewerRole === "administrador") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("usuario")
              .select("id")
              .eq("id", entityId)
              .maybeSingle();
            setUserBlock({ blocked: false });
          })(),
        );
      }

      await Promise.all(loads);
      setViewerContext(ctx);
    };
    load();
  }, [user, viewerRole, viewerId, entityId, entityType]);

  // ── Action helpers ──
  const withAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionState({ loading: true, success: null, error: null });
    try {
      await fn();
      setActionState({ loading: false, success: successMsg, error: null });
    } catch (e: unknown) {
      setActionState({
        loading: false,
        success: null,
        error: e instanceof Error ? e.message : "Error inesperado",
      });
    }
  };

  const handleBlock = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: true } as any)
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      setUserBlock({ blocked: true });
    }, "Usuario bloqueado");

  const handleUnblock = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: false } as any)
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      setUserBlock({ blocked: false });
    }, "Usuario desbloqueado");

  const handleVerify = (table: "empresa" | "centro_educativo") => () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from(table)
        .update({ verificado: true })
        .eq("id", entityId);
      if (e) throw new Error(e.message);
    }, `${ENTITY_LABELS[entityType]} verificado`);

  const handleDelete = () =>
    withAction(async () => {
      if (
        !window.confirm(
          "¿Seguro que deseas eliminar este perfil? Acción irreversible.",
        )
      )
        return;
      const table =
        entityType === "empresa"
          ? "empresa"
          : entityType === "centro_educativo"
            ? "centro_educativo"
            : "estudiante";
      const { error: e } = await supabase
        .from(table)
        .delete()
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      setTimeout(() => (window.location.href = "/"), 1000);
    }, "Perfil eliminado");

  const handleEnrollEstudiante = () =>
    withAction(async () => {
      const { data: cData } = await supabase
        .from("centro_educativo")
        .select("id")
        .eq("id", viewerId)
        .maybeSingle();
      const centroId = viewerContext.centroId ?? cData?.id ?? viewerId;
      const { error: e } = await supabase
        .from("centro_estudiante")
        .insert({ id_centro: centroId, id_estudiante: entityId });
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: true }));
    }, "Estudiante vinculado al centro");

  const handleUnenrollEstudiante = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .delete()
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: false }));
    }, "Estudiante desvinculado del centro");

  const handleAssignMiEstudiante = () =>
    withAction(async () => {
      if (!viewerContext.centroEstudiante)
        throw new Error("El estudiante no pertenece a tu centro");
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: viewerId })
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMiEstudiante: true }));
    }, "Estudiante asignado como tu tutorizado");

  const handleUnassignMiEstudiante = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: null })
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMiEstudiante: false }));
    }, "Estudiante desasignado de tu tutela");

  const handleStartPracticas = () =>
    withAction(async () => {
      if (!viewerContext.empresaId)
        throw new Error("No se encontró tu empresa");
      const { error: e } = await supabase
        .from("estudiante_estado")
        .upsert({
          id_estudiante: entityId,
          id_empresa: viewerContext.empresaId,
          estado: "en_practicas",
          updated_at: new Date().toISOString(),
        });
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: true }));
    }, "Estudiante marcado como alumno en prácticas");

  const handleEndPracticas = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("estudiante_estado")
        .update({ estado: "finalizado", updated_at: new Date().toISOString() })
        .eq("id_estudiante", entityId)
        .eq("id_empresa", viewerContext.empresaId ?? "");
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: false }));
    }, "Prácticas finalizadas");

  const handleGuardarEstudiante = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("guardado")
        .insert({
          id_estudiante: entityId,
          fecha_guardado: new Date().toISOString(),
        });
      if (e) throw new Error(e.message);
    }, "Estudiante guardado");

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2.5px solid var(--color-border-strong)",
            borderTopColor: "var(--color-brand)",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {error ?? "Perfil no encontrado"}
        </span>
        {onBack && (
          <button onClick={onBack} className="btn-secondary text-sm">
            ← Volver
          </button>
        )}
      </div>
    );
  }

  const ec = ENTITY_COLOR[entityType];

  const getName = () => {
    if (entityType === "estudiante") {
      const s = profile as Estudiante;
      return `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim();
    }
    return (profile as Empresa | CentroEducativo).nombre ?? "";
  };
  const getAvatar = () =>
    entityType === "empresa"
      ? (profile as Empresa).logo_url
      : (profile as Estudiante | CentroEducativo).avatar_url;
  const getMemberSince = () => {
    const d = (profile as any).created_at;
    if (!d) return null;
    return new Date(d).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const profileName = getName();
  const avatarUrl = getAvatar();
  const memberSince = getMemberSince();

  // Render tabs
  const canSeeCandidaturas =
    viewerRole === "administrador" ||
    viewerRole === "empresa" ||
    viewerRole === "tutor_empresa" ||
    viewerRole === "tutor_centro" ||
    (viewerRole === "estudiante" &&
      entityType === "estudiante" &&
      entityId === viewerId);
  const tabs = [
    { id: "info" as const, label: "Información" },
    ...(canSeeCandidaturas && entityType === "estudiante"
      ? [
          {
            id: "candidaturas" as const,
            label: `Candidaturas (${stats.candidaturas})`,
          },
        ]
      : []),
    { id: "actividad" as const, label: "Actividad" },
  ];

  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "28px 16px 60px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {/* ── Back ── */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: 13,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "var(--color-surface-strong)",
          border: `1px solid ${ec.border}`,
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 14,
          position: "relative",
        }}
      >
        {/* Banner gradient */}
        <div
          style={{
            height: 72,
            background: `linear-gradient(135deg, ${ec.glow} 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.015), rgba(255,255,255,0.005))`,
            borderBottom: `1px solid ${ec.border}`,
            position: "relative",
          }}
        >
          {/* Decorative dots */}
          <svg
            style={{ position: "absolute", top: 0, right: 0, opacity: 0.15 }}
            width="160"
            height="72"
            viewBox="0 0 160 72"
          >
            {Array.from({ length: 48 }).map((_, i) => (
              <circle
                key={i}
                cx={(i % 8) * 20 + 10}
                cy={Math.floor(i / 8) * 20 + 6}
                r="1.5"
                fill={ec.text}
              />
            ))}
          </svg>
        </div>

        <div style={{ padding: "0 28px 24px" }}>
          {/* Avatar overlap */}
          <div
            style={{
              marginTop: -36,
              marginBottom: 14,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ position: "relative" }}>
              <Avatar
                url={avatarUrl}
                name={profileName}
                size={80}
                entityType={entityType}
              />
              {"verificado" in profile && profile.verificado && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#c0ff72",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--color-surface-strong)",
                    fontSize: 10,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                paddingTop: 40,
              }}
            >
              {renderActions()}
            </div>
          </div>

          {/* Name + badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: "var(--color-text)",
                fontFamily: "Syne, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {profileName}
            </h1>
            <Badge label={ENTITY_LABELS[entityType]} color={ec} />
            {entityType === "estudiante" &&
              (profile as Estudiante).disponibilidad &&
              (() => {
                const disp = (profile as Estudiante).disponibilidad!;
                const dc =
                  DISPONIBILIDAD_COLOR[disp] ??
                  DISPONIBILIDAD_COLOR["no_disponible"];
                return (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: dc.bg,
                      color: dc.text,
                      border: `1px solid ${dc.text}33`,
                    }}
                  >
                    ●{" "}
                    {disp === "inmediata"
                      ? "Disponible ahora"
                      : disp === "1_mes"
                        ? "Disponible en 1 mes"
                        : disp === "3_meses"
                          ? "Disponible en 3 meses"
                          : "No disponible"}
                  </span>
                );
              })()}
          </div>

          {/* Subtitle */}
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 14,
              color: "var(--color-text-muted)",
            }}
          >
            {entityType === "estudiante" &&
              [
                (profile as Estudiante).titulacion,
                (profile as Estudiante).ciudad,
              ]
                .filter(Boolean)
                .join(" · ")}
            {entityType === "empresa" &&
              [
                (profile as Empresa).sector,
                (profile as Empresa).ciudad,
                (profile as Empresa).tamano,
              ]
                .filter(Boolean)
                .join(" · ")}
            {entityType === "centro_educativo" &&
              [
                (profile as CentroEducativo).tipo_centro,
                (profile as CentroEducativo).ciudad,
                (profile as CentroEducativo).provincia,
              ]
                .filter(Boolean)
                .join(" · ")}
          </p>

          {/* Meta info row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {memberSince && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>📅</span> Miembro desde {memberSince}
              </span>
            )}
            {entityType === "estudiante" &&
              (profile as Estudiante).modalidad && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>🌐</span> {(profile as Estudiante).modalidad}
                </span>
              )}
            {entityType === "estudiante" &&
              (profile as Estudiante).tipo_busqueda && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>🔍</span> {(profile as Estudiante).tipo_busqueda}
                </span>
              )}
            {entityType === "empresa" && (profile as Empresa).web && (
              <a
                href={(profile as Empresa).web!}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: ec.text,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>🌐</span> {(profile as Empresa).web}
              </a>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        {(stats.candidaturas > 0 ||
          stats.ofertas > 0 ||
          stats.estudiantes > 0 ||
          stats.valoracion !== undefined) && (
          <>
            <Divider />
            <div
              style={{
                display: "flex",
                padding: "16px 28px",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {entityType === "estudiante" && (
                <StatCard
                  value={stats.candidaturas}
                  label="Candidaturas"
                  color={ec.text}
                />
              )}
              {entityType === "empresa" && (
                <>
                  <StatCard
                    value={stats.ofertas}
                    label="Ofertas activas"
                    color={ec.text}
                  />
                  <StatCard
                    value={stats.candidaturas}
                    label="Candidaturas recibidas"
                  />
                  {stats.valoracion !== undefined && (
                    <StatCard
                      value={`${stats.valoracion} ⭐`}
                      label="Valoración media"
                      color="#facc15"
                    />
                  )}
                </>
              )}
              {entityType === "centro_educativo" && (
                <StatCard
                  value={stats.estudiantes}
                  label="Estudiantes vinculados"
                  color={ec.text}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TABS
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 16,
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "9px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${ec.text}`
                  : "2px solid transparent",
              color: activeTab === tab.id ? ec.text : "var(--color-text-muted)",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: INFORMACIÓN
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
          {renderInfoSections()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: CANDIDATURAS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "candidaturas" && (
        <SectionCard title="Candidaturas enviadas" icon="📋">
          {candidaturas.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              No hay candidaturas registradas.
            </p>
          ) : (
            candidaturas.map((c) => (
              <CandidaturaCard key={c.id_candidatura} c={c} />
            ))
          )}
        </SectionCard>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ACTIVIDAD
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "actividad" && (
        <SectionCard title="Actividad reciente" icon="📆">
          {memberSince && (
            <TimelineItem
              icon="🎉"
              text={`Perfil creado en Relance`}
              date={memberSince}
              accent
            />
          )}
          {entityType === "estudiante" && stats.candidaturas > 0 && (
            <TimelineItem
              icon="📩"
              text={`${stats.candidaturas} candidatura${stats.candidaturas > 1 ? "s" : ""} enviada${stats.candidaturas > 1 ? "s" : ""}`}
              date="Historial completo"
            />
          )}
          {entityType === "empresa" && stats.ofertas > 0 && (
            <TimelineItem
              icon="📢"
              text={`${stats.ofertas} oferta${stats.ofertas > 1 ? "s" : ""} publicada${stats.ofertas > 1 ? "s" : ""}`}
              date="Historial completo"
            />
          )}
          {entityType === "centro_educativo" && stats.estudiantes > 0 && (
            <TimelineItem
              icon="👨‍🎓"
              text={`${stats.estudiantes} estudiante${stats.estudiantes > 1 ? "s" : ""} vinculado${stats.estudiantes > 1 ? "s" : ""}`}
              date="Actualmente"
            />
          )}
          {entityType === "estudiante" &&
            (profile as Estudiante).habilidades &&
            (profile as Estudiante).habilidades!.length > 0 && (
              <TimelineItem
                icon="🛠️"
                text={`${(profile as Estudiante).habilidades!.length} habilidades registradas`}
                date="Perfil"
              />
            )}
          {valoraciones.length > 0 && (
            <TimelineItem
              icon="⭐"
              text={`${valoraciones.length} valoración${valoraciones.length > 1 ? "es" : ""} recibida${valoraciones.length > 1 ? "s" : ""}`}
              date="Historial"
            />
          )}
          <div style={{ padding: "12px 0 0", marginTop: 4 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--color-text-subtle)",
                fontStyle: "italic",
              }}
            >
              El historial completo de actividad estará disponible próximamente.
            </p>
          </div>
        </SectionCard>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUGERENCIAS
      ══════════════════════════════════════════════════════════════════════ */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{ height: 1, flex: 1, background: "var(--color-border)" }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Perfiles relacionados
            </span>
            <div
              style={{ height: 1, flex: 1, background: "var(--color-border)" }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 12,
            }}
          >
            {suggestions.map((s) => (
              <SuggestedCard key={s.id} profile={s} />
            ))}
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      {actionState.success && (
        <Toast
          message={actionState.success}
          type="success"
          onDismiss={() => setActionState((s) => ({ ...s, success: null }))}
        />
      )}
      {actionState.error && (
        <Toast
          message={actionState.error}
          type="error"
          onDismiss={() => setActionState((s) => ({ ...s, error: null }))}
        />
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fade-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );

  // ─── RBAC Actions ─────────────────────────────────────────────────────────

  function renderActions(): React.ReactNode {
    const al = actionState.loading;
    const IconMsg = () => (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );

    if (viewerRole === "administrador")
      return (
        <>
          {(entityType === "empresa" || entityType === "centro_educativo") && (
            <ActionButton
              label="Verificar"
              variant="primary"
              onClick={handleVerify(
                entityType as "empresa" | "centro_educativo",
              )}
              loading={al}
              icon={<span>✓</span>}
            />
          )}
          {userBlock?.blocked ? (
            <ActionButton
              label="Desbloquear"
              onClick={handleUnblock}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Bloquear"
              danger
              onClick={handleBlock}
              loading={al}
            />
          )}
          <ActionButton
            label="Eliminar"
            danger
            onClick={handleDelete}
            loading={al}
          />
          <ActionButton
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<IconMsg />}
          />
        </>
      );

    if (viewerRole === "centro_educativo" && entityType === "estudiante")
      return (
        <>
          {viewerContext.isEnrolledEstudiante ? (
            <ActionButton
              label="Desvincular del centro"
              danger
              onClick={handleUnenrollEstudiante}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Vincular al centro"
              variant="primary"
              onClick={handleEnrollEstudiante}
              loading={al}
            />
          )}
          <ActionButton
            label="Candidaturas"
            onClick={() =>
              (window.location.href = `/estudiantes/${entityId}/candidaturas`)
            }
          />
        </>
      );

    if (viewerRole === "tutor_centro" && entityType === "estudiante") {
      const sameCenter = !!viewerContext.centroEstudiante;
      return (
        <>
          {sameCenter ? (
            viewerContext.isMiEstudiante ? (
              <ActionButton
                label="Quitar de mis tutorizados"
                danger
                onClick={handleUnassignMiEstudiante}
                loading={al}
              />
            ) : (
              <ActionButton
                label="Añadir como tutorizado"
                variant="primary"
                onClick={handleAssignMiEstudiante}
                loading={al}
              />
            )
          ) : (
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-subtle)",
                alignSelf: "center",
              }}
            >
              Fuera de tu centro
            </span>
          )}
          <ActionButton
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<IconMsg />}
          />
        </>
      );
    }

    if (viewerRole === "tutor_empresa" && entityType === "estudiante")
      return (
        <>
          {viewerContext.isMyPracticasStudent ? (
            <ActionButton
              label="Finalizar prácticas"
              danger
              onClick={handleEndPracticas}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Iniciar prácticas"
              variant="primary"
              onClick={handleStartPracticas}
              loading={al}
            />
          )}
          <ActionButton
            label="Guardar"
            onClick={handleGuardarEstudiante}
            loading={al}
          />
          <ActionButton
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<IconMsg />}
          />
        </>
      );

    if (viewerRole === "empresa") {
      if (entityType === "estudiante")
        return (
          <>
            <ActionButton
              label="Guardar perfil"
              variant="primary"
              onClick={handleGuardarEstudiante}
              loading={al}
            />
            <ActionButton
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<IconMsg />}
            />
            <ActionButton
              label="Candidaturas"
              onClick={() =>
                (window.location.href = `/estudiantes/${entityId}/candidaturas`)
              }
            />
          </>
        );
      if (entityType === "centro_educativo")
        return (
          <ActionButton
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<IconMsg />}
          />
        );
    }

    if (viewerRole === "estudiante") {
      if (entityType === "empresa")
        return (
          <>
            <ActionButton
              label="Ver ofertas"
              variant="primary"
              onClick={() =>
                (window.location.href = `/empresas/${entityId}/ofertas`)
              }
            />
            <ActionButton
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<IconMsg />}
            />
          </>
        );
      if (entityType === "centro_educativo")
        return (
          <ActionButton
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<IconMsg />}
          />
        );
    }

    return null;
  }

  // ─── Info Sections ────────────────────────────────────────────────────────

  function renderInfoSections(): React.ReactNode {
    if (entityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.sobre_mi && (
            <SectionCard title="Sobre mí" icon="👤">
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.75,
                }}
              >
                {s.sobre_mi}
              </p>
            </SectionCard>
          )}

          {/* Two-column layout for info + skills */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <SectionCard title="Información de contacto" icon="📋">
              <InfoRow icon="📍" label="Ciudad" value={s.ciudad} />
              <InfoRow icon="📚" label="Titulación" value={s.titulacion} />
              <InfoRow
                icon="🔍"
                label="Disponibilidad"
                value={s.disponibilidad}
              />
              <InfoRow
                icon="💼"
                label="Tipo búsqueda"
                value={s.tipo_busqueda}
              />
              <InfoRow icon="🌐" label="Modalidad" value={s.modalidad} />
              {(viewerRole !== "estudiante" || entityId === viewerId) && (
                <InfoRow icon="📞" label="Teléfono" value={s.telefono} />
              )}
              {(viewerRole === "administrador" ||
                viewerRole === "tutor_centro" ||
                viewerRole === "tutor_empresa") && (
                <InfoRow icon="✉️" label="Email" value={s.email} />
              )}
              {s.github_username && (
                <InfoRow
                  icon="🐙"
                  label="GitHub"
                  value={`github.com/${s.github_username}`}
                  href={`https://github.com/${s.github_username}`}
                />
              )}
            </SectionCard>

            {s.habilidades && s.habilidades.length > 0 && (
              <SectionCard title="Nivel de habilidades" icon="📊">
                <SkillsRadar habilidades={s.habilidades} />
              </SectionCard>
            )}
          </div>

          {s.habilidades && s.habilidades.length > 0 && (
            <SectionCard title="Todas las habilidades" icon="🛠️">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {s.habilidades.map((h) => (
                  <Tag key={h} label={h} accent />
                ))}
              </div>
            </SectionCard>
          )}

          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <SectionCard title="Formación académica" icon="🎓">
              {(s.formaciones as Record<string, string>[]).map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i < s.formaciones!.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "rgba(99,179,237,0.08)",
                      border: "1px solid rgba(99,179,237,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🎓
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--color-text)",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      {f.titulo}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <SectionCard title="Proyectos" icon="🚀">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {(s.proyectos as Record<string, string>[]).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--color-text)",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        marginBottom: 4,
                      }}
                    >
                      {p.titulo}
                    </div>
                    {p.descripcion && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          lineHeight: 1.5,
                          marginBottom: 6,
                        }}
                      >
                        {p.descripcion}
                      </div>
                    )}
                    {p.enlace && (
                      <a
                        href={p.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          color: "var(--color-brand)",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Ver proyecto <span>→</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {s.redes_sociales && Object.keys(s.redes_sociales).length > 0 && (
            <SectionCard title="Redes sociales" icon="🔗">
              {Object.entries(s.redes_sociales).map(([red, url]) => (
                <InfoRow
                  key={red}
                  icon="🔗"
                  label={red}
                  value={url}
                  href={url}
                />
              ))}
            </SectionCard>
          )}
        </>
      );
    }

    if (entityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.descripcion && (
            <SectionCard title="Sobre la empresa" icon="🏢">
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.75,
                }}
              >
                {e.descripcion}
              </p>
            </SectionCard>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <SectionCard title="Información" icon="📋">
              <InfoRow icon="📍" label="Ciudad" value={e.ciudad} />
              <InfoRow icon="🏭" label="Sector" value={e.sector} />
              <InfoRow icon="👥" label="Tamaño" value={e.tamano} />
              <InfoRow icon="✉️" label="Email" value={e.email_contacto} />
              <InfoRow icon="📞" label="Teléfono" value={e.telefono} />
              <InfoRow icon="🌐" label="Web" value={e.web} href={e.web} />
              {viewerRole === "administrador" && (
                <InfoRow icon="🆔" label="CIF" value={e.cif} />
              )}
            </SectionCard>
            {(e.linkedin || e.twitter || e.instagram) && (
              <SectionCard title="Redes sociales" icon="🔗">
                {e.linkedin && (
                  <InfoRow
                    icon="🔗"
                    label="LinkedIn"
                    value={e.linkedin}
                    href={e.linkedin}
                  />
                )}
                {e.twitter && (
                  <InfoRow
                    icon="🐦"
                    label="Twitter/X"
                    value={e.twitter}
                    href={e.twitter}
                  />
                )}
                {e.instagram && (
                  <InfoRow
                    icon="📸"
                    label="Instagram"
                    value={e.instagram}
                    href={e.instagram}
                  />
                )}
              </SectionCard>
            )}
          </div>
        </>
      );
    }

    if (entityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.descripcion && (
            <SectionCard title="Sobre el centro" icon="🏫">
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.75,
                }}
              >
                {c.descripcion}
              </p>
            </SectionCard>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <SectionCard title="Información" icon="📋">
              <InfoRow icon="📍" label="Ciudad" value={c.ciudad} />
              <InfoRow icon="🗺️" label="Provincia" value={c.provincia} />
              <InfoRow icon="🏫" label="Tipo centro" value={c.tipo_centro} />
              <InfoRow
                icon="👨‍🎓"
                label="Nº alumnos"
                value={c.num_alumnos?.toString()}
              />
              <InfoRow icon="✉️" label="Email" value={c.email_contacto} />
              <InfoRow icon="📞" label="Teléfono" value={c.telefono} />
              <InfoRow
                icon="🌐"
                label="Web"
                value={c.sitio_web}
                href={c.sitio_web}
              />
            </SectionCard>
            {c.titulaciones && c.titulaciones.length > 0 && (
              <SectionCard title="Titulaciones impartidas" icon="📚">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {c.titulaciones.map((t) => (
                    <Tag key={t} label={t} accent />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </>
      );
    }

    return null;
  }
}
