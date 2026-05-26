import { vi } from "vitest";

export const useAuth = vi.fn(() => ({
  user: {
    id: "user-center-001",
    email: "secretaria@ies-ejemplo.edu.es",
    user_metadata: {
      centerName: "IES Ejemplo",
      institutionalCode: "IES-MAD-2024",
      centerType: "IES",
      city: "Madrid",
      province: "Madrid",
      website: "https://iesejemplo.edu.es",
    },
  },
  avatarUrl: null,
  refreshAvatar: vi.fn(),
}));

export const AuthProvider = ({ children }: { children: React.ReactNode }) =>
  children;
