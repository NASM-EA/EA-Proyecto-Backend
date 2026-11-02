import express from 'express';

import controller from '../controllers/Workout';

import { Schemas, ValidateId, ValidateJoi, ValidateQuery } from '../middleware/Joi';
import { RequireRole } from '../middleware/RequireRole';

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

/**
 * @openapi
 * /workouts:
 *   get:
 *     tags: [Workouts]
 *     summary: Lista las rutinas con paginación y buscador
 *     description: Cada rutina lleva sus ejercicios completos. El buscador mira el nombre y la descripción.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: search
 *         description: Texto que debe contener el nombre o la descripción (sin distinguir mayúsculas)
 *         schema: { type: string }
 *       - in: query
 *         name: dayOfWeek
 *         schema: { type: string, enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY] }
 *       - in: query
 *         name: sort
 *         description: Columna por la que se ordena (por defecto name)
 *         schema: { type: string, enum: [name, description, dayOfWeek] }
 *       - in: query
 *         name: order
 *         description: Sentido del orden (por defecto asc)
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Una página de rutinas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workouts:
 *                   type: array
 *                   items: { type: object }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *                     hasNextPage: { type: boolean }
 *                     hasPrevPage: { type: boolean }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para listar rutinas: primero validamos los parametros de la URL
router.get('/', ValidateQuery(Schemas.query.workout), controller.listWorkouts);

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
 *       200:
 *         description: Rutina actualizada. Al actualizar, los ejercicios se devuelven como ids, no como objetos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Workout' }
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
/**
 * @openapi
 * /workouts/{workoutId}:
 *   delete:
 *     tags: [Workouts]
 *     summary: Borrado lógico de una rutina
 *     description: >
 *       Marca la rutina como borrada (isDeleted). Sigue en la base de datos, pero deja de salir
 *       en los listados y su nombre queda libre. Solo ADMIN.
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Rutina borrada lógicamente }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado logico: solo marca la rutina como borrada
router.delete('/:workoutId', RequireRole('ADMIN'), ValidateId('workoutId'), controller.softDeleteWorkout);

/**
 * @openapi
 * /workouts/{workoutId}/hard:
 *   delete:
 *     tags: [Workouts]
 *     summary: Borrado definitivo de una rutina
 *     description: >
 *       Elimina la rutina de la base de datos para siempre. Sus ejercicios no se borran.
 *       No se puede deshacer. Solo ADMIN.
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Rutina eliminada de la base de datos }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado definitivo: elimina la rutina de la base de datos
router.delete('/:workoutId/hard', RequireRole('ADMIN'), ValidateId('workoutId'), controller.hardDeleteWorkout);

export = router;
