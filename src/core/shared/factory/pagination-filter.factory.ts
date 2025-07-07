import { Op } from 'sequelize';
import { PaginationRequestDto } from '../dto/pagination.dto';
import { getDateRangeFilter } from './date-filter.factory';

export function generateFilter<T extends Partial<PaginationRequestDto>>(
  query: T,
  searchOption?: any,
): {
  pageFilter: { limit: number; offset: number; order: any };
  searchFilter: object;
} {
  // let searchQuery: Record<string, any> = {};

  // if (query.search && query.searchFields.length > 0) {
  //   searchQuery = {
  //     [Op.or]: query.searchFields.map((field) => ({
  //       [field]: { [Op.iLike]: `%${query.search}%` },
  //     })),
  //   };
  // }

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

export function sqlGenerateFilter<T extends Partial<PaginationRequestDto>>(
  tableAlias: string,
  query: T,
  searchOption?: string,
): {
  pageFilter: string;
  searchFilter: string;
} {
  const pageFilter = `ORDER BY ${tableAlias ? `${tableAlias}.` : ''}${query.orderBy || 'updated_at'} ${query.orderDirection || 'DESC'}`;
  const searchFilters: string[] = [];
  if (query.search) {
    searchFilters.push(searchOption);
  }
  if (query.dateRange) {
    const [startDate, endDate] = getDateRangeFilter(query.dateRange).createdAt[
      Op.between
    ];

    searchFilters.push(
      `${tableAlias ? `${tableAlias}.` : ''}created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`,
    );
  }

  const searchFilter = searchFilters.join('\nAND ');

  return { pageFilter, searchFilter };
}
