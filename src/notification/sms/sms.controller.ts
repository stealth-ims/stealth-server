import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmsDto } from './dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  create(@Body() createSmDto: CreateSmsDto) {
    return this.smsService.sendSms(createSmDto);
  }

  @Get()
  findAll() {
    return this.smsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsService.findOne(+id);
  }
}
