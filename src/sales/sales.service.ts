import { Injectable } from '@nestjs/common';
import { GetSalesPaginationDto, CreateSaleDto, UpdateSalesDto } from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.models';
import { DrugsService } from 'src/inventory/drugs/drugs.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale)
    private saleRepository: typeof Sale,

    private drugService: DrugsService,
  ) {}

  async create(dto: CreateSaleDto) {
    await this.drugService.findOne(dto.drugId);

    dto.saleNumber = `S-${new Date().getTime()}`;

    const sale = await this.saleRepository.create({
      ...dto,
    });

    return sale;
  }

  fetchAll(_: GetSalesPaginationDto) {
    return [];
  }

  update(__: string, _: UpdateSalesDto) {}

  fetchOne(_: string) {}

  removeOne(_: string) {}
}
