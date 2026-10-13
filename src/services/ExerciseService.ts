import { HydratedDocument } from 'mongoose';
import Exercise, { IExercise } from '../models/Exercise';

// Datos necesarios para crear un ejercicio.
export type NewExercise = Pick<IExercise, 'name' | 'category'> & { sets?: number; reps?: number };

// Datos que se pueden actualizar de un ejercicio
export type UpdateExerciseInput = Partial<Pick<IExercise, 'name' | 'category' | 'sets' | 'reps'>>;

// Tipo de un documento de ejercicio ya cargado por Mongoose
type ExerciseDocument = HydratedDocument<IExercise>;

// Funcion que se encarga de crear un ejercicio en la base de datos
export const createExercise = (data: NewExercise): Promise<ExerciseDocument> => {

    // Creamos un nuevo ejercicio usando los datos que hemos recibido
    const exercise = new Exercise(data);

    // Guardamos el ejercicio en la base de datos y devolvemos el resultado.
    // Si el nombre ya existe entre los ejercicios no borrados, MongoDB devuelve
    // el error 11000 (clave duplicada) por el indice unico parcial del modelo.
    return exercise.save();

};

// Funcion que busca un ejercicio por su ID en la base de datos
export const getExerciseById = (exerciseId: string): Promise<ExerciseDocument | null> => {

    // Buscamos el ejercicio usando el ID que hemos recibido
    return Exercise.findById(exerciseId);

};

// Funcion que se encarga de actualizar un ejercicio
export const updateExercise = (exerciseId: string, data: UpdateExerciseInput): Promise<ExerciseDocument | null> => {

    // Actualizamos el ejercicio filtrando isDeleted: false para que un ejercicio borrado
    // logicamente no se pueda actualizar (devolvera null y el controlador respondera 404).
    // Con new: true devolvemos el documento actualizado.
    return Exercise.findOneAndUpdate({ _id: exerciseId, isDeleted: false }, data, { new: true });

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createExercise,

    getExerciseById,

    updateExercise

};
