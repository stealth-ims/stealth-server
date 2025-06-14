import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { ImsStockmateService } from './ims-stockmate.service';
import { AtskWebhookDto } from './dto';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { Response } from 'express';
import * as twilio from 'twilio';
// import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

@Controller('ims-stockmate')
export class ImsStockmateController {
  private logger = new Logger(ImsStockmateController.name);
  constructor(private readonly imsStockmateService: ImsStockmateService) {}

  @CustomApiResponse(['success'], {
    type: String,
    message: 'query passed successfully',
  })
  @Post('webhook/dev-test')
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: AtskWebhookDto) {
    return this.imsStockmateService.create(dto);
  }

  @CustomApiResponse(['success'], {
    type: String,
    message: 'query passed successfully',
  })
  @Post('webhook/twilio')
  @HttpCode(HttpStatus.OK)
  async replyIncomingMessage(
    @Body() dto: AtskWebhookDto,
    @Res() res: Response,
  ) {
    // const dto = req.body as TwilioWebhookDto;
    this.logger.log(dto);
    const twiml = new twilio.twiml.MessagingResponse();
    const data = await this.imsStockmateService.create(dto);

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
    await this.imsStockmateService.sendSmsResponse(dto);
    return;
  }
}
