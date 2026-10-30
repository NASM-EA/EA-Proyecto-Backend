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
        // Buscamos la rutina usando el servicio
        const workout = await WorkoutService.getWorkoutById(workoutId);

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

// Exportamos todas las funciones para poder utilizarlas desde las rutas
export default { createWorkout, readWorkout, updateWorkout };
