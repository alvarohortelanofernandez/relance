/**
 * UserProfilePage.tsx — Rediseño LinkedIn-style Enterprise
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

// ─── Types ─────────────────────────────────────────────────────────────────

type ViewerRole =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";
type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";
type ConvenioState = "none" | "sent" | "received" | "active" | "loading";

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
  github_repos_vinculados?: unknown[];
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

interface GitHubRepo {
  repo_id: number;
  nombre: string;
  nombre_completo: string;
  descripcion: string;
  url: string;
  url_demo?: string;
  lenguajes: string[];
  estrellas: number;
  forks: number;
  privado: boolean;
  actualizado: string;
}

interface Candidatura {
  id_candidatura: number;
  estado: string;
  fecha_envio: string;
  comentario_empresa?: string;
  id_oferta: string;
  titulo_oferta?: string;
}

export interface UserProfilePageProps {
  entityType?: EntityType;
  entityId?: string;
  onBack?: () => void;
}

// ─── Route inference ──────────────────────────────────────────────────────

function inferFromPath(): {
  entityType: EntityType | null;
  entityId: string | null;
} {
  const parts = window.location.pathname.replace(/^\//, "").split("/");
  if (parts.length < 2) return { entityType: null, entityId: null };
  const [segment, id] = parts;
  if (!id) return { entityType: null, entityId: null };
  const map: Record<string, EntityType> = {
    empresa: "empresa",
    centro: "centro_educativo",
    estudiante: "estudiante",
  };
  return { entityType: map[segment] ?? null, entityId: id };
}

// ─── Lang colors ─────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198CE7",
};

// ─── CSS ──────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -800px 0; } 100% { background-position: 800px 0; } }

.up-root {
  min-height: 100vh;
  background: var(--color-bg);
  font-family: 'DM Sans', system-ui, sans-serif;
  color: var(--color-text);
  padding-top: 68px;
}

.up-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  animation: fadeUp 0.3s ease forwards;
}

.up-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  color: var(--color-text-muted); font-size: 13px;
  font-family: 'DM Sans', inherit; font-weight: 500;
  padding: 0; margin-bottom: 24px; transition: color 0.15s;
  letter-spacing: -0.01em;
}
.up-back:hover { color: var(--color-text); }
.up-back svg { transition: transform 0.15s; }
.up-back:hover svg { transform: translateX(-2px); }

.up-hero {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.up-cover { height: 140px; position: relative; overflow: hidden; }
.up-hero-body { padding: 0 28px 28px; }

.up-avatar-row {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-top: -44px; margin-bottom: 16px;
}

.up-avatar {
  width: 88px; height: 88px; border-radius: 50%;
  border: 4px solid var(--color-surface-strong);
  overflow: hidden; background: var(--color-surface-elevated);
  flex-shrink: 0; position: relative;
}
.up-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.up-avatar-initials {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--color-brand);
}

.up-verified-ring { outline: 2px solid var(--color-brand); outline-offset: 2px; border-radius: 50%; }
.up-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-bottom: 4px; }
.up-name { font-size: 22px; font-weight: 700; letter-spacing: -0.04em; color: var(--color-text); line-height: 1.15; margin-bottom: 4px; }
.up-headline { font-size: 14px; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 12px; }

.up-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.up-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 6px;
  color: var(--color-text-muted); background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-strong); letter-spacing: -0.01em;
}
.up-chip-brand { color: var(--color-brand); background: rgba(192,255,114,0.06); border-color: rgba(192,255,114,0.2); }
.up-chip-verified { color: #4ade80; background: rgba(74,222,128,0.06); border-color: rgba(74,222,128,0.2); }
.up-chip-blue { color: #60a5fa; background: rgba(96,165,250,0.06); border-color: rgba(96,165,250,0.2); }

.up-stats { display: flex; border-top: 1px solid var(--color-border); margin-top: 20px; padding-top: 18px; gap: 32px; }
.up-stat-item { display: flex; flex-direction: column; gap: 2px; }
.up-stat-val { font-size: 20px; font-weight: 700; letter-spacing: -0.04em; color: var(--color-text); font-family: 'DM Serif Display', serif; }
.up-stat-lbl { font-size: 11px; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

.up-convenio { border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.up-convenio-none { background: var(--color-surface-strong); border: 1px dashed var(--color-border-strong); }
.up-convenio-sent { background: rgba(250,204,21,0.04); border: 1px solid rgba(250,204,21,0.2); }
.up-convenio-received { background: rgba(167,139,250,0.04); border: 1px solid rgba(167,139,250,0.2); }
.up-convenio-active { background: rgba(74,222,128,0.04); border: 1px solid rgba(74,222,128,0.2); }
.up-convenio-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.up-convenio-text { flex: 1; min-width: 0; }
.up-convenio-title { font-size: 13px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 2px; }
.up-convenio-sub { font-size: 12px; color: var(--color-text-muted); }

.up-section { background: var(--color-surface-strong); border: 1px solid var(--color-border-strong); border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
.up-section-head { padding: 18px 24px 0; display: flex; align-items: center; justify-content: space-between; }
.up-section-title { font-size: 13px; font-weight: 700; color: var(--color-text); letter-spacing: -0.02em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
.up-section-title svg { color: var(--color-text-muted); }
.up-section-body { padding: 16px 24px 24px; }

.up-prose { font-size: 14px; color: var(--color-text-secondary); line-height: 1.8; letter-spacing: -0.005em; }

.up-info-table { display: flex; flex-direction: column; gap: 0; }
.up-info-row { display: grid; grid-template-columns: 140px 1fr; gap: 16px; align-items: baseline; padding: 11px 0; border-bottom: 1px solid var(--color-border); }
.up-info-row:last-child { border-bottom: none; }
.up-info-label { font-size: 12px; color: var(--color-text-muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.up-info-val { font-size: 13px; color: var(--color-text-secondary); word-break: break-word; }
.up-info-link { font-size: 13px; color: var(--color-brand); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.up-info-link:hover { text-decoration: underline; }

.up-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.up-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 100px; background: var(--color-surface-elevated); border: 1px solid var(--color-border-strong); color: var(--color-text-secondary); letter-spacing: -0.01em; transition: all 0.13s; }
.up-tag:hover { border-color: rgba(192,255,114,0.3); color: var(--color-brand); }

.up-formations { display: flex; flex-direction: column; }
.up-formation { display: flex; gap: 16px; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid var(--color-border); }
.up-formation:first-child { padding-top: 0; }
.up-formation:last-child { border-bottom: none; padding-bottom: 0; }
.up-formation-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: var(--color-brand); margin-top: 5px; }
.up-formation-name { font-size: 14px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; margin-bottom: 3px; }
.up-formation-sub { font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px; }
.up-formation-desc { font-size: 13px; color: var(--color-text-secondary); line-height: 1.65; }

.up-projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.up-project { background: var(--color-surface-elevated); border: 1px solid var(--color-border-strong); border-radius: 12px; padding: 18px; transition: border-color 0.15s; }
.up-project:hover { border-color: rgba(192,255,114,0.25); }
.up-project-name { font-size: 13px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; margin-bottom: 6px; }
.up-project-desc { font-size: 12px; color: var(--color-text-muted); line-height: 1.65; margin-bottom: 12px; }
.up-project-link { font-size: 12px; color: var(--color-brand); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; }

.up-cands { display: flex; flex-direction: column; }
.up-cand { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--color-border); }
.up-cand:first-child { padding-top: 0; }
.up-cand:last-child { border-bottom: none; padding-bottom: 0; }
.up-cand-name { font-size: 13px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; margin-bottom: 3px; }
.up-cand-date { font-size: 11px; color: var(--color-text-muted); }
.up-cand-comment { margin-top: 8px; padding: 8px 12px; background: var(--color-surface-elevated); border-left: 2px solid var(--color-border-strong); border-radius: 0 6px 6px 0; font-size: 12px; color: var(--color-text-muted); font-style: italic; line-height: 1.6; }
.up-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; border: 1px solid; }

.up-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', inherit; cursor: pointer; border: 1px solid; transition: all 0.15s; letter-spacing: -0.01em; white-space: nowrap; }
.up-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.up-btn-primary { background: var(--color-brand); color: #020a00; border-color: transparent; }
.up-btn-primary:not(:disabled):hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(192,255,114,0.2); }
.up-btn-secondary { background: transparent; color: var(--color-text-secondary); border-color: var(--color-border-strong); }
.up-btn-secondary:not(:disabled):hover { background: var(--color-surface-elevated); color: var(--color-text); border-color: rgba(255,255,255,0.15); }
.up-btn-danger { background: transparent; color: #f87171; border-color: rgba(248,113,113,0.25); }
.up-btn-danger:not(:disabled):hover { background: rgba(248,113,113,0.06); }
.up-btn-convenio { background: transparent; color: #a78bfa; border-color: rgba(167,139,250,0.3); }
.up-btn-convenio:not(:disabled):hover { background: rgba(167,139,250,0.06); }

.up-spinner { width: 12px; height: 12px; border-radius: 50%; border: 2px solid currentColor; border-top-color: transparent; animation: spin 0.7s linear infinite; }
.up-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%); background-size: 800px 100%; animation: shimmer 1.6s infinite; border-radius: 6px; }
.up-toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 11px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', inherit; display: flex; align-items: center; gap: 8px; animation: toastIn 0.2s ease forwards; border: 1px solid; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
.up-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 20px; color: var(--color-text-muted); font-size: 13px; text-align: center; }

@media (max-width: 600px) {
  .up-page { padding: 20px 14px 60px; }
  .up-hero-body { padding: 0 18px 20px; }
  .up-section-head { padding: 16px 18px 0; }
  .up-section-body { padding: 14px 18px 20px; }
  .up-info-row { grid-template-columns: 110px 1fr; }
  .up-stats { gap: 20px; }
  .up-actions { flex-wrap: wrap; }
  .up-gh-grid { grid-template-columns: 1fr; }
}
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────

const Icon = {
  Back: () => (
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  MapPin: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Globe: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  GradCap: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Briefcase: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  GitHub: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  Link: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Check: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  CheckCircle: () => (
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  X: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Users: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Building: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M9 22V12h6v10" />
      <path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M15 11h.01" />
    </svg>
  ),
  Layers: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  ExternalLink: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Code: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Bookmark: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  ),
  Message: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Handshake: () => (
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Fork: () => (
    <svg
      width="12"
      height="12"
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
  ),
  Dot: ({ color }: { color: string }) => (
    <svg width="6" height="6" viewBox="0 0 6 6">
      <circle cx="3" cy="3" r="3" fill={color} />
    </svg>
  ),
};

// ─── Atoms ────────────────────────────────────────────────────────────────

function Btn({
  label,
  variant = "secondary",
  onClick,
  loading: l,
  disabled,
  danger,
  icon,
  className,
}: {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  const cls = className
    ? `up-btn ${className}`
    : danger
      ? "up-btn up-btn-danger"
      : variant === "primary"
        ? "up-btn up-btn-primary"
        : "up-btn up-btn-secondary";
  return (
    <button className={cls} onClick={onClick} disabled={disabled || l}>
      {l ? <div className="up-spinner" /> : icon}
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
  const ok = type === "success";
  return (
    <div
      className="up-toast"
      style={{
        background: ok ? "rgba(192,255,114,0.06)" : "rgba(248,113,113,0.06)",
        borderColor: ok ? "rgba(192,255,114,0.2)" : "rgba(248,113,113,0.2)",
        color: ok ? "var(--color-brand)" : "#f87171",
      }}
    >
      {ok ? <Icon.Check /> : <Icon.X />}
      {message}
    </div>
  );
}

function AvatarDisplay({
  url,
  name,
  size = 88,
}: {
  url?: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (url)
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  return (
    <div className="up-avatar-initials" style={{ fontSize: size * 0.28 }}>
      {initials || "?"}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="up-section">
      <div className="up-section-head">
        <div className="up-section-title">
          {icon}
          {title}
          {count !== undefined && (
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 5,
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="up-section-body">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="up-info-row">
      <span
        className="up-info-label"
        style={{ color: "var(--color-text-muted)" }}
      >
        {icon}
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="up-info-link"
        >
          {value} <Icon.ExternalLink />
        </a>
      ) : (
        <span className="up-info-val">{value}</span>
      )}
    </div>
  );
}

const DISP_MAP: Record<string, { label: string; color: string }> = {
  inmediata: { label: "Disponible ahora", color: "#4ade80" },
  "1_mes": { label: "En 1 mes", color: "#facc15" },
  "3_meses": { label: "En 3 meses", color: "#fb923c" },
  no_disponible: { label: "No disponible", color: "#f87171" },
};

const CAND_MAP: Record<string, { color: string; label: string }> = {
  pendiente: { color: "#facc15", label: "Pendiente" },
  aceptada: { color: "#4ade80", label: "Aceptada" },
  rechazada: { color: "#f87171", label: "Rechazada" },
  en_proceso: { color: "#60a5fa", label: "En proceso" },
};

const COVER: Record<string, { from: string; to: string }> = {
  empresa: { from: "rgba(192,255,114,0.14)", to: "rgba(96,165,250,0.06)" },
  centro_educativo: {
    from: "rgba(96,165,250,0.14)",
    to: "rgba(52,211,153,0.06)",
  },
  estudiante: { from: "rgba(192,255,114,0.10)", to: "rgba(3,6,15,0)" },
};

// ─── Main ─────────────────────────────────────────────────────────────────

export default function UserProfilePage({
  entityType: propEntityType,
  entityId: propEntityId,
  onBack,
}: UserProfilePageProps) {
  const { user } = useAuth();
  const viewerRole: ViewerRole = (user?.user_metadata?.rol ??
    user?.user_metadata?.role ??
    user?.user_metadata?.tipo ??
    "estudiante") as ViewerRole;
  const viewerId = user?.id ?? "";

  const resolved = !propEntityType || !propEntityId ? inferFromPath() : null;
  const rawEntityType: EntityType | null =
    propEntityType ?? resolved?.entityType ?? null;
  const entityId: string = propEntityId ?? resolved?.entityId ?? "";

  // ── ALL hooks must be here, before any conditional returns ──
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [stats, setStats] = useState({
    candidaturas: 0,
    ofertas: 0,
    estudiantes: 0,
  });
  const [viewerCtx, setViewerCtx] = useState<{
    isMiEstudiante?: boolean;
    isEnrolledEstudiante?: boolean;
    isMyPracticasStudent?: boolean;
    centroEstudiante?: string;
  }>({});
  const [userBlocked, setUserBlocked] = useState(false);
  const [convenioState, setConvenioState] = useState<ConvenioState>("loading");
  const [convenioId, setConvenioId] = useState<string | null>(null);
  const [convenioLoading, setConvenioLoading] = useState(false);
  const [ghTopics, setGhTopics] = useState<Record<number, string[]>>({});
  const [ghDescripciones, setGhDescripciones] = useState<
    Record<number, string>
  >({});
  const [ghLenguajes, setGhLenguajes] = useState<Record<number, string[]>>({});

  const showConvenio =
    (viewerRole === "empresa" && rawEntityType === "centro_educativo") ||
    (viewerRole === "centro_educativo" && rawEntityType === "empresa");

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  // ── Load profile ──
  useEffect(() => {
    if (!entityId) return;
    const load = async () => {
      setLoading(true);
      const table =
        rawEntityType === "empresa"
          ? "empresa"
          : rawEntityType === "centro_educativo"
            ? "centro_educativo"
            : "estudiante";
      const { data, error: e } = await supabase
        .from(table)
        .select("*")
        .eq("id", entityId)
        .maybeSingle();
      if (e || !data) {
        setError(e?.message ?? "Perfil no encontrado");
        setLoading(false);
        return;
      }
      setProfile(data as ProfileData);
      setLoading(false);
    };
    load();
  }, [entityId, rawEntityType]);

  // ── Load extras ──
  useEffect(() => {
    if (!profile || !rawEntityType) return;
    const load = async () => {
      if (rawEntityType === "estudiante") {
        const { count } = await supabase
          .from("candidatura")
          .select("id_candidatura", { count: "exact", head: true })
          .eq("id_estudiante", entityId);
        const { data } = await supabase
          .from("candidatura")
          .select(
            "id_candidatura, estado, fecha_envio, comentario_empresa, id_oferta",
          )
          .eq("id_estudiante", entityId)
          .order("fecha_envio", { ascending: false })
          .limit(15);
        const enriched: Candidatura[] = await Promise.all(
          (data ?? []).map(async (c) => {
            const { data: o } = await supabase
              .from("oferta")
              .select("titulo")
              .eq("id_oferta", c.id_oferta)
              .maybeSingle();
            return { ...c, titulo_oferta: o?.titulo };
          }),
        );
        setCandidaturas(enriched);
        setStats((s) => ({ ...s, candidaturas: count ?? 0 }));
      }
      if (rawEntityType === "empresa") {
        const { count } = await supabase
          .from("oferta")
          .select("id_oferta", { count: "exact", head: true })
          .eq("id_empresa", entityId);
        setStats((s) => ({ ...s, ofertas: count ?? 0 }));
      }
      if (rawEntityType === "centro_educativo") {
        const { count } = await supabase
          .from("centro_estudiante")
          .select("id", { count: "exact", head: true })
          .eq("id_centro", entityId);
        setStats((s) => ({ ...s, estudiantes: count ?? 0 }));
      }
    };
    load();
  }, [profile, rawEntityType, entityId]);

  // ── Load viewer context ──
  useEffect(() => {
    if (!user || !rawEntityType) return;
    const load = async () => {
      const ctx: typeof viewerCtx = {};
      if (viewerRole === "tutor_centro" && rawEntityType === "estudiante") {
        const { data } = await supabase
          .from("centro_estudiante")
          .select("id, id_tutor")
          .eq("id_estudiante", entityId)
          .maybeSingle();
        if (data) {
          ctx.centroEstudiante = data.id;
          ctx.isMiEstudiante = data.id_tutor === viewerId;
        }
      }
      if (viewerRole === "tutor_empresa" && rawEntityType === "estudiante") {
        const { data } = await supabase
          .from("estudiante_estado")
          .select("estado")
          .eq("id_estudiante", entityId)
          .maybeSingle();
        ctx.isMyPracticasStudent = data?.estado === "en_practicas";
      }
      if (viewerRole === "centro_educativo" && rawEntityType === "estudiante") {
        const { data } = await supabase
          .from("centro_estudiante")
          .select("id")
          .eq("id_estudiante", entityId)
          .maybeSingle();
        ctx.isEnrolledEstudiante = !!data;
      }
      setViewerCtx(ctx);
    };
    load();
  }, [user, viewerRole, viewerId, entityId, rawEntityType]);

  // ── Load convenio ──
  useEffect(() => {
    if (!showConvenio || !entityId || !viewerId) return;
    const load = async () => {
      setConvenioState("loading");
      const empresaId = viewerRole === "empresa" ? viewerId : entityId;
      const centroId = viewerRole === "empresa" ? entityId : viewerId;
      const { data } = await supabase
        .from("convenio")
        .select("id, estado, id_solicitante")
        .eq("id_empresa", empresaId)
        .eq("id_centro", centroId)
        .maybeSingle();
      if (!data) {
        setConvenioState("none");
        return;
      }
      setConvenioId(data.id);
      if (data.estado === "activo") setConvenioState("active");
      else if (data.estado === "pendiente")
        setConvenioState(
          data.id_solicitante === viewerId ? "sent" : "received",
        );
      else {
        setConvenioState("none");
        setConvenioId(null);
      }
    };
    load();
  }, [showConvenio, entityId, viewerId, viewerRole]);

  // GitHub topics useEffect — here with all other useEffects
  useEffect(() => {
    if (rawEntityType !== "estudiante" || !profile) return;
    const repos: GitHubRepo[] =
      ((profile as Estudiante).github_repos_vinculados as GitHubRepo[]) ?? [];
    if (!repos.length) return;

    repos.forEach(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo.nombre_completo}`,
          { headers: { Accept: "application/vnd.github.v3+json" } },
        );
        if (res.ok) {
          const data = await res.json();
          setGhTopics((prev) => ({
            ...prev,
            [repo.repo_id]: data.topics ?? [],
          }));
          setGhDescripciones((prev) => ({
            ...prev,
            [repo.repo_id]: data.description ?? "",
          }));
        }

        const resLangs = await fetch(
          `https://api.github.com/repos/${repo.nombre_completo}/languages`,
          { headers: { Accept: "application/vnd.github.v3+json" } },
        );
        if (resLangs.ok) {
          const langs = await resLangs.json();
          setGhLenguajes((prev) => ({
            ...prev,
            [repo.repo_id]: Object.keys(langs),
          }));
        }
      } catch {
        // silent
      }
    });
  }, [profile, rawEntityType]);

  // ── Actions ──
  const withAction = async (fn: () => Promise<void>, msg: string) => {
    setActionLoading(true);
    try {
      await fn();
      showToast(msg);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error inesperado", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposeConvenio = async () => {
    setConvenioLoading(true);
    try {
      const empresaId = viewerRole === "empresa" ? viewerId : entityId;
      const centroId = viewerRole === "empresa" ? entityId : viewerId;
      const { data: convData, error: e } = await supabase
        .from("convenio")
        .insert({
          id_empresa: empresaId,
          id_centro: centroId,
          estado: "pendiente",
          id_solicitante: viewerId,
          fecha_propuesta: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (e) throw e;
      setConvenioId(convData.id);
      await supabase.from("notificacion").insert({
        id_usuario_destino: entityId,
        tipo: "propuesta_convenio",
        titulo: "Nueva propuesta de convenio",
        mensaje: "Has recibido una propuesta de convenio de colaboración.",
        url_destino:
          viewerRole === "empresa"
            ? `/empresa/${viewerId}`
            : `/centro/${viewerId}`,
        leido: false,
        fecha: new Date().toISOString(),
        metadata: JSON.stringify({ convenio_id: convData.id }),
      });
      setConvenioState("sent");
      showToast("Propuesta enviada correctamente");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setConvenioLoading(false);
    }
  };

  const handleRetractConvenio = async () => {
    if (!convenioId) return;
    setConvenioLoading(true);
    try {
      const { error: e } = await supabase
        .from("convenio")
        .delete()
        .eq("id", convenioId);
      if (e) throw e;
      setConvenioId(null);
      setConvenioState("none");
      showToast("Convenio retirado");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setConvenioLoading(false);
    }
  };

  const handleAcceptConvenio = async () => {
    if (!convenioId) return;
    setConvenioLoading(true);
    try {
      const { error: e } = await supabase
        .from("convenio")
        .update({
          estado: "activo",
          fecha_aceptacion: new Date().toISOString(),
        })
        .eq("id", convenioId);
      if (e) throw e;
      const { data: cd } = await supabase
        .from("convenio")
        .select("id_solicitante")
        .eq("id", convenioId)
        .maybeSingle();
      if (cd?.id_solicitante)
        await supabase.from("notificacion").insert({
          id_usuario_destino: cd.id_solicitante,
          tipo: "convenio_aceptado",
          titulo: "Convenio aceptado",
          mensaje: "Tu propuesta de convenio ha sido aceptada.",
          leido: false,
          fecha: new Date().toISOString(),
          metadata: JSON.stringify({ convenio_id: convenioId }),
        });
      setConvenioState("active");
      showToast("Convenio aceptado");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setConvenioLoading(false);
    }
  };

  const handleRejectConvenio = async () => {
    if (!convenioId) return;
    setConvenioLoading(true);
    try {
      const { error: e } = await supabase
        .from("convenio")
        .update({ estado: "rechazado" })
        .eq("id", convenioId);
      if (e) throw e;
      const { data: cd } = await supabase
        .from("convenio")
        .select("id_solicitante")
        .eq("id", convenioId)
        .maybeSingle();
      if (cd?.id_solicitante)
        await supabase.from("notificacion").insert({
          id_usuario_destino: cd.id_solicitante,
          tipo: "convenio_rechazado",
          titulo: "Propuesta rechazada",
          mensaje: "Tu propuesta de convenio ha sido rechazada.",
          leido: false,
          fecha: new Date().toISOString(),
          metadata: JSON.stringify({ convenio_id: convenioId }),
        });
      setConvenioId(null);
      setConvenioState("none");
      showToast("Propuesta rechazada");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setConvenioLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else history.back();
  };

  // ── Derived ──
  const getName = () =>
    rawEntityType === "estudiante"
      ? `${(profile as Estudiante).nombre ?? ""} ${(profile as Estudiante).apellidos ?? ""}`.trim()
      : ((profile as Empresa | CentroEducativo).nombre ?? "");
  const getAvatar = () =>
    rawEntityType === "empresa"
      ? (profile as Empresa).logo_url
      : (profile as Estudiante | CentroEducativo).avatar_url;
  const isVerified =
    "verificado" in (profile ?? {}) && (profile as any).verificado;
  const coverGrad = COVER[rawEntityType ?? "estudiante"] ?? COVER.estudiante;
  const profileName = profile ? getName() : "";
  const canSeeCandidaturas =
    viewerRole === "administrador" ||
    viewerRole === "empresa" ||
    viewerRole === "tutor_empresa" ||
    viewerRole === "tutor_centro" ||
    (viewerRole === "estudiante" &&
      rawEntityType === "estudiante" &&
      entityId === viewerId);

  // ── Conditional returns (after ALL hooks) ──
  if (loading)
    return (
      <MainLayout>
        <style>{CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </MainLayout>
    );

  if (error || !profile)
    return (
      <MainLayout>
        <style>{CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {error ?? "Perfil no encontrado"}
          </p>
          <button className="up-btn up-btn-secondary" onClick={handleBack}>
            <Icon.Back /> Volver
          </button>
        </div>
      </MainLayout>
    );

  // ── Render actions ──
  const renderActions = () => {
    const al = actionLoading;
    if (viewerRole === "administrador")
      return (
        <>
          {(rawEntityType === "empresa" ||
            rawEntityType === "centro_educativo") && (
            <Btn
              label="Verificar"
              variant="primary"
              icon={<Icon.Check />}
              onClick={() =>
                withAction(async () => {
                  const { error: e } = await supabase
                    .from(rawEntityType as any)
                    .update({ verificado: true })
                    .eq("id", entityId);
                  if (e) throw e;
                }, "Verificado")
              }
              loading={al}
            />
          )}
          {userBlocked ? (
            <Btn
              label="Desbloquear"
              icon={<Icon.Unlock />}
              onClick={() =>
                withAction(async () => {
                  await supabase
                    .from("usuario")
                    .update({ blocked: false } as any)
                    .eq("id", entityId);
                  setUserBlocked(false);
                }, "Desbloqueado")
              }
              loading={al}
            />
          ) : (
            <Btn
              label="Bloquear"
              danger
              icon={<Icon.Lock />}
              onClick={() =>
                withAction(async () => {
                  await supabase
                    .from("usuario")
                    .update({ blocked: true } as any)
                    .eq("id", entityId);
                  setUserBlocked(true);
                }, "Bloqueado")
              }
              loading={al}
            />
          )}
          <Btn
            label="Eliminar"
            danger
            icon={<Icon.Trash />}
            onClick={() =>
              withAction(async () => {
                if (!confirm("¿Eliminar este perfil?")) return;
                const t =
                  rawEntityType === "empresa"
                    ? "empresa"
                    : rawEntityType === "centro_educativo"
                      ? "centro_educativo"
                      : "estudiante";
                const { error: e } = await supabase
                  .from(t)
                  .delete()
                  .eq("id", entityId);
                if (e) throw e;
                setTimeout(() => (window.location.href = "/perfiles"), 800);
              }, "Eliminado")
            }
            loading={al}
          />
        </>
      );

    if (viewerRole === "centro_educativo" && rawEntityType === "estudiante")
      return (
        <>
          {viewerCtx.isEnrolledEstudiante ? (
            <Btn
              label="Desvincular"
              danger
              onClick={() =>
                withAction(async () => {
                  const { error: e } = await supabase
                    .from("centro_estudiante")
                    .delete()
                    .eq("id_estudiante", entityId);
                  if (e) throw e;
                  setViewerCtx((c) => ({ ...c, isEnrolledEstudiante: false }));
                }, "Desvinculado")
              }
              loading={al}
            />
          ) : (
            <Btn
              label="Vincular al centro"
              variant="primary"
              icon={<Icon.Users />}
              onClick={() =>
                withAction(async () => {
                  const { error: e } = await supabase
                    .from("centro_estudiante")
                    .insert({ id_centro: viewerId, id_estudiante: entityId });
                  if (e) throw e;
                  setViewerCtx((c) => ({ ...c, isEnrolledEstudiante: true }));
                }, "Vinculado")
              }
              loading={al}
            />
          )}
          <Btn
            label="Mensaje"
            icon={<Icon.Message />}
            onClick={() => alert("Abrir chat")}
          />
        </>
      );

    if (viewerRole === "tutor_centro" && rawEntityType === "estudiante")
      return (
        <>
          {viewerCtx.centroEstudiante ? (
            viewerCtx.isMiEstudiante ? (
              <Btn
                label="Quitar tutorización"
                danger
                onClick={() =>
                  withAction(async () => {
                    const { error: e } = await supabase
                      .from("centro_estudiante")
                      .update({ id_tutor: null })
                      .eq("id_estudiante", entityId);
                    if (e) throw e;
                    setViewerCtx((c) => ({ ...c, isMiEstudiante: false }));
                  }, "Desasignado")
                }
                loading={al}
              />
            ) : (
              <Btn
                label="Tutorizar"
                variant="primary"
                icon={<Icon.Users />}
                onClick={() =>
                  withAction(async () => {
                    const { error: e } = await supabase
                      .from("centro_estudiante")
                      .update({ id_tutor: viewerId })
                      .eq("id_estudiante", entityId);
                    if (e) throw e;
                    setViewerCtx((c) => ({ ...c, isMiEstudiante: true }));
                  }, "Asignado")
                }
                loading={al}
              />
            )
          ) : (
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                alignSelf: "center",
              }}
            >
              Fuera de tu centro
            </span>
          )}
          <Btn
            label="Mensaje"
            icon={<Icon.Message />}
            onClick={() => alert("Abrir chat")}
          />
        </>
      );

    if (viewerRole === "tutor_empresa" && rawEntityType === "estudiante")
      return (
        <>
          {viewerCtx.isMyPracticasStudent ? (
            <Btn
              label="Finalizar prácticas"
              danger
              onClick={() =>
                withAction(async () => {
                  const { error: e } = await supabase
                    .from("estudiante_estado")
                    .update({
                      estado: "finalizado",
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id_estudiante", entityId);
                  if (e) throw e;
                  setViewerCtx((c) => ({ ...c, isMyPracticasStudent: false }));
                }, "Prácticas finalizadas")
              }
              loading={al}
            />
          ) : (
            <Btn
              label="Iniciar prácticas"
              variant="primary"
              icon={<Icon.Briefcase />}
              onClick={() =>
                withAction(async () => {
                  const { error: e } = await supabase
                    .from("estudiante_estado")
                    .upsert({
                      id_estudiante: entityId,
                      estado: "en_practicas",
                      updated_at: new Date().toISOString(),
                    });
                  if (e) throw e;
                  setViewerCtx((c) => ({ ...c, isMyPracticasStudent: true }));
                }, "Prácticas iniciadas")
              }
              loading={al}
            />
          )}
        </>
      );

    // if (viewerRole === "empresa") {
    //   if (rawEntityType === "estudiante")
    //     return (
    //       <>
    //         <Btn
    //           label="Guardar perfil"
    //           variant="primary"
    //           icon={<Icon.Bookmark />}
    //           onClick={() =>
    //             withAction(async () => {
    //               await supabase.from("guardado").insert({
    //                 id_estudiante: entityId,
    //                 fecha_guardado: new Date().toISOString(),
    //               });
    //             }, "Guardado")
    //           }
    //           loading={al}
    //         />
    //         <Btn
    //           label="Mensaje"
    //           icon={<Icon.Message />}
    //           onClick={() => alert("Abrir chat")}
    //         />
    //       </>
    //     );
    //   if (rawEntityType === "centro_educativo")
    //     return (
    //       <Btn
    //         label="Contactar"
    //         icon={<Icon.Message />}
    //         onClick={() => alert("Abrir chat")}
    //       />
    //     );
    // }

    if (viewerRole === "estudiante") {
      if (rawEntityType === "empresa")
        return (
          <>
            <Btn
              label="Ver ofertas"
              variant="primary"
              icon={<Icon.Layers />}
              onClick={() => (window.location.href = `/ofertas`)}
            />
            <Btn
              label="Mensaje"
              icon={<Icon.Message />}
              onClick={() => alert("Abrir chat")}
            />
          </>
        );
      if (rawEntityType === "centro_educativo")
        return (
          <Btn
            label="Contactar"
            icon={<Icon.Message />}
            onClick={() => alert("Abrir chat")}
          />
        );
    }
    return null;
  };

  // ── Render profile content ──
  const renderContent = () => {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      const disp = DISP_MAP[s.disponibilidad ?? ""];
      const ghRepos: GitHubRepo[] =
        (s.github_repos_vinculados as GitHubRepo[]) ?? [];
      console.log("🔍 repo[0]:", ghRepos[0]);

      return (
        <>
          {s.sobre_mi && (
            <SectionCard title="Sobre mí" icon={<Icon.FileText />}>
              <p className="up-prose">{s.sobre_mi}</p>
            </SectionCard>
          )}

          <SectionCard title="Información" icon={<Icon.FileText />}>
            <div className="up-info-table">
              <InfoRow icon={<Icon.MapPin />} label="Ciudad" value={s.ciudad} />
              <InfoRow
                icon={<Icon.GradCap />}
                label="Titulación"
                value={s.titulacion}
              />
              {disp && (
                <InfoRow
                  icon={<Icon.Clock />}
                  label="Disponibilidad"
                  value={disp.label}
                />
              )}
              <InfoRow
                icon={<Icon.Briefcase />}
                label="Tipo de búsqueda"
                value={s.tipo_busqueda}
              />
              <InfoRow
                icon={<Icon.Building />}
                label="Modalidad"
                value={s.modalidad}
              />
              {(viewerRole !== "estudiante" || entityId === viewerId) && (
                <InfoRow
                  icon={<Icon.Phone />}
                  label="Teléfono"
                  value={s.telefono}
                />
              )}
              {(viewerRole === "administrador" ||
                viewerRole === "tutor_centro" ||
                viewerRole === "tutor_empresa") && (
                <InfoRow icon={<Icon.Mail />} label="Email" value={s.email} />
              )}
              {s.github_username && (
                <InfoRow
                  icon={<Icon.GitHub />}
                  label="GitHub"
                  value={`github.com/${s.github_username}`}
                  href={`https://github.com/${s.github_username}`}
                />
              )}
            </div>
          </SectionCard>

          {(s.habilidades ?? []).length > 0 && (
            <SectionCard title="Habilidades y tecnologías" icon={<Icon.Code />}>
              <div className="up-tags">
                {s.habilidades!.map((h) => (
                  <span key={h} className="up-tag">
                    {h}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <SectionCard title="Formación académica" icon={<Icon.GradCap />}>
              <div className="up-formations">
                {(s.formaciones as Record<string, string>[]).map((f, i) => (
                  <div key={i} className="up-formation">
                    <div className="up-formation-dot" />
                    <div>
                      <div className="up-formation-name">{f.titulo}</div>
                      <div className="up-formation-sub">
                        {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                      </div>
                      {f.descripcion && (
                        <div className="up-formation-desc">{f.descripcion}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <SectionCard title="Proyectos" icon={<Icon.Code />}>
              <div className="up-projects">
                {(s.proyectos as Record<string, string>[]).map((p, i) => (
                  <div key={i} className="up-project">
                    <div className="up-project-name">{p.titulo}</div>
                    {p.descripcion && (
                      <div className="up-project-desc">{p.descripcion}</div>
                    )}
                    {p.enlace && (
                      <a
                        href={p.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="up-project-link"
                      >
                        Ver proyecto <Icon.ExternalLink />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ✅ GitHub repos — inside the estudiante return, before the closing </> */}
          {ghRepos.length > 0 && (
            <SectionCard
              title="Repositorios de GitHub"
              icon={<Icon.GitHub />}
              count={ghRepos.length}
            >
              <div className="up-gh-grid">
                {ghRepos.map((repo) => {
                  const topics: string[] = ghTopics[repo.repo_id] ?? [];
                  const fecha = repo.actualizado
                    ? new Date(repo.actualizado).toLocaleDateString("es-ES", {
                        month: "short",
                        year: "numeric",
                      })
                    : "";
                  const langs =
                    ghLenguajes[repo.repo_id] ?? repo.lenguajes ?? [];
                  const langColor = LANG_COLORS[langs[0]] ?? "#8b949e";
                  return (
                    <div key={repo.repo_id} className="up-gh-card">
                      <div className="up-gh-header">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="up-gh-name"
                        >
                          <Icon.GitHub /> {repo.nombre}
                        </a>
                        {repo.privado && (
                          <span className="up-gh-private">privado</span>
                        )}
                      </div>

                      {ghDescripciones[repo.repo_id] || repo.descripcion ? (
                        <p className="up-gh-desc">
                          {ghDescripciones[repo.repo_id] || repo.descripcion}
                        </p>
                      ) : (
                        <p
                          className="up-gh-desc"
                          style={{ fontStyle: "italic", opacity: 0.4 }}
                        >
                          Sin descripción
                        </p>
                      )}

                      {topics.length > 0 && (
                        <div className="up-gh-topics">
                          {topics.slice(0, 5).map((t) => (
                            <span key={t} className="up-gh-topic">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {langs.length > 0 && (
                        <div
                          className="up-gh-lang"
                          style={{ flexWrap: "wrap", gap: "8px" }}
                        >
                          {langs.slice(0, 4).map((lang) => (
                            <span
                              key={lang}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <span
                                className="up-gh-lang-dot"
                                style={{
                                  background: LANG_COLORS[lang] ?? "#8b949e",
                                }}
                              />
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="up-gh-footer">
                        {repo.estrellas > 0 && (
                          <span className="up-gh-stat">
                            <Icon.Star /> {repo.estrellas}
                          </span>
                        )}
                        {repo.forks > 0 && (
                          <span className="up-gh-stat">
                            <Icon.Fork /> {repo.forks}
                          </span>
                        )}
                        {fecha && <span className="up-gh-date">{fecha}</span>}
                      </div>

                      <div className="up-gh-links">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="up-gh-link"
                        >
                          <Icon.GitHub /> Código
                        </a>
                        {repo.url_demo && (
                          <a
                            href={repo.url_demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="up-gh-link"
                          >
                            <Icon.Link /> Demo
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {s.redes_sociales && Object.keys(s.redes_sociales).length > 0 && (
            <SectionCard title="Redes sociales" icon={<Icon.Link />}>
              <div className="up-info-table">
                {Object.entries(s.redes_sociales).map(([red, url]) =>
                  url ? (
                    <InfoRow
                      key={red}
                      icon={<Icon.Link />}
                      label={red}
                      value={url}
                      href={url}
                    />
                  ) : null,
                )}
              </div>
            </SectionCard>
          )}

          {canSeeCandidaturas && candidaturas.length > 0 && (
            <SectionCard
              title="Candidaturas"
              icon={<Icon.FileText />}
              count={stats.candidaturas}
            >
              <div className="up-cands">
                {candidaturas.map((c) => {
                  const col = CAND_MAP[c.estado] ?? {
                    color: "#6b7280",
                    label: c.estado,
                  };
                  return (
                    <div key={c.id_candidatura} className="up-cand">
                      <div style={{ minWidth: 0 }}>
                        <div className="up-cand-name">
                          {c.titulo_oferta ??
                            `Candidatura #${c.id_candidatura}`}
                        </div>
                        <div className="up-cand-date">
                          {new Date(c.fecha_envio).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {c.comentario_empresa && (
                          <div className="up-cand-comment">
                            "{c.comentario_empresa}"
                          </div>
                        )}
                      </div>
                      <span
                        className="up-pill"
                        style={{
                          background: `${col.color}18`,
                          color: col.color,
                          borderColor: `${col.color}30`,
                        }}
                      >
                        <Icon.Dot color={col.color} />
                        {col.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </>
      );
    }

    if (rawEntityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.descripcion && (
            <SectionCard title="Sobre la empresa" icon={<Icon.Building />}>
              <p className="up-prose">{e.descripcion}</p>
            </SectionCard>
          )}
          <SectionCard title="Información corporativa" icon={<Icon.FileText />}>
            <div className="up-info-table">
              <InfoRow icon={<Icon.MapPin />} label="Ciudad" value={e.ciudad} />
              <InfoRow
                icon={<Icon.Briefcase />}
                label="Sector"
                value={e.sector}
              />
              <InfoRow icon={<Icon.Users />} label="Tamaño" value={e.tamano} />
              <InfoRow
                icon={<Icon.Mail />}
                label="Email"
                value={e.email_contacto}
              />
              <InfoRow
                icon={<Icon.Phone />}
                label="Teléfono"
                value={e.telefono}
              />
              <InfoRow
                icon={<Icon.Globe />}
                label="Web"
                value={e.web}
                href={e.web}
              />
              <InfoRow
                icon={<Icon.Link />}
                label="LinkedIn"
                value={e.linkedin}
                href={e.linkedin}
              />
              {viewerRole === "administrador" && (
                <InfoRow icon={<Icon.Shield />} label="CIF" value={e.cif} />
              )}
            </div>
          </SectionCard>
        </>
      );
    }

    if (rawEntityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.descripcion && (
            <SectionCard title="Sobre el centro" icon={<Icon.Building />}>
              <p className="up-prose">{c.descripcion}</p>
            </SectionCard>
          )}
          <SectionCard title="Datos del centro" icon={<Icon.FileText />}>
            <div className="up-info-table">
              <InfoRow icon={<Icon.MapPin />} label="Ciudad" value={c.ciudad} />
              <InfoRow
                icon={<Icon.MapPin />}
                label="Provincia"
                value={c.provincia}
              />
              <InfoRow
                icon={<Icon.Building />}
                label="Tipo de centro"
                value={c.tipo_centro}
              />
              <InfoRow
                icon={<Icon.Users />}
                label="Nº de alumnos"
                value={c.num_alumnos?.toString()}
              />
              <InfoRow
                icon={<Icon.Mail />}
                label="Email"
                value={c.email_contacto}
              />
              <InfoRow
                icon={<Icon.Phone />}
                label="Teléfono"
                value={c.telefono}
              />
              <InfoRow
                icon={<Icon.Globe />}
                label="Web"
                value={c.sitio_web}
                href={c.sitio_web}
              />
            </div>
          </SectionCard>
          {c.titulaciones && c.titulaciones.length > 0 && (
            <SectionCard title="Titulaciones ofertadas" icon={<Icon.Layers />}>
              <div className="up-tags">
                {c.titulaciones.map((t) => (
                  <span key={t} className="up-tag up-chip-blue">
                    {t}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      );
    }

    return null;
  };

  // ── Convenio banner ──
  const renderConvenio = () => {
    if (!showConvenio) return null;
    const entityName = profileName;

    if (convenioState === "loading")
      return (
        <div
          className="up-convenio up-convenio-none"
          style={{ marginBottom: 12 }}
        >
          <div
            className="up-skeleton"
            style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div
              className="up-skeleton"
              style={{ height: 13, width: "40%", marginBottom: 8 }}
            />
            <div className="up-skeleton" style={{ height: 11, width: "60%" }} />
          </div>
        </div>
      );

    if (convenioState === "none")
      return (
        <div
          className="up-convenio up-convenio-none"
          style={{ marginBottom: 12 }}
        >
          <div
            className="up-convenio-icon"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.18)",
              color: "#a78bfa",
            }}
          >
            <Icon.Handshake />
          </div>
          <div className="up-convenio-text">
            <div
              className="up-convenio-title"
              style={{ color: "var(--color-text)" }}
            >
              Proponer convenio de colaboración
            </div>
            <div className="up-convenio-sub">
              Establece una relación formal con {entityName} para gestionar
              prácticas.
            </div>
          </div>
          <button
            className="up-btn up-btn-convenio"
            onClick={handleProposeConvenio}
            disabled={convenioLoading}
          >
            {convenioLoading ? (
              <div className="up-spinner" />
            ) : (
              <Icon.Handshake />
            )}
            Proponer
          </button>
        </div>
      );

    if (convenioState === "sent")
      return (
        <div
          className="up-convenio up-convenio-sent"
          style={{ marginBottom: 12 }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#facc15",
              flexShrink: 0,
              boxShadow: "0 0 0 3px rgba(250,204,21,0.2)",
            }}
          />
          <div className="up-convenio-text">
            <div className="up-convenio-title" style={{ color: "#facc15" }}>
              Propuesta enviada — pendiente de respuesta
            </div>
            <div className="up-convenio-sub">
              {entityName} aún no ha respondido
            </div>
          </div>
          <button
            className="up-btn up-btn-danger"
            onClick={handleRetractConvenio}
            disabled={convenioLoading}
          >
            {convenioLoading ? <div className="up-spinner" /> : <Icon.X />}
            Retirar
          </button>
        </div>
      );

    if (convenioState === "received")
      return (
        <div
          className="up-convenio up-convenio-received"
          style={{ marginBottom: 12 }}
        >
          <div
            className="up-convenio-icon"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa",
            }}
          >
            <Icon.Handshake />
          </div>
          <div className="up-convenio-text">
            <div className="up-convenio-title" style={{ color: "#a78bfa" }}>
              {entityName} quiere establecer un convenio
            </div>
            <div className="up-convenio-sub">Acepta o rechaza la propuesta</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              className="up-btn up-btn-danger"
              onClick={handleRejectConvenio}
              disabled={convenioLoading}
            >
              <Icon.X />
              Rechazar
            </button>
            <button
              className="up-btn up-btn-primary"
              onClick={handleAcceptConvenio}
              disabled={convenioLoading}
            >
              <Icon.Check />
              Aceptar
            </button>
          </div>
        </div>
      );

    if (convenioState === "active")
      return (
        <div
          className="up-convenio up-convenio-active"
          style={{ marginBottom: 12 }}
        >
          <div
            className="up-convenio-icon"
            style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              color: "#4ade80",
            }}
          >
            <Icon.CheckCircle />
          </div>
          <div className="up-convenio-text">
            <div className="up-convenio-title" style={{ color: "#4ade80" }}>
              Convenio activo con {entityName}
            </div>
            <div className="up-convenio-sub">Relación formal establecida</div>
          </div>
          <button
            className="up-btn up-btn-danger"
            onClick={handleRetractConvenio}
            disabled={convenioLoading}
          >
            {convenioLoading ? <div className="up-spinner" /> : null}Retirar
            convenio
          </button>
        </div>
      );

    return null;
  };

  const dispInfo =
    rawEntityType === "estudiante"
      ? (DISP_MAP[(profile as Estudiante).disponibilidad ?? ""] ?? null)
      : null;

  return (
    <MainLayout>
      <style>{CSS}</style>
      <div className="up-root">
        <div className="up-page">
          <button className="up-back" onClick={handleBack}>
            <Icon.Back /> Volver
          </button>

          <div className="up-hero">
            <div
              className="up-cover"
              style={{
                background: `linear-gradient(135deg, ${coverGrad.from} 0%, ${coverGrad.to} 100%)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: `linear-gradient(to bottom, transparent, var(--color-surface-strong))`,
                }}
              />
            </div>

            <div className="up-hero-body">
              <div className="up-avatar-row">
                <div
                  className={`up-avatar${isVerified ? " up-verified-ring" : ""}`}
                >
                  <AvatarDisplay url={getAvatar()} name={profileName} />
                </div>
                <div className="up-actions">{renderActions()}</div>
              </div>

              <h1 className="up-name">{profileName}</h1>

              {rawEntityType === "estudiante" &&
                (() => {
                  const s = profile as Estudiante;
                  return s.titulacion ? (
                    <p className="up-headline">
                      {s.titulacion}
                      {s.ciudad ? ` · ${s.ciudad}` : ""}
                    </p>
                  ) : s.ciudad ? (
                    <p className="up-headline">{s.ciudad}</p>
                  ) : null;
                })()}
              {rawEntityType === "empresa" &&
                (() => {
                  const e = profile as Empresa;
                  return (
                    <p className="up-headline">
                      {[e.sector, e.ciudad, e.tamano]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  );
                })()}
              {rawEntityType === "centro_educativo" &&
                (() => {
                  const c = profile as CentroEducativo;
                  return (
                    <p className="up-headline">
                      {[c.tipo_centro, c.ciudad, c.provincia]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  );
                })()}

              <div className="up-chips">
                {rawEntityType === "empresa" && (
                  <span className="up-chip">
                    <Icon.Building />
                    &nbsp;Empresa
                  </span>
                )}
                {rawEntityType === "centro_educativo" && (
                  <span className="up-chip up-chip-blue">
                    <Icon.Building />
                    &nbsp;Centro educativo
                  </span>
                )}
                {rawEntityType === "estudiante" && (
                  <span className="up-chip">
                    <Icon.GradCap />
                    &nbsp;Estudiante
                  </span>
                )}
                {isVerified && (
                  <span className="up-chip up-chip-verified">
                    <Icon.Check />
                    &nbsp;Verificado
                  </span>
                )}
                {dispInfo && (
                  <span
                    className="up-chip"
                    style={{
                      color: dispInfo.color,
                      background: `${dispInfo.color}12`,
                      borderColor: `${dispInfo.color}25`,
                    }}
                  >
                    <Icon.Dot color={dispInfo.color} />
                    &nbsp;{dispInfo.label}
                  </span>
                )}
                {viewerCtx.isMiEstudiante && (
                  <span className="up-chip up-chip-verified">
                    <Icon.Check />
                    &nbsp;Mi estudiante
                  </span>
                )}
                {viewerCtx.isMyPracticasStudent && (
                  <span
                    className="up-chip"
                    style={{
                      color: "#fb923c",
                      background: "rgba(251,146,60,0.08)",
                      borderColor: "rgba(251,146,60,0.2)",
                    }}
                  >
                    <Icon.Briefcase />
                    &nbsp;En prácticas
                  </span>
                )}
                {convenioState === "active" && (
                  <span className="up-chip up-chip-verified">
                    <Icon.CheckCircle />
                    &nbsp;Convenio activo
                  </span>
                )}
              </div>

              {(stats.candidaturas > 0 ||
                stats.ofertas > 0 ||
                stats.estudiantes > 0) && (
                <div className="up-stats">
                  {rawEntityType === "estudiante" && stats.candidaturas > 0 && (
                    <div className="up-stat-item">
                      <span className="up-stat-val">{stats.candidaturas}</span>
                      <span className="up-stat-lbl">Candidaturas</span>
                    </div>
                  )}
                  {rawEntityType === "empresa" && stats.ofertas > 0 && (
                    <div className="up-stat-item">
                      <span className="up-stat-val">{stats.ofertas}</span>
                      <span className="up-stat-lbl">Ofertas publicadas</span>
                    </div>
                  )}
                  {rawEntityType === "centro_educativo" &&
                    stats.estudiantes > 0 && (
                      <div className="up-stat-item">
                        <span className="up-stat-val">{stats.estudiantes}</span>
                        <span className="up-stat-lbl">Estudiantes</span>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {renderConvenio()}
          {renderContent()}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
}
