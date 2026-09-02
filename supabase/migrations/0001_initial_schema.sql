-- El Vikingo / Fitness Troop - esquema inicial
-- Tablas: perfiles, rutinas, rutina_dias, ejercicios, rutina_ejercicios,
-- rutinas_usuario, sesiones_entrenamiento, registros_progreso,
-- historial_chat, suscripciones.

-- ============================================================
-- Enums
-- ============================================================
create type objetivo_enum as enum ('perder_grasa', 'ganar_musculo', 'rendimiento', 'salud_general');
create type nivel_enum as enum ('principiante', 'intermedio', 'avanzado');
create type tipo_actividad_enum as enum ('gym', 'calistenia', 'running', 'deporte_especifico');
create type dia_semana_enum as enum ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo');
create type estado_sesion_enum as enum ('en_progreso', 'completada', 'saltada');
create type rol_chat_enum as enum ('user', 'assistant');
create type estado_suscripcion_enum as enum ('activa', 'vencida', 'cancelada', 'prueba');
create type plataforma_enum as enum ('ios', 'android');

-- ============================================================
-- Función helper para updated_at
-- ============================================================
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- perfiles (extiende auth.users)
-- ============================================================
create table perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text,
  objetivo objetivo_enum,
  nivel nivel_enum,
  tipo_actividad tipo_actividad_enum,
  deporte_especifico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger perfiles_set_updated_at
  before update on perfiles
  for each row execute function set_updated_at();

-- Crea automáticamente el perfil cuando se registra un usuario en auth.users.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- rutinas (plantillas)
-- ============================================================
create table rutinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  objetivo objetivo_enum,
  nivel nivel_enum,
  tipo_actividad tipo_actividad_enum,
  duracion_semanas int,
  creado_por uuid references perfiles (id),
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger rutinas_set_updated_at
  before update on rutinas
  for each row execute function set_updated_at();

-- ============================================================
-- rutina_dias (secuencia de días dentro de una rutina, ej. Día A/B/C)
-- ============================================================
create table rutina_dias (
  id uuid primary key default gen_random_uuid(),
  rutina_id uuid not null references rutinas (id) on delete cascade,
  numero_dia int not null,
  nombre text not null,
  dia_semana_sugerido dia_semana_enum,
  created_at timestamptz not null default now(),
  unique (rutina_id, numero_dia)
);

-- ============================================================
-- ejercicios (catálogo maestro)
-- ============================================================
create table ejercicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  grupo_muscular text,
  equipo_necesario text,
  video_url text,
  descripcion text,
  instrucciones text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- rutina_ejercicios (detalle: series/reps/descanso por día de rutina)
-- ============================================================
create table rutina_ejercicios (
  id uuid primary key default gen_random_uuid(),
  rutina_dia_id uuid not null references rutina_dias (id) on delete cascade,
  ejercicio_id uuid not null references ejercicios (id),
  orden int not null default 1,
  series int not null,
  repeticiones text not null,
  descanso_segundos int,
  video_url_override text,
  notas text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- rutinas_usuario (rutina activa/histórica de cada usuario)
-- ============================================================
create table rutinas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references perfiles (id) on delete cascade,
  rutina_id uuid not null references rutinas (id),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- sesiones_entrenamiento (una sesión = un rutina_dia completado/en curso)
-- ============================================================
create table sesiones_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references perfiles (id) on delete cascade,
  rutina_usuario_id uuid not null references rutinas_usuario (id) on delete cascade,
  rutina_dia_id uuid not null references rutina_dias (id),
  fecha timestamptz not null default now(),
  estado estado_sesion_enum not null default 'en_progreso',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- registros_progreso (peso, reps y RPE por serie)
-- ============================================================
create table registros_progreso (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references sesiones_entrenamiento (id) on delete cascade,
  rutina_ejercicio_id uuid not null references rutina_ejercicios (id),
  serie_numero int not null,
  peso_usado numeric,
  repeticiones_realizadas int,
  rpe int check (rpe between 1 and 10),
  notas text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- historial_chat (chat de coaching con IA)
-- ============================================================
create table historial_chat (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references perfiles (id) on delete cascade,
  conversacion_id uuid not null default gen_random_uuid(),
  rol rol_chat_enum not null,
  mensaje text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- suscripciones (espejo del estado de RevenueCat)
-- ============================================================
create table suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references perfiles (id) on delete cascade,
  revenuecat_customer_id text,
  producto_id text,
  estado estado_suscripcion_enum not null default 'vencida',
  plataforma plataforma_enum,
  fecha_inicio timestamptz,
  fecha_expiracion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger suscripciones_set_updated_at
  before update on suscripciones
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table perfiles enable row level security;
alter table rutinas enable row level security;
alter table rutina_dias enable row level security;
alter table ejercicios enable row level security;
alter table rutina_ejercicios enable row level security;
alter table rutinas_usuario enable row level security;
alter table sesiones_entrenamiento enable row level security;
alter table registros_progreso enable row level security;
alter table historial_chat enable row level security;
alter table suscripciones enable row level security;

-- perfiles: cada usuario ve y edita solo el suyo.
create policy "perfiles_select_propio" on perfiles
  for select using (auth.uid() = id);
create policy "perfiles_update_propio" on perfiles
  for update using (auth.uid() = id);

-- rutinas / rutina_dias / ejercicios / rutina_ejercicios: catálogo de
-- lectura pública para usuarios autenticados. La escritura queda
-- reservada al service_role (panel de administración / seed), por eso
-- no se define policy de insert/update/delete para el rol "authenticated".
create policy "rutinas_select_autenticado" on rutinas
  for select using (auth.role() = 'authenticated');
create policy "rutina_dias_select_autenticado" on rutina_dias
  for select using (auth.role() = 'authenticated');
create policy "ejercicios_select_autenticado" on ejercicios
  for select using (auth.role() = 'authenticated');
create policy "rutina_ejercicios_select_autenticado" on rutina_ejercicios
  for select using (auth.role() = 'authenticated');

-- rutinas_usuario: cada usuario administra sus propias asignaciones.
create policy "rutinas_usuario_select_propio" on rutinas_usuario
  for select using (auth.uid() = user_id);
create policy "rutinas_usuario_insert_propio" on rutinas_usuario
  for insert with check (auth.uid() = user_id);
create policy "rutinas_usuario_update_propio" on rutinas_usuario
  for update using (auth.uid() = user_id);

-- sesiones_entrenamiento: cada usuario administra sus propias sesiones.
create policy "sesiones_select_propio" on sesiones_entrenamiento
  for select using (auth.uid() = user_id);
create policy "sesiones_insert_propio" on sesiones_entrenamiento
  for insert with check (auth.uid() = user_id);
create policy "sesiones_update_propio" on sesiones_entrenamiento
  for update using (auth.uid() = user_id);

-- registros_progreso: acceso solo si la sesión asociada es del usuario.
create policy "registros_select_propio" on registros_progreso
  for select using (
    exists (
      select 1 from sesiones_entrenamiento s
      where s.id = registros_progreso.sesion_id and s.user_id = auth.uid()
    )
  );
create policy "registros_insert_propio" on registros_progreso
  for insert with check (
    exists (
      select 1 from sesiones_entrenamiento s
      where s.id = registros_progreso.sesion_id and s.user_id = auth.uid()
    )
  );
create policy "registros_update_propio" on registros_progreso
  for update using (
    exists (
      select 1 from sesiones_entrenamiento s
      where s.id = registros_progreso.sesion_id and s.user_id = auth.uid()
    )
  );

-- historial_chat: cada usuario ve y crea solo sus propios mensajes.
create policy "chat_select_propio" on historial_chat
  for select using (auth.uid() = user_id);
create policy "chat_insert_propio" on historial_chat
  for insert with check (auth.uid() = user_id);

-- suscripciones: el usuario solo puede leer su estado. Las escrituras
-- las hace el webhook de RevenueCat con la service_role key (bypassea RLS).
create policy "suscripciones_select_propio" on suscripciones
  for select using (auth.uid() = user_id);
