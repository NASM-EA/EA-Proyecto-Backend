import { HydratedDocument } from 'mongoose';
import Exercise, { ExerciseCategory, IExercise } from '../models/Exercise';
import Workout from '../models/Workout';
import { buildPageInfo, buildSort, escapeRegex, getSkip } from '../utils/pagination';

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

    // Buscamos el ejercicio usando el ID que hemos recibido.
    // Filtramos isDeleted: false para que un ejercicio borrado logicamente no se pueda leer
    return Exercise.findOne({ _id: exerciseId, isDeleted: false });

};

// Borrado logico: el ejercicio sigue en la base de datos, pero marcado como borrado.
// Deja de salir en los listados y su nombre queda libre (indice unico parcial del modelo).
// Devuelve null si no existe o ya estaba borrado.
export const softDeleteExercise = (exerciseId: string): Promise<ExerciseDocument | null> => {

    return Exercise.findOneAndUpdate({ _id: exerciseId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });

};

// Borrado definitivo: el ejercicio desaparece de la base de datos para siempre.
// Tambien se quita de las rutinas que lo usaban, para que no queden ids que apunten a nada.
// Funciona tambien con ejercicios que ya estaban borrados logicamente. Devuelve null si no existe.
export const hardDeleteExercise = async (exerciseId: string): Promise<ExerciseDocument | null> => {

    const exercise = await Exercise.findByIdAndDelete(exerciseId);

    if (exercise) {
        await Workout.updateMany({ exercises: exercise._id }, { $pull: { exercises: exercise._id } });
    }

    return exercise;

};

// Funcion que se encarga de actualizar un ejercicio
export const updateExercise = (exerciseId: string, data: UpdateExerciseInput): Promise<ExerciseDocument | null> => {

    // Actualizamos el ejercicio filtrando isDeleted: false para que un ejercicio borrado
    // logicamente no se pueda actualizar (devolvera null y el controlador respondera 404).
    // Con new: true devolvemos el documento actualizado.
    return Exercise.findOneAndUpdate({ _id: exerciseId, isDeleted: false }, data, { new: true });

};

// Parametros de un listado: los que llegan ya validados por ValidateQuery
// (sort es la columna por la que ordenar y order el sentido: asc o desc)
export type ListExercisesInput = { page: number; limit: number; search?: string; category?: ExerciseCategory; sort?: string; order?: 'asc' | 'desc' };

// Devuelve una pagina de ejercicios, filtrada por categoria y/o por texto en el nombre
export const listExercises = async ({ page, limit, search, category, sort, order }: ListExercisesInput) => {

    // Solo los ejercicios no borrados logicamente
    const filter: Record<string, unknown> = { isDeleted: false };

    // Filtro exacto por categoria, si se ha pedido
    if (category) {
        filter.category = category;
    }

    // Buscador: el nombre contiene el texto, sin distinguir mayusculas ('i')
    if (search) {
        filter.name = new RegExp(escapeRegex(search), 'i');
    }

    // Pedimos la pagina y el total a la vez, usando el MISMO filtro en las dos consultas
    const [exercises, total] = await Promise.all([
        // Ordenamos por la columna pedida (por defecto el nombre)
        Exercise.find(filter).sort(buildSort(sort, order, 'name')).skip(getSkip(page, limit)).limit(limit),
        Exercise.countDocuments(filter)
    ]);

    return { exercises, pagination: buildPageInfo(page, limit, total) };

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createExercise,

    getExerciseById,

    updateExercise,

    softDeleteExercise,

    hardDeleteExercise,

    listExercises

};
