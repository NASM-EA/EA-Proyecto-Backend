import { IAuthor } from './models/Author';
import { IBook } from './models/Book';
import { IUser } from './models/User';

// Datos de ejemplo para llenar la base de datos.
// Los correos, las webs, los ISBN y los precios son inventados.

// Usuarios para iniciar sesión en la aplicación: uno de cada rol.
// Las contraseñas están sin cifrar y son públicas a propósito (ver el README):
// el hook pre-save del modelo User las cifra al guardarlas.
export const usersSeed: IUser[] = [
    {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'seminari7',
        role: 'ADMIN'
    },
    {
        name: 'Usuario',
        email: 'user@example.com',
        password: 'seminari7',
        role: 'USER'
    }
];

export const authorsSeed: IAuthor[] = [
    {
        name: 'Miguel de Cervantes',
        email: 'cervantes@example.com',
        birthDate: new Date('1547-09-29'),
        nationality: 'España',
        biography: 'Autor de El Quijote, la novela más conocida de la literatura española.',
        website: 'https://example.com/cervantes',
        photoUrl: 'https://example.com/fotos/cervantes.jpg',
        deleted: false
    },
    {
        name: 'Jorge Luis Borges',
        email: 'borges@example.com',
        birthDate: new Date('1899-08-24'),
        nationality: 'Argentina',
        biography: 'Escritor de cuentos y ensayos sobre laberintos, espejos y bibliotecas.',
        website: 'https://example.com/borges',
        photoUrl: 'https://example.com/fotos/borges.jpg',
        deleted: false
    },
    {
        name: 'Mercè Rodoreda',
        email: 'rodoreda@example.com',
        birthDate: new Date('1908-10-10'),
        nationality: 'España',
        biography: 'Una de las voces más importantes de la narrativa en catalán del siglo XX.',
        website: 'https://example.com/rodoreda',
        photoUrl: 'https://example.com/fotos/rodoreda.jpg',
        deleted: false
    },
    {
        name: 'Ursula K. Le Guin',
        email: 'leguin@example.com',
        birthDate: new Date('1929-10-21'),
        nationality: 'Estados Unidos',
        biography: 'Escritora de ciencia ficción y fantasía conocida por Terramar.',
        website: 'https://example.com/leguin',
        photoUrl: 'https://example.com/fotos/leguin.jpg',
        deleted: false
    },
    {
        name: 'Isaac Asimov',
        email: 'asimov@example.com',
        birthDate: new Date('1920-01-02'),
        nationality: 'Estados Unidos',
        biography: 'Autor de la saga de la Fundación y de las tres leyes de la robótica.',
        website: 'https://example.com/asimov',
        photoUrl: 'https://example.com/fotos/asimov.jpg',
        deleted: false
    },
    {
        name: 'Mary Shelley',
        email: 'shelley@example.com',
        nationality: 'Reino Unido',
        deleted: false
    },
    {
        name: 'Jane Austen',
        email: 'austen@example.com',
        nationality: 'Reino Unido',
        deleted: false
    },
    {
        name: 'Gabriel García Márquez',
        email: 'marquez@example.com',
        nationality: 'Colombia',
        deleted: false
    },
    {
        name: 'Julio Cortázar',
        email: 'cortazar@example.com',
        nationality: 'Argentina',
        deleted: false
    },
    {
        name: 'Toni Morrison',
        email: 'morrison@example.com',
        nationality: 'Estados Unidos',
        deleted: false
    },
    {
        name: 'George Orwell',
        email: 'orwell@example.com',
        nationality: 'Reino Unido',
        deleted: false
    },
    {
        name: 'Octavia E. Butler',
        email: 'butler@example.com',
        nationality: 'Estados Unidos',
        deleted: false
    }
];

// Cada libro dice de qué autores es con sus emails. El script del seed los cambia
// por los ids que MongoDB les ha dado.
// El campo 'deleted' tampoco se indica aquí: el esquema del libro lo pone en false por defecto.
export type BookSeed = Omit<IBook, 'authors' | 'deleted'> & { authorEmails: string[] };

export const booksSeed: BookSeed[] = [
    {
        title: 'Don Quijote de la Mancha',
        authorEmails: ['cervantes@example.com'],
        isbn: '9788400000001',
        edition: 3,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1605,
        pages: 863,
        language: 'es',
        tags: ['novela'],
        price: 19.9,
        description: [
            'En un lugar de la Mancha vive Alonso Quijano, un hidalgo apasionado por las novelas de caballerías hasta el punto de perder el juicio y creerse él mismo un caballero andante. Rebautizado como don Quijote de la Mancha y a lomos de su caballo Rocinante, decide lanzarse a los caminos en busca de aventuras, honra y justicia para consagrar sus hazañas a su amada Dulcinea del Toboso.',
            'Acompañado por el ingenuo pero pragmático campesino Sancho Panza, convertido en su fiel escudero, la pareja protagoniza una sucesión de desventuras cómicas y conmovedoras, transformando ventas en castillos, molinos de viento en gigantes amenazantes y rebaños de ovejas en ejércitos formidables.',
            'Obra cumbre de la literatura española y precursora indiscutible de la novela moderna, Cervantes teje una reflexión magistral sobre el choque entre los ideales heroicos y la cruda realidad del mundo cotidiano.'
        ].join('\n\n')
    },
    {
        title: 'Novelas ejemplares',
        authorEmails: ['cervantes@example.com'],
        isbn: '9788400000002',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1613,
        pages: 480,
        language: 'es',
        tags: ['novela'],
        price: 14.5
    },
    {
        title: 'Ficciones',
        authorEmails: ['borges@example.com'],
        isbn: '9788400000003',
        edition: 2,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1944,
        pages: 203,
        language: 'es',
        tags: ['novela', 'fantasia'],
        price: 12.0
    },
    {
        title: 'El Aleph',
        authorEmails: ['borges@example.com'],
        isbn: '9788400000004',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1949,
        pages: 224,
        language: 'es',
        tags: ['fantasia'],
        price: 12.5
    },
    {
        title: 'Otras inquisiciones',
        authorEmails: ['borges@example.com'],
        isbn: '9788400000005',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1952,
        pages: 206,
        language: 'es',
        tags: ['ensayo'],
        price: 11.0
    },
    {
        title: 'La plaça del Diamant',
        authorEmails: ['rodoreda@example.com'],
        isbn: '9788400000006',
        edition: 5,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1962,
        pages: 256,
        language: 'ca',
        tags: ['novela'],
        price: 13.9,
        description: [
            'Ambientada en el popular barrio de Gràcia en Barcelona, la historia sigue la vida de Natàlia, una joven tímida e ingenua a quien su primer marido, Quimet, apoda Colometa. A través de su mirada inocente y sensible, asistimos a la transformación de su rutina doméstica y a las dificultades de un matrimonio condicionado por las obsesiones de su esposo y la cría asfixiante de palomas.',
            'El estallido de la Guerra Civil española y la posterior posguerra destruyen de forma implacable el frágil entorno de Colometa. Sometida al hambre, a la pérdida y a la soledad más desgarradora en una ciudad sitiada por el miedo y la miseria, la protagonista emprende una lucha desesperada por sacar adelante a sus dos hijos.',
            'Considerada una de las obras capitales de la narrativa catalana del siglo XX, la novela destaca por su estilo íntimo y poético, convirtiéndose en un testimonio conmovedor sobre la resiliencia humana y el dolor silencioso de las personas comunes frente a los estragos del conflicto.'
        ].join('\n\n')
    },
    {
        title: 'Mirall trencat',
        authorEmails: ['rodoreda@example.com'],
        isbn: '9788400000007',
        edition: 2,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1974,
        pages: 320,
        language: 'ca',
        tags: ['novela'],
        price: 15.0
    },
    {
        title: 'A Wizard of Earthsea',
        authorEmails: ['leguin@example.com'],
        isbn: '9788400000008',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1968,
        pages: 183,
        language: 'en',
        tags: ['fantasia'],
        price: 16.0
    },
    {
        title: 'The Left Hand of Darkness',
        authorEmails: ['leguin@example.com'],
        isbn: '9788400000009',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1969,
        pages: 304,
        language: 'en',
        tags: ['ciencia-ficcion'],
        price: 17.5
    },
    {
        title: 'Fundación',
        authorEmails: ['asimov@example.com'],
        isbn: '9788400000010',
        edition: 4,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1951,
        pages: 244,
        language: 'es',
        tags: ['ciencia-ficcion', 'novela'],
        price: 18.0
    },
    // Estas dos antologías son inventadas, y sirven de ejemplo de libro con dos autores
    {
        title: 'Antología de ciencia ficción',
        authorEmails: ['leguin@example.com', 'asimov@example.com'],
        isbn: '9788400000011',
        edition: 1,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1980,
        pages: 410,
        language: 'en',
        tags: ['ciencia-ficcion'],
        price: 21.0
    },
    {
        title: 'Antología del cuento fantástico',
        authorEmails: ['borges@example.com', 'rodoreda@example.com'],
        isbn: '9788400000012',
        edition: 2,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1975,
        pages: 350,
        language: 'es',
        tags: ['fantasia', 'novela'],
        price: 19.5
    }
];
