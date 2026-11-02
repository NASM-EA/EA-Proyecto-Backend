import mongoose, { Document, Schema } from 'mongoose';

// Dias de la semana en los que se puede realizar una rutina.
export const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Definimos los datos que puede tener una rutina.
export interface IWorkout {

    name: string;

    description?: string;

    // Dia de la semana en el que se realiza la rutina
    dayOfWeek: DayOfWeek;

    // Referencias al modelo Exercise que forman parte de la rutina
    exercises: mongoose.Types.ObjectId[];

    // Marca si la rutina esta borrada. Las rutinas borradas no se eliminan fisicamente de la base de datos
    isDeleted: boolean;

    deletedAt?: Date;

}

// Esta interfaz junta los datos de la rutina con las propiedades de un documento de MongoDB
export interface IWorkoutModel extends IWorkout, Document {}

// Definimos el esquema que van a seguir las rutinas en la base de datos
const WorkoutSchema: Schema = new Schema(

    {
        // El nombre es obligatorio y quitamos los espacios del principio y del final
        name: { type: String, required: true, trim: true },

        // La descripcion es opcional y quitamos los espacios del principio y del final
        description: { type: String, trim: true },

        // El dia de la semana es obligatorio y solo puede ser uno de los definidos arriba
        dayOfWeek: { type: String, enum: DAYS_OF_WEEK, required: true },

        // Los ejercicios son referencias al modelo Exercise
        exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],

        isDeleted: { type: Boolean, default: false },

        deletedAt: { type: Date, default: null }

    },

    {
        timestamps: true,

        versionKey: false

    }

);

// Indice unico parcial del nombre: solo tiene que ser unico entre las rutinas no borradas.
// Asi una rutina borrada logicamente libera su nombre para que otra rutina nueva lo pueda usar.
// Es importante definirlo con schema.index(): Mongoose ignora partialFilterExpression
// cuando se pone como opcion del campo.
WorkoutSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Creamos y exportamos el modelo Workout a partir del esquema
export default mongoose.model<IWorkoutModel>('Workout', WorkoutSchema);
