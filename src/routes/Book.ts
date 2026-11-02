import express from 'express';

import controller from '../controllers/Book';

import { Schemas, ValidateId, ValidateJoi, ValidatePagination } from '../middleware/Joi';

// Creamos el router que se encargara de las rutas relacionadas con los libros
const router = express.Router();

/**
 * @openapi
 * /books:
 *   post:
 *     tags: [Books]
 *     summary: Crea un libro
 *     description: Un libro necesita al menos un autor, y cada autor se indica con su id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookInput' }
 *     responses:
 *       201:
 *         description: Libro creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Book' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear un libro nuevo
// Primero comprobamos que los datos recibidos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createBook del controlador
router.post('/', ValidateJoi(Schemas.book.create), controller.createBook);

/**
 * @openapi
 * /books/{bookId}:
 *   get:
 *     tags: [Books]
 *     summary: Devuelve un libro, con los datos de sus autores
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1c247a7d5e4fe530049
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar un libro usando su ID
// Antes de llamar al controlador comprobamos que el ID tenga un formato valido
router.get('/:bookId', ValidateId('bookId'), controller.readBook);

/**
 * @openapi
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Lista todos los libros, con los datos de sus autores
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 5 }
 *         description: Número de libros por página
 *       - in: query
 *         name: search
 *         schema: { type: string, maxLength: 100 }
 *         description: Buscar por título, ISBN o descripción
 *       - in: query
 *         name: sort
 *         schema: { type: string, maxLength: 30 }
 *         description: 'Campo por el que ordenar (title, authors, language, publishedYear, price)'
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *         description: Sentido del orden
 *     responses:
 *       200: { $ref: '#/components/responses/BookList' }
 *       400: { $ref: '#/components/responses/InvalidPagination' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para obtener todos los libros
router.get('/', ValidatePagination, controller.readAll);

/**
 * @openapi
 * /books/{bookId}:
 *   put:
 *     tags: [Books]
 *     summary: Reemplaza los datos de un libro
 *     description: Hay que enviar el libro entero, no solo los campos que cambian.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar un libro
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:bookId', ValidateId('bookId'), ValidateJoi(Schemas.book.update), controller.updateBook);

/**
 * @openapi
 * /books/{bookId}:
 *   delete:
 *     tags: [Books]
 *     summary: Borra un libro (borrado logico)
 *     description: >
 *       No se elimina fisicamente: el libro se marca como borrado (soft delete)
 *       y deja de aparecer en el listado y en las busquedas por ID.
 *       Su ISBN queda libre para que otro libro pueda usarlo.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Libro marcado como borrado, sin contenido }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para eliminar un libro usando su ID
// Comprobamos primero que el ID tenga un formato valido
router.delete('/:bookId', ValidateId('bookId'), controller.deleteBook);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
