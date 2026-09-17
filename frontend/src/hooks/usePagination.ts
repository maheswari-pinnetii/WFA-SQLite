import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export const usePagination = (initialState?: Partial<PaginationState>) => {
  const [params, setParams] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    ...initialState,
  });

  const setPage = useCallback((page: number) => setParams(prev => ({ ...prev, page })), []);
  const setSearch = useCallback((search: string) => setParams(prev => ({ ...prev, search, page: 1 })), []);
  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => setParams(prev => ({ ...prev, sortBy, sortDir, page: 1 })), []);
  const setLimit = useCallback((limit: number) => setParams(prev => ({ ...prev, limit, page: 1 })), []);

  return {
    params,
    setPage,
    setSearch,
    setSort,
    setLimit,
  };
};
