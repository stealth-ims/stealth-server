import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { DateRange } from '../docs/dto/pagination.dto';

export const getDateRangeFilter = (
  dateRange: DateRange,
): { [key: string]: any } | undefined => {
  const now = new Date();

  switch (dateRange) {
    case DateRange.TODAY:
      return {
        createdAt: {
          [Op.between]: [startOfDay(now), endOfDay(now)],
        },
      };
    case DateRange.THIS_WEEK:
      return {
        createdAt: {
          [Op.between]: [startOfWeek(now), endOfWeek(now)],
        },
      };
    case DateRange.THIS_MONTH:
      return {
        createdAt: {
          [Op.between]: [startOfMonth(now), endOfMonth(now)],
        },
      };
    case DateRange.LAST_MONTH:
      const lastMonth = subMonths(now, 1);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastMonth), endOfMonth(lastMonth)],
        },
      };
    case DateRange.LAST_THREE_MONTHS:
      const lastThreeMonths = subMonths(now, 3);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastThreeMonths), endOfMonth(now)],
        },
      };
    case DateRange.THIS_YEAR:
      return {
        createdAt: {
          [Op.between]: [startOfYear(now), endOfYear(now)],
        },
      };
    default:
      return undefined;
  }
};
