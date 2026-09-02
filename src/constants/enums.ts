export const OBJETIVOS = [
  { value: 'perder_grasa', label: 'Perder grasa' },
  { value: 'ganar_musculo', label: 'Ganar músculo' },
  { value: 'rendimiento', label: 'Mejorar rendimiento' },
  { value: 'salud_general', label: 'Salud general' },
] as const;

export const NIVELES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
] as const;

export const TIPOS_ACTIVIDAD = [
  { value: 'gym', label: 'Gimnasio' },
  { value: 'calistenia', label: 'Calistenia' },
  { value: 'running', label: 'Running' },
  { value: 'deporte_especifico', label: 'Deporte específico' },
] as const;

export type Objetivo = (typeof OBJETIVOS)[number]['value'];
export type Nivel = (typeof NIVELES)[number]['value'];
export type TipoActividad = (typeof TIPOS_ACTIVIDAD)[number]['value'];
