import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { NIVELES, OBJETIVOS, TIPOS_ACTIVIDAD } from '@/constants/enums';
import { signOut } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function PerfilScreen() {
  const session = useAuthStore((state) => state.session);
  const perfil = useAuthStore((state) => state.perfil);

  const objetivoLabel = OBJETIVOS.find((o) => o.value === perfil?.objetivo)?.label;
  const nivelLabel = NIVELES.find((n) => n.value === perfil?.nivel)?.label;
  const actividadLabel = TIPOS_ACTIVIDAD.find((t) => t.value === perfil?.tipo_actividad)?.label;

  async function handleLogout() {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('No se pudo cerrar sesión', error instanceof Error ? error.message : '');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{perfil?.nombre || 'Tu perfil'}</Text>
      <Text style={styles.email}>{session?.user.email}</Text>

      <View style={styles.card}>
        <Row label="Objetivo" value={objetivoLabel} />
        <Row label="Nivel" value={nivelLabel} />
        <Row label="Actividad" value={actividadLabel} />
        {perfil?.deporte_especifico && <Row label="Deporte" value={perfil.deporte_especifico} />}
      </View>

      <Button label="Cerrar sesión" onPress={handleLogout} variant="secondary" />
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    gap: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1F',
  },
  email: {
    fontSize: 15,
    color: '#6B6B70',
    marginTop: -16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#DCDCE0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#6B6B70',
    fontSize: 14,
  },
  rowValue: {
    color: '#1B1B1F',
    fontSize: 14,
    fontWeight: '600',
  },
});
