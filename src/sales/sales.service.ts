import { Injectable } from '@nestjs/common';
import { CreateSaleDto, UpdateSalesDto } from './dto/create.dto';

@Injectable()
export class SalesService {
  create(_: CreateSaleDto) {
    return 'This action adds a new sale';
  }

  fetchAll() {
    return [];
  }

  update(__: string, _: UpdateSalesDto) {}

  fetchOne(_: string) {}

  removeOne(_: string) {}
}
