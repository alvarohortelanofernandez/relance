/**
 * @file OnboardingModal.test.tsx
 * @description Tests para el modal de onboarding de Relance.
 *
 * Cubre:
 *  - Paso 1: selección de rol
 *  - Paso 2 — EstudianteForm: campos, validaciones y envío
 *  - Paso 2 — EmpresaForm: campos, validaciones y envío
 *  - Paso 2 — CentroForm: campos, validaciones y envío
 *  - Navegación entre pasos (Continuar / Volver)
 *  - Comportamiento del spinner de carga
 *  - Propagación de errores del servidor
 *
 * Dependencias de test:
 *   vitest, @testing-library/react, @testing-library/user-event,
 *   @testing-library/jest-dom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Tipos compartidos ────────────────────────────────────────────────────────

type Center = { id: string; nombre: string; ciudad: string };

/**
 * Forma que devuelve mockFrom en cada llamada.
 *
 * `then` imita el thenable que usa el componente al cargar centros:
 *   supabase.from("centro_educativo").select(...).order(...).then(cb)
 *
 * El tipo del callback es deliberadamente amplio (unknown[]) para que
 * mockImplementationOnce no genere conflictos de firma con TypeScript.
 */
type MockFromShape = {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  then: (cb: (arg: { data: unknown[] }) => void) => Promise<void>;
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });
const mockRefreshSession = vi.fn().mockResolvedValue({});

/**
 * Construye el objeto devuelto por supabase.from().
 * Acepta una lista de centros para simular la carga del buscador.
 */
const buildFromShape = (centers: Center[] = []): MockFromShape => ({
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  upsert: mockUpsert,
  then: (cb) => Promise.resolve(cb({ data: centers })),
});

const mockFrom = vi.fn<() => MockFromShape>(() => buildFromShape());

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: mockFrom,
    auth: {
      updateUser: mockUpdateUser,
      refreshSession: mockRefreshSession,
    },
  },
}));

vi.mock("../../assets/logotipo_relance.svg", () => ({
  default: "/mock-logo.svg",
}));

// ─── Importación del componente (después de los mocks) ────────────────────────
import OnboardingModal from "../components/auth/OnboardingModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { full_name: "Ana García" },
} as any;

function renderModal(onClose = vi.fn()) {
  return {
    onClose,
    ue: userEvent.setup(),
    ...render(<OnboardingModal user={mockUser} onClose={onClose} />),
  };
}

/**
 * Avanza al paso 2 seleccionando el rol indicado.
 * Devuelve la instancia de userEvent para continuar interactuando.
 */
async function goToStep2(role: "Estudiante" | "Empresa" | "Centro educativo") {
  const ue = userEvent.setup();
  renderModal();
  await ue.click(screen.getByRole("button", { name: new RegExp(role, "i") }));
  await ue.click(screen.getByRole("button", { name: /continuar/i }));
  return ue;
}

// ─── Suite principal ──────────────────────────────────────────────────────────

describe("OnboardingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    /*
     * vi.clearAllMocks() limpia también las implementaciones, por lo que hay
     * que restaurarlas explícitamente tras el clear.
     */
    mockFrom.mockImplementation(() => buildFromShape());
    mockUpsert.mockResolvedValue({ error: null });
    mockUpdateUser.mockResolvedValue({ error: null });
    mockRefreshSession.mockResolvedValue({});
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PASO 1 — Selección de rol
  // ──────────────────────────────────────────────────────────────────────────
  describe("Paso 1 — Selección de rol", () => {
    it("muestra el título de bienvenida", () => {
      renderModal();
      expect(screen.getByText(/bienvenido a relance/i)).toBeInTheDocument();
    });

    it("renderiza los tres roles disponibles", () => {
      renderModal();
      expect(
        screen.getByRole("button", { name: /estudiante/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /empresa/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /centro educativo/i }),
      ).toBeInTheDocument();
    });

    it("el botón Continuar está deshabilitado si no se ha elegido rol", () => {
      renderModal();
      expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
    });

    it("el botón Continuar se habilita al seleccionar un rol", async () => {
      const ue = userEvent.setup();
      renderModal();
      await ue.click(screen.getByRole("button", { name: /estudiante/i }));
      expect(
        screen.getByRole("button", { name: /continuar/i }),
      ).not.toBeDisabled();
    });

    it("marca visualmente el rol seleccionado", async () => {
      const ue = userEvent.setup();
      renderModal();
      const btn = screen.getByRole("button", { name: /empresa/i });
      await ue.click(btn);
      expect(btn).toHaveStyle("border: 1px solid rgba(192,255,114,0.35)");
    });

    it("avanza al paso 2 al hacer clic en Continuar con rol elegido", async () => {
      const ue = userEvent.setup();
      renderModal();
      await ue.click(screen.getByRole("button", { name: /estudiante/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));
      expect(screen.getByText(/registro como estudiante/i)).toBeInTheDocument();
    });

    it("muestra la nota informativa sobre tutores", () => {
      renderModal();
      expect(
        screen.getByText(/tutores se registran mediante el enlace/i),
      ).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // NAVEGACIÓN — Volver al paso 1
  // ──────────────────────────────────────────────────────────────────────────
  describe("Navegación entre pasos", () => {
    it("el botón Volver regresa al paso 1 desde el formulario de Estudiante", async () => {
      const ue = userEvent.setup();
      renderModal();
      await ue.click(screen.getByRole("button", { name: /estudiante/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));
      await ue.click(
        screen.getByRole("button", { name: /volver a elegir tipo/i }),
      );
      expect(screen.getByText(/bienvenido a relance/i)).toBeInTheDocument();
    });

    it("limpia el error al volver al paso 1", async () => {
      /*
       * El componente hace: const { error: usuarioError } = await upsert(...)
       * Si hay error, lanza throw usuarioError — por tanto el PRIMER upsert
       * (tabla "usuario") ya es suficiente para que el catch lo capture y
       * muestre el mensaje.
       */
      mockUpsert.mockResolvedValueOnce({
        error: { message: "Error de prueba" },
      });

      const ue = userEvent.setup();
      renderModal();

      await ue.click(screen.getByRole("button", { name: /empresa/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));

      await ue.type(
        screen.getByPlaceholderText(/mi empresa s\.l\./i),
        "Acme SL",
      );
      await ue.type(screen.getByPlaceholderText(/b12345678/i), "B12345678");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );

      await waitFor(() =>
        expect(screen.getByText(/error de prueba/i)).toBeInTheDocument(),
      );

      await ue.click(
        screen.getByRole("button", { name: /volver a elegir tipo/i }),
      );
      expect(screen.queryByText(/error de prueba/i)).not.toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // FORMULARIO ESTUDIANTE
  // ──────────────────────────────────────────────────────────────────────────
  describe("EstudianteForm", () => {
    describe("Renderizado de campos", () => {
      it("muestra los campos del formulario", async () => {
        await goToStep2("Estudiante");
        expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/tus apellidos/i),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/\+34 600/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/córdoba/i)).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/busca tu instituto/i),
        ).toBeInTheDocument();
      });

      it("el campo de correo está deshabilitado y muestra el email del usuario", async () => {
        await goToStep2("Estudiante");
        expect(screen.getByDisplayValue("test@example.com")).toBeDisabled();
      });

      it("pre-rellena el nombre con los metadatos del usuario", async () => {
        await goToStep2("Estudiante");
        expect(screen.getByPlaceholderText(/tu nombre/i)).toHaveValue("Ana");
      });

      it("pre-rellena los apellidos con los metadatos del usuario", async () => {
        await goToStep2("Estudiante");
        expect(screen.getByPlaceholderText(/tus apellidos/i)).toHaveValue(
          "García",
        );
      });
    });

    describe("Validaciones de campos obligatorios", () => {
      it("muestra error si se envía sin nombre", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.clear(screen.getByPlaceholderText(/tu nombre/i));
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/nombre es obligatorio/i)).toBeInTheDocument();
      });

      it("muestra error si se envía sin apellidos", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.clear(screen.getByPlaceholderText(/tus apellidos/i));
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/apellidos son obligatorios/i),
        ).toBeInTheDocument();
      });

      it("muestra error si falta el teléfono", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/teléfono es obligatorio/i),
        ).toBeInTheDocument();
      });

      it("muestra error si el teléfono tiene formato inválido", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.type(screen.getByPlaceholderText(/\+34 600/i), "abc");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/teléfono no válido/i)).toBeInTheDocument();
      });

      it("muestra error si falta la ciudad", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/ciudad es obligatoria/i)).toBeInTheDocument();
      });

      it("muestra error si no se selecciona instituto", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/instituto es obligatorio/i),
        ).toBeInTheDocument();
      });
    });

    describe("Validaciones de formato válido", () => {
      it("acepta un número de teléfono con formato correcto", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.type(
          screen.getByPlaceholderText(/\+34 600/i),
          "+34 600 000 000",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.queryByText(/teléfono no válido/i),
        ).not.toBeInTheDocument();
      });
    });

    describe("Buscador de centros", () => {
      it("no muestra el desplegable si el query está vacío", async () => {
        await goToStep2("Estudiante");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });

      it("muestra mensaje cuando no hay centros que coincidan", async () => {
        const ue = await goToStep2("Estudiante");
        await ue.type(
          screen.getByPlaceholderText(/busca tu instituto/i),
          "xyzxyz",
        );
        await waitFor(() =>
          expect(
            screen.getByText(/no se encontró ningún centro/i),
          ).toBeInTheDocument(),
        );
      });
    });

    describe("Envío correcto", () => {
      it("llama a Supabase con los datos del estudiante al enviar el formulario correctamente", async () => {
        const centers: Center[] = [
          { id: "centro-1", nombre: "IES Los Olivos", ciudad: "Córdoba" },
        ];

        /*
         * La primera llamada a mockFrom es el useEffect que carga centros.
         * Las siguientes son los upserts (usan el shape por defecto sin centros).
         */
        mockFrom
          .mockImplementationOnce(() => buildFromShape(centers))
          .mockImplementation(() => buildFromShape());

        const ue = userEvent.setup();
        const onClose = vi.fn();
        render(<OnboardingModal user={mockUser} onClose={onClose} />);

        await ue.click(screen.getByRole("button", { name: /estudiante/i }));
        await ue.click(screen.getByRole("button", { name: /continuar/i }));

        await ue.clear(screen.getByPlaceholderText(/tu nombre/i));
        await ue.type(screen.getByPlaceholderText(/tu nombre/i), "Ana");
        await ue.clear(screen.getByPlaceholderText(/tus apellidos/i));
        await ue.type(
          screen.getByPlaceholderText(/tus apellidos/i),
          "García López",
        );
        await ue.type(
          screen.getByPlaceholderText(/\+34 600/i),
          "+34 600 111 222",
        );
        await ue.type(screen.getByPlaceholderText(/córdoba/i), "Córdoba");

        await ue.type(
          screen.getByPlaceholderText(/busca tu instituto/i),
          "IES",
        );
        await waitFor(() =>
          expect(screen.getByText("IES Los Olivos")).toBeInTheDocument(),
        );
        await ue.click(screen.getByText("IES Los Olivos"));

        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );

        await waitFor(() => {
          expect(mockUpsert).toHaveBeenCalled();
          expect(onClose).toHaveBeenCalled();
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // FORMULARIO EMPRESA
  // ──────────────────────────────────────────────────────────────────────────
  describe("EmpresaForm", () => {
    describe("Renderizado de campos", () => {
      it("muestra todos los campos del formulario de empresa", async () => {
        await goToStep2("Empresa");
        expect(
          screen.getByPlaceholderText(/mi empresa s\.l\./i),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/b12345678/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/\+34 900/i)).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/https:\/\/miempresa\.com/i),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/madrid/i)).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/describe tu empresa/i),
        ).toBeInTheDocument();
      });

      it("el email está deshabilitado", async () => {
        await goToStep2("Empresa");
        expect(screen.getByDisplayValue("test@example.com")).toBeDisabled();
      });

      it("renderiza los selectores de Sector y Tamaño", async () => {
        /*
         * Los <select> no tienen id/htmlFor asociado al <label>, por lo que
         * Testing Library no puede resolver el nombre accesible por label.
         * Se busca por el texto de la <option> vacía (valor placeholder).
         */
        await goToStep2("Empresa");
        expect(
          screen.getByRole("combobox", { name: /seleccionar sector/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("combobox", { name: /seleccionar tamaño/i }),
        ).toBeInTheDocument();
      });

      it("el selector de Sector contiene las opciones esperadas", async () => {
        await goToStep2("Empresa");
        const select = screen.getByRole("combobox", {
          name: /seleccionar sector/i,
        });
        expect(
          within(select).getByRole("option", { name: /tecnología/i }),
        ).toBeInTheDocument();
        expect(
          within(select).getByRole("option", { name: /finanzas/i }),
        ).toBeInTheDocument();
      });

      it("el selector de Tamaño contiene las opciones esperadas", async () => {
        await goToStep2("Empresa");
        const select = screen.getByRole("combobox", {
          name: /seleccionar tamaño/i,
        });
        expect(
          within(select).getByRole("option", { name: /1.10 empleados/i }),
        ).toBeInTheDocument();
        expect(
          within(select).getByRole("option", { name: /500\+ empleados/i }),
        ).toBeInTheDocument();
      });

      it("muestra la nota de verificación del CIF", async () => {
        await goToStep2("Empresa");
        expect(screen.getByText(/cif será verificado/i)).toBeInTheDocument();
      });
    });

    describe("Validaciones", () => {
      it("muestra error si falta el nombre de empresa", async () => {
        const ue = await goToStep2("Empresa");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/nombre de la empresa es obligatorio/i),
        ).toBeInTheDocument();
      });

      it("muestra error si falta el CIF", async () => {
        const ue = await goToStep2("Empresa");
        await ue.type(
          screen.getByPlaceholderText(/mi empresa s\.l\./i),
          "Acme SL",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/cif es obligatorio/i)).toBeInTheDocument();
      });

      it("muestra error con CIF de formato inválido", async () => {
        const ue = await goToStep2("Empresa");
        await ue.type(screen.getByPlaceholderText(/b12345678/i), "invalido!!");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/formato de cif inválido/i),
        ).toBeInTheDocument();
      });

      it("acepta un CIF con formato correcto (8 caracteres alfanuméricos)", async () => {
        const ue = await goToStep2("Empresa");
        await ue.type(
          screen.getByPlaceholderText(/mi empresa s\.l\./i),
          "Acme SL",
        );
        await ue.type(screen.getByPlaceholderText(/b12345678/i), "B12345678");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.queryByText(/formato de cif inválido/i),
        ).not.toBeInTheDocument();
      });

      it("muestra error si la URL del sitio web es inválida", async () => {
        const ue = await goToStep2("Empresa");
        await ue.type(
          screen.getByPlaceholderText(/https:\/\/miempresa\.com/i),
          "no-es-una-url",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/introduce una url válida/i),
        ).toBeInTheDocument();
      });

      it("no muestra error de URL si el campo web está vacío", async () => {
        const ue = await goToStep2("Empresa");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.queryByText(/introduce una url válida/i),
        ).not.toBeInTheDocument();
      });

      it("muestra error si el teléfono tiene formato inválido", async () => {
        const ue = await goToStep2("Empresa");
        await ue.type(
          screen.getByPlaceholderText(/\+34 900/i),
          "no-es-telefono",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/teléfono no válido/i)).toBeInTheDocument();
      });
    });

    describe("Textarea de descripción", () => {
      it("limita la descripción a 500 caracteres", async () => {
        const ue = await goToStep2("Empresa");
        const textarea = screen.getByPlaceholderText(/describe tu empresa/i);
        /*
         * userEvent.type simula una pulsación por carácter: 600 chars supera
         * el timeout del test. userEvent.paste inserta el texto de golpe.
         */
        await ue.click(textarea);
        await ue.paste("a".repeat(600));
        expect(
          (textarea as HTMLTextAreaElement).value.length,
        ).toBeLessThanOrEqual(500);
      });

      it("muestra el contador de caracteres de la descripción", async () => {
        const ue = await goToStep2("Empresa");
        const textarea = screen.getByPlaceholderText(/describe tu empresa/i);
        await ue.click(textarea);
        await ue.paste("Hola");
        expect(screen.getByText(/4\/500/)).toBeInTheDocument();
      });
    });

    describe("Envío correcto", () => {
      it("llama a Supabase con los datos de empresa al enviar correctamente", async () => {
        const ue = userEvent.setup();
        const onClose = vi.fn();
        render(<OnboardingModal user={mockUser} onClose={onClose} />);

        await ue.click(screen.getByRole("button", { name: /empresa/i }));
        await ue.click(screen.getByRole("button", { name: /continuar/i }));

        await ue.type(
          screen.getByPlaceholderText(/mi empresa s\.l\./i),
          "Acme SL",
        );
        await ue.type(screen.getByPlaceholderText(/b12345678/i), "B12345678");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );

        await waitFor(() => {
          expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ nombre: "Acme SL", cif: "B12345678" }),
            expect.anything(),
          );
          expect(onClose).toHaveBeenCalled();
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // FORMULARIO CENTRO EDUCATIVO
  // ──────────────────────────────────────────────────────────────────────────
  describe("CentroForm", () => {
    describe("Renderizado de campos", () => {
      it("muestra todos los campos del formulario de centro", async () => {
        await goToStep2("Centro educativo");
        expect(
          screen.getByPlaceholderText(/ies nombre del centro/i),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/ies-cor-2026/i),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/https:\/\/iesejemplo/i),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ej: 350/i)).toBeInTheDocument();
      });

      it("el email institucional está deshabilitado", async () => {
        await goToStep2("Centro educativo");
        expect(screen.getByDisplayValue("test@example.com")).toBeDisabled();
      });

      it("renderiza el selector de tipo de centro", async () => {
        // Mismo motivo que en EmpresaForm: buscar por opción placeholder.
        await goToStep2("Centro educativo");
        expect(
          screen.getByRole("combobox", { name: /seleccionar tipo/i }),
        ).toBeInTheDocument();
      });

      it("el selector de tipo contiene las opciones esperadas", async () => {
        await goToStep2("Centro educativo");
        const select = screen.getByRole("combobox", {
          name: /seleccionar tipo/i,
        });
        expect(
          within(select).getByRole("option", { name: /universidad/i }),
        ).toBeInTheDocument();
        expect(
          within(select).getByRole("option", {
            name: /fp.*formación profesional/i,
          }),
        ).toBeInTheDocument();
      });

      it("muestra la nota de verificación del código institucional", async () => {
        await goToStep2("Centro educativo");
        expect(
          screen.getByText(/código institucional será verificado/i),
        ).toBeInTheDocument();
      });
    });

    describe("Validaciones", () => {
      it("muestra error si falta el nombre del centro", async () => {
        const ue = await goToStep2("Centro educativo");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/nombre del centro es obligatorio/i),
        ).toBeInTheDocument();
      });

      it("muestra error si falta el código institucional", async () => {
        const ue = await goToStep2("Centro educativo");
        await ue.type(
          screen.getByPlaceholderText(/ies nombre del centro/i),
          "IES Test",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/código institucional es obligatorio/i),
        ).toBeInTheDocument();
      });

      it("muestra error si el código tiene menos de 3 caracteres", async () => {
        const ue = await goToStep2("Centro educativo");
        /*
         * La función validate() recorre los campos en orden. Si falta el nombre,
         * el error de nombre tapa al del código. Hay que rellenar el nombre
         * para que el validador llegue a evaluar la longitud del código.
         */
        await ue.type(
          screen.getByPlaceholderText(/ies nombre del centro/i),
          "IES Test",
        );
        await ue.type(screen.getByPlaceholderText(/ies-cor-2026/i), "AB");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
      });

      it("muestra error si falta la ciudad", async () => {
        const ue = await goToStep2("Centro educativo");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(screen.getByText(/ciudad es obligatoria/i)).toBeInTheDocument();
      });

      it("muestra error si la URL del centro es inválida", async () => {
        const ue = await goToStep2("Centro educativo");
        await ue.type(
          screen.getByPlaceholderText(/https:\/\/iesejemplo/i),
          "url-invalida",
        );
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.getByText(/introduce una url válida/i),
        ).toBeInTheDocument();
      });

      it("no muestra error de URL si el campo web está vacío", async () => {
        const ue = await goToStep2("Centro educativo");
        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );
        expect(
          screen.queryByText(/introduce una url válida/i),
        ).not.toBeInTheDocument();
      });
    });

    describe("Envío correcto", () => {
      it("llama a Supabase con los datos del centro al enviar correctamente", async () => {
        const ue = userEvent.setup();
        const onClose = vi.fn();
        render(<OnboardingModal user={mockUser} onClose={onClose} />);

        await ue.click(
          screen.getByRole("button", { name: /centro educativo/i }),
        );
        await ue.click(screen.getByRole("button", { name: /continuar/i }));

        await ue.type(
          screen.getByPlaceholderText(/ies nombre del centro/i),
          "IES Averroes",
        );
        await ue.type(
          screen.getByPlaceholderText(/ies-cor-2026/i),
          "IES-COR-001",
        );
        await ue.type(screen.getByPlaceholderText(/córdoba/i), "Córdoba");

        await ue.click(
          screen.getByRole("button", { name: /completar registro/i }),
        );

        await waitFor(() => {
          expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
              nombre: "IES Averroes",
              codigo_centro: "IES-COR-001",
            }),
            expect.anything(),
          );
          expect(onClose).toHaveBeenCalled();
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO DE CARGA Y ERRORES DE SERVIDOR
  // ──────────────────────────────────────────────────────────────────────────
  describe("Estado de carga y errores de servidor", () => {
    it("muestra el spinner y el texto 'Guardando...' mientras carga", async () => {
      mockUpsert.mockImplementation(() => new Promise(() => {}));

      const ue = userEvent.setup();
      renderModal();

      await ue.click(screen.getByRole("button", { name: /empresa/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));

      await ue.type(
        screen.getByPlaceholderText(/mi empresa s\.l\./i),
        "Acme SL",
      );
      await ue.type(screen.getByPlaceholderText(/b12345678/i), "B12345678");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );

      await waitFor(() =>
        expect(screen.getByText(/guardando\.\.\./i)).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: /guardando\.\.\./i }),
      ).toBeDisabled();
    });

    it("muestra el mensaje de error devuelto por Supabase", async () => {
      /*
       * El primer upsert falla (tabla "usuario"). El componente hace
       * `if (usuarioError) throw usuarioError`, así que el catch captura
       * el objeto y lee su propiedad .message para mostrarlo.
       */
      mockUpsert.mockResolvedValueOnce({
        error: { message: "duplicate key value" },
      });

      const ue = userEvent.setup();
      renderModal();

      await ue.click(screen.getByRole("button", { name: /empresa/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));

      await ue.type(
        screen.getByPlaceholderText(/mi empresa s\.l\./i),
        "Acme SL",
      );
      await ue.type(screen.getByPlaceholderText(/b12345678/i), "B12345678");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );

      await waitFor(() =>
        expect(screen.getByText(/duplicate key value/i)).toBeInTheDocument(),
      );
    });

    it("el botón de envío se deshabilita durante la carga", async () => {
      mockUpsert.mockImplementation(() => new Promise(() => {}));

      const ue = userEvent.setup();
      renderModal();

      await ue.click(screen.getByRole("button", { name: /centro educativo/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));

      await ue.type(
        screen.getByPlaceholderText(/ies nombre del centro/i),
        "IES Test",
      );
      await ue.type(
        screen.getByPlaceholderText(/ies-cor-2026/i),
        "IES-ABC-001",
      );
      await ue.type(screen.getByPlaceholderText(/córdoba/i), "Granada");

      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /guardando/i }),
        ).toBeDisabled(),
      );
    });

    it("llama a onClose cuando el guardado en Supabase se completa con éxito", async () => {
      const ue = userEvent.setup();
      const onClose = vi.fn();
      render(<OnboardingModal user={mockUser} onClose={onClose} />);

      await ue.click(screen.getByRole("button", { name: /centro educativo/i }));
      await ue.click(screen.getByRole("button", { name: /continuar/i }));

      await ue.type(
        screen.getByPlaceholderText(/ies nombre del centro/i),
        "IES Centro",
      );
      await ue.type(screen.getByPlaceholderText(/ies-cor-2026/i), "IES-999");
      await ue.type(screen.getByPlaceholderText(/córdoba/i), "Sevilla");

      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // UTILIDADES DE VALIDACIÓN — cobertura de casos límite
  // ──────────────────────────────────────────────────────────────────────────
  describe("Funciones de validación inline — cobertura de casos límite", () => {
    it("acepta URLs con protocolo https://", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(
        screen.getByPlaceholderText(/https:\/\/miempresa\.com/i),
        "https://acme.com",
      );
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(
        screen.queryByText(/introduce una url válida/i),
      ).not.toBeInTheDocument();
    });

    it("rechaza URLs sin protocolo", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(
        screen.getByPlaceholderText(/https:\/\/miempresa\.com/i),
        "acme.com",
      );
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(screen.getByText(/introduce una url válida/i)).toBeInTheDocument();
    });

    it("acepta CIF con letras mayúsculas y 9 caracteres", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(
        screen.getByPlaceholderText(/mi empresa s\.l\./i),
        "Test Corp",
      );
      await ue.type(screen.getByPlaceholderText(/b12345678/i), "A23456789");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(
        screen.queryByText(/formato de cif inválido/i),
      ).not.toBeInTheDocument();
    });

    it("rechaza CIF con caracteres especiales", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(screen.getByPlaceholderText(/b12345678/i), "B-12345!!");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(screen.getByText(/formato de cif inválido/i)).toBeInTheDocument();
    });

    it("acepta teléfonos con paréntesis y guiones", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(
        screen.getByPlaceholderText(/\+34 900/i),
        "(+34) 91-000-00-00",
      );
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(screen.queryByText(/teléfono no válido/i)).not.toBeInTheDocument();
    });

    it("rechaza teléfonos con menos de 7 caracteres", async () => {
      const ue = await goToStep2("Empresa");
      await ue.type(screen.getByPlaceholderText(/\+34 900/i), "123");
      await ue.click(
        screen.getByRole("button", { name: /completar registro/i }),
      );
      expect(screen.getByText(/teléfono no válido/i)).toBeInTheDocument();
    });
  });
});
