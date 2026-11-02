import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import Exercise from './models/Exercise';
import User from './models/User';
import Workout from './models/Workout';
import { exercisesSeed, usersSeed, workoutsSeed } from './seed-data';

// Llena la base de datos con los datos de ejemplo de seed-data.ts.
//
//   npm run seed             inserta los datos solo si la base de datos está vacía
//   npm run seed -- --reset  borra los usuarios, los ejercicios y las rutinas y vuelve a insertarlos
//
// Siempre trabaja sobre la base de datos del .env (MONGO_URL).

const reset = process.argv.includes('--reset');

const seed = async () => {
    await mongoose.connect(config.mongo.url);
    Logging.info(`Conectado a ${config.mongo.url}`);

    if (reset) {
        // Ojo: deleteMany({}) es un borrado fisico real y a proposito.
        // El reset del seed es el unico punto que hace borrado duro: asi tambien
        // se limpian los documentos que se habian borrado logicamente (soft delete).
        const users = await User.deleteMany({});
        const exercises = await Exercise.deleteMany({});
        const workouts = await Workout.deleteMany({});
        Logging.warning(`Borrados ${users.deletedCount} usuarios, ${exercises.deletedCount} ejercicios y ${workouts.deletedCount} rutinas`);
    }

    const usersInDb = await User.countDocuments();
    const exercisesInDb = await Exercise.countDocuments();
    const workoutsInDb = await Workout.countDocuments();

    if (usersInDb > 0 || exercisesInDb > 0 || workoutsInDb > 0) {
        Logging.warning('La base de datos ya tiene datos. Para rehacerla: npm run seed -- --reset');
        return;
    }

    // create() dispara los hooks del modelo: la contrasena del usuario se guarda cifrada
    const createdUsers = await User.create(usersSeed);
    Logging.info(`Usuarios creados: ${createdUsers.length}`);

    // Primero los ejercicios, porque las rutinas los referencian por su id
    const createdExercises = await Exercise.create(exercisesSeed);
    Logging.info(`Ejercicios creados: ${createdExercises.length}`);

    // Cada rutina trae los nombres de sus ejercicios; aquí se cambian por los ids que les ha dado MongoDB
    const workoutsWithExercises = workoutsSeed.map(({ exerciseNames, ...workout }) => {
        const exercises = exerciseNames.map((name) => {
            const exercise = createdExercises.find((created) => created.name === name);

            if (!exercise) {
                throw new Error(`En seed-data.ts hay una rutina con un ejercicio que no existe: ${name}`);
            }

            return exercise._id;
        });

        return { ...workout, exercises };
    });

    const createdWorkouts = await Workout.insertMany(workoutsWithExercises);
    Logging.info(`Rutinas creadas: ${createdWorkouts.length}`);
};

seed()
    .catch((error) => {
        Logging.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
