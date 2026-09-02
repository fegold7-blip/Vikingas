import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { OptionPicker } from '@/components/ui/OptionPicker';
import { TextField } from '@/components/ui/TextField';
import { NIVELES, OBJETIVOS, TIPOS_ACTIVIDAD } from '@/constants/enums';
import type { Nivel, Objetivo, TipoActividad } from '@/constants/enums';
import { actualizarPerfil } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function PerfilInicialScreen() {
  const session = useAuthStore((state) => state.session);
  const refreshPerfil = useAuthStore((state) => state.refreshPerfil);

  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [tipoActividad, setTipoActividad] = useState<TipoActividad | null>(null);
  const [deporteEspecifico, setDeporteEspecifico] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGuardar() {
    if (!session) return;
    if (!objetivo || !nivel || !tipoActividad) {
      Alert.alert('Faltan datos', 'Elegí objetivo, nivel y tipo de actividad.');
      return;
    }
    if (tipoActividad === 'deporte_especifico' && !deporteEspecifico.trim()) {
      Alert.alert('Falta el deporte', 'Contanos qué deporte practicás.');
      return;
    }

    setLoading(true);
    try {
      await actualizarPerfil(session.user.id, {
        nombre: nombre.trim() || null,
        objetivo,
        nivel,
        tipo_actividad: tipoActividad,
        deporte_especifico: tipoActividad === 'deporte_especifico' ? deporteEspecifico.trim() : null,
      });
      await refreshPerfil();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('No se pudo guardar tu perfil', mensajeError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Contanos sobre vos</Text>
      <Text style={styles.subtitle}>Así armamos tu rutina a medida</Text>

      <View style={styles.form}>
        <TextField label="Nombre" value={nombre} onChangeText={setNombre} autoCapitalize="words" />

        <OptionPicker label="Objetivo" options={OBJETIVOS} value={objetivo} onChange={(v) => setObjetivo(v as Objetivo)} />
        <OptionPicker label="Nivel" options={NIVELES} value={nivel} onChange={(v) => setNivel(v as Nivel)} />
        <OptionPicker
          label="Tipo de actividad"
          options={TIPOS_ACTIVIDAD}
          value={tipoActividad}
          onChange={(v) => setTipoActividad(v as TipoActividad)}
        />

        {tipoActividad === 'deporte_especifico' && (
          <TextField
            label="¿Qué deporte practicás?"
            value={deporteEspecifico}
            onChangeText={setDeporteEspecifico}
            autoCapitalize="words"
          />
        )}
      </View>

      <Button label="Guardar y continuar" onPress={handleGuardar} loading={loading} />
    </ScrollView>
  );
}

function mensajeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    gap: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B1B1F',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B70',
    marginTop: -16,
  },
  form: {
    gap: 20,
  },
});
