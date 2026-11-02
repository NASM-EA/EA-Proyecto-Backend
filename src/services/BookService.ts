import Book, { IBook } from '../models/Book';
import { escapeRegExp } from '../utils/escape-regexp';

// Funcion que se encarga de crear un libro en la base de datos
export const createBook = (data: IBook) => {
    // Creamos un nuevo libro usando los datos que hemos recibido
    const book = new Book(data);

    // Guardamos el libro en la base de datos y devolvemos el resultado
    return book.save();
};

// Funcion que busca un libro por su ID en la base de datos
export const getBookById = (bookId: string) => {
    // Buscamos el libro por su ID y obtenemos tambien los datos de sus autores.
    // Filtramos deleted: false para no devolver libros borrados logicamente.
    return Book.findOne({ _id: bookId, deleted: false }).populate('authors');
};

// Funcion que busca una pagina de libros y cuenta los que no estan borrados
export const getAllBooks = (page: number, limit: number, search = '', sort = '', order = 'asc') => {
    const searchRegex = search ? new RegExp(escapeRegExp(search), 'i') : undefined;
    const filter = {
        deleted: false,
        ...(searchRegex
            ? { $or: [{ title: searchRegex }, { isbn: searchRegex }, { description: searchRegex }] }
            : {})
    };

    // Columnas por las que se permite ordenar. Si llega otra, se ordena por _id como antes
    const sortableFields = ['title', 'language', 'publishedYear', 'price'];
    const direction = order === 'desc' ? -1 : 1;

    // Los libros de la pagina: si ordenamos por autores hace falta una consulta especial
    let booksPage;
    if (sort === 'authors') {
        // Ordenamos por el nombre del primer autor de cada libro. Para eso unimos cada libro con sus autores
        booksPage = Book.aggregate([
            { $match: filter },
            { $lookup: { from: 'authors', localField: 'authors', foreignField: '_id', as: 'authorDocs' } },
            { $addFields: { firstAuthorName: { $arrayElemAt: ['$authorDocs.name', 0] } } },
            { $sort: { firstAuthorName: direction, _id: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { authorDocs: 0, firstAuthorName: 0 } }
        ])
            .collation({ locale: 'es' })
            // El aggregate no rellena los autores, los rellenamos aqui como hace find
            .then((books) => Book.populate(books, { path: 'authors' }));
    } else {
        // Desempatamos con _id para que las paginas no repitan ni pierdan libros
        const sortBy: Record<string, 1 | -1> = sortableFields.includes(sort) ? { [sort]: direction, _id: 1 } : { _id: 1 };
        booksPage = Book.find(filter)
            .collation({ locale: 'es' })
            .populate('authors')
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit);
    }

    return Promise.all([
        booksPage,
        Book.countDocuments(filter)
    ]).then(([books, total]) => ({
        books,
        total,
        page,
        pages: Math.ceil(total / limit)
    }));
};

// Funcion que se encarga de actualizar un libro
export const updateBook = (bookId: string, data: IBook) => {
    // Buscamos el libro por su ID y actualizamos sus datos.
    // Filtramos deleted: false para que un libro borrado logicamente no se pueda actualizar
    // (devolvera null y el controlador respondera 404).
    // Con new: true devolvemos el documento actualizado y también poblamos autores.
    return Book.findOneAndUpdate({ _id: bookId, deleted: false }, data, { new: true }).populate('authors');
};

// Funcion que se encarga de eliminar un libro de la base de datos.
export const deleteBook = (bookId: string) => {
    // Marcamos el libro como borrado en lugar de quitarlo de la base de datos.
    // El controlador sigue recibiendo el documento (204) o null (404) igual que antes.
    return Book.findByIdAndUpdate(bookId, { deleted: true, deletedAt: new Date() }, { new: true });
};

// Exportamos todas las funciones para poder utilizarlas desde el controlador
export default {
    createBook,

    getBookById,

    getAllBooks,

    updateBook,

    deleteBook
};
