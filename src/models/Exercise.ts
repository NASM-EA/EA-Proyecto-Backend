import mongoose, { Document, Schema } from 'mongoose';

// Categorias que puede tener un ejercicio.
export const EXERCISE_CATEGORIES = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO'] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

// Definimos los datos que puede tener un ejercicio.
export interface IExercise {

    name: string;

    category: ExerciseCategory;

    sets: number;

    reps: number;

    // Marca si el ejercicio esta borrado. Los ejercicios borrados no se eliminan fisicamente de la base de datos
    isDeleted: boolean;

    deletedAt?: Date;

}

// Esta interfaz junta los datos del ejercicio con las propiedades de un documento de MongoDB
export interface IExerciseModel extends IExercise, Document {}

// Definimos el esquema que van a seguir los ejercicios en la base de datos
const ExerciseSchema: Schema = new Schema(

    {
        // El nombre es obligatorio y quitamos los espacios del principio y del final
        name: { type: String, required: true, trim: true },

        // La categoria es obligatoria y solo puede ser una de las definidas arriba
        category: { type: String, enum: EXERCISE_CATEGORIES, required: true },

        // Por defecto un ejercicio no tiene series ni repeticiones asignadas
        sets: { type: Number, default: 0 },

        reps: { type: Number, default: 0 },

        isDeleted: { type: Boolean, default: false },

        deletedAt: { type: Date, default: null }

    },

    {
        timestamps: true,

        versionKey: false

    }

);

// Indice unico parcial del nombre: solo tiene que ser unico entre los ejercicios no borrados.
// Asi un ejercicio borrado logicamente libera su nombre para que otro ejercicio nuevo lo pueda usar.
// Es importante definirlo con schema.index(): Mongoose ignora partialFilterExpression
// cuando se pone como opcion del campo.
ExerciseSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Creamos y exportamos el modelo Exercise a partir del esquema
export default mongoose.model<IExerciseModel>('Exercise', ExerciseSchema);
