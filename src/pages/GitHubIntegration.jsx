// ==========================
// GitHubIntegration.jsx
// ==========================

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ============= Iconos =============
function IconGitHub({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconStar({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconFork({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M6 9v2a3 3 0 003 3h6a3 3 0 003-3V9" />
      <line x1="12" y1="12" x2="12" y2="15" />
    </svg>
  );
}
function IconLink({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconUnlink({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
function IconRefresh({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconExternalLink({ size = 11 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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

// ========== Colores por lenguaje — ampliado ==========
const LANG_COLORS = {
  // Web
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Sass: "#a53b70",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  // Backend
  Python: "#3572A5",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Erlang: "#B83998",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  Lua: "#000080",
  Perl: "#0298c3",
  R: "#198CE7",
  Julia: "#a270ba",
  Nim: "#ffc200",
  Zig: "#ec915c",
  // Shell / Scripts
  Shell: "#89e051",
  Bash: "#89e051",
  PowerShell: "#012456",
  // Data / Config
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  MATLAB: "#e16737",
  // Mobile
  "Objective-C": "#438eff",
  // Infra / Config
  Dockerfile: "#384d54",
  HCL: "#844FBA",
  Nix: "#7e7eff",
  // Markup / Other
  Markdown: "#083fa1",
  TeX: "#3D6117",
};

// ========== Punto de color de lenguaje ==========
function LangDot({ lang }) {
  const color = LANG_COLORS[lang] || "#8b949e";
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "var(--color-text-muted)",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {lang}
    </span>
  );
}

// ========== Extrae datos de GitHub de la sesión de Supabase ==========
function extractGitHubSession(session) {
  const user = session?.user;
  if (!user) return null;

  const provider = user?.app_metadata?.provider;
  const metadata = user?.user_metadata ?? {};

  if (provider === "github") {
    return {
      token: session.provider_token,
      username:
        metadata.user_name || metadata.preferred_username || metadata.login,
      avatarUrl: metadata.avatar_url,
    };
  }

  const githubIdentity = user?.identities?.find((i) => i.provider === "github");
  if (githubIdentity) {
    const ghData = githubIdentity.identity_data ?? {};
    return {
      token: session.provider_token || null,
      username:
        ghData.user_name ||
        ghData.preferred_username ||
        ghData.login ||
        metadata.user_name,
      avatarUrl: ghData.avatar_url || metadata.avatar_url,
    };
  }

  return null;
}

// ========== Hook: sesión de GitHub ==========
export function useGitHubSession() {
  const [githubSession, setGithubSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveSession = async (session) => {
    const base = extractGitHubSession(session);

    // Token en sesión válido: solo si es de GitHub (no de Google, que empieza por ya29.)
    if (base?.token && !base.token.startsWith("ya29.")) {
      return { ...base, fromOAuth: true };
    }

    // Sin token GitHub en sesión: buscar en BD (caso recarga de página)
    const user = session?.user;
    if (!user) return null;

    const githubIdentity = user.identities?.find(
      (i) => i.provider === "github",
    );
    if (!githubIdentity) return null;

    const { data } = await supabase
      .from("estudiante")
      .select("github_access_token, github_username")
      .eq("id", user.id)
      .maybeSingle();

    if (!data?.github_access_token) return null;

    return {
      token: data.github_access_token,
      username: data.github_username || githubIdentity.identity_data?.user_name,
      avatarUrl: githubIdentity.identity_data?.avatar_url,
      fromOAuth: false,
    };
  };

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const resolved = await resolveSession(data?.session);
      setGithubSession(resolved);
      setLoading(false);
    };

    check();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const resolved = await resolveSession(session);
        setGithubSession(resolved);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const connectGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user public_repo",
        redirectTo: `${window.location.origin}/perfil/estudiante`,
        skipBrowserRedirect: false,
      },
    });
  };

  return { githubSession, loading, connectGitHub };
}

// ========== Hook: obtener repos ==========
export function useGitHubRepos(token) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50&type=owner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      const data = await res.json();
      setRepos(
        data.map((r) => ({
          repo_id: r.id,
          nombre: r.name,
          nombre_completo: r.full_name,
          descripcion: r.description || "",
          url: r.html_url,
          url_demo: r.homepage || "",
          lenguajes: r.language ? [r.language] : [],
          estrellas: r.stargazers_count,
          forks: r.forks_count,
          privado: r.private,
          actualizado: r.updated_at,
          vinculado_proyecto_id: null,
        })),
      );
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, loading, error, refetch: fetchRepos };
}

// ========== Tarjeta de repositorio ==========
function RepoCard({ repo, isVinculado, onToggle }) {
  const fecha = repo.actualizado
    ? new Date(repo.actualizado).toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      })
    : "";
  const langColor = LANG_COLORS[repo.lenguajes?.[0]] || "#8b949e";

  return (
    <div
      style={{
        background: isVinculado
          ? "rgba(192,255,114,0.04)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${isVinculado ? "rgba(192,255,114,0.3)" : "var(--color-border-strong)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isVinculado)
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-brand)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <IconGitHub size={12} />
              {repo.nombre}
            </a>
            {repo.privado && (
              <span
                style={{
                  fontSize: 10,
                  border: "1px solid var(--color-border-strong)",
                  color: "var(--color-text-muted)",
                  padding: "1px 7px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                privado
              </span>
            )}
          </div>

          {repo.descripcion && (
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                margin: "0 0 8px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {repo.descripcion}
            </p>
          )}

          {/* Lang + stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            {repo.lenguajes?.[0] && <LangDot lang={repo.lenguajes[0]} />}
            {repo.estrellas > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                <IconStar /> {repo.estrellas}
              </span>
            )}
            {repo.forks > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                <IconFork /> {repo.forks}
              </span>
            )}
            {fecha && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-subtle)",
                  marginLeft: "auto",
                }}
              >
                {fecha}
              </span>
            )}
          </div>
        </div>

        {/* Botón vincular/desvincular */}
        <button
          onClick={() => onToggle(repo)}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 10px",
            borderRadius: 8,
            border: isVinculado
              ? "1px solid rgba(192,255,114,0.3)"
              : "1px solid var(--color-border-strong)",
            background: isVinculado ? "rgba(192,255,114,0.08)" : "transparent",
            color: isVinculado
              ? "var(--color-brand)"
              : "var(--color-text-muted)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (isVinculado) {
              e.currentTarget.style.background = "rgba(248,113,113,0.08)";
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
            } else {
              e.currentTarget.style.borderColor = "rgba(192,255,114,0.3)";
              e.currentTarget.style.color = "var(--color-brand)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isVinculado
              ? "rgba(192,255,114,0.08)"
              : "transparent";
            e.currentTarget.style.color = isVinculado
              ? "var(--color-brand)"
              : "var(--color-text-muted)";
            e.currentTarget.style.borderColor = isVinculado
              ? "rgba(192,255,114,0.3)"
              : "var(--color-border-strong)";
          }}
          title={isVinculado ? "Quitar del perfil" : "Añadir al perfil"}
        >
          {isVinculado ? (
            <>
              <IconUnlink size={11} /> Quitar
            </>
          ) : (
            <>
              <IconLink size={11} /> Añadir
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function GitHubReposSection({
  reposVinculados = [],
  onReposChange,
  githubUsername,
  onUsernameChange,
}) {
  const {
    githubSession,
    loading: sessionLoading,
    connectGitHub,
  } = useGitHubSession();
  const {
    repos,
    loading: reposLoading,
    error,
    refetch,
  } = useGitHubRepos(githubSession?.token);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (githubSession?.username && githubSession.username !== githubUsername) {
      onUsernameChange?.(githubSession.username);
    }
  }, [githubSession?.username]);

  const vinculadosIds = new Set(reposVinculados.map((r) => r.repo_id));

  const handleToggle = (repo) => {
    if (vinculadosIds.has(repo.repo_id)) {
      onReposChange(reposVinculados.filter((r) => r.repo_id !== repo.repo_id));
    } else {
      onReposChange([...reposVinculados, repo]);
    }
  };

  const reposFiltrados = repos.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // ── Cargando sesión ──
  if (sessionLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 0",
          gap: 8,
          color: "var(--color-text-muted)",
        }}
      >
        <Spinner className="w-4 h-4" /> Comprobando sesión...
      </div>
    );
  }

  // ── No conectado ──
  if (!githubSession) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 20px",
          border: "1px dashed var(--color-border-strong)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            color: "var(--color-text-muted)",
          }}
        >
          <IconGitHub size={26} />
        </div>
        <h3
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 6,
          }}
        >
          Conecta tu GitHub
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginBottom: 16,
            maxWidth: 280,
            margin: "0 auto 16px",
          }}
        >
          Vincula tu cuenta para mostrar tus repositorios directamente en tu
          perfil.
        </p>
        <button
          onClick={connectGitHub}
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <IconGitHub size={13} /> Conectar con GitHub
        </button>

        {reposVinculados.length > 0 && (
          <div
            style={{
              marginTop: 20,
              textAlign: "left",
              borderTop: "1px solid var(--color-border)",
              paddingTop: 16,
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              Repositorios en tu perfil ({reposVinculados.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {reposVinculados.map((r) => (
                <div
                  key={r.repo_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <IconGitHub size={12} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {r.nombre}
                    </span>
                    {r.lenguajes?.[0] && <LangDot lang={r.lenguajes[0]} />}
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    Ver <IconExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Conectado ──
  return (
    <div>
      {/* Header de sesión */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          padding: "10px 14px",
          background: "rgba(74,222,128,0.04)",
          border: "1px solid rgba(74,222,128,0.18)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {githubSession.avatarUrl && (
            <img
              src={githubSession.avatarUrl}
              alt={githubSession.username}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid var(--color-border-strong)",
              }}
            />
          )}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-success)",
                margin: 0,
              }}
            >
              GitHub conectado
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              @{githubSession.username}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Botón reconectar: visible cuando el token viene de BD */}
          {!githubSession.fromOAuth && (
            <button
              onClick={connectGitHub}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-warning)",
                border: "1px solid rgba(251,191,36,0.25)",
                background: "transparent",
                padding: "4px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              title="Reconecta para refrescar el token de GitHub"
            >
              Reconectar
            </button>
          )}
          <button
            onClick={refetch}
            disabled={reposLoading}
            style={{
              padding: "6px 8px",
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
            }}
            title="Actualizar repositorios"
          >
            {reposLoading ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <IconRefresh size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Repos vinculados al perfil */}
      {reposVinculados.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p
            style={{
              fontSize: 10,
              color: "var(--color-text-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            En tu perfil ({reposVinculados.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {reposVinculados.map((r) => (
              <span
                key={r.repo_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(192,255,114,0.08)",
                  border: "1px solid rgba(192,255,114,0.2)",
                  color: "var(--color-brand)",
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                <IconGitHub size={10} />
                {r.nombre}
                <button
                  onClick={() => handleToggle(r)}
                  style={{
                    color: "inherit",
                    opacity: 0.6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar repositorios..."
          className="input-field"
          style={{ fontSize: 12, padding: "8px 11px 8px 32px" }}
        />
        <svg
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-subtle)",
            width: 13,
            height: 13,
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: 10,
            padding: "10px 14px",
            background: "var(--color-error-bg)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 10,
            color: "var(--color-error)",
            fontSize: 12,
          }}
        >
          {error}.{" "}
          <button
            onClick={refetch}
            style={{
              color: "inherit",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: 12,
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de repos */}
      {reposLoading && repos.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
            gap: 8,
            color: "var(--color-text-muted)",
          }}
        >
          <Spinner /> Cargando repositorios...
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 420,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {reposFiltrados.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: 12,
                padding: "24px 0",
              }}
            >
              {busqueda
                ? "No se encontraron repositorios"
                : "No tienes repositorios públicos"}
            </p>
          ) : (
            reposFiltrados.map((repo) => (
              <RepoCard
                key={repo.repo_id}
                repo={repo}
                isVinculado={vinculadosIds.has(repo.repo_id)}
                onToggle={handleToggle}
              />
            ))
          )}
        </div>
      )}

      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-subtle)",
          marginTop: 10,
          textAlign: "center",
        }}
      >
        {reposFiltrados.length} repositorios · Solo se muestran los públicos
      </p>
    </div>
  );
}
