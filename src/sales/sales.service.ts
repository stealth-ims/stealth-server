import { Injectable } from '@nestjs/common';
import { CreateSaleDto, UpdateSalesDto } from './dto/create.dto';
import { GetSalesPaginationDto } from './dto/get.dto';

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
