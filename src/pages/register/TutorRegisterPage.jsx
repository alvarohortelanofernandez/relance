import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const TYPE_TO_ROLE = {
  empresa: "tutor_empresa",
  centro_educativo: "tutor_centro",
};

const TYPE_LABEL = {
  empresa: "empresa",
  centro_educativo: "centro educativo",
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const getFriendlyDbError = (message = "") => {
  const msg = message.toLowerCase();
  if (msg.includes("row-level security") || msg.includes("rls")) {
    return "La base de datos bloqueó la operación por políticas RLS. Revisa las políticas INSERT/UPDATE para invite_tokens, usuario y tutor_*.";
  }
  if (msg.includes("violates foreign key") || msg.includes("foreign key")) {
    return "Fallo de relación en base de datos. Verifica que los UUID de entidad/tutor y usuario coincidan con sus tablas.";
  }
  if (msg.includes("duplicate key") || msg.includes("unique")) {
    return "Ya existe un registro con esos datos (correo o relación de tutor duplicada).";
  }
  return null;
};

export default function TutorRegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading, signOut } = useAuth();

  const token = params.get("token");
  const entityId = params.get("entity");
  const entityType = params.get("type");
  const role = useMemo(() => TYPE_TO_ROLE[entityType] ?? null, [entityType]);

  const [state, setState] = useState("loading"); // loading|logged_in|invalid|form|success
  const [inviterName, setInviterName] = useState("la entidad");
  const [submitError, setSubmitError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateToken = async () => {
    if (!token || !entityId || !role) return null;
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("id, entity_id, entity_type, used, expires_at")
      .eq("token", token)
      .eq("entity_id", entityId)
      .eq("entity_type", entityType)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error validando token tutor:", error.message);
      return null;
    }
    return data;
  };

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      if (user) {
        setState("logged_in");
        return;
      }

      const valid = await validateToken();
      if (!valid) {
        setState("invalid");
        return;
      }

      const { data } = await supabase
        .from("usuario")
        .select("nombre")
        .eq("id", entityId)
        .maybeSingle();

      if (data?.nombre) setInviterName(data.nombre);
      setState("form");
    };

    init();
  }, [authLoading, user, token, entityId, entityType, role]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setDebugInfo([]);

    if (!form.fullName.trim()) return setSubmitError("Escribe tu nombre completo.");
    if (!isValidEmail(form.email)) return setSubmitError("Escribe un correo válido.");
    if (form.password.length < 8)
      return setSubmitError("La contraseña debe tener al menos 8 caracteres.");
    if (form.password !== form.confirmPassword)
      return setSubmitError("Las contraseñas no coinciden.");

    setSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role,
          linked_entity_id: entityId,
          linked_entity_type: entityType,
          invite_token: token,
        },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      const friendly = getFriendlyDbError(signUpError.message);
      setSubmitError(
        signUpError.message === "User already registered"
          ? "Este correo ya está registrado."
          : friendly || signUpError.message,
      );
      setDebugInfo([
        `Supabase auth.signUp devolvió: ${signUpError.message}`,
        "Revisa si hay trigger/procedimiento que inserta en usuario/tutor_* y si ese trigger falla por RLS o FK.",
      ]);
      return;
    }

    const debug = [];
    if (signUpData?.user?.id) debug.push(`Usuario Auth creado: ${signUpData.user.id}`);

    const { data: userRow, error: userRowError } = await supabase
      .from("usuario")
      .select("id, rol, email")
      .eq("email", form.email)
      .maybeSingle();

    if (userRowError) {
      debug.push(`Error consultando tabla usuario: ${userRowError.message}`);
    } else if (!userRow) {
      debug.push("No aparece fila en tabla usuario tras registro (posible trigger ausente/bloqueado por RLS).");
    } else {
      debug.push(`Fila usuario detectada: ${userRow.id} (${userRow.rol ?? "sin rol"}).`);
    }

    const tutorTable = role === "tutor_empresa" ? "tutor_empresa" : "tutor_centro";
    const { data: tutorRow, error: tutorError } = await supabase
      .from(tutorTable)
      .select("id, usuario_id")
      .eq("usuario_id", userRow?.id ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (tutorError) {
      debug.push(`Error consultando ${tutorTable}: ${tutorError.message}`);
    } else if (!tutorRow) {
      debug.push(`No aparece fila en ${tutorTable} asociada al usuario.`);
    } else {
      debug.push(`Fila en ${tutorTable} detectada: ${tutorRow.id}.`);
    }

    const { error: inviteUpdateError } = await supabase
      .from("invite_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token)
      .eq("entity_id", entityId)
      .eq("entity_type", entityType)
      .eq("used", false);

    if (inviteUpdateError) {
      debug.push(`No se pudo marcar invite_tokens.used=true: ${inviteUpdateError.message}`);
    }

    setDebugInfo(debug);
    setSubmitting(false);
    setState("success");
  };

  if (state === "loading") return <div className="min-h-screen bg-dark" />;

  if (state === "logged_in") {
    return <div className="min-h-screen bg-dark flex items-center justify-center p-4"><div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-8 text-center"><h2 className="font-display text-xl font-bold text-white mb-3">Ya tienes sesión iniciada</h2><p className="text-gray-400 text-sm mb-6">Cierra sesión para completar este registro por invitación.</p><button className="btn-primary w-full mb-3" onClick={signOut}>Cerrar sesión</button><a href="/" className="btn-secondary block w-full text-center">Volver al inicio</a></div></div>;
  }

  if (state === "invalid") {
    return <div className="min-h-screen bg-dark flex items-center justify-center p-4"><div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-8 text-center"><h2 className="font-display text-xl font-bold text-white mb-3">Invitación inválida o caducada</h2><p className="text-gray-400 text-sm mb-6">Este enlace no es válido, ya fue usado o ha caducado.</p><a href="/" className="btn-secondary block w-full text-center">Volver al inicio</a></div></div>;
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-3">¡Cuenta creada!</h2>
          <p className="text-gray-400 text-sm mb-4">Tu cuenta de tutor fue creada. Revisa tu correo para verificar tu email.</p>
          {debugInfo.length > 0 && (
            <div className="text-left bg-black/20 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs uppercase tracking-wide text-brand mb-2">Diagnóstico rápido del registro</p>
              <ul className="space-y-1 text-xs text-gray-300 list-disc pl-5">
                {debugInfo.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          <button onClick={() => navigate("/")} className="btn-primary w-full">Ir al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-xl p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Registro de tutor</h1>
        <p className="text-gray-400 text-sm mb-6">Invitación de <strong className="text-white">{inviterName}</strong> ({TYPE_LABEL[entityType] ?? "entidad"}).</p>
        <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-brand">Se crearán datos en: auth.users, usuario y {role === "tutor_empresa" ? "tutor_empresa" : "tutor_centro"}. Si algo falla, verás diagnóstico para detectar RLS/relaciones.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input className="input-field md:col-span-2" placeholder="Nombre completo" value={form.fullName} onChange={onChange("fullName")} />
          <input className="input-field" type="email" placeholder="Correo electrónico" value={form.email} onChange={onChange("email")} />
          <input className="input-field" type="password" placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={onChange("password")} />
          <input className="input-field md:col-span-2" type="password" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={onChange("confirmPassword")} />
        </div>

        {submitError && <p className="text-red-400 text-sm mt-4">{submitError}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 disabled:opacity-60">
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
