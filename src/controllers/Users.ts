import { NextFunction, Request, Response } from 'express';
import UserService from '../services/UserService';

// Devuelve los datos básicos de los usuarios (id y nombre) con paginación y buscador,
// para que el frontend pueda mostrarlos y usarlos al iniciar un chat directo.
const listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // El servicio necesita saber el rol de la sesion: el ADMIN ve todos los usuarios
        // (tambien los borrados) y cualquier otra sesion solo los activos
        const isAdmin = req.user?.role === 'ADMIN';

        // ValidateQuery ya ha comprobado y convertido los parametros de la URL
        const result = await UserService.listUsers(res.locals.query, isAdmin);

        // Devolvemos { users, pagination }
        res.status(200).json(result);
    } catch (error) {
        // El middleware de errores de Express se encarga de responder ante fallos.
        next(error);
    }
};

// Función para crear un usuario nuevo
// El rol es opcional: si no se envía, el modelo asigna USER por defecto
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.createUser(req.body);

        // Si se ha creado correctamente devolvemos el usuario creado
        // El codigo 201 indica que se ha creado un recurso nuevo
        res.status(201).json({ user });
    } catch (error) {
        // Si ocurre algun error lo pasamos al siguiente middleware
        // para que se encargue de gestionarlo
        next(error);
    }
};

// Función para buscar un usuario concreto a partir de su ID
// El modelo quita la contraseña en el toJSON, asi que la respuesta nunca la lleva
const readUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID del usuario que viene en los parametros de la URL
    const userId = req.params.userId;

    try {
        // Buscamos el usuario usando el servicio
        const user = await UserService.getUserById(userId);

        // Comprobamos si hemos encontrado el usuario
        if (user) {
            // Si existe devolvemos sus datos
            res.status(200).json({ user });
        } else {
            // Si no existe devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // En caso de error lo pasamos al siguiente middleware
        next(error);
    }
};

// Función para modificar los datos de un usuario
const updateUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    // Cogemos el ID del usuario de los parametros de la URL
    const userId = req.params.userId;

    try {
        // Pasamos al servicio el ID del usuario y los nuevos datos
        const user = await UserService.updateUser(userId, req.body);

        // Comprobamos si se ha encontrado y actualizado el usuario
        if (user) {
            // Si todo ha ido bien devolvemos el usuario actualizado
            res.status(200).json({ user });
        } else {
            // Si no existe el usuario devolvemos un error 404
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        // Si ocurre algun error lo gestionamos mediante el siguiente middleware
        next(error);
    }
};

// Exportamos todas las funciones para poder utilizarlas desde las rutas
export default { listUsers, createUser, readUser, updateUser };