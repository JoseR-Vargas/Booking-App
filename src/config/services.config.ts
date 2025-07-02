export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutos
  basePrice: number;
  category: string;
  isActive: boolean;
  requirements?: string[];
  preparationTime?: number; // tiempo de preparación en minutos
}

export const SERVICES_CONFIG: ServiceConfig[] = [
  {
    id: 'haircut',
    name: 'Corte de Cabello',
    description: 'Corte de cabello profesional con asesoramiento de estilo',
    duration: 45,
    basePrice: 25000,
    category: 'cabello',
    isActive: true,
    preparationTime: 5
  },
  {
    id: 'coloring',
    name: 'Tintura de Cabello',
    description: 'Coloración completa con productos de alta calidad',
    duration: 120,
    basePrice: 80000,
    category: 'cabello',
    isActive: true,
    requirements: ['Prueba de alergia 48h antes'],
    preparationTime: 10
  },
  {
    id: 'facial',
    name: 'Limpieza Facial',
    description: 'Limpieza facial profunda con hidratación',
    duration: 60,
    basePrice: 35000,
    category: 'facial',
    isActive: true,
    preparationTime: 5
  },
  {
    id: 'manicure',
    name: 'Manicure Completa',
    description: 'Manicure con esmaltado semipermanente',
    duration: 75,
    basePrice: 20000,
    category: 'uñas',
    isActive: true
  },
  {
    id: 'massage',
    name: 'Masaje Relajante',
    description: 'Masaje corporal de relajación (60 min)',
    duration: 60,
    basePrice: 45000,
    category: 'bienestar',
    isActive: true,
    preparationTime: 10
  }
];

export const BUSINESS_CONFIG = {
  name: 'Beauty Center',
  timezone: 'America/Bogota',
  workingHours: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '19:00' },
    saturday: { start: '08:00', end: '16:00' },
    sunday: { start: '10:00', end: '14:00' }
  },
  breakTime: {
    start: '12:00',
    end: '13:00'
  },
  bookingAdvanceDays: 30, // días hacia adelante que se pueden reservar
  cancelationDeadlineHours: 24
}; 