import { HydratedDocument } from 'mongoose';

import User, { IUser, IUserModel } from '../models/User';
import { buildPageInfo, buildSort, escapeRegex, getSkip } from '../utils/pagination';

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

    // Buscamos el usuario usando el ID que hemos recibido.
    // Esta ruta es solo para ADMIN, que puede ver tambien los usuarios borrados logicamente
    return User.findById(userId);

};

// Borrado logico: el usuario sigue en la base de datos, pero marcado como borrado.
// Deja de salir en los listados y su email queda libre (indice unico parcial del modelo).
// Devuelve null si no existe o ya estaba borrado.
export const softDeleteUser = (userId: string): Promise<HydratedDocument<IUserModel> | null> => {

    return User.findOneAndUpdate({ _id: userId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });

};

// Borrado logico de varios usuarios a la vez. Devuelve cuantos se han borrado.
export const softDeleteManyUsers = async (ids: string[]): Promise<number> => {

    const result = await User.updateMany({ _id: { $in: ids }, isDeleted: false }, { isDeleted: true, deletedAt: new Date() });

    return result.modifiedCount;

};

// Borrado definitivo de varios usuarios a la vez.
export const hardDeleteManyUsers = async (ids: string[]): Promise<number> => {

    const result = await User.deleteMany({ _id: { $in: ids } });

    return result.deletedCount;

};

// Borrado definitivo: el usuario desaparece de la base de datos para siempre.
// Funciona tambien con usuarios ya borrados logicamente. Devuelve null si no existe.
export const hardDeleteUser = (userId: string): Promise<HydratedDocument<IUserModel> | null> => {

    return User.findByIdAndDelete(userId);

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

// Parametros de un listado: los que llegan ya validados por ValidateQuery
// (sort es la columna por la que ordenar y order el sentido: asc o desc)
export type ListUsersInput = { page: number; limit: number; search?: string; sort?: string; order?: 'asc' | 'desc' };

// Devuelve una pagina de usuarios para el chat: solo _id y name.
// El buscador mira SOLO el nombre: este listado lo puede llamar cualquier usuario con sesion
// y no debe permitir descubrir emails de otros (por eso tampoco hay filtro por rol).
// El ADMIN ve todos los usuarios, tambien los borrados logicamente; cualquier otra sesion
// solo ve los activos, que es lo que necesita el chat.
export const listUsers = async ({ page, limit, search, sort, order }: ListUsersInput, isAdmin: boolean) => {

    // El ADMIN consulta todo, asi que su filtro empieza vacio; el resto empieza solo con los activos
    const filter: Record<string, unknown> = isAdmin ? {} : { isDeleted: false };

    // Buscador: el nombre contiene el texto, sin distinguir mayusculas
    if (search) {
        filter.name = new RegExp(escapeRegex(search), 'i');
    }

    // El nombre no es unico, asi que desempatamos con _id para que el orden sea estable entre paginas
    const [users, total] = await Promise.all([
        // Ordenamos por la columna pedida (por defecto el nombre)
        User.find(filter).select(isAdmin ? '_id name isDeleted' : '_id name').sort(buildSort(sort, order, 'name')).skip(getSkip(page, limit)).limit(limit).lean(),
        User.countDocuments(filter)
    ]);

    return { users, pagination: buildPageInfo(page, limit, total) };

};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {

    createUser,

    getUserById,

    updateUser,

    softDeleteUser,

    hardDeleteUser,

    softDeleteManyUsers,

    hardDeleteManyUsers,

    listUsers

};
