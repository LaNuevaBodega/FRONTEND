export interface PagedResult<T> {
    items: T[];
    total: number;
    pagina: number;
    pageSize: number;
}