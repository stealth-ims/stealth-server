import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DrugsModule } from './items/items.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DrugsCategoryModule } from './items-category/items.-category.module';

@Module({
  imports: [DrugsModule, SuppliersModule, DrugsCategoryModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
