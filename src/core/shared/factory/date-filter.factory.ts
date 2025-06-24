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
import { DateRange } from '../dto/pagination.dto';

export const getDateRangeFilter = (
  dateRange: DateRange,
):
  | { createdAt: { [Op.between]: [Date, Date] }; groupby?: string }
  | undefined => {
  const now = new Date();

  switch (dateRange) {
    case DateRange.TODAY:
      return {
        createdAt: {
          [Op.between]: [startOfDay(now), endOfDay(now)],
        },
        groupby: 'hour',
      };
    case DateRange.THIS_WEEK:
      return {
        createdAt: {
          [Op.between]: [startOfWeek(now), endOfWeek(now)],
        },
        groupby: 'day',
      };
    case DateRange.THIS_MONTH:
      return {
        createdAt: {
          [Op.between]: [startOfMonth(now), endOfMonth(now)],
        },
        groupby: 'day',
      };
    case DateRange.LAST_MONTH: {
      const lastMonth = subMonths(now, 1);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastMonth), endOfMonth(lastMonth)],
        },
        groupby: 'day',
      };
    }
    case DateRange.LAST_THREE_MONTHS: {
      const lastThreeMonths = subMonths(now, 3);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastThreeMonths), endOfMonth(now)],
        },
        groupby: 'week',
      };
    }
    case DateRange.THIS_YEAR:
      return {
        createdAt: {
          [Op.between]: [startOfYear(now), endOfYear(now)],
        },
        groupby: 'month',
      };
    default:
      return undefined;
  }
};
