import { Redirect, Tabs } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function TabsLayout() {
  const session = useAuthStore((state) => state.session);
  const perfil = useAuthStore((state) => state.perfil);

  if (!session) return <Redirect href="/(auth)/login" />;

  const perfilIncompleto = !perfil?.objetivo || !perfil?.nivel || !perfil?.tipo_actividad;
  if (perfilIncompleto) return <Redirect href="/(onboarding)/perfil-inicial" />;

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B1B1F' }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="rutinas/index" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="progreso" options={{ title: 'Progreso' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat IA' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
