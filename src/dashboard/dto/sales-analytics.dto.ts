import { ApiResponseProperty } from '@nestjs/swagger';
import { MetricDto } from './general.dto';

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
  @ApiResponseProperty({ type: () => MetricDto })
  metrics: MetricDto;
  @ApiResponseProperty({
    example: [
      {
        hours: ['01:00', '03:00', '08:00', '11:00', '15:00'],
        '2025-05-04': [54071, 161466, 81981, 67889],
        '2025-05-02': [54071, 161466, 81981, 67889],
      },
    ],
  })
  sales: { hours: Date[]; quantities1: number[]; quantities2: number[] };
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
export class MarkupAnalysticsDto {
  @ApiResponseProperty({ example: { total: 3234323.33, quantity: 232 } })
  insured: [number, number];
  @ApiResponseProperty({ example: { total: 3234323.33, quantity: 232 } })
  notInsured: [number, number];
  constructor(insured: any, notInsured: any) {
    this.insured = insured;
    this.notInsured = notInsured;
  }
}

export class RecentSalesDto {}
