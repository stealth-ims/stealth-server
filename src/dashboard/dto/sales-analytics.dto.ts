import { ApiResponseProperty } from '@nestjs/swagger';

export class SalesTrendDto {
  @ApiResponseProperty({
    example: {
      dates: [
        '2025-03-05T00:00:00.000Z',
        '2025-03-10T00:00:00.000Z',
        '2025-03-15T00:00:00.000Z',
        '2025-03-20T00:00:00.000Z',
        '2025-03-25T00:00:00.000Z',
      ],
      quantities: [190, 400, 600, 800, 1000],
    },
  })
  trend: { dates: Date[]; quantities: number[] };

  constructor(dates: Date[], quantities: number[]) {
    this.trend = { dates, quantities };
  }
}

export class TopSellingCategoriesDto {
  @ApiResponseProperty({
    example: {
      categories: ['Syrup', 'Tablets', 'Analgesics', 'Inhalers'],
      quantities: [54071, 161466, 81981, 67889],
    },
  })
  topSelling: { categories: string[]; quantities: number[] };

  constructor(categories: string[], quantities: number[]) {
    this.topSelling = { categories, quantities };
  }
}

export class DailySalesDto {
  @ApiResponseProperty({
    example: [
      {
        dates: [
          '2025-03-05T00:00:00.000Z',
          '2025-03-10T00:00:00.000Z',
          '2025-03-15T00:00:00.000Z',
          '2025-03-20T00:00:00.000Z',
          '2025-03-25T00:00:00.000Z',
        ],
        quantities: [54071, 161466, 81981, 67889],
      },
    ],
  })
  sales: { dates: Date[]; quantities: number[] }[];

  constructor(
    dates1: Date[],
    first: number[],
    dates2: Date[],
    second: number[],
  ) {
    this.sales = [
      { dates: dates1, quantities: first },
      { dates: dates2, quantities: second },
    ];
  }
}

export class SalesPaymentMethodDto {
  @ApiResponseProperty({
    example: {
      categories: ['MobileMoney', 'Cash', 'Bank', 'Card'],
      quantities: [54071, 161466, 81981, 67889],
    },
  })
  topSelling: { categories: string[]; quantities: number[] };

  constructor(categories: string[], quantities: number[]) {
    this.topSelling = { categories, quantities };
  }
}

export class RecentSalesDto {}
