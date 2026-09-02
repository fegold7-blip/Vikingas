import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { getPerfil } from '@/services/auth.service';
import type { Perfil } from '@/types/database.types';

interface AuthState {
  session: Session | null;
  perfil: Perfil | null;
  initializing: boolean;
  init: () => () => void;
  refreshPerfil: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  perfil: null,
  initializing: true,

  init: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      set({ session });
      if (session) await get().refreshPerfil();
      set({ initializing: false });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) {
        await get().refreshPerfil();
      } else {
        set({ perfil: null });
      }
    });

    return () => subscription.subscription.unsubscribe();
  },

  refreshPerfil: async () => {
    const { session } = get();
    if (!session) return;
    try {
      const perfil = await getPerfil(session.user.id);
      set({ perfil: perfil as Perfil });
    } catch {
      set({ perfil: null });
    }
  },
}));
