import { PaginationRequestDto } from '../docs/dto/pagination.dto';
import { getDateRangeFilter } from './date-filter.factory';

export function generateFilter<T extends PaginationRequestDto>(
  query: T,
  searchOption?: any,
): { pageFilter: object; searchFilter: object } {
  return {
    pageFilter: {
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy
        ? [[query.orderBy, query.orderDirection ? query.orderDirection : 'ASC']]
        : [['updatedAt', 'DESC']],
    },
    searchFilter: {
      ...(query.search && searchOption),
      ...(query.dateRange && getDateRangeFilter(query.dateRange)),
    },
  };
}
