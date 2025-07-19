import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { StockmateSmsService } from './sms.service';
import { AtskWebhookDto, TwilioWebhookDto } from './dto';
import { Response } from 'express';
import * as twilio from 'twilio';
import { CustomApiResponse } from '../../core/shared/docs/decorators';
import { ApiTags } from '@nestjs/swagger';
// import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

@ApiTags('IMS Stockmate Sms')
@Controller('ims-stockmate/sms')
export class StockmateSmsController {
  private logger = new Logger(StockmateSmsController.name);
  constructor(private readonly stockmateSmsService: StockmateSmsService) {}

  @CustomApiResponse(['success'], {
    type: String,
    message: 'query passed successfully',
  })
  @Post('webhook/dev-test')
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: AtskWebhookDto) {
    return this.stockmateSmsService.create(dto);
  }

  @CustomApiResponse(['success'], {
    type: String,
    message: 'query passed successfully',
  })
  @Post('webhook/twilio')
  @HttpCode(HttpStatus.OK)
  async replyIncomingMessage(
    @Body() dto: TwilioWebhookDto,
    @Res() res: Response,
  ) {
    // const dto = req.body as TwilioWebhookDto;
    this.logger.log(dto);
    const twiml = new twilio.twiml.MessagingResponse();
    const data = await this.stockmateSmsService.create(dto);

    this.logger.log('data length', data.length);
    // if (data.length > 1600) {
    //   data = data.substring(0, 1597) + '...';
    // }
    twiml.message(data);
    // twiml.message('The Robots are coming! Head for the hills!');
    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  @CustomApiResponse(['success'], {
    type: String,
    message: 'query passed successfully',
  })
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() dto: AtskWebhookDto) {
    await this.stockmateSmsService.sendSmsResponse(dto);
    return;
  }
}
