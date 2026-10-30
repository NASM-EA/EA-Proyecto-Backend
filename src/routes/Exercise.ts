import express from 'express';

import controller from '../controllers/Exercise';

import { Schemas, ValidateId, ValidateJoi } from '../middleware/Joi';

// Creamos el router que se encargara de las rutas relacionadas con los ejercicios
const router = express.Router();

/**
 * @openapi
 * /exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Crea un ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ExerciseInput' }
 *     responses:
 *       201:
 *         description: Ejercicio creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Exercise' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear un ejercicio nuevo
// Primero comprobamos que los datos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createExercise del controlador
router.post('/', ValidateJoi(Schemas.exercise.create), controller.createExercise);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Devuelve un ejercicio
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1ad9ada2730451295a7
 *     responses:
 *       200: { $ref: '#/components/responses/ExerciseOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar un ejercicio por su ID
// Antes de llamar al controlador comprobamos que el ID tiene el formato correcto
router.get('/:exerciseId', ValidateId('exerciseId'), controller.readExercise);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   put:
 *     tags: [Exercises]
 *     summary: Reemplaza los datos de un ejercicio
 *     description: Hay que enviar el ejercicio entero, no solo los campos que cambian.
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ExerciseInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/ExerciseOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar un ejercicio
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:exerciseId', ValidateId('exerciseId'), ValidateJoi(Schemas.exercise.update), controller.updateExercise);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
