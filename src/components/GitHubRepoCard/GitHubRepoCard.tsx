// ==========================
// GitHubRepoCard.tsx
// ==========================

type GitHubRepoCardProps = {
  // Core
  name: string;
  url: string;
  // Optional data
  description?: string;
  languages?: string[]; // múltiples lenguajes ordenados por uso
  topics?: string[]; // tags del repo
  stars?: number;
  forks?: number;
  watchers?: number;
  size?: number; // en KB
  license?: string;
  updatedAt?: string; // ISO date string
  isPrivate?: boolean;
  urlDemo?: string;
  // Display mode
  mode?: "card" | "row"; // card = grid, row = lista compacta
};

// ── Lang colors ──────────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Sass: "#a53b70",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
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
  Shell: "#89e051",
  Bash: "#89e051",
  PowerShell: "#012456",
  "Jupyter Notebook": "#DA5B0B",
  MATLAB: "#e16737",
  "Objective-C": "#438eff",
  Dockerfile: "#384d54",
  HCL: "#844FBA",
  Nix: "#7e7eff",
  Markdown: "#083fa1",
  TeX: "#3D6117",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  if (days < 365)
    return d.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconGitHub({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconStar({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconFork({ size = 11 }: { size?: number }) {
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
function IconEye({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconLink({ size = 11 }: { size?: number }) {
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
function IconExternalLink({ size = 10 }: { size?: number }) {
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
function IconLicense({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconDatabase({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
function IconClock({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconLock({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GitHubRepoCard({
  name,
  url,
  description,
  languages = [],
  topics = [],
  stars = 0,
  forks = 0,
  watchers = 0,
  size,
  license,
  updatedAt,
  isPrivate = false,
  urlDemo,
  mode = "card",
}: GitHubRepoCardProps) {
  const primaryLang = languages[0];
  const primaryColor = primaryLang
    ? (LANG_COLORS[primaryLang] ?? "#8b949e")
    : "#8b949e";

  // ── ROW mode (lista compacta para GitHubIntegration) ──
  if (mode === "row") {
    return (
      <div
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          transition: "border-color 0.2s",
          cursor: "default",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "rgba(192,255,114,0.25)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border-strong)")
        }
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 3,
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-brand)",
                textDecoration: "none",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </a>
            {isPrivate && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border-strong)",
                  padding: "1px 6px",
                  borderRadius: 20,
                  flexShrink: 0,
                }}
              >
                <IconLock size={9} /> privado
              </span>
            )}
          </div>
          {description && (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                margin: "0 0 6px",
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {description}
            </p>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            {primaryLang && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: primaryColor,
                    display: "inline-block",
                  }}
                />
                {primaryLang}
              </span>
            )}
            {stars > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                }}
              >
                <IconStar /> {stars}
              </span>
            )}
            {forks > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                }}
              >
                <IconFork /> {forks}
              </span>
            )}
            {updatedAt && (
              <span
                style={{
                  fontSize: 10,
                  color: "var(--color-text-subtle)",
                  marginLeft: "auto",
                }}
              >
                {formatDate(updatedAt)}
              </span>
            )}
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 10px",
            borderRadius: 8,
            border: "1px solid var(--color-border-strong)",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "rgba(192,255,114,0.3)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-brand)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "var(--color-border-strong)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-text-muted)";
          }}
        >
          <IconGitHub size={11} /> Ver
        </a>
      </div>
    );
  }

  // ── CARD mode (grid premium para UserProfilePage) ──
  return (
    <div
      className="up-gh-card"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(192,255,114,0.3)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-strong)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Accent bar top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${primaryColor}60, transparent)`,
        }}
      />

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
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="up-gh-name"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <IconGitHub size={13} />
              {name}
            </a>
            {isPrivate && (
              <span
                className="up-gh-private"
                style={{ display: "flex", alignItems: "center", gap: 3 }}
              >
                <IconLock size={9} /> privado
              </span>
            )}
          </div>
        </div>
        {/* Quick link icon */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            color: "var(--color-text-subtle)",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-brand)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-text-subtle)")
          }
        >
          <IconExternalLink size={13} />
        </a>
      </div>

      {/* Description */}
      {description ? (
        <p className="up-gh-desc" style={{ margin: 0, lineHeight: 1.65 }}>
          {description}
        </p>
      ) : (
        <p
          className="up-gh-desc"
          style={{ margin: 0, fontStyle: "italic", opacity: 0.35 }}
        >
          Sin descripción
        </p>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div
          className="up-gh-topics"
          style={{ display: "flex", flexWrap: "wrap", gap: 5 }}
        >
          {topics.slice(0, 6).map((t) => (
            <span key={t} className="up-gh-topic">
              {t}
            </span>
          ))}
          {topics.length > 6 && (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-subtle)",
                padding: "3px 0",
              }}
            >
              +{topics.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {languages.slice(0, 5).map((lang) => (
            <span
              key={lang}
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
                  background: LANG_COLORS[lang] ?? "#8b949e",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {lang}
            </span>
          ))}
          {languages.length > 5 && (
            <span style={{ fontSize: 11, color: "var(--color-text-subtle)" }}>
              +{languages.length - 5} más
            </span>
          )}
        </div>
      )}

      {/* Meta info */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--color-border)",
          marginTop: "auto",
        }}
      >
        {stars > 0 && (
          <span className="up-gh-stat">
            <IconStar /> {stars.toLocaleString("es-ES")}
          </span>
        )}
        {forks > 0 && (
          <span className="up-gh-stat">
            <IconFork /> {forks.toLocaleString("es-ES")}
          </span>
        )}
        {watchers > 0 && (
          <span className="up-gh-stat">
            <IconEye /> {watchers.toLocaleString("es-ES")}
          </span>
        )}
        {size !== undefined && size > 0 && (
          <span className="up-gh-stat">
            <IconDatabase /> {formatSize(size)}
          </span>
        )}
        {license && (
          <span className="up-gh-stat">
            <IconLicense /> {license}
          </span>
        )}
        {updatedAt && (
          <span
            className="up-gh-date"
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <IconClock /> {formatDate(updatedAt)}
          </span>
        )}
      </div>

      {/* Action links */}
      <div className="up-gh-links" style={{ display: "flex", gap: 8 }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="up-gh-link"
        >
          <IconGitHub size={11} /> Código
        </a>
        {urlDemo && (
          <a
            href={urlDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="up-gh-link"
          >
            <IconLink size={11} /> Demo
          </a>
        )}
      </div>
    </div>
  );
}
