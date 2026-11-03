import express from 'express';

import controller from '../controllers/Exercise';

import { Schemas, ValidateId, ValidateJoi, ValidateQuery  } from '../middleware/Joi';
import { RequireRole } from '../middleware/RequireRole';

// Creamos el router que se encargara de las rutas relacionadas con los ejercicios
const router = express.Router();

/**
 * @openapi
 * /exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Crea un ejercicio
 *     description: Solo un ADMIN puede crear ejercicios.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ExerciseInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/ExerciseOne' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

/**
 * @openapi
 * /exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: Lista los ejercicios con paginación y buscador
 *     description: >
 *       Cualquier sesión con token puede consultarlo. Un ADMIN ve todos los ejercicios, también los
 *       que están borrados; el resto de usuarios solo ve los activos.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: search
 *         description: Texto que debe contener el nombre (sin distinguir mayúsculas)
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE, CARDIO] }
 *       - in: query
 *         name: sort
 *         description: Columna por la que se ordena (por defecto name)
 *         schema: { type: string, enum: [name, category, sets, reps] }
 *       - in: query
 *         name: order
 *         description: Sentido del orden (por defecto asc)
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Una página de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercises:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Exercise' }
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
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para listar ejercicios: primero validamos los parametros de la URL
// La lectura la puede hacer cualquier sesion: el controlador pasa el rol al servicio
// y el servicio decide si devuelve solo los activos o todos
router.get('/', ValidateQuery(Schemas.query.exercise), controller.listExercises);

// Ruta para crear un ejercicio nuevo
// Solo ADMIN: escribir en el catalogo es cosa del backoffice
// Primero comprobamos que los datos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createExercise del controlador
router.post('/', RequireRole('ADMIN'), ValidateJoi(Schemas.exercise.create), controller.createExercise);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Devuelve un ejercicio
 *     description: >
 *       Cualquier sesión con token puede consultarlo. Un ADMIN ve también los ejercicios borrados;
 *       para el resto, un ejercicio borrado responde 404.
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
 *     description: Hay que enviar el ejercicio entero, no solo los campos que cambian. Solo un ADMIN puede modificarlo.
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
// Solo ADMIN, igual que la creacion: el catalogo lo mantiene el backoffice
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:exerciseId', RequireRole('ADMIN'), ValidateId('exerciseId'), ValidateJoi(Schemas.exercise.update), controller.updateExercise);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Borrado lógico de un ejercicio
 *     description: >
 *       Marca el ejercicio como borrado (isDeleted). Sigue en la base de datos, pero deja de salir
 *       en los listados y su nombre queda libre. Solo ADMIN.
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Ejercicio borrado lógicamente }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado logico: solo marca el ejercicio como borrado
router.delete('/:exerciseId', RequireRole('ADMIN'), ValidateId('exerciseId'), controller.softDeleteExercise);

/**
 * @openapi
 * /exercises/{exerciseId}/hard:
 *   delete:
 *     tags: [Exercises]
 *     summary: Borrado definitivo de un ejercicio
 *     description: >
 *       Elimina el ejercicio de la base de datos para siempre y lo quita de las rutinas que lo usaban.
 *       No se puede deshacer. Solo ADMIN.
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Ejercicio eliminado de la base de datos }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado definitivo: elimina el ejercicio de la base de datos
router.delete('/:exerciseId/hard', RequireRole('ADMIN'), ValidateId('exerciseId'), controller.hardDeleteExercise);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
