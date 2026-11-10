import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import { Cors } from './middleware/Cors';
import Logging from './library/Logging';
import Logger from './middleware/Logger';
import ErrorHandler from './middleware/ErrorHandler';
import { VerifyToken } from './middleware/VerifyToken';
import authRoutes from './routes/Auth';
import exerciseRoutes from './routes/Exercise';
import workoutRoutes from './routes/Workout';
import swaggerUi from 'swagger-ui-express'; // permite mostrar Swagger en el navegador.
import swaggerDocument from './config/swagger'; // importa el documento que hemos creado en swagger.ts
const router = express();
import userRoutes from './routes/Users';

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
        StartServer();
    })
    .catch((error) => Logging.error(error));

/** Only Start Server if Mongoose Connects */
const StartServer = () => {
    router.use(Logger);

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** CORS */
    router.use(Cors);

    /** Routes */
    // Publicas: registro, login y refresh
    router.use('/auth', authRoutes);

    // Protegidas: VerifyToken comprueba el token (401 si falta o no vale) y deja el usuario
    // en req.user. La lectura de ejercicios y rutinas esta abierta a cualquier sesion: los
    // servicios ya devuelven solo los elementos activos a quien no es ADMIN (tarjeta SE-07).
    // Las escrituras siguen siendo solo de ADMIN y eso se comprueba en cada router.
    router.use('/exercises', VerifyToken, exerciseRoutes);
    router.use('/workouts', VerifyToken, workoutRoutes);
    // La lista de usuarios (solo id y nombre) la puede consultar cualquier usuario autenticado.
    // Las escrituras (POST y PUT) y el detalle por id son solo para ADMIN, y eso se comprueba
    // en src/routes/Users.ts, porque aquí el montaje es el mismo para todas las rutas del router.
    router.use('/users', VerifyToken, userRoutes);

    // La documentacion y el healthcheck son publicos
    router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    /** Healthcheck */
    /**
     * @openapi
     * /ping:
     *   get:
     *     tags: [Health]
     *     summary: Comprueba que la API está viva
     *     security: []
     *     responses:
     *       200:
     *         description: La API responde
     *         content:
     *           application/json:
     *             example: { hello: world }
     */
    router.get('/ping', (req, res) => res.status(200).json({ hello: 'world' }));

    /** Error handling */
    router.use((req, res, next) => {
        next(new Error('Not found'));
    });

    router.use(ErrorHandler);

    const server = http.createServer(router);
server.listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
