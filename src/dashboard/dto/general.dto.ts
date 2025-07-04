import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ChangeType } from '../../inventory/items/dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class MetricDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  percentageChange: number;

  @ApiProperty({ enum: ChangeType })
  changeType: ChangeType;

  constructor(
    total: number = 0,
    percentageChange: number = 0,
    changeType: ChangeType = ChangeType.None,
  ) {
    this.total = total;
    this.percentageChange = percentageChange;
    this.changeType = changeType;
  }
}

export class SoonToExpireMetricsDto extends MetricDto {
  constructor() {
    super();
  }
  @ApiProperty()
  totalCost: number;
}

class StockDto {
  @ApiResponseProperty({ example: 300 })
  total: number;

  @ApiResponseProperty({ example: 0 })
  lowStocked: number;

  @ApiResponseProperty({ example: 0 })
  outOfStock: number;

  @ApiResponseProperty({ example: 4500 })
  totalStock: number;

  @ApiResponseProperty({ example: 300 })
  highStocked: number;

  @ApiResponseProperty({ example: 258.78 })
  stockDaysOnHand: number;
}

class StockLevelDto {
  @ApiResponseProperty({ type: StockDto })
  stock: StockDto;

  @ApiResponseProperty({ example: 100 })
  percentageChange: number;

  @ApiProperty({ enum: ChangeType })
  changeType: ChangeType;

  constructor(
    stock: StockDto = {
      total: 759,
      lowStocked: 0,
      outOfStock: 0,
      totalStock: 444113,
      highStocked: 759,
      stockDaysOnHand: 1302.78,
    },
    percentageChange: number = 0,
    changeType: ChangeType = ChangeType.None,
  ) {
    this.stock = stock;
    this.percentageChange = percentageChange;
    this.changeType = changeType;
  }
}

export class GeneralAnalyticsDto {
  @ApiProperty({ type: StockLevelDto })
  @Type(() => StockLevelDto)
  @ValidateNested()
  itemStockLevel: StockLevelDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  totalItemsSold: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  totalTransactions: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  inventoryTurnoverRate: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  totalRevenue: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  averageItemsPerTransaction: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  customers: MetricDto;

  @ApiProperty({
    type: SoonToExpireMetricsDto,
  })
  @Type(() => SoonToExpireMetricsDto)
  @ValidateNested()
  soonToExpireItems: SoonToExpireMetricsDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  itemsReturned: MetricDto;
  //
  // constructor() {
  //   this.itemStockLevel = new StockLevelDto();
  //   this.totalItemsSold = new MetricDto();
  //   this.totalTransactions = new MetricDto();
  //   this.inventoryTurnoverRate = new MetricDto();
  //   this.totalRevenue = new MetricDto();
  //   this.averageItemsPerTransaction = new MetricDto();
  //   this.customers = new MetricDto();
  //   this.soonToExpireItems = new MetricDto();
  //   this.itemsReturned = new MetricDto();
  // }
}

export class ItemSalesAnalyticsDto {
  @ApiResponseProperty({ example: 6.8 })
  average: number;

  @ApiResponseProperty({
    example: {
      names: ['paracetamol', 'eyeDrop', 'condom', 'painKiller', 'inhaler'],
      quantities: [90, 100, 50, 30, 150],
    },
  })
  items: { names: string[]; quantities: number[] };

  constructor(names: string[], quantities: number[], avg: number) {
    this.average = avg;
    this.items = {
      names,
      quantities,
    };
  }
}
