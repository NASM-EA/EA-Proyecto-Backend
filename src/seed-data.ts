import { IExercise } from './models/Exercise';
import { IUser } from './models/User';
import { IWorkout } from './models/Workout';

// Datos de ejemplo para llenar la base de datos del gimnasio.
// Los nombres de los ejercicios y de las rutinas son inventados.

// Usuarios para iniciar sesión en la aplicación: uno de cada rol.
// Las contraseñas están sin cifrar y son públicas a propósito (ver el README):
// el hook pre-save del modelo User las cifra al guardarlas.
export const usersSeed: IUser[] = [
    {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'seminari7',
        role: 'ADMIN'
    },
    {
        name: 'Usuario',
        email: 'user@example.com',
        password: 'seminari7',
        role: 'USER'
    }
];

// El campo 'isDeleted' no se indica aquí: el esquema lo pone en false por defecto.
export type ExerciseSeed = Omit<IExercise, 'isDeleted' | 'deletedAt'>;

// Ejercicios repartidos entre todas las categorías de EXERCISE_CATEGORIES.
// En los ejercicios de fuerza, sets son las series y reps las repeticiones de cada serie.
export const exercisesSeed: ExerciseSeed[] = [
    {
        name: 'Press de banca',
        category: 'CHEST',
        sets: 4,
        reps: 10
    },
    {
        name: 'Aperturas con mancuernas',
        category: 'CHEST',
        sets: 3,
        reps: 12
    },
    {
        name: 'Dominadas',
        category: 'BACK',
        sets: 4,
        reps: 8
    },
    {
        name: 'Remo con barra',
        category: 'BACK',
        sets: 4,
        reps: 10
    },
    {
        name: 'Sentadilla',
        category: 'LEGS',
        sets: 5,
        reps: 5
    },
    {
        name: 'Prensa de piernas',
        category: 'LEGS',
        sets: 3,
        reps: 12
    },
    {
        name: 'Press militar',
        category: 'SHOULDERS',
        sets: 4,
        reps: 8
    },
    {
        name: 'Elevaciones laterales',
        category: 'SHOULDERS',
        sets: 3,
        reps: 15
    },
    {
        name: 'Curl de bíceps',
        category: 'ARMS',
        sets: 3,
        reps: 12
    },
    {
        name: 'Fondos en paralelas',
        category: 'ARMS',
        sets: 3,
        reps: 10
    },
    {
        name: 'Plancha abdominal',
        category: 'CORE',
        sets: 3,
        reps: 1
    },
    // En el cardio no hay repeticiones: sets son los minutos de trabajo y reps queda en 0.
    {
        name: 'Cinta a intervalos',
        category: 'CARDIO',
        sets: 20,
        reps: 0
    }
];

// Cada rutina dice de qué ejercicios está hecha con sus nombres. El script del seed los cambia
// por los ids que MongoDB les ha dado a los ejercicios, por eso primero se insertan los ejercicios.
// Los campos 'exercises' e 'isDeleted' tampoco se indican aquí: el esquema los pone por defecto.
export type WorkoutSeed = Omit<IWorkout, 'exercises' | 'isDeleted' | 'deletedAt'> & { exerciseNames: string[] };

export const workoutsSeed: WorkoutSeed[] = [
    {
        name: 'Día de pecho',
        description: 'Empuje con barra y mancuernas, y fondos para terminar de cansar el pecho.',
        dayOfWeek: 'MONDAY',
        exerciseNames: ['Press de banca', 'Aperturas con mancuernas', 'Fondos en paralelas']
    },
    {
        name: 'Día de espalda',
        description: 'Tirón vertical y horizontal, con bíceps al final.',
        dayOfWeek: 'TUESDAY',
        exerciseNames: ['Dominadas', 'Remo con barra', 'Curl de bíceps']
    },
    {
        name: 'Día de piernas',
        description: 'Sentadilla y prensa, con plancha para cerrar el entrenamiento.',
        dayOfWeek: 'THURSDAY',
        exerciseNames: ['Sentadilla', 'Prensa de piernas', 'Plancha abdominal']
    },
    {
        name: 'Día de hombro y brazos',
        description: 'Hombro completo y un bloque corto de brazos.',
        dayOfWeek: 'FRIDAY',
        exerciseNames: ['Press militar', 'Elevaciones laterales', 'Curl de bíceps', 'Fondos en paralelas']
    },
    {
        name: 'Cardio y core',
        description: 'Sesión corta de cardio y abdomen para el fin de semana.',
        dayOfWeek: 'SATURDAY',
        exerciseNames: ['Cinta a intervalos', 'Plancha abdominal']
    }
];
