import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GetSalesPaginationDto,
  CreateSaleDto,
  UpdateSalesDto,
  FindItemDto,
  FetchSalesReportDataQueryDto,
  FetchTopSellingReportDataQueryDto,
  SmsCreateSale,
  CreateSaleItemsDto,
  BatchSellingPrice,
  UssdCreateSale,
} from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.model';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { DestroyOptions, FindAndCountOptions, WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { BatchService } from '../inventory/items/batches/batch.service';
import { Batch, Item, Markup } from '../inventory/items/models';
import { IUserPayload } from '../auth/interface/payload.interface';
import { endOfDay, startOfDay, startOfToday } from 'date-fns';
import { SaleItem } from './models/sale-items.model';
import { Sequelize } from 'sequelize-typescript';
import { ItemService } from '../inventory/items/items.service';
import { MarkupService } from '../inventory/items/markup/markup.service';
import { generateSaleReportQuery } from './sql';
import { SalesHelperService } from './helpers.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale)
    private saleRepository: typeof Sale,
    @InjectModel(SaleItem)
    private saleItemRepository: typeof SaleItem,
    private sequelize: Sequelize,
    private batchService: BatchService,
    private itemService: ItemService,
    private markupService: MarkupService,
    private salesHelperService: SalesHelperService,
  ) {}

  async fetchItems(query: FindItemDto, user: IUserPayload) {
    let itemWhereConditions: WhereOptions = {};

    itemWhereConditions.facilityId = { [Op.eq]: user.facility };
    if (query.search) {
      const search = query.search;

      itemWhereConditions = {
        ...itemWhereConditions,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { brandName: { [Op.iLike]: `%${search}%` } },
          { dosageForm: { [Op.iLike]: `%${search}%` } },
          { strength: { [Op.iLike]: `%${search}%` } },
          Sequelize.where(
            Sequelize.fn(
              'concat_ws',
              ' ',
              Sequelize.fn('coalesce', Sequelize.col('name'), ''),
              Sequelize.literal(
                `CASE WHEN "brand_name" IS NOT NULL AND "brand_name" <> '' THEN '(' || "brand_name" || ')' ELSE '' END`,
              ),
              Sequelize.fn('coalesce', Sequelize.col('dosage_form'), ''),
              Sequelize.fn('coalesce', Sequelize.col('strength'), ''),
            ),
            {
              [Op.iLike]: `%${search}%`,
            },
          ),
        ],
      };
    }

    const filter: FindAndCountOptions<Batch> = {
      where: {
        validity: { [Op.gt]: startOfToday() },
        departmentId: user.department,
      },
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: [
        ['quantity', 'DESC'],
        ['validity', 'ASC'],
      ],

      attributes: [['id', 'batchId'], 'batchNumber', 'validity', 'quantity'],
      include: [
        {
          model: Item,
          attributes: [
            'id',
            'name',
            'brandName',
            'sellingPrice',
            'dosageForm',
            'strength',
            'itemFullName',
          ],
          where: itemWhereConditions,
        },
        {
          model: Markup,
          attributes: ['type', 'amountType', 'amount'],
        },
      ],
      distinct: true,
    };

    const { rows, count } = await this.batchService.findBySpecs(filter);

    return { rows, count };
  }

  async fetchSellingProducts(
    whereOptions: Record<string, any>,
    limit?: number,
  ) {
    const rows = await this.saleItemRepository.findAll({
      where: {
        ...whereOptions,
      },
      attributes: [
        'itemId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalQuantity'],
      ],
      group: ['itemId'],
      order: [['totalQuantity', 'DESC']],
      ...(limit && { limit }),
    });

    const finalData = await Promise.all(
      rows.map(async (saleItem) => {
        const item = await this.itemService.fetchOne({
          query: { id: saleItem.itemId },
          fields: ['id', 'name', 'sellingPrice'],
        });
        if (!item) {
          throw new NotFoundException(`item not found`);
        }
        return {
          item: item,
          totalQuantity: +saleItem.totalQuantity,
          totalSales: +saleItem.totalQuantity * item.sellingPrice,
        };
      }),
    );

    return { rows: finalData, count: finalData.length };
  }

  async fetchTopSellingItemsData(
    query: FetchTopSellingReportDataQueryDto,
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

    const { rows, count } = await this.fetchSellingProducts(
      whereConditions,
      query.limit || 10,
    );
    return { count, rows };
  }

  async create(dto: CreateSaleDto, user: IUserPayload): Promise<Sale> {
    const transaction = await this.sequelize.transaction();
    try {
      if (!dto.patientId && dto.patientCardId) {
        await this.salesHelperService.attachPatientIfExists(dto);
      }

      const batchSellingPrices: BatchSellingPrice[] = [];
      const saleItems = await this.salesHelperService.processSaleItems(
        dto,
        user,
        batchSellingPrices,
      );

      dto.saleNumber = `S-${Date.now()}`;
      dto.subTotal = this.salesHelperService.calculateSubTotal(saleItems);

      if (dto.insured) {
        await this.salesHelperService.handleInsuredCalculations(
          dto,
          batchSellingPrices,
        );
      } else {
        dto.total = dto.subTotal;
      }

      const sale = await this.salesHelperService.createSaleRecord(
        dto,
        user,
        transaction,
      );
      await this.salesHelperService.createSaleItems(
        sale,
        dto,
        user,
        batchSellingPrices,
        transaction,
      );

      await transaction.commit();
      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async ussdSale(dto: UssdCreateSale) {
    const saleItems: CreateSaleItemsDto[] = [];
    const responses: string[] = [];

    for (const saleItem of dto.saleItems) {
      const [batchSaleItems, batchResponses] =
        await this.salesHelperService.fifoDeductItemStock(
          saleItem.itemCode,
          saleItem.quantity,
          dto.departmentId,
          dto.facilityId,
        );

      responses.push(...batchResponses);
      saleItems.push(...batchSaleItems);
    }

    const saleDto: CreateSaleDto = {
      patientCardId: dto.patientCardId,
      paymentType: dto.paymentType,
      insured: true,
      saleItems,
    };

    const user: IUserPayload = {
      sub: dto.createdById,
      facility: dto.facilityId,
      department: dto.departmentId,
    };
    const sale = await this.create(saleDto, user);
    return {
      responses,
      saleMeta: {
        subTotal: sale.subTotal,
        total: sale.total,
        patientId: sale.patientId,
      },
    };
  }

  async smsSale(dto: SmsCreateSale) {
    const saleItems = await Promise.all(
      dto.saleItems.map(async (saleItem) => {
        const batch = await this.batchService.fetchOne({
          query: {
            batchNumber: { [Op.iLike]: `%${saleItem.batchNumber}%` },
            departmentId: dto.departmentId,
            facilityId: dto.facilityId,
          },
          fields: ['id', 'itemId', 'batchNumber'],
        });
        return {
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          itemId: batch.itemId,
          quantity: saleItem.quantity,
        } as CreateSaleItemsDto;
      }),
    );
    const saleDto: CreateSaleDto = {
      patientCardId: dto.patientCardId,
      paymentType: dto.paymentType,
      insured: false,
      saleItems,
    };
    const user: IUserPayload = {
      sub: dto.createdById,
      facility: dto.facilityId,
      department: dto.departmentId,
    };
    return await this.create(saleDto, user);
  }

  async fetchAll(query: GetSalesPaginationDto, user: IUserPayload) {
    const filter = this.salesHelperService.fetchAllFilter(query, user);
    const { rows, count } = await this.saleRepository.findAndCountAll(filter);

    const modRows = rows.map((sale) => {
      const transformed = this.salesHelperService.transformSale(sale);
      if (!transformed || (transformed as any).notFound) {
        return null;
      }
      return transformed;
    });

    const finalRows = modRows.filter((sale) => sale);

    return new PaginatedDataResponseDto(
      finalRows,
      query.page || 1,
      query.pageSize,
      count,
    );
  }

  async fetchData(whereConditions: Record<string, Record<any, any>>) {
    const filter: FindAndCountOptions<Sale> = {
      where: { ...whereConditions },
      attributes: ['id', 'saleNumber', 'total', 'createdAt', 'status'],
      include: this.salesHelperService.defaultIncludes,
      order: [['createdAt', 'ASC']],
      distinct: true,
    };

    const { rows, count } = await this.saleRepository.findAndCountAll(filter);

    const modRows: Sale[] = rows.map((sale) => {
      const refinedSale: Sale = sale.get({ plain: true });

      refinedSale.saleItems.forEach((item) => {
        item.batchNumber = item.batch.batchNumber;
        delete item.batch;
      });
      return refinedSale;
    });

    return { rows: modRows, count };
  }

  async fetchPeriodicSales(
    query: FetchSalesReportDataQueryDto,
    user: IUserPayload,
  ) {
    const sqlQuery = generateSaleReportQuery(query, {
      facility: user.facility,
      department: user.department,
    });

    const [results] = await this.sequelize.query(sqlQuery);
    return (results[0] as any).result;
  }

  async fetchOne(id: string) {
    const sale = await this.saleRepository.findByPk(id, {
      attributes: { exclude: ['patientId', 'deletedAt', 'deletedBy'] },
      include: this.salesHelperService.defaultIncludes,
    });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    const refinedSale: Sale = sale.get({ plain: true });

    refinedSale.saleItems.forEach((item) => {
      item.batchNumber = item.batch.batchNumber;
      delete item.batch;
    });
    return refinedSale;
  }

  async update(id: string, dto: UpdateSalesDto, userId: string): Promise<void> {
    const sale = await this.fetchOne(id);

    if (dto.patientCardId) {
      await this.salesHelperService.attachPatientIfExists(dto);
    }

    if (dto.saleItems) {
      const batchSellingPrices: BatchSellingPrice[] = [];
      const saleItems = [];

      for (const saleItem of dto.saleItems) {
        const savedSaleItem = sale.saleItems.find(
          (s) => s.batchId === saleItem.batchId,
        );
        const batch = await this.batchService.findIndividual(saleItem.batchId);
        if (!batch) {
          throw new Error(`Batch with ID ${saleItem.batchId} not found`);
        }

        await this.salesHelperService.updateBatchStockBasedOnQuantityChange(
          savedSaleItem,
          saleItem,
          userId,
        );

        const markup = await this.markupService.fetchOne({
          query: { batchId: batch.id, type: 'NHIS' },
        });

        const nhisCovered = !!markup;
        const batchItemId = batch.item.id;

        if (savedSaleItem) {
          await this.saleItemRepository.update(
            {
              ...saleItem,
              itemId: batchItemId,
              updatedById: userId,
              nhisCovered,
            },
            { where: { id: savedSaleItem.id } },
          );
        } else {
          await this.batchService.removeStock(
            saleItem.batchId,
            saleItem.quantity,
            userId,
          );

          await this.saleItemRepository.create({
            ...saleItem,
            saleId: id,
            createdById: userId,
            departmentId: sale.departmentId,
            facilityId: sale.facilityId,
            itemId: batchItemId,
            nhisCovered,
          });
        }

        const modBatch = batch.get({ plain: true });
        batchSellingPrices.push({
          batchId: saleItem.batchId,
          quantity: saleItem.quantity,
          sellingPrice: modBatch.item.sellingPrice,
          nhisCovered,
        });

        saleItems.push({ ...modBatch, quantity: saleItem.quantity });
      }

      dto.subTotal = this.salesHelperService.calculateSubTotal(saleItems);

      if (dto.insured) {
        await this.salesHelperService.handleInsuredCalculations(
          dto,
          batchSellingPrices,
        );
      } else {
        dto.total = dto.subTotal;
      }
    }
    const { saleItems, ...others } = dto;
    const [rowsUpdated] = await this.saleRepository.update(
      { ...others, updatedById: userId },
      { where: { id } },
    );

    if (rowsUpdated === 0) {
      throw new NotFoundException('Sale not found');
    }
  }

  async removeOne(id: string, userId: string) {
    await this.saleRepository.update(
      { updatedById: userId },
      {
        where: { id },
      },
    );

    const saleItems = await this.saleItemRepository.findAll({
      where: { saleId: id },
      attributes: ['batchId', 'quantity'],
    });

    for (const item of saleItems) {
      await this.salesHelperService.restoreStock(
        item.batchId,
        item.quantity,
        userId,
      );
    }

    const destroyedRows = await this.saleRepository.destroy({
      where: { id },
      userId,
    } as DestroyOptions);

    if (destroyedRows == 0) {
      throw new NotFoundException('Sale not found');
    }

    return;
  }
}
