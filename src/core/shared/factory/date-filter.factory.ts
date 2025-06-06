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
  startOfYesterday,
  subWeeks,
  subYears,
} from 'date-fns';
import { DateRange } from '../dto/pagination.dto';

export const getDateRangeFilter = (
  dateRange: DateRange,
): { createdAt: { [Op.between]: [Date, Date] } } | undefined => {
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
    case DateRange.LAST_MONTH: {
      const lastMonth = subMonths(now, 1);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastMonth), endOfMonth(lastMonth)],
        },
      };
    }
    case DateRange.LAST_THREE_MONTHS: {
      const lastThreeMonths = subMonths(now, 3);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastThreeMonths), endOfMonth(now)],
        },
      };
    }
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

export const getDateRangeFilterCompare = (
  dateRange: DateRange,
):
  | { createdAt: { [Op.between]: [Date, Date] }; bound: Date; groupby: string }
  | undefined => {
  const now = new Date();

  switch (dateRange) {
    case DateRange.TODAY:
      return {
        createdAt: {
          [Op.between]: [startOfYesterday(), endOfDay(now)],
        },
        bound: startOfDay(now),
        groupby: 'hour',
      };
    case DateRange.THIS_WEEK:
      return {
        createdAt: {
          [Op.between]: [
            startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
            endOfWeek(now),
          ],
        },
        groupby: 'day',
        bound: startOfWeek(now),
      };
    case DateRange.LAST_MONTH:
    case DateRange.THIS_MONTH:
      return {
        createdAt: {
          [Op.between]: [startOfMonth(subMonths(now, 1)), endOfMonth(now)],
        },
        groupby: 'day',
        bound: startOfMonth(now),
      };
    case DateRange.LAST_THREE_MONTHS: {
      const lastThreeMonths = subMonths(now, 3);
      return {
        createdAt: {
          [Op.between]: [startOfMonth(lastThreeMonths), endOfMonth(now)],
        },
        groupby: 'week',
        bound: null,
      };
    }
    case DateRange.THIS_YEAR:
      return {
        createdAt: {
          [Op.between]: [startOfYear(subYears(now, 1)), endOfYear(now)],
        },
        groupby: 'month',
        bound: startOfYear(now),
      };
    default:
      return undefined;
  }
};
