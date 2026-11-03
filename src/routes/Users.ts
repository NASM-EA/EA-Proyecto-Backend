import express from 'express';
import controller from '../controllers/Users';

import { Schemas, ValidateId, ValidateJoi, ValidateQuery } from '../middleware/Joi';
import { RequireRole } from '../middleware/RequireRole';

// Agrupa las rutas relacionadas con los usuarios.
const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Lista los usuarios disponibles para el chat
 *     description: >
 *       Devuelve solo el id y el nombre de cada usuario, con paginación y buscador por nombre.
 *       Cualquier usuario con token puede consultarla. Un ADMIN ve también los usuarios borrados;
 *       el resto solo ve los activos.
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
 *         name: sort
 *         description: Columna por la que se ordena (por defecto name)
 *         schema: { type: string, enum: [name] }
 *       - in: query
 *         name: order
 *         description: Sentido del orden (por defecto asc)
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Una página de usuarios con su id y su nombre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, example: 6ab3f2fe9c500204a7d5f8a1 }
 *                       name: { type: string, example: Admin }
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
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Devuelve el listado de usuarios disponibles.
router.get('/', ValidateQuery(Schemas.query.user), controller.listUsers);

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Crea un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/UserOne' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear un usuario nuevo
// Las escrituras son solo para ADMIN: un usuario normal no puede crearse ni crearse a si mismo
// como ADMIN. Despues comprobamos que los datos cumplen el esquema de Joi.
router.post('/', RequireRole('ADMIN'), ValidateJoi(Schemas.user.create), controller.createUser);

/**
 * @openapi
 * /users:
 *   delete:
 *     tags: [Users]
 *     summary: Borrado lógico de varios usuarios
 *     description: >
 *       Marca como borrados (isDeleted) los usuarios cuyos ids se envían en el cuerpo. Los que no existen
 *       o ya estaban borrados no cuentan. Si la lista incluye al propio admin responde 400. Solo ADMIN.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       200:
 *         description: Cuántos se han borrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Borrado logico multiple. Va antes de las rutas con :id para que "hard" no se tome por un id
router.delete('/', RequireRole('ADMIN'), ValidateJoi(Schemas.bulkDelete), controller.softDeleteManyUsers);

/**
 * @openapi
 * /users/hard:
 *   delete:
 *     tags: [Users]
 *     summary: Borrado definitivo de varios usuarios
 *     description: >
 *       Elimina de la base de datos los usuarios cuyos ids se envían en el cuerpo. No se puede deshacer.
 *       Si la lista incluye al propio admin responde 400. Solo ADMIN.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       200:
 *         description: Cuántos se han eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Borrado definitivo multiple
router.delete('/hard', RequireRole('ADMIN'), ValidateJoi(Schemas.bulkDelete), controller.hardDeleteManyUsers);

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Devuelve un usuario
 *     description: La respuesta nunca lleva la contraseña; el modelo la quita en el toJSON.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1ad9ada2730451295a7
 *     responses:
 *       200: { $ref: '#/components/responses/UserOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar un usuario por su ID
// Solo ADMIN: el detalle devuelve el email y el rol de otro usuario, y eso no lo necesita el chat
// (para el chat esta el listado de arriba, que solo lleva el id y el nombre).
// Antes de llamar al controlador comprobamos que el ID tiene el formato correcto
router.get('/:userId', RequireRole('ADMIN'), ValidateId('userId'), controller.readUser);

/**
 * @openapi
 * /users/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Reemplaza los datos de un usuario
 *     description: >
 *       Hay que enviar el usuario entero, no solo los campos que cambian.
 *       La contraseña es opcional: si no se envia, se queda la que ya tenia.
 *       La respuesta nunca lleva la contraseña.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/UserOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar un usuario
// Solo ADMIN: si no, cualquier usuario podria cambiarse el rol o la contraseña de otro.
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:userId', RequireRole('ADMIN'), ValidateId('userId'), ValidateJoi(Schemas.user.update), controller.updateUser);

/**
 * @openapi
 * /users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Borrado lógico de un usuario
 *     description: >
 *       Marca al usuario como borrado (isDeleted). Sigue en la base de datos, pero deja de salir
 *       en los listados y su email queda libre. Solo ADMIN. Un admin no puede borrarse a sí mismo.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Usuario borrado lógicamente }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado logico: solo ADMIN
router.delete('/:userId', RequireRole('ADMIN'), ValidateId('userId'), controller.softDeleteUser);

/**
 * @openapi
 * /users/{userId}/hard:
 *   delete:
 *     tags: [Users]
 *     summary: Borrado definitivo de un usuario
 *     description: >
 *       Elimina al usuario de la base de datos para siempre. No se puede deshacer.
 *       Solo ADMIN. Un admin no puede borrarse a sí mismo.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Usuario eliminado de la base de datos }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Borrado definitivo: solo ADMIN
router.delete('/:userId/hard', RequireRole('ADMIN'), ValidateId('userId'), controller.hardDeleteUser);

export = router;
