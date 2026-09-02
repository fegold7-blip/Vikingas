import { StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '@/store/auth.store';

export default function InicioScreen() {
  const perfil = useAuthStore((state) => state.perfil);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola{perfil?.nombre ? `, ${perfil.nombre}` : ''} 👋</Text>
      <Text style={styles.subtitle}>Tu rutina de hoy va a aparecer acá.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1F',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B70',
    textAlign: 'center',
  },
});
