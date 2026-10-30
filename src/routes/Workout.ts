import express from 'express';

import controller from '../controllers/Workout';

import { Schemas, ValidateId, ValidateJoi } from '../middleware/Joi';

// Creamos el router que se encargara de las rutas relacionadas con las rutinas
const router = express.Router();

/**
 * @openapi
 * /workouts:
 *   post:
 *     tags: [Workouts]
 *     summary: Crea una rutina
 *     description: >
 *       Los ejercicios se envian como una lista de ids (textos) de ejercicios ya existentes.
 *       La respuesta devuelve la rutina guardada, con esos mismos ids en exercises.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WorkoutInput' }
 *     responses:
 *       201:
 *         description: Rutina creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Workout' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear una rutina nueva
// Primero comprobamos que los datos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createWorkout del controlador
router.post('/', ValidateJoi(Schemas.workout.create), controller.createWorkout);

/**
 * @openapi
 * /workouts/{workoutId}:
 *   get:
 *     tags: [Workouts]
 *     summary: Devuelve una rutina con sus ejercicios completos
 *     description: >
 *       Los ejercicios se guardan como ids, pero esta respuesta los devuelve ya resueltos:
 *       cada elemento de exercises es un objeto Exercise entero, no un id.
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1ad9ada2730451295a7
 *     responses:
 *       200: { $ref: '#/components/responses/WorkoutOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar una rutina por su ID
// Antes de llamar al controlador comprobamos que el ID tiene el formato correcto
router.get('/:workoutId', ValidateId('workoutId'), controller.readWorkout);

/**
 * @openapi
 * /workouts/{workoutId}:
 *   put:
 *     tags: [Workouts]
 *     summary: Reemplaza los datos de una rutina
 *     description: >
 *       Hay que enviar la rutina entera, no solo los campos que cambian.
 *       Los ejercicios se envian como una lista de ids (textos) de ejercicios ya existentes.
 *       La respuesta devuelve la rutina actualizada, con esos mismos ids en exercises.
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WorkoutInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/WorkoutOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar una rutina
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:workoutId', ValidateId('workoutId'), ValidateJoi(Schemas.workout.update), controller.updateWorkout);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
