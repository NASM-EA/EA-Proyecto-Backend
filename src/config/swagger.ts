import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';
import j2s from 'joi-to-swagger';
import { Schemas } from '../middleware/Joi';
import { config } from './config';

// La documentación de cada endpoint está escrita en un comentario /** @openapi */
// encima de su ruta, en src/routes/. Aquí solo se montan las piezas comunes.

// Los esquemas del body salen de los mismos esquemas de Joi que validan las
// peticiones, así que no se pueden quedar desfasados.
const { swagger: registerInput } = j2s(Schemas.auth.register);
const { swagger: loginInput } = j2s(Schemas.auth.login);
const { swagger: refreshInput } = j2s(Schemas.auth.refresh);
const { swagger: userInput } = j2s(Schemas.user.create);
const { swagger: exerciseInput } = j2s(Schemas.exercise.create);
const { swagger: workoutInput } = j2s(Schemas.workout.create);

// Lo que devuelve la API no es igual a lo que se envía: lleva el _id, las fechas que
// pone MongoDB y las marcas del borrado lógico, que no se envían nunca en el body.
const storedFields = {
    _id: { type: 'string', example: '6ab3f2fe9c500204a7d5f80b' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    isDeleted: { type: 'boolean', example: false },
    deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null }
};

// El usuario se devuelve sin la contraseña. El rol sale del esquema de Joi, que a su vez
// sale del modelo, así que se documenta con los mismos valores: ADMIN y USER.
const { password: _password, ...userFields } = userInput.properties;

const userSchema = { type: 'object', properties: { ...storedFields, ...userFields } };

const exerciseSchema = { type: 'object', properties: { ...storedFields, ...exerciseInput.properties } };

// Una rutina guardada lleva los ejercicios como ids, porque así se envían y así se guardan.
const workoutSchema = { type: 'object', properties: { ...storedFields, ...workoutInput.properties } };

// Al leer una rutina por su id, el servicio hace populate y devuelve los ejercicios enteros.
const populatedWorkoutSchema = {
    type: 'object',
    properties: { ...storedFields, ...workoutInput.properties, exercises: { type: 'array', items: exerciseSchema } }
};

// Ejemplos que se ven en la página de Swagger, con datos del dominio del gimnasio
const exerciseExample = {
    _id: '6ab3f2fe9c500204a7d5f8b1',
    name: 'Press de banca',
    category: 'CHEST',
    sets: 4,
    reps: 10,
    createdAt: '2026-09-23T10:00:00.000Z',
    updatedAt: '2026-09-23T10:00:00.000Z',
    isDeleted: false,
    deletedAt: null
};

const workoutExample = {
    _id: '6ab3f2fe9c500204a7d5f8c1',
    name: 'Día de pecho',
    description: 'Press de banca y aperturas para terminar.',
    dayOfWeek: 'MONDAY',
    exercises: [exerciseExample._id],
    createdAt: '2026-09-23T10:00:00.000Z',
    updatedAt: '2026-09-23T10:00:00.000Z',
    isDeleted: false,
    deletedAt: null
};

const populatedWorkoutExample = { ...workoutExample, exercises: [exerciseExample] };

// Una respuesta correcta: el esquema de lo que se devuelve y un ejemplo con datos de verdad
const okResponse = (description: string, schema: object, example: object) => ({
    description,
    content: { 'application/json': { schema, example } }
});

// Una respuesta de error: siempre un message, con un ejemplo del mensaje real
const errorResponse = (description: string, message: string) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: { message: { type: 'string' } }
            },
            example: { message }
        }
    }
});

const userExample = {
    _id: '6ab3f2fe9c500204a7d5f8a1',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z',
    isDeleted: false,
    deletedAt: null
};

const swaggerPath = (filePath: string) => filePath.replace(/\\/g, '/');

const swaggerDocument = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gym API',
            version: '1.0.0',
            description: 'API de ejercicios, rutinas y usuarios del Seminari 7 (Node.js, Express, TypeScript y MongoDB).'
        },
        servers: [{ url: `http://localhost:${config.server.port}` }],
        tags: [
            { name: 'Health', description: 'Comprobar que la API responde' },
            { name: 'Auth', description: 'Registro, login y renovación del token' },
            { name: 'Exercises', description: 'Ejercicios del gimnasio' },
            { name: 'Workouts', description: 'Rutinas, con los ejercicios que las forman' },
            { name: 'Users', description: 'Usuarios del backoffice' }
        ],
        // Por defecto todas las rutas piden el token (el candado de Swagger).
        // Las rutas públicas lo quitan con security: [] en su comentario @openapi.
        security: [{ bearerAuth: [] }],
        components: {
            // Cómo se envía el token: en la cabecera Authorization: Bearer <token>.
            // En la página de Swagger se pega con el botón Authorize.
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                RegisterInput: registerInput,
                LoginInput: loginInput,
                RefreshInput: refreshInput,
                UserInput: userInput,
                User: userSchema,
                ExerciseInput: exerciseInput,
                Exercise: exerciseSchema,
                WorkoutInput: workoutInput,
                Workout: workoutSchema
            },
            responses: {
                LoginOk: okResponse(
                    'Sesión iniciada: el access token, el refresh token y el usuario',
                    {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                            refreshToken: { type: 'string' },
                            user: userSchema
                        }
                    },
                    { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: userExample }
                ),
                BadCredentials: errorResponse('El email o la contraseña no son correctos', 'Email o contraseña incorrectos'),
                Unauthorized: errorResponse('Falta el token, ha caducado o no es válido', 'El token ha caducado'),
                Forbidden: errorResponse('El usuario no tiene el rol necesario', 'Necesitas el rol ADMIN'),
                UserOne: okResponse('Un usuario, con la contraseña ya quitada', { type: 'object', properties: { user: userSchema } }, { user: userExample }),
                ExerciseOne: okResponse('Un ejercicio', { type: 'object', properties: { exercise: exerciseSchema } }, { exercise: exerciseExample }),
                WorkoutOne: okResponse(
                    'Una rutina con sus ejercicios completos',
                    { type: 'object', properties: { workout: populatedWorkoutSchema } },
                    { workout: populatedWorkoutExample }
                ),
                BadRequest: errorResponse('El id de la URL no tiene forma de id de MongoDB', 'exerciseId no es un id válido'),
                InvalidPagination: errorResponse('Los parámetros de paginación o búsqueda no son válidos', '"page" must be greater than or equal to 1'),
                NotFound: errorResponse('No existe ningún recurso con ese id', 'not found'),
                Conflict: errorResponse('Ya existe otro recurso con ese email o ese nombre', 'name ya existe'),
                Unprocessable: errorResponse('El body no cumple el esquema', '"name" is required'),
                ServerError: errorResponse('Error inesperado del servidor', 'Internal server error')
            }
        }
    },
    // __dirname es src/config con npm run dev y build/config con npm start:
    // en los dos casos se leen las rutas, porque al compilar se conservan los comentarios
    apis: [
        swaggerPath(path.join(__dirname, '../routes/*.ts')),
        swaggerPath(path.join(__dirname, '../routes/*.js')),
        swaggerPath(path.join(__dirname, '../server.ts')),
        swaggerPath(path.join(__dirname, '../server.js'))
    ]
});

export default swaggerDocument;
