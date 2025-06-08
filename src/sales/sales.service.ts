import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GetSalesPaginationDto,
  CreateSaleDto,
  UpdateSalesDto,
  FindItemDto,
} from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.model';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';
import { BatchService } from '../inventory/items/batches/batch.service';
import { Patient } from '../patient/models/patient.model';
import { Batch, Item } from '../inventory/items/models';
import { IUserPayload } from '../auth/interface/payload.interface';
import { PatientService } from '../patient/patient.service';
import { endOfToday, startOfToday } from 'date-fns';
import { generateFilter } from '../core/shared/factory';
import { SaleItem } from './models/sale-items.model';
import { Sequelize } from 'sequelize-typescript';
import { ItemService } from '../inventory/items/items.service';

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
      ],
      distinct: true,
    };

    const { rows, count } = await this.batchService.findBySpecs(filter);

    return { rows, count };
  }

  async fetchSellingProducts(
    paramOptions: {
      facilityId: string;
      departmentId: string;
      whereOptions: Record<string, any>;
    },
    limit?: number,
  ) {
    const rows = await this.saleItemRepository.findAll({
      where: {
        facilityId: paramOptions.facilityId,
        departmentId: paramOptions.departmentId,
        ...paramOptions.whereOptions,
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
        const item = await this.itemService.findOne(saleItem.itemId, [
          'id',
          'name',
          'sellingPrice',
        ]);
        return {
          item: item,
          totalQuantity: +saleItem.totalQuantity,
          totalSales: +saleItem.totalQuantity * item.sellingPrice,
        };
      }),
    );

    return { rows: finalData, count: finalData.length };
  }

  async create(dto: CreateSaleDto, user: IUserPayload) {
    const transaction = await this.sequelize.transaction();
    try {
      const saleItems = await Promise.all(
        dto.saleItems.map(async (saleItem, index) => {
          const batch = await this.batchService.findIndividual(
            saleItem.batchId,
          );
          await this.batchService.removeStock(
            saleItem.batchId,
            saleItem.quantity,
          );
          const modBatch = batch.get({ plain: true });
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
      dto.total = parseFloat(subTotal.toFixed(2));

      if (dto.patientCardId) {
        const patient = await this.patientService.findByCardId(
          dto.patientCardId,
          false,
        );
        dto.patientId = patient.id;
      }

      const sale = await this.saleRepository.create(
        {
          ...dto,
          saleItems,
          departmentId: user.department,
          facilityId: user.facility,
        },
        { transaction },
      );

      const refinedSaleItems = dto.saleItems.map((saleItem) => ({
        saleId: sale.id,
        departmentId: user.department,
        facilityId: user.facility,
        ...saleItem,
      }));

      const _newItems = await this.saleItemRepository.bulkCreate(
        refinedSaleItems,
        { transaction },
      );
      await transaction.commit();

      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

  async update(id: string, dto: UpdateSalesDto) {
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
                await this.batchService.removeStock(saleItem.batchId, deductBy);
              } else {
                const increaseBy = savedSaleItem.quantity - saleItem.quantity;
                await this.batchService.increaseStock(
                  saleItem.batchId,
                  increaseBy,
                );
              }
            }
            await this.saleItemRepository.update(
              {
                ...saleItem,
                itemId: batch.item.id,
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
            );
            saleItem.itemId = batch.item.id;
            await this.saleItemRepository.create({
              ...saleItem,
              saleId: id,
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
      { ...dto, ...saleItemsBody },
      {
        where: { id },
      },
    );

    if (rowsUpdated == 0) {
      throw new NotFoundException(`Sale not found`);
    }

    return;
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
