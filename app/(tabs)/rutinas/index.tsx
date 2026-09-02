import { StyleSheet, Text, View } from 'react-native';

export default function RutinasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>
      <Text style={styles.subtitle}>Próximamente: tus rutinas asignadas con ejercicios y video.</Text>
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
