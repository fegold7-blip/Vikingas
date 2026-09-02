import { supabase } from '@/lib/supabase';
import type { PerfilUpdate } from '@/types/database.types';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getPerfil(userId: string) {
  const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function actualizarPerfil(userId: string, cambios: PerfilUpdate) {
  const { data, error } = await supabase
    .from('perfiles')
    .update(cambios)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
