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

  constructor() {
    this.trend = {
      dates: [],
      quantities: [],
    };
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

  constructor() {
    this.topSelling = {
      categories: [],
      quantities: [],
    };
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

  constructor() {
    this.sales = [
      {
        dates: [],
        quantities: [],
      },
      {
        dates: [],
        quantities: [],
      },
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

  constructor() {
    this.topSelling = {
      categories: ['MobileMoney', 'Cash', 'Bank', 'Card'],
      quantities: [54071, 161466, 81981, 67889],
    };
  }
}

export class RecentSalesDto {}
