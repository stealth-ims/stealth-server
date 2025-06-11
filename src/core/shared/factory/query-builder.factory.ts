import { IncludeOptions, Op } from 'sequelize';
import { QueryOptionsDto } from '../dto/query-options.dto';

export function buildQuery<T>(
  params: QueryOptionsDto<T>,
  populates: Record<string, IncludeOptions>,
): Record<string, any> {
  let searchQuery: Record<string, any>[] = [];

  if (params.search && params.searchFields.length > 0) {
    searchQuery = params.searchFields.map((field) => ({
      [field]: { [Op.iLike]: `%${params.search}%` },
    }));
  }

  const queryOptions: Record<string, any> = {};

  if (searchQuery) {
    queryOptions.where = {
      ...(searchQuery.length > 0 && {
        [Op.or]: searchQuery,
      }),
    };
  }

  if (params.query) {
    queryOptions.where = { ...queryOptions.where, ...params.query };
  }

  if (params.fields) {
    queryOptions.attributes = params.fields;
  }

  if (params.populate) {
    queryOptions.include = params.populate.map(
      (item: keyof T | IncludeOptions) => {
        if (typeof item === 'object' && item !== null) {
          return item;
        }
        return populates[item as string];
      },
    );
  }

  if (params.sort) {
    queryOptions.order = [
      [
        params.sort.replace(/^-/, ''),
        params.sort.startsWith('-') ? 'DESC' : 'ASC',
      ],
    ];
  }

  if (params.pageSize) {
    queryOptions.limit = params.pageSize;
  }
  if (params.page) {
    queryOptions.offset = queryOptions.limit * (params.page - 1) || 0;
  }

  queryOptions.distinct = true;
  return queryOptions;
}
