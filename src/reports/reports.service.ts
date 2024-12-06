import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GetReportDto, GetReportPaginationDto } from './dto/get.dto';
import { FindAndCountOptions, Op } from 'sequelize';
import { UpdateReportDto } from './dto/edit.dto';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { StockAdjustmentsService } from 'src/stock-adjustments/stock-adjustments.service';
import { StockAdjustmentPaginationDto } from 'src/stock-adjustments/dto';
import { plainToInstance } from 'class-transformer';
import { ItemService } from 'src/inventory/items/items.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report)
    private reportRepository: typeof Report,

    private stockAdjustmentService: StockAdjustmentsService,
    private itemService: ItemService,
  ) {}

  private dataToCSV(headerLabels: Record<string, string>, rowsJson: any[]) {
    const csvRows = [];

    csvRows.push(Object.values(headerLabels).join(','));

    for (const [index, row] of rowsJson.entries()) {
      const values = Object.keys(headerLabels).map((header) => {
        const escaped =
          headerLabels[header] === '#'
            ? index + 1
            : ('' + (row[header] ?? '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  async fetchAll(query: GetReportPaginationDto) {
    const whereConditions: Record<string, Record<any, any>> = {};

    if (query.reportName) {
      whereConditions.reportName = { [Op.iLike]: `%${query.reportName}%` };
    }

    if (query.nameInExport) {
      whereConditions.nameInExport = { [Op.iLike]: `%${query.nameInExport}%` };
    }

    if (query.startDate || query.endDate) {
      whereConditions.createdAt = {
        ...(query.startDate && { [Op.gte]: new Date(query.startDate) }),
        ...(query.endDate && { [Op.lte]: new Date(query.endDate) }),
      };
    }

    const filter: FindAndCountOptions<Report> = {
      where: whereConditions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
      distinct: true,
    };

    const { rows, count } = await this.reportRepository.findAndCountAll(filter);

    const response = new PaginatedDataResponseDto<GetReportDto[]>(
      rows,
      query.page || 1,
      query.pageSize,
      count,
    );

    return response;
  }

  async export(id: string) {
    const { reportName, startDate, endDate } = await this.fetchOne(id);

    const [rows] = await this.stockAdjustmentService.findAll(
      plainToInstance(StockAdjustmentPaginationDto, { startDate, endDate }),
    );

    const items = await Promise.all(
      rows.map(({ itemId }) => this.itemService.findOne(itemId)),
    );

    const rowsWithItems = rows.map(({ type, reason }, index) => ({
      type,
      reason,
      name: items[index].name,
      brand: items[index].brandName,
      costPrice: items[index].costPrice,
      sellingPrice: items[index].sellingPrice,
      code: items[index].code,
    }));

    const headerLabels = {
      type: 'Type',
      reason: 'Reason',
      name: 'Item Name',
      brand: 'Brand',
      costPrice: 'Cost Price',
      sellingPrice: 'Selling Price',
      code: 'Code',
    };

    const csv = this.dataToCSV(headerLabels, rowsWithItems);

    return { reportName, csv };
  }

  getReportCategories() {
    const inventoryReports = [
      { id: 'STOCK_LEVEL_REPORT', label: 'Stock Level Report' },
      { id: 'STOCK_MOVEMENT_REPORT', label: 'Stock Movement Report' },
      { id: 'LOW_STOCK_REORDER_REPORT', label: 'Low Stock and Reorder Report' },
      { id: 'EXPIRY_REPORT', label: 'Expiry Report' },
      { id: 'DAMAGE_LOSS_REPORT', label: 'Damage/Loss Report' },
      { id: 'INVENTORY_VALUATION_REPORT', label: 'Inventory Valuation Report' },
    ];

    const salesReport = [
      { id: 'PERIODIC_SALES_REPORT', label: 'Sales and Financial Reports' },
    ];

    const categories = { inventoryReports, salesReport };

    return categories;
  }

  async create(dto: CreateReportDto) {
    const { inventoryReports, salesReport } = this.getReportCategories();

    const allowedCategories = [
      ...inventoryReports.map((r) => r.id),
      ...salesReport.map((r) => r.id),
    ];

    if (!allowedCategories.includes(dto.reportName)) {
      throw new BadRequestException(
        `Invalid report category ${dto.reportName}`,
      );
    }

    const report = await this.reportRepository.create({
      ...dto,
    });

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

    return rowsUpdated;
  }

  async fetchOne(id: string) {
    const report = await this.reportRepository.findByPk(id);
    if (!report) {
      throw new NotFoundException(`Report not found`);
    }

    return report;
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
