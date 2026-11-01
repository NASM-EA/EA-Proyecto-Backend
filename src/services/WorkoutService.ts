import mongoose, { HydratedDocument } from 'mongoose';
import Workout, { DayOfWeek, IWorkout } from '../models/Workout';
import { buildPageInfo, buildSort, escapeRegex, getSkip } from '../utils/pagination';

// Datos necesarios para crear una rutina.
// El nombre y el dia de la semana son obligatorios; la descripcion y los ejercicios
// son opcionales. Los ejercicios llegan como textos (IDs) desde el cuerpo de la peticion.
export type NewWorkout = Pick<IWorkout, 'name' | 'dayOfWeek'> & { description?: string; exercises?: string[] };

// Datos que se pueden actualizar de una rutina.
// Los ejercicios tambien llegan como textos (IDs) desde el cuerpo de la peticion.
export type UpdateWorkoutInput = Partial<Pick<IWorkout, 'name' | 'description' | 'dayOfWeek'>> & { exercises?: string[] };

// Tipo de un documento de rutina ya cargado por Mongoose
type WorkoutDocument = HydratedDocument<IWorkout>;
// Funcion que se encarga de crear una rutina en la base de datos.
// Los ejercicios llegan como textos, asi que los convertimos a ObjectId antes de guardar.
export const createWorkout = (data: NewWorkout): Promise<WorkoutDocument> => {

    // Construimos el documento convirtiendo cada ID de ejercicio a ObjectId.
    // Si no llegan ejercicios guardamos una lista vacia.
    const workout = new Workout({
        ...data,
        exercises: (data.exercises ?? []).map((id) => new mongoose.Types.ObjectId(id))
    });

    // Guardamos la rutina en la base de datos y devolvemos el resultado.
    // Si el nombre ya existe entre las rutinas no borradas, MongoDB devuelve
    // el error 11000 (clave duplicada) por el indice unico parcial del modelo.
    return workout.save();

};

// Funcion que busca una rutina por su ID en la base de datos.
// El populate carga los documentos completos de Exercise en lugar de dejar los ObjectId,
// para que el controlador pueda responder con los ejercicios enteros. Si no hay ejercicios,
// el populate mantiene una lista vacia. Devuelve null si la rutina no existe.
export const getWorkoutById = (workoutId: string): Promise<WorkoutDocument | null> => {

    // Buscamos la rutina por ID y cargamos sus ejercicios referenciados.
    // Filtramos isDeleted: false: una rutina borrada logicamente no se puede leer, y
    // los ejercicios borrados logicamente no salen dentro de la rutina
    return Workout.findOne({ _id: workoutId, isDeleted: false }).populate({ path: 'exercises', match: { isDeleted: false } });

};

// Borrado logico: la rutina sigue en la base de datos, pero marcada como borrada.
// Deja de salir en los listados y su nombre queda libre. Devuelve null si no existe o ya estaba borrada.
export const softDeleteWorkout = (workoutId: string): Promise<WorkoutDocument | null> => {

    return Workout.findOneAndUpdate({ _id: workoutId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });

};

// Borrado definitivo: la rutina desaparece de la base de datos para siempre.
// Los ejercicios de la rutina no se borran. Funciona tambien con rutinas ya borradas logicamente.
export const hardDeleteWorkout = (workoutId: string): Promise<WorkoutDocument | null> => {

    return Workout.findByIdAndDelete(workoutId);

};

// Funcion que se encarga de actualizar una rutina
export const updateWorkout = (workoutId: string, data: UpdateWorkoutInput): Promise<WorkoutDocument | null> => {

    // Copiamos los datos recibidos y convertimos los ejercicios a ObjectId dentro
    // del propio payload de actualizacion.
    const updates: Record<string, unknown> = { ...data };
    if (data.exercises) {

        updates.exercises = data.exercises.map((id) => new mongoose.Types.ObjectId(id));

    }

    // Actualizamos la rutina filtrando isDeleted: false para que una rutina borrada
    // logicamente no se pueda actualizar (devolvera null y el controlador respondera 404).
    // Con new: true devolvemos el documento actualizado.
    return Workout.findOneAndUpdate({ _id: workoutId, isDeleted: false }, updates, { new: true });

};

// Parametros de un listado: los que llegan ya validados por ValidateQuery
// (sort es la columna por la que ordenar y order el sentido: asc o desc)
export type ListWorkoutsInput = { page: number; limit: number; search?: string; dayOfWeek?: DayOfWeek; sort?: string; order?: 'asc' | 'desc' };

// Devuelve una pagina de rutinas, filtrada por dia y/o por texto en nombre o descripcion
export const listWorkouts = async ({ page, limit, search, dayOfWeek, sort, order }: ListWorkoutsInput) => {

    // Solo las rutinas no borradas logicamente
    const filter: Record<string, unknown> = { isDeleted: false };

    // Filtro exacto por dia de la semana, si se ha pedido
    if (dayOfWeek) {
        filter.dayOfWeek = dayOfWeek;
    }

    // Buscador: el texto puede estar en el nombre O en la descripcion
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ name: regex }, { description: regex }];
    }

    // Pedimos la pagina y el total a la vez, con el MISMO filtro
    const [workouts, total] = await Promise.all([
        // Ordenamos por la columna pedida (por defecto el nombre)
        Workout.find(filter).sort(buildSort(sort, order, 'name')).skip(getSkip(page, limit)).limit(limit).populate({ path: 'exercises', match: { isDeleted: false } }),
        Workout.countDocuments(filter)
    ]);

    return { workouts, pagination: buildPageInfo(page, limit, total) };

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createWorkout,

    getWorkoutById,

    updateWorkout,

    softDeleteWorkout,

    hardDeleteWorkout,

    listWorkouts

};
