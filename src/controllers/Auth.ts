import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/AuthService';

// Función para registrar un usuario nuevo
// Según el contrato, el registro no devuelve token: el frontend lleva al usuario a la página de login
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.register(req.body);

        // 201 porque se ha creado un recurso nuevo
        res.status(201).json({ user });
    } catch (error) {
        // Si el email ya existe, el ErrorHandler responde 409
        next(error);
    }
};

// Función para iniciar sesión
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body.email, req.body.password);

        if (result) {
            // Devolvemos { token, refreshToken, user }
            res.status(200).json(result);
        } else {
            // 401: no se ha podido identificar al usuario
            res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }
    } catch (error) {
        next(error);
    }
};

// Función para iniciar sesión en el backoffice: solo entra un usuario con rol ADMIN
const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.adminLogin(req.body.email, req.body.password);

        if (!result) {
            // 401: no se ha podido identificar al usuario, igual que en /auth/login
            res.status(401).json({ message: 'Email o contraseña incorrectos' });
        } else if (result === 'FORBIDDEN') {
            // 403: sé quién eres, pero no eres administrador.
            // El mensaje es el mismo que devuelve RequireRole, así el frontend muestra uno solo
            res.status(403).json({ message: 'Necesitas el rol ADMIN' });
        } else {
            // Es ADMIN: devolvemos { token, refreshToken, user }
            res.status(200).json(result);
        }
    } catch (error) {
        next(error);
    }
};

// Función para pedir un access token nuevo con el refresh token
const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.refresh(req.body.refreshToken);

        if (result) {
            // Devolvemos { token }
            res.status(200).json(result);
        } else {
            res.status(401).json({ message: 'El usuario ya no existe' });
        }
    } catch (error) {
        // Si el refresh token está caducado o no es válido, el ErrorHandler responde 401
        next(error);
    }
};

export default { register, login, adminLogin, refresh };
