import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GetSalesPaginationDto,
  CreateSaleDto,
  UpdateSalesDto,
  GetSalesDto,
} from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.models';
import { DrugsService } from 'src/inventory/drugs/drugs.service';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';

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

  async fetchAll(query: GetSalesPaginationDto) {
    const whereConditions: Record<string, Record<any, any>> = {};

    if (query.search) {
      whereConditions.patientName = { [Op.like]: `%${query.search}%` };
    }

    if (query.status) {
      whereConditions.status = { [Op.eq]: query.status };
    }

    const filter: FindAndCountOptions<Sale> = {
      where: whereConditions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
    };

    const { rows, count } = await this.saleRepository.findAndCountAll(filter);

    const response = new PaginatedDataResponseDto<GetSalesDto[]>(
      rows,
      query.page || 1,
      query.pageSize,
      count,
    );

    return response;
  }

  async update(id: string, dto: UpdateSalesDto) {
    const [rowsUpdated] = await this.saleRepository.update(
      { ...dto },
      {
        where: { id },
      },
    );

    if (rowsUpdated == 0) {
      throw new NotFoundException(`Sale not found`);
    }

    return rowsUpdated;
  }

  async fetchOne(id: string) {
    const sale = await this.saleRepository.findByPk(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async removeOne(id: string) {
    const destroyedRows = await this.saleRepository.destroy({
      where: { id },
    });

    if (destroyedRows == 0) {
      throw new NotFoundException(`Sale not found`);
    }

    return;
  }
}
