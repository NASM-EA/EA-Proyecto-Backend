import { HydratedDocument } from 'mongoose';

import User, { IUser, IUserModel } from '../models/User';

// Datos que hacen falta para crear un usuario.
// El nombre, el email y la contraseña son obligatorios; el rol es opcional
// (si no se indica, el modelo asigna USER por defecto).
export type NewUser = Pick<IUser, 'name' | 'email' | 'password'> & { role?: IUser['role'] };

// Datos que se pueden actualizar de un usuario. Todos son opcionales.
export type UpdateUserInput = Partial<Pick<IUser, 'name' | 'email' | 'role' | 'password'>>;

// Funcion que se encarga de crear un usuario en la base de datos
export const createUser = (data: NewUser): Promise<HydratedDocument<IUserModel>> => {

    // Creamos un nuevo usuario usando los datos que hemos recibido.
    // No ciframos aqui la contraseña: el hook pre('save') del modelo se encarga de hacerlo.
    const user = new User(data);

    // Guardamos el usuario en la base de datos y devolvemos el resultado.
    // Si el email ya existe entre los usuarios activos, MongoDB lanza un error 11000.
    return user.save();

};

// Funcion que busca un usuario por su ID en la base de datos
export const getUserById = (userId: string): Promise<HydratedDocument<IUserModel> | null> => {

    // Buscamos el usuario usando el ID que hemos recibido
    return User.findById(userId);

};

// Funcion que se encarga de actualizar un usuario
export const updateUser = (userId: string, data: UpdateUserInput): Promise<HydratedDocument<IUserModel> | null> => {

    // Buscamos primero el usuario que queremos actualizar.
    // Filtramos isDeleted: false para que un usuario borrado logicamente no se pueda actualizar
    // (devolvera null y el controlador respondera 404).
    return User.findOne({ _id: userId, isDeleted: false }).then(async (user) => {

        // Si no existe ningun usuario con ese ID devolvemos null
        if (!user) {

            return null;

        }

        // Actualizamos los datos del usuario con los nuevos datos recibidos.
        // Usamos save() en lugar de update para que el hook pre('save')
        // vuelva a cifrar la contraseña si ha cambiado.
        Object.assign(user, data);

        // Guardamos los cambios en la base de datos
        return user.save();

    });

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createUser,

    getUserById,

    updateUser

};
