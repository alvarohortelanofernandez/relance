import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks globales ────────────────────────────────────────────────────────────

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "http://test.com/avatar.jpg" },
        }),
      })),
    },
  },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-123", email: "test@test.com" } }),
}));

vi.mock("../../components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../GitHubIntegration", () => ({
  default: () => <div data-testid="github-section">GitHub mock</div>,
}));

vi.mock("../../assets/logo_relance.jpg", () => ({ default: "logo.jpg" }));

import StudentProfile from "../pages/perfil/StudentProfile";

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// HABILIDADES
// ─────────────────────────────────────────────────────────────────────────────

describe("StudentProfile — Habilidades técnicas", () => {
  it("añade una habilidad al pulsar Enter", async () => {
    render(<StudentProfile />);
    const input = screen.getByPlaceholderText(/Escribe una habilidad/i);
    await userEvent.type(input, "React{Enter}");
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("no añade la misma habilidad dos veces", async () => {
    render(<StudentProfile />);
    const input = screen.getByPlaceholderText(/Escribe una habilidad/i);
    await userEvent.type(input, "React{Enter}");
    await userEvent.type(input, "React{Enter}");
    const tags = screen.getAllByText("React");
    expect(tags).toHaveLength(1);
  });

  it("elimina una habilidad al pulsar ×", async () => {
    render(<StudentProfile />);
    const input = screen.getByPlaceholderText(/Escribe una habilidad/i);
    await userEvent.type(input, "Vue{Enter}");
    expect(screen.getByText("Vue")).toBeInTheDocument();
    const removeBtn = screen.getByRole("button", { name: "×" });
    await userEvent.click(removeBtn);
    expect(screen.queryByText("Vue")).not.toBeInTheDocument();
  });

  it("limpia el input tras añadir una habilidad", async () => {
    render(<StudentProfile />);
    const input = screen.getByPlaceholderText(/Escribe una habilidad/i);
    await userEvent.type(input, "TypeScript{Enter}");
    expect(input).toHaveValue("");
  });

  it("muestra mensaje cuando no hay habilidades", () => {
    render(<StudentProfile />);
    expect(
      screen.getByText("Aún no has añadido habilidades"),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORMACIÓN ACADÉMICA — Modal
// ─────────────────────────────────────────────────────────────────────────────

describe("StudentProfile — Formación académica", () => {
  it("abre el modal al pulsar Añadir formación", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir formación"));
    expect(
      screen.getByText("Añadir formación", { selector: "h2" }),
    ).toBeInTheDocument();
  });

  it("cierra el modal al pulsar Cancelar", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir formación"));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("el botón guardar está deshabilitado si el título está vacío", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir formación"));
    const saveBtn = screen.getByRole("button", {
      name: /Añadir formación/i,
      hidden: true,
    });
    expect(saveBtn).toBeDisabled();
  });

  it("muestra el toggle 'Todavía en curso'", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir formación"));
    expect(screen.getByText("Todavía en curso")).toBeInTheDocument();
  });

  it("oculta la fecha de fin cuando 'en curso' está activo", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir formación"));
    const toggle = screen
      .getByText("Todavía en curso")
      .closest("div")!
      .querySelector("button")!;
    await userEvent.click(toggle);
    expect(screen.queryByText("Fecha de finalización")).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROYECTOS — Modal
// ─────────────────────────────────────────────────────────────────────────────

describe("StudentProfile — Proyectos", () => {
  it("abre el modal al pulsar Añadir proyecto", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    expect(
      screen.getByText("Añadir proyecto", { selector: "h2" }),
    ).toBeInTheDocument();
  });

  it("muestra el banner de análisis con IA", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    expect(
      screen.getByText(/Rellena automáticamente con IA/i),
    ).toBeInTheDocument();
  });

  it("el botón Analizar está deshabilitado si la URL está vacía", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    expect(screen.getByRole("button", { name: "Analizar" })).toBeDisabled();
  });

  it("se habilita el botón Analizar al introducir una URL", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    const urlInput = screen.getByPlaceholderText(
      "https://github.com/usuario/repositorio",
    );
    await userEvent.type(urlInput, "https://github.com/user/repo");
    expect(screen.getByRole("button", { name: "Analizar" })).not.toBeDisabled();
  });

  it("añade tecnología al pulsar Enter en el campo de tecnologías", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    const techInput = screen.getByPlaceholderText(/Escribe y pulsa Enter/i);
    await userEvent.type(techInput, "React{Enter}");
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("el botón guardar proyecto requiere al menos título", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Añadir proyecto"));
    const saveBtn = screen.getByRole("button", {
      name: "Añadir proyecto",
      hidden: true,
    });
    expect(saveBtn).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO DE BÚSQUEDA
// ─────────────────────────────────────────────────────────────────────────────

describe("StudentProfile — Tipo de búsqueda", () => {
  it("selecciona 'Solo prácticas' al pulsarlo", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getByText("Solo prácticas"));
    const btn = screen.getByText("Solo prácticas").closest("button")!;
    expect(btn.style.background).toContain("rgba(192,255,114");
  });

  it("muestra las tres opciones de búsqueda", () => {
    render(<StudentProfile />);
    expect(screen.getByText("Solo prácticas")).toBeInTheDocument();
    expect(screen.getByText("Prácticas + contratación")).toBeInTheDocument();
    expect(screen.getByText("Empleo directo")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR PERFIL
// ─────────────────────────────────────────────────────────────────────────────

describe("StudentProfile — Guardar perfil", () => {
  it("muestra 'Guardando...' mientras guarda", async () => {
    const { supabase } = await import("../lib/supabase");
    vi.mocked(supabase.from).mockReturnValueOnce({
      upsert: () =>
        new Promise((res) => setTimeout(() => res({ error: null }), 500)),
    } as any);

    render(<StudentProfile />);
    await userEvent.click(screen.getAllByText("Guardar cambios")[0]);
    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });

  it("muestra 'Guardado' tras guardar con éxito", async () => {
    render(<StudentProfile />);
    await userEvent.click(screen.getAllByText("Guardar cambios")[0]);
    await waitFor(() => {
      expect(screen.getByText("Guardado")).toBeInTheDocument();
    });
  });
});
