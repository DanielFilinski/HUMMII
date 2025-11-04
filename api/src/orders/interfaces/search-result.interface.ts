export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResult<T> {
  data: T[];
  meta: PaginationMeta;
}

