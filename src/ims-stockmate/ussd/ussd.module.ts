import { Module } from '@nestjs/common';
import { StockmateUssdService } from './ussd.service';
import { StockmateUssdController } from './ussd.controller';

@Module({
  controllers: [StockmateUssdController],
  providers: [StockmateUssdService],
})
export class StockmateUssdModule {}
