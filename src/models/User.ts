import mongoose, { Document, Schema } from 'mongoose';

import Logging from '../library/Logging';
import { hashPassword } from '../utils/password';

// Roles que puede tener un usuario.
// ADMIN gestiona el backoffice (ejercicios, rutinas y usuarios); USER solo puede usar el chat.
export const USER_ROLES = ['ADMIN', 'USER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Definimos los datos que puede tener un usuario.
// Un usuario es quien inicia sesion en la aplicacion; no es un dato del gimnasio como un ejercicio o una rutina.
export interface IUser {
    name: string;

    email: string;

    password: string;

    role: UserRole;
}

// Esta interfaz junta los datos del usuario con las propiedades de un documento de MongoDB
export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
    {
        // El nombre es el que se ve en la aplicacion (por ejemplo, en el chat)
        name: { type: String, required: true, trim: true },

        // El email es con lo que se inicia sesion, asi que no puede repetirse.
        // Lo guardamos en minusculas para que Ana@example.com y ana@example.com sean el mismo.
        // El unique no se pone aqui: lo definimos con UserSchema.index mas abajo,
        // porque al ser un indice parcial necesitamos una opcion que el campo no admite
        email: { type: String, required: true, lowercase: true, trim: true },

        // La contraseña se guarda cifrada (ver el hook de abajo) y no sale en las consultas:
        // para leerla hay que pedirla a proposito con .select('+password')
        password: { type: String, required: true, select: false },

        // Si no se indica, un usuario nuevo es USER. Los ADMIN se crean con el seed
        role: { type: String, enum: USER_ROLES, default: 'USER' },

        // Marca de borrado logico: no borramos el usuario de la base de datos, solo lo ocultamos
        isDeleted: { type: Boolean, default: false },

        // Fecha en la que se hizo el borrado logico (null si sigue activo)
        deletedAt: { type: Date, default: null }
    },
    {
        // Mongoose crea automaticamente las fechas de creacion y actualizacion
        timestamps: true,

        // Quitamos el campo que usa Mongoose para controlar las versiones
        versionKey: false,

        // Al convertir el usuario a JSON quitamos la contraseña, por si alguna vez se ha leido
        toJSON: {
            transform: (document, result: Record<string, unknown>) => {
                delete result.password;

                return result;
            }
        }
    }
);

// Definimos un indice unico parcial sobre el email: solo cuenta para los usuarios activos.
// Asi un email borrado (isDeleted: true) deja de bloquear el registro de uno nuevo.
// Tiene que ir con UserSchema.index porque la opcion partialFilterExpression
// no se puede pasar dentro de las opciones del campo email: Mongoose la ignoraria.
UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Este hook se ejecuta antes de guardar un usuario en la base de datos
UserSchema.pre('save', async function () {
    // Si la contraseña no ha cambiado no la volvemos a cifrar
    // (cifrariamos una contraseña que ya esta cifrada)
    if (!this.isModified('password')) {
        return;
    }

    // Guardamos la contraseña cifrada en lugar de la original
    this.password = await hashPassword(String(this.password));
});

// Este hook se ejecuta despues de guardar correctamente el usuario
UserSchema.post('save', function (user) {
    // Simulamos el envio de un email de bienvenida
    // En este caso simplemente lo mostramos en los logs
    Logging.info(`Email simulation: welcome email sent to ${user.email}`);
});

export default mongoose.model<IUserModel>('User', UserSchema);
