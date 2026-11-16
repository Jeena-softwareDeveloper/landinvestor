import { useState } from 'react';

export interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const resetPage = () => setPage(1);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
  };
}
