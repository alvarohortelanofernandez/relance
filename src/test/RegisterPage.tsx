import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../pages/register/RegisterPage";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const mockNavigate = vi.hoisted(() => vi.fn());

const mockSupabase = vi.hoisted(() => ({
  auth: {
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-123" } },
      error: null,
    }),
  },
  from: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue({ error: null }),
  insert: vi.fn().mockResolvedValue({ error: null }),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../lib/supabase", () => ({
  supabase: mockSupabase,
}));

vi.mock("../components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  mockSupabase.from.mockReturnValue(mockSupabase);
  mockSupabase.order.mockResolvedValue({ data: [], error: null });
  mockSupabase.auth.signUp.mockResolvedValue({
    data: { user: { id: "new-user-123" } },
    error: null,
  });
  mockSupabase.upsert.mockResolvedValue({ error: null });
  mockSupabase.insert.mockResolvedValue({ error: null });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function selectRole(role: "Estudiante" | "Empresa" | "Centro educativo") {
  await userEvent.click(screen.getByText(role));
}

async function fillCommonFields({
  name = "Ana García",
  email = "ana@test.com",
  password = "Password1",
}: {
  name?: string;
  email?: string;
  password?: string;
} = {}) {
  await userEvent.type(
    screen.getByPlaceholderText(
      /nombre y apellidos|representante|responsable/i,
    ),
    name,
  );
  await userEvent.type(
    screen.getByPlaceholderText(
      /tu@correo|contacto@empresa|responsable@centro/i,
    ),
    email,
  );
  const [pass, confirm] =
    screen.getAllByPlaceholderText(/mínimo 8 caracteres/i);
  await userEvent.type(pass, password);
  await userEvent.type(
    screen.getByPlaceholderText("Repite la contraseña"),
    password,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("RegisterPage — Renderizado inicial", () => {
  it("muestra el título Crea tu cuenta", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Crea tu cuenta")).toBeInTheDocument();
  });

  it("muestra los tres roles disponibles", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Estudiante")).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
    expect(screen.getByText("Centro educativo")).toBeInTheDocument();
  });

  it("muestra el aviso para tutores", () => {
    render(<RegisterPage />);
    expect(screen.getByText("¿Eres tutor?")).toBeInTheDocument();
  });

  it("no muestra el formulario si no se ha seleccionado rol", () => {
    render(<RegisterPage />);
    expect(
      screen.getByText("Selecciona un tipo de cuenta para continuar"),
    ).toBeInTheDocument();
  });

  it("muestra el enlace para iniciar sesión", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
  });
});

describe("RegisterPage — Selección de rol", () => {
  it("muestra el formulario de estudiante al seleccionar Estudiante", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    expect(screen.getByText("Registro como Estudiante")).toBeInTheDocument();
  });

  it("muestra el formulario de empresa al seleccionar Empresa", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    expect(screen.getByText("Registro como Empresa")).toBeInTheDocument();
  });

  it("muestra el formulario de centro al seleccionar Centro educativo", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    expect(
      screen.getByText("Registro como Centro educativo"),
    ).toBeInTheDocument();
  });

  it("cambia el formulario al cambiar de rol", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    expect(screen.getByText("Registro como Estudiante")).toBeInTheDocument();
    await selectRole("Empresa");
    expect(screen.getByText("Registro como Empresa")).toBeInTheDocument();
  });
});

describe("RegisterPage — Validaciones comunes", () => {
  it("muestra error si el nombre está vacío", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
  });

  it("muestra error si el correo no es válido", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await userEvent.type(
      screen.getByPlaceholderText(/nombre y apellidos/i),
      "Ana García",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/tu@correo/i),
      "correo-invalido",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );
    expect(screen.getByText("Introduce un correo válido.")).toBeInTheDocument();
  });

  it("muestra error si la contraseña tiene menos de 8 caracteres", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await userEvent.type(
      screen.getByPlaceholderText(/nombre y apellidos/i),
      "Ana García",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/tu@correo/i),
      "ana@test.com",
    );
    const [pass] = screen.getAllByPlaceholderText(/mínimo 8 caracteres/i);
    await userEvent.type(pass, "abc");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );
    expect(screen.getByText("Mínimo 8 caracteres.")).toBeInTheDocument();
  });

  it("muestra error si la contraseña no tiene mayúscula o número", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await userEvent.type(
      screen.getByPlaceholderText(/nombre y apellidos/i),
      "Ana García",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/tu@correo/i),
      "ana@test.com",
    );
    const [pass] = screen.getAllByPlaceholderText(/mínimo 8 caracteres/i);
    await userEvent.type(pass, "sinmayusculas");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );
    expect(
      screen.getByText("Debe tener al menos una mayúscula y un número."),
    ).toBeInTheDocument();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await userEvent.type(
      screen.getByPlaceholderText(/nombre y apellidos/i),
      "Ana García",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/tu@correo/i),
      "ana@test.com",
    );
    const [pass] = screen.getAllByPlaceholderText(/mínimo 8 caracteres/i);
    await userEvent.type(pass, "Password1");
    await userEvent.type(
      screen.getByPlaceholderText("Repite la contraseña"),
      "Password2",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );
    expect(
      screen.getByText("Las contraseñas no coinciden."),
    ).toBeInTheDocument();
  });
});

describe("RegisterPage — Formulario de estudiante", () => {
  it("muestra la sección de información académica", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    expect(
      screen.getByText("Información académica (opcional)"),
    ).toBeInTheDocument();
  });

  it("llama a supabase.auth.signUp con los datos correctos", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "ana@test.com",
          password: "Password1",
        }),
      );
    });
  });

  it("llama a supabase.from('estudiante').upsert tras registro exitoso", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("estudiante");
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });
  });

  it("muestra la pantalla de éxito tras registro correcto", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("¡Cuenta creada!")).toBeInTheDocument();
    });
  });

  it("muestra el email en la pantalla de éxito", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields({ email: "ana@test.com" });
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("ana@test.com")).toBeInTheDocument();
    });
  });

  it("muestra error si supabase.auth.signUp falla", async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Something went wrong" },
    });

    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("muestra mensaje especial si el correo ya está registrado", async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: "User already registered" },
    });

    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Este correo ya está registrado. ¿Quieres iniciar sesión?",
        ),
      ).toBeInTheDocument();
    });
  });

  it("muestra el spinner mientras se procesa el registro", async () => {
    mockSupabase.auth.signUp.mockImplementationOnce(
      () =>
        new Promise((res) =>
          setTimeout(
            () => res({ data: { user: { id: "new-user-123" } }, error: null }),
            500,
          ),
        ),
    );

    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    expect(screen.getByText("Creando cuenta...")).toBeInTheDocument();
  });
});

describe("RegisterPage — Formulario de empresa", () => {
  it("muestra error si falta el nombre de empresa", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    await fillCommonFields({
      name: "Carlos López",
      email: "carlos@empresa.com",
    });
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de empresa/i }),
    );
    expect(
      screen.getByText("El nombre de la empresa es obligatorio."),
    ).toBeInTheDocument();
  });

  it("muestra error si el CIF está vacío", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    await fillCommonFields({
      name: "Carlos López",
      email: "carlos@empresa.com",
    });
    await userEvent.type(
      screen.getByPlaceholderText("Mi Empresa S.L."),
      "Mi Empresa",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de empresa/i }),
    );
    expect(screen.getByText("El CIF es obligatorio.")).toBeInTheDocument();
  });

  it("muestra error si el CIF tiene formato inválido", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    await fillCommonFields({
      name: "Carlos López",
      email: "carlos@empresa.com",
    });
    await userEvent.type(
      screen.getByPlaceholderText("Mi Empresa S.L."),
      "Mi Empresa",
    );
    await userEvent.type(
      screen.getByPlaceholderText("B12345678"),
      "INVALIDO!!!",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de empresa/i }),
    );
    expect(screen.getByText(/formato de CIF inválido/i)).toBeInTheDocument();
  });

  it("muestra error si la URL de la web no es válida", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    await fillCommonFields({
      name: "Carlos López",
      email: "carlos@empresa.com",
    });
    await userEvent.type(
      screen.getByPlaceholderText("Mi Empresa S.L."),
      "Mi Empresa",
    );
    await userEvent.type(screen.getByPlaceholderText("B12345678"), "B12345678");
    await userEvent.type(
      screen.getByPlaceholderText("https://miempresa.com"),
      "no-es-una-url",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de empresa/i }),
    );
    expect(screen.getByText(/introduce una URL válida/i)).toBeInTheDocument();
  });

  it("muestra el aviso de verificación de CIF", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    expect(screen.getByText(/el cif será verificado/i)).toBeInTheDocument();
  });

  it("llama a signUp con role empresa", async () => {
    render(<RegisterPage />);
    await selectRole("Empresa");
    await fillCommonFields({
      name: "Carlos López",
      email: "carlos@empresa.com",
    });
    await userEvent.type(
      screen.getByPlaceholderText("Mi Empresa S.L."),
      "Mi Empresa",
    );
    await userEvent.type(screen.getByPlaceholderText("B12345678"), "B12345678");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de empresa/i }),
    );

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({ role: "empresa" }),
          }),
        }),
      );
    });
  });
});

describe("RegisterPage — Formulario de centro educativo", () => {
  it("muestra error si falta el nombre del centro", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    await fillCommonFields({
      name: "María Sánchez",
      email: "maria@ies.edu.es",
    });
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de centro/i }),
    );
    expect(
      screen.getByText("El nombre del centro es obligatorio."),
    ).toBeInTheDocument();
  });

  it("muestra error si falta el código institucional", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    await fillCommonFields({
      name: "María Sánchez",
      email: "maria@ies.edu.es",
    });
    await userEvent.type(
      screen.getByPlaceholderText("IES Nombre del Centro"),
      "IES Ejemplo",
    );
    await userEvent.type(screen.getByPlaceholderText("Córdoba"), "Córdoba");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de centro/i }),
    );
    expect(
      screen.getByText("El código institucional es obligatorio."),
    ).toBeInTheDocument();
  });

  it("muestra error si la ciudad está vacía", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    await fillCommonFields({
      name: "María Sánchez",
      email: "maria@ies.edu.es",
    });
    await userEvent.type(
      screen.getByPlaceholderText("IES Nombre del Centro"),
      "IES Ejemplo",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Ej: IES-COR-2026"),
      "IES-COR-001",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de centro/i }),
    );
    expect(screen.getByText("La ciudad es obligatoria.")).toBeInTheDocument();
  });

  it("muestra el aviso de verificación del código institucional", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    expect(
      screen.getByText(/código institucional será verificado/i),
    ).toBeInTheDocument();
  });

  it("llama a signUp con role centro_educativo", async () => {
    render(<RegisterPage />);
    await selectRole("Centro educativo");
    await fillCommonFields({
      name: "María Sánchez",
      email: "maria@ies.edu.es",
    });
    await userEvent.type(
      screen.getByPlaceholderText("IES Nombre del Centro"),
      "IES Ejemplo",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Ej: IES-COR-2026"),
      "IES-COR-001",
    );
    await userEvent.type(screen.getByPlaceholderText("Córdoba"), "Córdoba");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de centro/i }),
    );

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({ role: "centro_educativo" }),
          }),
        }),
      );
    });
  });
});

describe("RegisterPage — Pantalla de éxito", () => {
  it("muestra el botón Ir al inicio", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Ir al inicio" }),
      ).toBeInTheDocument();
    });
  });

  it("navega al inicio al pulsar Ir al inicio", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => screen.getByRole("button", { name: "Ir al inicio" }));
    await userEvent.click(screen.getByRole("button", { name: "Ir al inicio" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navega al login al pulsar Iniciar sesión en la pantalla de éxito", async () => {
    render(<RegisterPage />);
    await selectRole("Estudiante");
    await fillCommonFields();
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta de estudiante/i }),
    );

    await waitFor(() => screen.getByRole("button", { name: "Iniciar sesión" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

describe("RegisterPage — Navegación", () => {
  it("navega al login al pulsar el enlace Inicia sesión", async () => {
    render(<RegisterPage />);
    await userEvent.click(screen.getByText("Inicia sesión"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/",
      expect.objectContaining({ state: { openLogin: true } }),
    );
  });
});
