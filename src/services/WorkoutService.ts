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
// El ADMIN consulta todas las rutinas, tambien las borradas logicamente.
// Cualquier otra sesion solo ve las activas: si la rutina esta borrada se comporta
// como si no existiera y el controlador responde 404.
// El populate carga los documentos completos de Exercise en lugar de dejar los ObjectId,
// para que el controlador pueda responder con los ejercicios enteros. Si no hay ejercicios,
// el populate mantiene una lista vacia.
export const getWorkoutById = (workoutId: string, isAdmin: boolean): Promise<WorkoutDocument | null> => {

    // Con el rol ADMIN buscamos por ID a secas; el resto exige ademas isDeleted: false.
    // En los dos casos cargamos los ejercicios referenciados.
    return isAdmin
        ? Workout.findById(workoutId).populate('exercises')
        : Workout.findOne({ _id: workoutId, isDeleted: false }).populate({ path: 'exercises', match: { isDeleted: false } });

};

// Borrado logico: la rutina sigue en la base de datos, pero marcada como borrada.
// Deja de salir en los listados y su nombre queda libre. Devuelve null si no existe o ya estaba borrada.
export const softDeleteWorkout = (workoutId: string): Promise<WorkoutDocument | null> => {

    return Workout.findOneAndUpdate({ _id: workoutId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });

};

// Borrado logico de varias rutinas a la vez. Devuelve cuantas se han borrado.
export const softDeleteManyWorkouts = async (ids: string[]): Promise<number> => {

    const result = await Workout.updateMany({ _id: { $in: ids }, isDeleted: false }, { isDeleted: true, deletedAt: new Date() });

    return result.modifiedCount;

};

// Borrado definitivo de varias rutinas a la vez. Sus ejercicios no se borran.
export const hardDeleteManyWorkouts = async (ids: string[]): Promise<number> => {

    const result = await Workout.deleteMany({ _id: { $in: ids } });

    return result.deletedCount;

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

// Devuelve una pagina de rutinas, filtrada por dia y/o por texto en nombre o descripcion.
// El ADMIN ve todas las rutinas; cualquier otra sesion solo las activas (isDeleted: false).
export const listWorkouts = async ({ page, limit, search, dayOfWeek, sort, order }: ListWorkoutsInput, isAdmin: boolean) => {

    // El ADMIN consulta todo, asi que su filtro empieza vacio; el resto empieza solo con las activas
    const filter: Record<string, unknown> = isAdmin ? {} : { isDeleted: false };

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
        Workout.find(filter).sort(buildSort(sort, order, 'name')).skip(getSkip(page, limit)).limit(limit).populate({ path: 'exercises', match: isAdmin ? {} : { isDeleted: false } }),
        Workout.countDocuments(filter)
    ]);

    return { workouts, pagination: buildPageInfo(page, limit, total) };

};

// Recuperar: deshace el borrado logico, o sea isDeleted vuelve a false.
// Devuelve null si no existe o si no estaba borrado.
// Si ya hay otro activo con el mismo nombre/email, MongoDB da error 11000 (409).
export const restoreWorkout = (workoutId: string): Promise<WorkoutDocument | null> => {

    return Workout.findOneAndUpdate({ _id: workoutId, isDeleted: true }, { isDeleted: false, deletedAt: null }, { new: true });

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createWorkout,

    getWorkoutById,

    updateWorkout,

    softDeleteWorkout,

    restoreWorkout,

    hardDeleteWorkout,

    softDeleteManyWorkouts,

    hardDeleteManyWorkouts,

    listWorkouts

};
