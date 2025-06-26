import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GetSalesPaginationDto,
  CreateSaleDto,
  UpdateSalesDto,
  FindItemDto,
  FetchSalesReportDataQueryDto,
  FetchTopSellingReportDataQueryDto,
  SmsCreateSale,
  CreateSaleItemsDto,
} from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.model';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';
import { BatchService } from '../inventory/items/batches/batch.service';
import { Patient } from '../patient/models/patient.model';
import { Batch, Item, Markup } from '../inventory/items/models';
import { IUserPayload } from '../auth/interface/payload.interface';
import { PatientService } from '../patient/patient.service';
import { endOfDay, endOfToday, startOfDay, startOfToday } from 'date-fns';
import { generateFilter } from '../core/shared/factory';
import { SaleItem } from './models/sale-items.model';
import { Sequelize } from 'sequelize-typescript';
import { ItemService } from '../inventory/items/items.service';
import { MarkupService } from '../inventory/items/markup/markup.service';
import { AmountType } from '../inventory/items/markup/dto';

type BatchSellingPrice = { batchId: string; sellingPrice: number };
@Injectable()
export class SalesService {
  private logger: Logger = new Logger(SalesService.name);
  constructor(
    @InjectModel(Sale)
    private saleRepository: typeof Sale,
    @InjectModel(SaleItem)
    private saleItemRepository: typeof SaleItem,
    private sequelize: Sequelize,
    private batchService: BatchService,
    private patientService: PatientService,
    private itemService: ItemService,
    private markupService: MarkupService,
  ) {}

  async fetchItems(query: FindItemDto, user: IUserPayload) {
    const itemWhereConditions: Record<string, Record<any, any>> = {};

    itemWhereConditions.facilityId = { [Op.eq]: user.facility };

    // if (user.department) {
    //   itemWhereConditions.departmentId = { [Op.eq]: user.department };
    // }

    if (query.search) {
      itemWhereConditions.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const filter: FindAndCountOptions<Batch> = {
      where: {
        departmentId: user.department,
      },
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: [['validity', 'ASC']],
      attributes: [['id', 'batchId'], 'batchNumber', 'validity', 'quantity'],
      include: [
        {
          model: Item,
          attributes: ['name', 'brandName', 'sellingPrice'],
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

  async create(dto: CreateSaleDto, user: IUserPayload) {
    const transaction = await this.sequelize.transaction();
    try {
      if (dto.patientCardId) {
        const patient = await this.patientService.findByCardId(
          dto.patientCardId,
          false,
        );
        dto.patientId = patient.id;
      }
      const batchSellingPrices: BatchSellingPrice[] = [];

      const saleItems = await Promise.all(
        dto.saleItems.map(async (saleItem, index) => {
          const batch = await this.batchService.findIndividual(
            saleItem.batchId,
          );
          await this.batchService.removeStock(
            saleItem.batchId,
            saleItem.quantity,
            user.sub,
          );
          const modBatch = batch.get({ plain: true });

          batchSellingPrices.push({
            batchId: saleItem.batchId,
            sellingPrice: modBatch.item.sellingPrice,
          });

          dto.saleItems[index].itemId = modBatch.item.id;
          return {
            ...modBatch,
            quantity: saleItem.quantity,
          };
        }),
      );

      const subTotal = saleItems.reduce((total: number, saleItem: any) => {
        return total + saleItem.item.sellingPrice * saleItem.quantity;
      }, 0);

      dto.saleNumber = `S-${new Date().getTime()}`;
      dto.subTotal = parseFloat(subTotal.toFixed(2));
      if (dto.insured) {
        const totalMarkup = await this.calculateTotal(batchSellingPrices);
        const total = totalMarkup + dto.subTotal;
        dto.total = parseFloat(total.toFixed(2));
      } else {
        dto.total = parseFloat(subTotal.toFixed(2));
      }

      const { saleItems: _saleItems, ...createDto } = dto;
      const sale = await this.saleRepository.create(
        {
          ...createDto,
          createdById: user.sub,
          departmentId: user.department,
          facilityId: user.facility,
        },
        { transaction },
      );

      const refinedSaleItems = dto.saleItems.map((saleItem) => ({
        saleId: sale.id,
        departmentId: user.department,
        createdById: user.sub,
        facilityId: user.facility,
        ...saleItem,
      }));

      const _newItems = await this.saleItemRepository.bulkCreate(
        refinedSaleItems,
        { transaction, individualHooks: true },
      );
      await transaction.commit();

      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async calculateTotal(payload: BatchSellingPrice[]) {
    const cappedPrices = await Promise.all(
      payload.map(async (item) => {
        const markup = await this.markupService.fetchOne({
          query: { batchId: item.batchId, type: 'NHIS' },
        });
        if (!markup) {
          return 0;
        }
        switch (markup.amountType) {
          case AmountType.PERCENTAGE: {
            const newCapPercentage = item.sellingPrice * (markup.amount / 100);
            return item.sellingPrice + newCapPercentage;
          }
          case AmountType.PRICE: {
            return item.sellingPrice + markup.amount;
          }
          default:
            return 0;
        }
      }),
    );

    const finalTotal = cappedPrices.reduce(
      (accum, current) => current + accum,
      0,
    );
    return finalTotal;
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
          fields: ['id', 'itemId'],
        });
        return {
          batchId: batch.id,
          itemId: batch.itemId,
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
      email: null,
      role: null,
      permissions: null,
      session: null,
    };
    return await this.create(saleDto, user);
  }

  async fetchAll(query: GetSalesPaginationDto, user: IUserPayload) {
    const whereConditions: Record<string, Record<any, any>> = {};
    const queryFilter = generateFilter(query);

    whereConditions.facilityId = {
      [Op.eq]: user.facility,
    };

    const dayStart = startOfToday();
    const dayEnd = endOfToday();

    const todaySales = query.todaySales === 'true';

    if (todaySales) {
      whereConditions.createdAt = {
        [Op.between]: [dayStart, dayEnd],
      };
    }

    if (user.department) {
      whereConditions.departmentId = { [Op.eq]: user.department };
    }
    if (query.search) {
      whereConditions.saleNumber = {
        [Op.like]: `%${query.search}%`,
      };
    }

    if (query.status) {
      whereConditions.status = { [Op.eq]: query.status };
    }

    const filter: FindAndCountOptions<Sale> = {
      where: { ...whereConditions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      attributes: [
        'id',
        'saleNumber',
        'total',
        'createdAt',
        'status',
        'updatedAt',
      ],
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
        {
          model: SaleItem,
          attributes: ['batchId', 'quantity'],
          include: [
            {
              model: Item,
              attributes: ['name', 'brandName', 'sellingPrice'],
            },
            {
              model: Batch,
              attributes: ['batchNumber'],
              paranoid: false,
            },
          ],
        },
      ],
      distinct: true,
    };

    const { rows, count } = await this.saleRepository.findAndCountAll(filter);
    let modRows: object[] = [];

    if (rows.length != 0) {
      modRows = rows.map((sale) => {
        const modSale: Sale = sale.get({ plain: true });
        const saleItem: any = modSale.saleItems[0];
        const remainderItems =
          modSale.saleItems.length > 0 ? modSale.saleItems.length - 1 : 0;
        const totalQuantity = modSale.saleItems.reduce(
          (total, saleItem: any) => total + saleItem.quantity,
          0,
        );
        delete modSale.saleItems;
        delete saleItem.quantity;
        saleItem.batchNumber = saleItem.batch.batchNumber;
        delete saleItem.batch;
        return {
          ...modSale,
          saleItem,
          remainderItems,
          totalQuantity,
        };
      });
    }

    const response = new PaginatedDataResponseDto<object[]>(
      modRows,
      query.page || 1,
      query.pageSize,
      count,
    );

    return response;
  }

  async fetchData(whereConditions: Record<string, Record<any, any>>) {
    const filter: FindAndCountOptions<Sale> = {
      where: { ...whereConditions },
      attributes: ['id', 'saleNumber', 'total', 'createdAt', 'status'],
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
        {
          model: SaleItem,
          attributes: ['id', 'batchId', 'quantity'],
          include: [
            {
              model: Item,
              attributes: ['name', 'brandName', 'sellingPrice'],
            },
            {
              model: Batch,
              attributes: ['batchNumber'],
            },
          ],
        },
      ],
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

    const { rows, count } = await this.fetchData(whereConditions);
    return { count, rows };
  }

  async fetchOne(id: string) {
    const sale = await this.saleRepository.findByPk(id, {
      attributes: { exclude: ['patientId', 'deletedAt', 'deletedBy'] },
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
        {
          model: SaleItem,
          attributes: ['id', 'batchId', 'quantity'],
          include: [
            {
              model: Item,
              attributes: ['name', 'brandName', 'sellingPrice'],
            },
            {
              model: Batch,
              attributes: ['batchNumber'],
            },
          ],
        },
      ],
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

  async update(id: string, dto: UpdateSalesDto, userId: string) {
    const saleItemsBody: any = {};

    if (dto.saleItems) {
      const sale = await this.fetchOne(id);
      const saleItems = await Promise.all(
        dto.saleItems.map(async (saleItem) => {
          const savedSaleItem = sale.saleItems.find(
            (savedSaleItem) => savedSaleItem.batchId === saleItem.batchId,
          );
          const batch = await this.batchService.findIndividual(
            saleItem.batchId,
          );

          if (savedSaleItem) {
            if (savedSaleItem.quantity !== saleItem.quantity) {
              if (saleItem.quantity > savedSaleItem.quantity) {
                const deductBy = saleItem.quantity - savedSaleItem.quantity;
                await this.batchService.removeStock(
                  saleItem.batchId,
                  deductBy,
                  userId,
                );
              } else {
                const increaseBy = savedSaleItem.quantity - saleItem.quantity;
                await this.batchService.increaseStock(
                  saleItem.batchId,
                  increaseBy,
                  userId,
                );
              }
            }
            await this.saleItemRepository.update(
              {
                ...saleItem,
                itemId: batch.item.id,
                updatedById: userId,
              },
              {
                where: {
                  id: savedSaleItem.id,
                },
              },
            );
          } else {
            await this.batchService.removeStock(
              saleItem.batchId,
              saleItem.quantity,
              userId,
            );
            saleItem.itemId = batch.item.id;
            await this.saleItemRepository.create({
              ...saleItem,
              saleId: id,
              createdById: userId,
              departmentId: sale.departmentId,
              facilityId: sale.facilityId,
            });
          }

          const modBatch = batch.get({ plain: true });

          return {
            ...modBatch,
            quantity: saleItem.quantity,
          };
        }),
      );

      const subTotal = saleItems.reduce((total: number, saleItem: any) => {
        return total + saleItem.item.sellingPrice * saleItem.quantity;
      }, 0);

      dto.subTotal = parseFloat(subTotal.toFixed(2));
      dto.total = parseFloat(subTotal.toFixed(2));

      saleItemsBody.saleItems = saleItems;
    }

    if (dto.patientCardId) {
      const patient = await this.patientService.findByCardId(
        dto.patientCardId,
        false,
      );
      dto.patientId = patient.id;
    }
    const [rowsUpdated] = await this.saleRepository.update(
      { ...dto, ...saleItemsBody, updatedById: userId },
      {
        where: { id },
      },
    );

    if (rowsUpdated == 0) {
      throw new NotFoundException(`Sale not found`);
    }

    return;
  }

  async removeOne(id: string, userId: string) {
    await this.saleRepository.update(
      { updatedById: userId },
      {
        where: { id },
      },
    );

    const destroyedRows = await this.saleRepository.destroy({
      where: { id },
      userId,
    } as any);

    if (destroyedRows == 0) {
      throw new NotFoundException(`Sale not found`);
    }

    return;
  }
}
