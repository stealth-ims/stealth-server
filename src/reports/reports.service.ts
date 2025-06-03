import { Injectable, NotFoundException } from '@nestjs/common';
import { Report } from './models/reports.models';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op } from 'sequelize';
import { ItemService } from 'src/inventory/items/items.service';
import { StockAdjustmentsService } from '../inventory/inventory.service';
import { SalesService } from '../sales/sales.service';
import {
  CreateReportDto,
  FindReportDataDto,
  GetReportPaginationDto,
  ReportCategories,
  UpdateReportDto,
} from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';
import { generateFilter } from '../core/shared/factory';
import { addDays, endOfDay, startOfDay, startOfToday } from 'date-fns';
import { BatchService } from '../inventory/items/batches/batch.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report)
    private reportRepository: typeof Report,
    private itemService: ItemService,
    private stockAdjustmentService: StockAdjustmentsService,
    private batchService: BatchService,
    private salesService: SalesService,
  ) {}

  async create(dto: CreateReportDto, user: IUserPayload) {
    const report = await this.reportRepository.create({
      ...dto,
      facilityId: user.facility,
      departmentId: user.department,
    });

    return report;
  }

  async fetchAll(query: GetReportPaginationDto, user: IUserPayload) {
    const whereConditions: Record<string, Record<any, any>> = {};
    const queryFilter = generateFilter(query);

    whereConditions.facilityId = { [Op.is]: `%${user.facility}%` };

    if (user.department) {
      whereConditions.departmentId = { [Op.is]: `%${user.department}%` };
    }

    const filter: FindAndCountOptions<Report> = {
      where: { ...whereConditions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      distinct: true,
    };

    const { rows, count } = await this.reportRepository.findAndCountAll(filter);

    return { rows, count };
  }

  async fetchData(
    type: ReportCategories,
    query: FindReportDataDto,
    user: IUserPayload,
  ) {
    const { facility, department } = user;
    const whereConditions: Record<string, any> = {
      facilityId: facility,
      ...(department && { departmentId: department }),
    };

    if (query.startDate && query.endDate) {
      whereConditions.createdAt = {
        [Op.between]: [query.startDate, query.endDate],
      };
    }

    if (query.specificDate) {
      const specificDateStart = startOfDay(query.specificDate);
      const specificDateEnd = endOfDay(query.specificDate);
      whereConditions.createdAt = {
        [Op.between]: [specificDateStart, specificDateEnd],
      };
    }

    switch (type) {
      case ReportCategories.PERIODIC_SALES_REPORT: {
        const { rows, count } =
          await this.salesService.fetchData(whereConditions);
        return { count, rows };
      }
      case ReportCategories.STOCK_LEVEL_REPORT: {
        const { rows, count } = await this.batchService.findAndCount({
          query: whereConditions,
          fields: ['id', 'batchNumber', 'createdAt', 'validity'],
          populate: ['item', 'department', 'facility'],
          sort: '-createdAt',
        });
        return { count, rows };
      }
      case ReportCategories.EXPIRY_REPORT: {
        const { rows, count } = await this.fetchStockNearingExpiry(
          facility,
          department,
        );
        return { count, rows };
      }
      default:
        return { count: 0, rows: [] };
    }
  }

  private async findBatchesByValidity(
    ownershipQuery: Record<string, any>,
    validityCondition: Record<string, any>,
  ) {
    return this.batchService.findAndCount({
      query: {
        ...ownershipQuery,
        validity: validityCondition,
      },
      fields: ['id', 'batchNumber', 'createdAt', 'validity'],
      populate: ['item', 'department', 'facility'],
      sort: 'validity',
    });
  }

  async fetchStockNearingExpiry(
    facilityId: string,
    departmentId: string,
  ): Promise<{ rows: Record<string, any>; count: number }> {
    const rows: Record<string, any> = {};
    const ownershipQuery = {
      facilityId,
      ...(departmentId && { departmentId }),
    };

    const today = startOfToday();
    const nDaysFromNow = (days: number) => addDays(new Date(), days);

    const expired = await this.findBatchesByValidity(ownershipQuery, {
      [Op.lt]: today,
    });
    const critical = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [today, nDaysFromNow(30)],
    });
    const highRisk = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [nDaysFromNow(30), nDaysFromNow(60)],
    });
    const approaching = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [nDaysFromNow(60), nDaysFromNow(90)],
    });

    rows.expired = expired.rows;
    rows.critical = critical.rows;
    rows.highRisk = highRisk.rows;
    rows.approaching = approaching.rows;

    const totalCount =
      (expired.count || 0) +
      (critical.count || 0) +
      (highRisk.count || 0) +
      (approaching.count || 0);

    return { rows, count: totalCount };
  }

  async fetchOne(id: string) {
    const report = await this.reportRepository.findByPk(id);
    if (!report) {
      throw new NotFoundException(`Report not found`);
    }

    return report;
  }

  async update(id: string, dto: UpdateReportDto) {
    const [rowsUpdated] = await this.reportRepository.update(
      { ...dto },
      {
        where: { id },
      },
    );

    if (rowsUpdated == 0) {
      throw new NotFoundException(`Report not found`);
    }

    return;
  }

  async removeOne(id: string) {
    const destroyedRows = await this.reportRepository.destroy({
      where: { id },
    });

    if (destroyedRows == 0) {
      throw new NotFoundException(`Report not found`);
    }

    return;
  }
}
