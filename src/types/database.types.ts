import type { Nivel, Objetivo, TipoActividad } from '@/constants/enums';

// Tipos manuales alineados a supabase/migrations/0001_initial_schema.sql.
// Cuando el esquema se estabilice, reemplazar por `supabase gen types typescript`.

export interface Perfil {
  id: string;
  email: string;
  nombre: string | null;
  objetivo: Objetivo | null;
  nivel: Nivel | null;
  tipo_actividad: TipoActividad | null;
  deporte_especifico: string | null;
  created_at: string;
  updated_at: string;
}

export type PerfilInsert = Pick<Perfil, 'id' | 'email'> &
  Partial<Omit<Perfil, 'id' | 'email' | 'created_at' | 'updated_at'>>;

export type PerfilUpdate = Partial<Omit<Perfil, 'id' | 'created_at' | 'updated_at'>>;
