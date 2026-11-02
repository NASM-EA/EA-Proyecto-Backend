// Pasa al enum actual (ADMIN/USER) los roles que quedaron en minuscula; se ejecuta con npm run migrate-roles.

import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import User, { USER_ROLES } from './models/User';

const LEGACY_ROLES: Record<string, string> = {
    admin: 'ADMIN',
    user: 'USER'
};

const migrateRoles = async () => {
    await mongoose.connect(config.mongo.url);
    Logging.info(`Conectado a ${config.mongo.url}`);

    for (const [legacyRole, currentRole] of Object.entries(LEGACY_ROLES)) {
        const result = await User.collection.updateMany({ role: legacyRole }, { $set: { role: currentRole } });

        if (result.modifiedCount > 0) {
            Logging.info(`Rol '${legacyRole}' -> '${currentRole}': ${result.modifiedCount} usuarios`);
        }
    }

    const unknown = await User.collection.find({ role: { $nin: [...USER_ROLES] } }, { projection: { email: 1, role: 1 } }).toArray();

    if (unknown.length > 0) {
        Logging.warning(`Hay ${unknown.length} usuarios con un rol que no esta en USER_ROLES; no se han tocado:`);

        for (const user of unknown) {
            Logging.warning(`  ${user.email}: '${user.role}'`);
        }
    } else {
        Logging.info('No queda ningun usuario con un rol fuera de USER_ROLES');
    }

    for (const role of USER_ROLES) {
        const count = await User.countDocuments({ role });
        Logging.info(`Usuarios con rol ${role}: ${count}`);
    }
};

migrateRoles()
    .catch((error) => {
        Logging.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
