import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { session, perfil, initializing } = useAuthStore();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;

  const perfilIncompleto = !perfil?.objetivo || !perfil?.nivel || !perfil?.tipo_actividad;
  if (perfilIncompleto) return <Redirect href="/(onboarding)/perfil-inicial" />;

  return <Redirect href="/(tabs)" />;
}
