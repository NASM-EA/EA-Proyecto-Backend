import { NextFunction, Request, Response } from 'express';
import ExerciseService from '../services/ExerciseService';

// Función para crear un ejercicio nuevo
// Cogemos los datos que nos llegan en el body y se los pasamos al servicio
const createExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const exercise = await ExerciseService.createExercise(req.body);

        // Si se ha creado correctamente devolvemos el ejercicio creado
        // El codigo 201 indica que se ha creado un recurso nuevo
        res.status(201).json({ exercise });
    } catch (error) {
        // Si ocurre algun error lo pasamos al siguiente middleware
        // para que se encargue de gestionarlo
        next(error);
    }
};

// Función para buscar un ejercicio concreto a partir de su ID
const readExercise = async (req: Request<{ exerciseId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID del ejercicio que viene en los parametros de la URL
    const exerciseId = req.params.exerciseId;

    try {
        // Buscamos el ejercicio usando el servicio
        const exercise = await ExerciseService.getExerciseById(exerciseId);

        // Comprobamos si hemos encontrado el ejercicio
        if (exercise) {
            // Si existe devolvemos sus datos
            res.status(200).json({ exercise });
        } else {
            // Si no existe devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // En caso de error lo pasamos al siguiente middleware
        next(error);
    }
};

// Función para modificar los datos de un ejercicio
const updateExercise = async (req: Request<{ exerciseId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID del ejercicio de los parametros de la URL
    const exerciseId = req.params.exerciseId;

    try {
        // Pasamos al servicio el ID del ejercicio y los nuevos datos
        const exercise = await ExerciseService.updateExercise(exerciseId, req.body);

        // Comprobamos si se ha encontrado y actualizado el ejercicio
        if (exercise) {
            // Si todo ha ido bien devolvemos el ejercicio actualizado
            res.status(200).json({ exercise });
        } else {
            // Si no existe el ejercicio devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // Si ocurre algun error lo gestionamos mediante el siguiente middleware
        next(error);
    }
};

// Exportamos todas las funciones para poder utilizarlas desde las rutas
export default { createExercise, readExercise, updateExercise };
