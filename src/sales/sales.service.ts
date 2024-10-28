import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  create(_: CreateSaleDto) {
    return 'This action adds a new sale';
  }
}
