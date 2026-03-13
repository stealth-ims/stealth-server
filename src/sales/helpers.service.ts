import { Injectable } from '@nestjs/common';
import { MarkupService } from '../inventory/items/markup/markup.service';
import { PatientService } from '../patient/patient.service';
import { BatchService } from '../inventory/items/batches/batch.service';
import { AmountType } from '../inventory/items/markup/dto';
import { Batch, Item, Markup } from '../inventory/items/models';
import { IUserPayload } from '../auth/interface/payload.interface';
import {
  BatchSellingPrice,
  CreateSaleDto,
  CreateSaleItemsDto,
  GetSalesPaginationDto,
  UpdateSalesDto,
} from './dto';
import { Sale, SalePaymentType } from './models/sales.model';
import { InjectModel } from '@nestjs/sequelize';
import { SaleItem } from './models/sale-items.model';
import { startOfToday, endOfToday } from 'date-fns';
import { Op, FindAndCountOptions, Includeable } from 'sequelize';
import { generateFilter } from '../core/shared/factory';
import { Patient } from '../patient/models/patient.model';
import { ItemService } from 'src/inventory/items/items.service';

@Injectable()
export class SalesHelperService {
  constructor(
    @InjectModel(SaleItem)
    private saleItemRepository: typeof SaleItem,
    @InjectModel(Sale)
    private saleRepository: typeof Sale,
    private readonly markupService: MarkupService,
    private readonly patientService: PatientService,
    private readonly batchService: BatchService,
    private readonly itemService: ItemService,
  ) {}

  defaultIncludes: Includeable[] = [
    {
      model: Patient,
      attributes: ['id', 'cardIdentificationNumber', 'name'],
    },
    {
      model: SaleItem,
      attributes: ['id', 'batchId', 'quantity'],
      paranoid: false,
      include: [
        {
          model: Item,
          attributes: [
            'name',
            'brandName',
            'sellingPrice',
            'dosageForm',
            'strength',
            'itemFullName',
          ],
          paranoid: false,
        },
        {
          model: Batch,
          attributes: ['batchNumber'],
          paranoid: false,
        },
      ],
    },
  ];

  async updateBatchStockBasedOnQuantityChange(
    savedSaleItem: any,
    saleItem: any,
    userId: string,
  ): Promise<void> {
    if (!savedSaleItem) return;

    if (savedSaleItem.quantity !== saleItem.quantity) {
      const difference = saleItem.quantity - savedSaleItem.quantity;
      if (difference > 0) {
        await this.batchService.removeStock(
          saleItem.batchId,
          difference,
          userId,
        );
      } else {
        await this.batchService.increaseStock(
          saleItem.batchId,
          -difference,
          userId,
        );
      }
    }
  }

  calculateCappedPrice(sellingPrice: number, markup: Markup): number {
    switch (markup.amountType) {
      case AmountType.PERCENTAGE:
        return sellingPrice - (sellingPrice * markup.amount) / 100;
      case AmountType.PRICE:
        return sellingPrice - markup.amount;
      default:
        return sellingPrice;
    }
  }

  async createSaleItems(
    sale: Sale,
    dto: CreateSaleDto,
    user: IUserPayload,
    batchSellingPrices: BatchSellingPrice[],
    transaction: any,
  ): Promise<void> {
    const refinedSaleItems = dto.saleItems.map((saleItem) => {
      const foundBatch = batchSellingPrices.find(
        (batch) => batch.batchId === saleItem.batchId,
      );
      if (!foundBatch) {
        throw new Error(
          `Batch selling price not found for batch ${saleItem.batchId}`,
        );
      }

      return {
        saleId: sale.id,
        departmentId: user.department,
        createdById: user.sub,
        facilityId: user.facility,
        nhisCovered: foundBatch.nhisCovered,
        ...saleItem,
      };
    });

    await this.saleItemRepository.bulkCreate(refinedSaleItems, {
      transaction,
      individualHooks: true,
    });
  }

  async calculateTotal(
    payload: BatchSellingPrice[],
  ): Promise<[number, number, BatchSellingPrice[]]> {
    let count = 0;
    let finalTotal = 0;

    for (const item of payload) {
      const markup = await this.markupService.fetchOne({
        query: { batchId: item.batchId, type: 'NHIS' },
      });

      if (!markup) {
        finalTotal += item.quantity * item.sellingPrice;
        continue;
      }

      item.nhisCovered = true;
      count += 1;

      // let cappedPrice = this.calculateCappedPrice(item.sellingPrice, markup);
      // cappedPrice = Math.max(cappedPrice, 0);
      const cappedPrice = item.sellingPrice; // changed to 0 for original structure
      finalTotal += cappedPrice * item.quantity;
    }

    return [finalTotal, count, payload];
  }

  async handleInsuredCalculations(
    dto: CreateSaleDto | UpdateSalesDto,
    batchSellingPrices: BatchSellingPrice[],
  ): Promise<void> {
    const [total, count, updatedBatchPrices] =
      await this.calculateTotal(batchSellingPrices);
    batchSellingPrices.splice(
      0,
      batchSellingPrices.length,
      ...updatedBatchPrices,
    );

    if (count === dto.saleItems.length) {
      dto.paymentType = [SalePaymentType.NHIS];
    } else if (count > 0 && !dto.paymentType.includes(SalePaymentType.NHIS)) {
      dto.paymentType = [...dto.paymentType, SalePaymentType.NHIS];
    }

    dto.total = Number(Math.max(total, 0).toFixed(2));
  }

  async createSaleRecord(
    dto: CreateSaleDto,
    user: IUserPayload,
    transaction: any,
  ): Promise<Sale> {
    const { saleItems: _saleItems, ...createDto } = dto;

    return await this.saleRepository.create(
      {
        ...createDto,
        createdById: user.sub,
        departmentId: user.department,
        facilityId: user.facility,
      },
      { transaction },
    );
  }

  calculateSubTotal(saleItems: any[]): number {
    return Number(
      saleItems
        .reduce(
          (total, item) => total + item.item.sellingPrice * item.quantity,
          0,
        )
        .toFixed(2),
    );
  }

  async processSaleItems(
    dto: CreateSaleDto,
    user: IUserPayload,
    batchSellingPrices: BatchSellingPrice[],
  ): Promise<any[]> {
    const saleItems = [];

    for (const saleItem of dto.saleItems) {
      const batch = await this.batchService.findIndividual(saleItem.batchId);
      if (!batch) {
        throw new Error(`Batch with ID ${saleItem.batchId} not found`);
      }

      if (saleItem.quantity <= 0) {
        throw new Error(`Invalid quantity for batch ${saleItem.batchId}`);
      }

      await this.batchService.removeStock(
        saleItem.batchId,
        saleItem.quantity,
        user.sub,
      );

      const modBatch = batch.get({ plain: true });
      batchSellingPrices.push({
        batchId: saleItem.batchId,
        quantity: saleItem.quantity,
        sellingPrice: modBatch.item.sellingPrice,
        nhisCovered: false,
      });

      saleItem.itemId = modBatch.item.id;
      saleItems.push({ ...modBatch, quantity: saleItem.quantity });
    }

    return saleItems;
  }

  async attachPatientIfExists(
    dto: CreateSaleDto | UpdateSalesDto,
  ): Promise<void> {
    if (dto.patientCardId) {
      const patient = await this.patientService.findByCardId(
        dto.patientCardId,
        false,
      );
      if (!patient) {
        throw new Error(`Patient with card ID ${dto.patientCardId} not found`);
      }
      dto.patientId = patient.id;
    }
  }

  transformSale(sale: Sale): object {
    const plainSale = sale.get({ plain: true });
    const [firstItem, ...restItems] = plainSale.saleItems;

    const totalQuantity = plainSale.saleItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const remainderItems = restItems.length;

    if (!firstItem || !firstItem.batch || !firstItem.batch.batchNumber) {
      return { notFound: true };
    }

    const transformedItem = {
      ...firstItem,
      batchNumber: firstItem.batch.batchNumber,
    };
    delete transformedItem.quantity;
    delete transformedItem.batch;

    const { saleItems, ...rest } = plainSale;

    return {
      ...rest,
      saleItem: transformedItem,
      remainderItems,
      totalQuantity,
    };
  }

  fetchAllFilter(query: GetSalesPaginationDto, user: IUserPayload) {
    const whereConditions: Record<string, any> = {
      facilityId: { [Op.eq]: user.facility },
    };

    if (user.department) {
      whereConditions.departmentId = { [Op.eq]: user.department };
    }

    if (query.search) {
      whereConditions.saleNumber = { [Op.like]: `%${query.search}%` };
    }

    if (query.status) {
      whereConditions.status = { [Op.eq]: query.status };
    }

    if (query.todaySales === 'true') {
      whereConditions.createdAt = {
        [Op.between]: [startOfToday(), endOfToday()],
      };
    }

    const queryFilter = generateFilter(query);

    const filter: FindAndCountOptions<Sale> = {
      where: { ...whereConditions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      attributes: [
        'id',
        'icd_code',
        'saleNumber',
        'total',
        'createdAt',
        'status',
        'paymentType',
        'updatedAt',
      ],
      include: this.defaultIncludes,
      distinct: true,
    };
    return filter;
  }

  async fetchBatchByItemCode(
    itemCode: string,
    departmentId: string | null,
    facilityId: string,
  ) {
    return this.batchService.fetchOne({
      query: {
        departmentId,
        facilityId,
      },
      fields: ['id', 'itemId', 'batchNumber'],
      populate: [
        {
          model: Item,
          attributes: [],
          where: { code: { [Op.iLike]: `${itemCode}%` } },
        },
      ],
      sort: 'validity',
    });
  }

  async restoreStock(batchId: string, quantity: number, userId: string) {
    const oldBatch = await this.batchService.findOne(batchId);
    await this.batchService.increaseStock(batchId, quantity, userId);
    oldBatch.updatedById = userId;
    await oldBatch.save();
    return oldBatch;
  }

  async fifoDeductItemStock(
    itemCode: string,
    requestedQuantity: number,
    departmentId: string | null,
    facilityId: string,
  ): Promise<[CreateSaleItemsDto[], string[]]> {
    const saleItems: CreateSaleItemsDto[] = [];
    let remainingQuantity = requestedQuantity;
    let page = 1;
    const pageSize = 5;
    const responses: string[] = [];
    let batchesPresent: boolean = true;

    while (remainingQuantity > 0) {
      const batches = await this.batchService.find({
        query: {
          departmentId,
          facilityId,
        },
        fields: ['id', 'itemId', 'batchNumber', 'quantity', 'validity'],
        populate: [
          {
            model: Item,
            attributes: [],
            where: { code: { [Op.iLike]: `${itemCode}%` } },
          },
        ],
        sort: 'validity',
        pageSize,
        page,
      });

      if (batches.length === 0) {
        batchesPresent = false;
        const item = await this.itemService.fetchOne({
          query: { code: { [Op.iLike]: `${itemCode}%` }, facilityId },
          fields: ['id', 'name'],
        });

        if (!item) {
          responses.push(`❌ Item ${itemCode} - Not Found`);
        } else {
          responses.push(`❌ Item ${itemCode} - Out of stock`);
        }

        break;
      }

      for (const batch of batches) {
        if (remainingQuantity <= 0) break;

        const deductQuantity = Math.min(batch.quantity, remainingQuantity);

        saleItems.push({
          batchId: batch.id,
          itemId: batch.itemId,
          quantity: deductQuantity,
        });

        remainingQuantity -= deductQuantity;
      }

      page += 1;
    }

    if (batchesPresent) {
      if (remainingQuantity > 0) {
        responses.push(`❌ Item ${itemCode} - Insufficient stock`);
      } else {
        responses.push(`✅ Item ${itemCode} - Successful`);
      }
    }

    return [saleItems, responses];
  }
}
