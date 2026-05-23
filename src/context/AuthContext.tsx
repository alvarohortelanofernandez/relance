import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

export type UserRole =
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor"
  | "tutor_empresa"
  | "tutor_centro"
  | "admin";

export function getRoleRoute(role: UserRole | null): string {
  switch (role) {
    case "empresa":
      return "/perfil/empresa";
    case "centro_educativo":
      return "/perfil/centro";
    case "tutor":
    case "tutor_empresa":
    case "tutor_centro":
      return "/perfil/tutor";
    case "admin":
      return "/perfil/admin";
    case "estudiante":
    default:
      return "/perfil/estudiante";
  }
}

export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  try {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000),
    );
    const query = supabase
      .from("usuario")
      .select("rol")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return null;
        return data.rol as UserRole;
      });
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

type AuthContextType = {
  user: User | null;
  userRole: UserRole | null;
  avatarUrl: string | null;
  loading: boolean;
  isBlocked: boolean;
  refreshAvatar: () => Promise<void>;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const activeEmailRef = useRef<string | null>(null);

  const loadUserData = async (u: User | null) => {
    if (!u?.email) {
      setUserRole(null);
      setAvatarUrl(null);
      setIsBlocked(false);
      return;
    }
    try {
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000),
      );
      const query = supabase
        .from("usuario")
        .select("rol, avatar_url, is_blocked")
        .eq("email", u.email)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) return null;
          return data;
        });

      const data = await Promise.race([query, timeout]);
      console.log("[loadUserData] email:", u.email, "→ data:", data);

      if (data?.is_blocked) {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setAvatarUrl(null);
        setIsBlocked(true);
        activeEmailRef.current = null;
        return;
      }

      setIsBlocked(false);
      setUserRole((data?.rol as UserRole) ?? null);
      setAvatarUrl(data?.avatar_url ?? null);
    } catch {
      setUserRole(null);
      setAvatarUrl(null);
      setIsBlocked(false);
    }
  };

  const refreshRole = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("usuario")
      .select("rol, avatar_url, is_blocked")
      .eq("email", user.email)
      .maybeSingle();

    if (data?.is_blocked) {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setAvatarUrl(null);
      setIsBlocked(true);
      activeEmailRef.current = null;
      return;
    }

    if (data?.rol) setUserRole(data.rol as UserRole);
    if (data?.avatar_url !== undefined) setAvatarUrl(data.avatar_url);
    setIsBlocked(false);
  };

  const refreshAvatar = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("usuario")
      .select("avatar_url")
      .eq("email", user.email)
      .maybeSingle();
    if (data?.avatar_url !== undefined) setAvatarUrl(data.avatar_url);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user ?? null;
        setUser(u);
        activeEmailRef.current = u?.email ?? null;
        await loadUserData(u);
      } catch (err) {
        console.warn("Error al obtener sesión:", err);
        setUser(null);
        setUserRole(null);
        setAvatarUrl(null);
        setIsBlocked(false);
      } finally {
        setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session: Session | null) => {
        const u = session?.user ?? null;
        const incomingEmail = u?.email ?? null;

        console.log(
          "[onAuthStateChange] evento:",
          _event,
          "| email entrante:",
          incomingEmail,
          "| email activo:",
          activeEmailRef.current,
        );

        const silentEvents = [
          "TOKEN_REFRESHED",
          "USER_UPDATED",
          "MFA_CHALLENGE_VERIFIED",
        ];

        const isSameUser =
          incomingEmail !== null && incomingEmail === activeEmailRef.current;
        const isSilent =
          silentEvents.includes(_event) ||
          (_event === "SIGNED_IN" && isSameUser);

        console.log(
          "[onAuthStateChange] isSameUser:",
          isSameUser,
          "| isSilent:",
          isSilent,
        );

        setUser(u);

        if (isSilent) {
          loadUserData(u);
          return;
        }

        activeEmailRef.current = incomingEmail;
        setLoading(true);
        try {
          await loadUserData(u);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    activeEmailRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setAvatarUrl(null);
    setIsBlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        avatarUrl,
        loading,
        isBlocked,
        refreshAvatar,
        refreshRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
