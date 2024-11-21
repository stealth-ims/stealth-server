import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ItemsModule } from './items/items.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ItemsCategoryModule } from './items-category/items-category.module';

@Module({
  imports: [ItemsModule, SuppliersModule, ItemsCategoryModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
