import express from 'express';

import controller from '../controllers/Author';

import { Schemas, ValidateId, ValidateJoi, ValidatePagination } from '../middleware/Joi';

// Creamos el router que se encargara de las rutas relacionadas con los autores
const router = express.Router();

/**
 * @openapi
 * /authors:
 *   post:
 *     tags: [Authors]
 *     summary: Crea un autor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorInput' }
 *     responses:
 *       201:
 *         description: Autor creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Author' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear un autor nuevo
// Primero comprobamos que los datos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createAuthor del controlador
router.post('/', ValidateJoi(Schemas.author.create), controller.createAuthor);

/**
 * @openapi
 * /authors/{authorId}:
 *   get:
 *     tags: [Authors]
 *     summary: Devuelve un autor
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1ad9ada2730451295a7
 *     responses:
 *       200: { $ref: '#/components/responses/AuthorOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar un autor por su ID
// Antes de llamar al controlador comprobamos que el ID tiene el formato correcto
router.get('/:authorId', ValidateId('authorId'), controller.readAuthor);

/**
 * @openapi
 * /authors:
 *   get:
 *     tags: [Authors]
 *     summary: Lista todos los autores
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 5 }
 *         description: Número de autores por página
 *       - in: query
 *         name: search
 *         schema: { type: string, maxLength: 100 }
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: sort
 *         schema: { type: string, maxLength: 30 }
 *         description: 'Campo por el que ordenar (name, email, nationality, birthDate, active)'
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *         description: Sentido del orden
 *     responses:
 *       200: { $ref: '#/components/responses/AuthorList' }
 *       400: { $ref: '#/components/responses/InvalidPagination' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para obtener todos los autores
router.get('/', ValidatePagination, controller.readAll);

/**
 * @openapi
 * /authors/{authorId}:
 *   put:
 *     tags: [Authors]
 *     summary: Reemplaza los datos de un autor
 *     description: Hay que enviar el autor entero, no solo los campos que cambian.
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/AuthorOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar un autor
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:authorId', ValidateId('authorId'), ValidateJoi(Schemas.author.update), controller.updateAuthor);

/**
 * @openapi
 * /authors/{authorId}:
 *   delete:
 *     tags: [Authors]
 *     summary: Borra un autor (borrado logico)
 *     description: >
 *       No se elimina fisicamente: el autor se marca como borrado (soft delete)
 *       y deja de aparecer en el listado y en las busquedas por ID.
 *       Su email queda libre para que otro autor pueda usarlo.
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Autor marcado como borrado, sin contenido }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para eliminar un autor por su ID
// Comprobamos primero que el ID tenga un formato valido
router.delete('/:authorId', ValidateId('authorId'), controller.deleteAuthor);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
