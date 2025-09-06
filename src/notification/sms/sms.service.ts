import { Injectable } from '@nestjs/common';
import { CreateSmsDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import AfricasTalking from 'africastalking';
import { SMSMessageData } from './types';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  constructor(
    private configService: ConfigService,
    private twilioService: TwilioService,
    private readonly httpService: HttpService,
  ) {}
  create(_createSmDto: CreateSmsDto) {
    return 'This action adds a new sm';
  }

  private get africastalkingClient() {
    return AfricasTalking({
      apiKey: this.configService.get<string>('ATSK_API_KEY'),
      username: this.configService.get<string>('ATSK_USERNAME'),
    });
  }

  async sendSms(dto: CreateSmsDto) {
    return await this.sendWithAfricasTalkingOneWay({
      body: dto.body,
      to: dto.to,
    });
    // return await this.sendWithArkesel({
    //   body: dto.body,
    //   to: dto.to,
    // });
    // return await this.sendWithAfricasTalking({
    //   body: dto.body,
    //   to: dto.to,
    // });
    // return this.twilioService.client.messages.create();
  }

  async sendWithArkesel(dto: CreateSmsDto): Promise<any> {
    const from = this.configService.get<string>('ARK_SENDER');
    const response = await firstValueFrom(
      this.httpService.post('/sms/send', {
        sender: from,
        message: dto.body,
        recipients: [dto.to],
      }),
    );
    return response.data;
  }

  async sendWithAfricasTalkingOneWay(
    dto: CreateSmsDto,
  ): Promise<SMSMessageData> {
    const from = this.configService.get<string>('ATSK_SENDER');
    return this.africastalkingClient.SMS.send({
      to: dto.to,
      from: from,
      message: dto.body,
    });
  }

  async sendWithAfricasTalking(dto: CreateSmsDto): Promise<SMSMessageData> {
    // const from = this.configService.get<string>('ATSK_SHORT_CODE');
    const from = this.configService.get<string>('ATSK_SENDER');
    return this.africastalkingClient.SMS.send({
      to: dto.to,
      from: from,
      message: dto.body,
    });
  }

  async sendWithTwilio(dto: CreateSmsDto): Promise<MessageInstance> {
    const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    return this.twilioService.client.messages.create({
      body: dto.body,
      from: from,
      to: dto.to,
    });
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }
}
