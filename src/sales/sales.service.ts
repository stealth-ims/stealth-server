import { Injectable } from '@nestjs/common';
import { GetSalesPaginationDto, CreateSaleDto, UpdateSalesDto } from './dto/';

@Injectable()
export class SalesService {
  create(_: CreateSaleDto) {
    return 'This action adds a new sale';
  }

  fetchAll(_: GetSalesPaginationDto) {
    return [];
  }

  update(__: string, _: UpdateSalesDto) {}

  fetchOne(_: string) {}

  removeOne(_: string) {}
}
