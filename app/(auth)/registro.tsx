import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { signUp } from '@/services/auth.service';

export default function RegistroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegistro() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Completá email y contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Usá al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisá la confirmación.');
      return;
    }
    setLoading(true);
    try {
      const { session } = await signUp(email.trim(), password);
      if (!session) {
        Alert.alert(
          'Confirmá tu email',
          'Te enviamos un email de confirmación. Una vez confirmado, iniciá sesión.'
        );
        router.replace('/(auth)/login');
        return;
      }
      router.replace('/');
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', mensajeError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Creá tu cuenta</Text>
        <Text style={styles.subtitle}>Empezá a entrenar con El Vikingo</Text>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />
          <TextField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Button label="Crear cuenta" onPress={handleRegistro} loading={loading} />

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>¿Ya tenés cuenta? Iniciá sesión</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

function mensajeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B1B1F',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B70',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  link: {
    alignSelf: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#1B1B1F',
    fontWeight: '600',
  },
});
