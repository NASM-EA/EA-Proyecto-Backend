import { NextFunction, Request, Response } from 'express';
import WorkoutService from '../services/WorkoutService';

// Función para crear una rutina nueva
// Cogemos los datos que nos llegan en el body y se los pasamos al servicio
const createWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workout = await WorkoutService.createWorkout(req.body);

        // Si se ha creado correctamente devolvemos la rutina creada
        // El codigo 201 indica que se ha creado un recurso nuevo
        res.status(201).json({ workout });
    } catch (error) {
        // Si ocurre algun error lo pasamos al siguiente middleware
        // para que se encargue de gestionarlo
        next(error);
    }
};

// Función para buscar una rutina concreta a partir de su ID
// El servicio ya carga los ejercicios enteros, asi que aqui no hay que hacer nada mas
const readWorkout = async (req: Request<{ workoutId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID de la rutina que viene en los parametros de la URL
    const workoutId = req.params.workoutId;

    try {
        // El servicio necesita saber el rol de la sesion: solo un ADMIN ve las rutinas borradas
        const isAdmin = req.user?.role === 'ADMIN';

        // Buscamos la rutina usando el servicio
        const workout = await WorkoutService.getWorkoutById(workoutId, isAdmin);

        // Comprobamos si hemos encontrado la rutina
        if (workout) {
            // Si existe devolvemos sus datos con los ejercicios completos
            res.status(200).json({ workout });
        } else {
            // Si no existe devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // En caso de error lo pasamos al siguiente middleware
        next(error);
    }
};

// Función para modificar los datos de una rutina
const updateWorkout = async (req: Request<{ workoutId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID de la rutina de los parametros de la URL
    const workoutId = req.params.workoutId;

    try {
        // Pasamos al servicio el ID de la rutina y los nuevos datos
        const workout = await WorkoutService.updateWorkout(workoutId, req.body);

        // Comprobamos si se ha encontrado y actualizado la rutina
        if (workout) {
            // Si todo ha ido bien devolvemos la rutina actualizada
            res.status(200).json({ workout });
        } else {
            // Si no existe la rutina devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // Si ocurre algun error lo gestionamos mediante el siguiente middleware
        next(error);
    }
};

// Función para listar rutinas con paginación y buscador
const listWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // El servicio necesita saber el rol de la sesion: el ADMIN ve todas las rutinas
        // y cualquier otra sesion solo las activas
        const isAdmin = req.user?.role === 'ADMIN';

        // ValidateQuery ya ha comprobado y convertido los parametros de la URL
        const result = await WorkoutService.listWorkouts(res.locals.query, isAdmin);

        // Devolvemos la pagina de rutinas junto con los datos de paginacion
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Borrado logico de varios rutinas a la vez: recibe { ids: [...] } y devuelve cuantos se han borrado
const softDeleteManyWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await WorkoutService.softDeleteManyWorkouts(req.body.ids);
        res.status(200).json({ deleted });
    } catch (error) {
        next(error);
    }
};

// Borrado definitivo de varios rutinas a la vez: recibe { ids: [...] } y devuelve cuantos se han eliminado
const hardDeleteManyWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await WorkoutService.hardDeleteManyWorkouts(req.body.ids);
        res.status(200).json({ deleted });
    } catch (error) {
        next(error);
    }
};

// Exportamos todas las funciones para poder utilizarlas desde las rutas
// Función para el borrado lógico: marca la rutina como borrada (isDeleted) sin quitarla de la base de datos
const softDeleteWorkout = async (req: Request<{ workoutId: string }>, res: Response, next: NextFunction) => {
    try {
        const workout = await WorkoutService.softDeleteWorkout(req.params.workoutId);

        if (workout) {
            // 204: se ha hecho y no hay nada que devolver
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Función para el borrado definitivo: elimina la rutina de la base de datos para siempre
const hardDeleteWorkout = async (req: Request<{ workoutId: string }>, res: Response, next: NextFunction) => {
    try {
        const workout = await WorkoutService.hardDeleteWorkout(req.params.workoutId);

        if (workout) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

export default { createWorkout, readWorkout, updateWorkout, softDeleteWorkout, hardDeleteWorkout, softDeleteManyWorkouts, hardDeleteManyWorkouts, listWorkouts };

