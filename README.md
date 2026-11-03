# EA-Proyecto-Backend

## Instalar las dependencias

```
npm install
```

Antes de arrancar, copia la plantilla de variables de entorno. Sin `JWT_SECRET` y `JWT_REFRESH_SECRET` la API
no arranca:

```
cp .env.example .env
```

## Ejecutar

Mientras programas, arranca la API en modo desarrollo; se reinicia sola cada vez que guardas un archivo:

```
npm run dev
```

Comprueba que responde en <http://localhost:1337/ping> (debe devolver `{"hello":"world"}`). La
documentación de la API está en <http://localhost:1337/api-docs>.

Para ejecutar la versión compilada, como en un servidor:

```
npm run build
npm start
```

`npm run build` compila de TypeScript a JavaScript en `build/`. Si cambias el código, vuelve a ejecutarlo
antes de `npm start`.

Para analizar el código con Oxlint (solo `src/`, porque `build/` es código generado):

```
npm run lint
```

Y para aplicar las correcciones automáticas que tenga:

```
npm run lint:fix
```

## Endpoints

Todo salvo `/auth/*`, `/ping` y `/api-docs` pide el token en la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/auth/register` | cualquiera | Crea un usuario `USER`: 201 `{ user }`, sin token |
| POST | `/auth/login` | cualquiera | Devuelve `{ token, refreshToken, user }` o 401 |
| POST | `/auth/admin/login` | solo `ADMIN` | Login del backoffice: 200 igual que `/auth/login`, 401 si las credenciales no son correctas, 403 si el usuario no es `ADMIN` |
| POST | `/auth/refresh` | su refresh token | Devuelve un `{ token }` nuevo o 401 |
| GET | `/users` | cualquier sesión | Lista de usuarios para el chat: solo `_id` y `name` |
| POST | `/users` | `ADMIN` | Crea un usuario: 201 `{ user }` |
| GET | `/users/:userId` | `ADMIN` | Devuelve `{ user }` o 404 |
| PUT | `/users/:userId` | `ADMIN` | Actualiza el usuario: 200 `{ user }` o 404 |
| POST | `/exercises` | `ADMIN` | Crea un ejercicio: 201 `{ exercise }` |
| GET | `/exercises/:exerciseId` | `ADMIN` | Devuelve `{ exercise }` o 404 |
| PUT | `/exercises/:exerciseId` | `ADMIN` | Actualiza el ejercicio: 200 `{ exercise }` o 404 |
| POST | `/workouts` | `ADMIN` | Crea una rutina: 201 `{ workout }` |
| GET | `/workouts/:workoutId` | `ADMIN` | Devuelve `{ workout }` con sus ejercicios completos |
| PUT | `/workouts/:workoutId` | `ADMIN` | Actualiza la rutina: 200 `{ workout }` o 404 |
| GET | `/ping` | cualquiera | Healthcheck: `{ hello: 'world' }` |

No hay listados ni `DELETE`: cada servicio solo crea, lee por id y actualiza. Los cuerpos que se envían:

- **Ejercicios**: `name`, `category` (una de `CHEST`, `BACK`, `LEGS`, `SHOULDERS`, `ARMS`, `CORE`, `CARDIO`),
  `sets` y `reps` (enteros, opcionales).
- **Rutinas**: `name`, `description` (opcional), `dayOfWeek` (de `MONDAY` a `SUNDAY`) y `exercises`, que se
  envía como lista de ids de ejercicio y se devuelve como lista de objetos `Exercise` completos al leer por id.
- **Usuarios**: `name`, `email`, `password` (8 caracteres como mínimo) y `role` (`ADMIN` o `USER`).

## Estructura del proyecto

```
src/
  server.ts        Punto de entrada: conecta con MongoDB, registra middleware y rutas, y arranca el servidor y el chat
  seed.ts          Script que llena la base de datos con los datos de ejemplo
  migrate-roles.ts Script de una sola vez: pasa los roles antiguos (admin, user) a ADMIN y USER
  seed-data.ts     Los datos de ejemplo: usuarios, ejercicios y rutinas
  config/
    config.ts        Lee las variables de entorno y las reúne en un objeto config
    swagger.ts       Monta el documento de Swagger con los esquemas de Joi y las rutas
  library/
    Logging.ts       Mensajes de consola con fecha y color (info, warning, error)
  routes/          El mapa de URLs: qué petición va a qué controlador
    Auth.ts, Users.ts, Exercise.ts, Workout.ts
  controllers/     Leen la petición (req), llaman al servicio y eligen la respuesta (res)
    Auth.ts, Users.ts, Exercise.ts, Workout.ts
  services/        Leen y escriben en la base de datos a través de los modelos. No saben que existe HTTP
    AuthService.ts, UserService.ts, ExerciseService.ts, WorkoutService.ts
  models/          Esquemas de Mongoose: qué campos tiene cada documento y de qué tipo
    User.ts, Exercise.ts, Workout.ts, Message.ts
  middleware/      Lo que se ejecuta entre la ruta y el controlador
    VerifyToken.ts   Comprueba el token de la cabecera Authorization y deja el usuario en req.user (401)
    RequireRole.ts   Deja pasar solo a un rol concreto (403)
    Joi.ts           Guardas: validan el body (422) y el id de la URL (400)
    SocketAuth.ts    Lo mismo que VerifyToken, para la conexión del chat
    Cors.ts          Cabeceras de CORS, configuradas con CORS_ORIGIN
    Logger.ts        Escribe en consola cada petición y su código de respuesta
    ErrorHandler.ts  Convierte cualquier error en su código: 400, 401, 404, 409, 422 o 500
  types/           Tipos compartidos: el payload de los tokens, los eventos del chat y req.user de Express
  utils/
    password.ts      Cifra y comprueba contraseñas con scrypt
```
