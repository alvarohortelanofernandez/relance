import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

// LOGIN CON GOOGLE
// Si se pasa inviteContext, lo guarda en sessionStorage antes del redirect
// para que OnboardingInviteModal lo recupere al volver de Google.
export async function loginWithGoogle(inviteContext?: {
  token: string;
  entity: string;
  type: string;
}) {
  if (inviteContext) {
    sessionStorage.setItem("invite_context", JSON.stringify(inviteContext));
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error("Error login Google:", error.message);
  }
}