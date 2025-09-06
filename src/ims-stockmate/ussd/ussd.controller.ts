import { Controller, Logger, Post, Body, Header } from '@nestjs/common';
import { CreateUssdDto } from './dto';
import { StockmateUssdService } from './ussd.service';
import { ApiTags } from '@nestjs/swagger';
import { throwError } from 'src/core/shared/responses/error.response';

@ApiTags('IMS Stockmate Ussd')
@Controller('ims-stockmate/ussd')
export class StockmateUssdController {
  private logger = new Logger(StockmateUssdController.name);
  constructor(private readonly stockmateUssdService: StockmateUssdService) {}

  @Post('webhook/dev-test')
  testWithoutSandbox(@Body() dto: CreateUssdDto) {
    try {
      this.logger.log('webhook data:', dto);
      return this.stockmateUssdService.createDevTest(dto);
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
      return 'END An error occured. Please try again.';
    }
  }

  @Header('Content-Type', 'text/plain')
  @Post('webhook/dev')
  testWithSandbox(@Body() dto: CreateUssdDto) {
    this.logger.log('webhook data:', dto);
    return this.stockmateUssdService.createDev(dto);
    // try {
    // } catch (error) {
    //   this.logger.error(
    //     `An error occured: ${error.name} :: ${error.message}`,
    //     error.stack,
    //   );
    //   return 'END An error occured. Please try again.';
    // }
  }

  @Header('Content-Type', 'text/plain')
  @Post('webhook')
  webhook(@Body() dto: CreateUssdDto) {
    try {
      this.logger.log('webhook data:', dto);
      return this.stockmateUssdService.create(dto);
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
      return 'END An error occured. Please try again.';
    }
  }

  @Post('events')
  webhookEvents(@Body() body: any) {
    try {
      this.logger.debug('sms status data:', body);
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
