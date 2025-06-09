import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ChangeType } from '../../inventory/items/dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class AnalyticItem {
  @ApiProperty()
  itemName: string;

  @ApiProperty()
  quantity: number;

  constructor(itemName: string, quantity: number) {
    this.itemName = itemName;
    this.quantity = quantity;
  }
}

class MetricDto {
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

class StockLevelDto extends MetricDto {
  @ApiProperty()
  totalStock: number;

  @ApiProperty({ type: [AnalyticItem] })
  @Type(() => AnalyticItem)
  @ValidateNested({ each: true })
  items: AnalyticItem[];

  constructor(
    totalStock: number = 0,
    items: AnalyticItem[] = [],
    total: number = 0,
    percentageChange: number = 0,
    changeType: ChangeType = ChangeType.None,
  ) {
    super(total, percentageChange, changeType);
    this.totalStock = totalStock;
    this.items = items;
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

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  soonToExpireItems: MetricDto;

  @ApiProperty({ type: MetricDto })
  @Type(() => MetricDto)
  @ValidateNested()
  itemsReturned: MetricDto;

  constructor() {
    this.itemStockLevel = new StockLevelDto();
    this.totalItemsSold = new MetricDto();
    this.totalTransactions = new MetricDto();
    this.inventoryTurnoverRate = new MetricDto();
    this.totalRevenue = new MetricDto();
    this.averageItemsPerTransaction = new MetricDto();
    this.customers = new MetricDto();
    this.soonToExpireItems = new MetricDto();
    this.itemsReturned = new MetricDto();
  }
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

  constructor(names: string[], quantities: number[], avg) {
    this.average = avg;
    this.items = {
      names,
      quantities,
    };
  }
}
