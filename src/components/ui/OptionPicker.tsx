import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Option {
  value: string;
  label: string;
}

interface OptionPickerProps {
  label: string;
  options: readonly Option[];
  value: string | null;
  onChange: (value: string) => void;
}

export function OptionPicker({ label, options, value, onChange }: OptionPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1B1F',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCDCE0',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#1B1B1F',
    borderColor: '#1B1B1F',
  },
  chipLabel: {
    fontSize: 14,
    color: '#1B1B1F',
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
});
