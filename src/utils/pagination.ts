// Metadatos que acompañan a cada listado paginado
export interface PageInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Cuantos elementos hay que saltarse para llegar a la pagina pedida
export const getSkip = (page: number, limit: number): number => (page - 1) * limit;

// Construye el bloque de metadatos a partir del total de resultados
export const buildPageInfo = (page: number, limit: number, total: number): PageInfo => {
    const totalPages = Math.ceil(total / limit);
    return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

// Escapa los caracteres especiales de regex para que "c++" o "(" se busquen como texto normal
export const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');