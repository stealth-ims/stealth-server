import { Controller, Get } from '@nestjs/common';

@Controller('inventory')
export class InventoryController {
  @Get('/')
  async find() {
    return 'test';
  }
}
