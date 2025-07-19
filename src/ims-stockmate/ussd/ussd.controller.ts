import { Controller, Logger, Post, Body, Header } from '@nestjs/common';
import { CreateUssdDto } from './dto';
import { StockmateUssdService } from './ussd.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('IMS Stockmate Ussd')
@Controller('ims-stockmate/ussd')
export class StockmateUssdController {
  private logger = new Logger(StockmateUssdController.name);
  constructor(private readonly stockmateUssdService: StockmateUssdService) {}

  @Post('webhook/dev-test')
  testWithoutSandbox(@Body() dto: CreateUssdDto) {
    this.logger.log('webhook data:', dto);
    return this.stockmateUssdService.createDevTest(dto);
  }

  @Header('Content-Type', 'text/plain')
  @Post('webhook/dev')
  testWithSandbox(@Body() dto: CreateUssdDto) {
    this.logger.log('webhook data:', dto);
    return this.stockmateUssdService.createDev(dto);
  }

  @Header('Content-Type', 'text/plain')
  @Post('webhook')
  webhook(@Body() dto: CreateUssdDto) {
    this.logger.log('webhook data:', dto);
    return this.stockmateUssdService.create(dto);
  }
}
