import { PaginationRequestDto } from '../dto/pagination.dto';
import { getDateRangeFilter } from './date-filter.factory';

export function generateFilter<T extends Partial<PaginationRequestDto>>(
  query: T,
  searchOption?: any,
): {
  pageFilter: { limit: number; offset: number; order: any };
  searchFilter: object;
} {
  return {
    pageFilter: {
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: [[query.orderBy || 'updatedAt', query.orderDirection || 'DESC']],
    },
    searchFilter: {
      ...(query.search && searchOption),
      ...(query.dateRange && {
        createdAt: getDateRangeFilter(query.dateRange).createdAt,
      }),
    },
  };
}
