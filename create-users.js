import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrbokvlvxyqgcvzdomdx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYm9rdmx2eHlxZ2N2emRvbWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIwODM2NSwiZXhwIjoyMDkxNzg0MzY1fQ.G6HMYfcZBLCp7gIDfcwF7B4m-cNknKPUpcLr-pxVAX4", // la encuentras en Settings → API → service_role
);

const users = [
  // Estudiantes
  {
    email: "mario.garcia.fco@gmail.com",
    id: "a1000001-0000-0000-0000-000000000001",
  },
  {
    email: "sara.lopez.dev@gmail.com",
    id: "a1000001-0000-0000-0000-000000000002",
  },
  {
    email: "alejandro.ruiz.2001@hotmail.com",
    id: "a1000001-0000-0000-0000-000000000003",
  },
  {
    email: "lucia.fernandez.malaga@gmail.com",
    id: "a1000001-0000-0000-0000-000000000004",
  },
  {
    email: "daniel.moreno.coder@gmail.com",
    id: "a1000001-0000-0000-0000-000000000005",
  },
  {
    email: "alba.jimenez.ux@gmail.com",
    id: "a1000001-0000-0000-0000-000000000006",
  },
  {
    email: "pablo.castro.backend@gmail.com",
    id: "a1000001-0000-0000-0000-000000000007",
  },
  {
    email: "nerea.vega.fullstack@gmail.com",
    id: "a1000001-0000-0000-0000-000000000008",
  },
  {
    email: "ivan.blanco.sys@gmail.com",
    id: "a1000001-0000-0000-0000-000000000009",
  },
  {
    email: "carmen.torres.data@gmail.com",
    id: "a1000001-0000-0000-0000-000000000010",
  },
  {
    email: "javier.romero.mobile@gmail.com",
    id: "a1000001-0000-0000-0000-000000000011",
  },
  {
    email: "claudia.santos.qa@gmail.com",
    id: "a1000001-0000-0000-0000-000000000012",
  },
  // Empresas
  {
    email: "info@soldigimalaga.es",
    id: "b2000001-0000-0000-0000-000000000001",
  },
  {
    email: "rrhh@innotech-cordoba.com",
    id: "b2000001-0000-0000-0000-000000000002",
  },
  {
    email: "contacto@datasmart.es",
    id: "b2000001-0000-0000-0000-000000000003",
  },
  { email: "empleo@cibersegur.es", id: "b2000001-0000-0000-0000-000000000004" },
  { email: "hola@webfactory.es", id: "b2000001-0000-0000-0000-000000000005" },
  { email: "studio@disenioux.es", id: "b2000001-0000-0000-0000-000000000006" },
  {
    email: "jobs@cloudops-sevilla.com",
    id: "b2000001-0000-0000-0000-000000000007",
  },
  {
    email: "talent@mobilefirst.es",
    id: "b2000001-0000-0000-0000-000000000008",
  },
  { email: "rrhh@softland.es", id: "b2000001-0000-0000-0000-000000000009" },
  { email: "empleo@devbridge.es", id: "b2000001-0000-0000-0000-000000000010" },
  // Centros
  {
    email: "secretaria@iespolijm.es",
    id: "c3000001-0000-0000-0000-000000000001",
  },
  {
    email: "administracion@iesalandalus.es",
    id: "c3000001-0000-0000-0000-000000000002",
  },
  { email: "fp@cifpcarlosiii.es", id: "c3000001-0000-0000-0000-000000000003" },
  {
    email: "orientacion@iesdominmiral.es",
    id: "c3000001-0000-0000-0000-000000000004",
  },
  {
    email: "secretaria@iesjandula.es",
    id: "c3000001-0000-0000-0000-000000000005",
  },
  // Tutores empresa
  {
    email: "c.ruiz@soldigimalaga.es",
    id: "d4000001-0000-0000-0000-000000000001",
  },
  {
    email: "p.jimenez@innotech-cordoba.com",
    id: "d4000001-0000-0000-0000-000000000002",
  },
  { email: "l.vega@datasmart.es", id: "d4000001-0000-0000-0000-000000000003" },
  {
    email: "a.blanco@cibersegur.es",
    id: "d4000001-0000-0000-0000-000000000004",
  },
  // Tutores centro
  {
    email: "f.romero@iespolijm.es",
    id: "e5000001-0000-0000-0000-000000000001",
  },
  {
    email: "md.perez@iesalandalus.es",
    id: "e5000001-0000-0000-0000-000000000002",
  },
  {
    email: "ji.serrano@cifpcarlosiii.es",
    id: "e5000001-0000-0000-0000-000000000003",
  },
  {
    email: "a.guerrero@iesdominmiral.es",
    id: "e5000001-0000-0000-0000-000000000004",
  },
  {
    email: "r.torres@iesjandula.es",
    id: "e5000001-0000-0000-0000-000000000005",
  },
];

for (const user of users) {
  // Primero borra el usuario existente en auth
  await supabase.auth.admin.deleteUser(user.id);

  // Créalo de nuevo con el mismo ID y contraseña correcta
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: "Relance2026!",
    email_confirm: true,
    user_metadata: {},
    // Forzar el mismo UUID
    id: user.id,
  });

  if (error) console.error(`❌ ${user.email}:`, error.message);
  else console.log(`✅ ${user.email}`);
}
