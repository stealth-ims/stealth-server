import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GetSalesPaginationDto,
  CreateSaleDto,
  UpdateSalesDto,
  FindItemDto,
} from './dto/';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './models/sales.models';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';
import { BatchService } from '../inventory/items/batches/batch.service';
import { Patient } from '../patient/models/patient.model';
import { Batch, Item } from '../inventory/items/models';
import { IUserPayload } from '../auth/interface/payload.interface';
import { PatientService } from '../patient/patient.service';
import { endOfDay, startOfDay } from 'date-fns';
import { generateFilter } from '../core/shared/factory';

@Injectable()
export class SalesService {
  private logger: Logger = new Logger(SalesService.name);
  constructor(
    @InjectModel(Sale)
    private saleRepository: typeof Sale,

    private batchService: BatchService,
    private patientService: PatientService,
  ) {}

  async fetchItems(query: FindItemDto, user: IUserPayload) {
    const itemWhereConditions: Record<string, Record<any, any>> = {};

    itemWhereConditions.facilityId = { [Op.eq]: user.facility };

    if (user.department) {
      itemWhereConditions.departmentId = { [Op.eq]: user.department };
    }

    if (query.search) {
      itemWhereConditions.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const filter: FindAndCountOptions<Batch> = {
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

  async create(dto: CreateSaleDto, user: IUserPayload) {
    const saleItems = await Promise.all(
      dto.saleItems.map(async (saleItem) => {
        const batch = await this.batchService.findIndividual(saleItem.batchId);
        await this.batchService.removeStock(
          saleItem.batchId,
          saleItem.quantity,
        );
        const modBatch = batch.get({ plain: true });
        return { ...modBatch, quantity: saleItem.quantity };
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
    const notes = dto.notes ? dto.notes : null;
    const sale = await this.saleRepository.create({
      ...dto,
      saleItems,
      departmentId: user.department,
      facilityId: user.facility,
      notes,
    });

    return sale;
  }

  async fetchAll(query: GetSalesPaginationDto, user: IUserPayload) {
    const whereConditions: Record<string, Record<any, any>> = {};
    const queryFilter = generateFilter(query);

    whereConditions.facilityId = {
      [Op.eq]: user.facility,
    };
    const currentDate = new Date();
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);

    const todaySales = query.todaySales === 'true';

    if (todaySales) {
      whereConditions.createdAt = {
        [Op.gt]: dayStart,
        [Op.lte]: dayEnd,
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
        'saleItems',
        'saleNumber',
        'total',
        'createdAt',
        'status',
      ],
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
      ],
      distinct: true,
    };

    const { rows, count } = await this.saleRepository.findAndCountAll(filter);

    const modRows = rows.map((sale) => {
      const modSale: Sale = sale.get({ plain: true });
      const saleItem: any = modSale.saleItems[0];
      const remainderItems = modSale.saleItems.length - 1;
      const totalQuantity = modSale.saleItems.reduce(
        (total, saleItem: any) => total + saleItem.quantity,
        0,
      );
      delete modSale.saleItems;
      delete saleItem.quantity;
      return { ...modSale, saleItem, remainderItems, totalQuantity };
    });

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
      attributes: [
        'id',
        'saleItems',
        'saleNumber',
        'total',
        'createdAt',
        'status',
      ],
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
      ],
      order: [['createdAt', 'ASC']],
      distinct: true,
    };

    const { rows, count } = await this.saleRepository.findAndCountAll(filter);

    // const modRows = rows.map((sale) => {
    //   const modSale: Sale = sale.get({ plain: true });
    //   const saleItem: any = modSale.saleItems[0];
    //   const remainderItems = modSale.saleItems.length - 1;
    //   const totalQuantity = modSale.saleItems.reduce(
    //     (total, saleItem: any) => total + saleItem.quantity,
    //     0,
    //   );
    //   delete saleItem.quantity;
    //   return { ...modSale, saleItem totalQuantity };
    // });

    return { rows, count };
  }

  async fetchOne(id: string) {
    const sale = await this.saleRepository.findByPk(id, {
      attributes: { exclude: ['patientId', 'deletedAt', 'deletedBy'] },
      include: [
        {
          model: Patient,
          attributes: ['id', 'cardIdentificationNumber', 'name'],
        },
      ],
    });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
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
          } else {
            await this.batchService.removeStock(
              saleItem.batchId,
              saleItem.quantity,
            );
          }

          const modBatch = batch.get({ plain: true });
          return { ...modBatch, quantity: saleItem.quantity };
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
