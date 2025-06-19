import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ChangeOrderStatusDto,
  CreateItemOrderDto,
  GetOrdersDto,
  SearchBy,
  UpdateItemOrderDto,
} from './dto';
import { ItemOrder } from './models/itemOrder.model';
import { FindAndCountOptions, literal } from 'sequelize'; // Sequelize operators for filtering
import { generateOrderNumber } from 'src/orders/utils/orders.utils';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { Supplier } from '../inventory/suppliers/models/supplier.model';
import { Item } from '../inventory/items/models';
import { generateFilter } from '../core/shared/factory';
import { Op } from 'sequelize';
import { IUserPayload } from '../auth/interface/payload.interface';

@Injectable()
export class ItemOrdersService {
  constructor(
    @InjectModel(ItemOrder)
    private itemOrderModel: typeof ItemOrder,
  ) {}

  // Create a new item order
  async createItemOrder(
    dto: CreateItemOrderDto,
    user: IUserPayload,
  ): Promise<ItemOrder> {
    if (!dto.orderNumber) {
      dto.orderNumber = generateOrderNumber();
    }

    return this.itemOrderModel.create({
      ...dto,
      facilityId: user.facility,
      createdById: user.sub,
    });
  }

  // Fetch multiple item orders with optional filters
  async findItemOrders(
    dto: GetOrdersDto,
    facilityId: string,
  ): Promise<PaginatedDataResponseDto<ItemOrder[]>> {
    let searchCondtion = {};
    if (dto.searchBy == SearchBy.ORDER_NUMBER) {
      searchCondtion = { orderNumber: { [Op.iLike]: `%${dto.search}%` } };
    }

    const queryFilter = generateFilter(dto, searchCondtion);
    const limit = queryFilter.pageFilter.limit;
    const offset = queryFilter.pageFilter.offset;
    const order = queryFilter.pageFilter.order;
    // Define query options
    const queryOptions: FindAndCountOptions<ItemOrder> = {
      where: {
        facilityId,
        ...(dto.status && { status: dto.status }),
        ...(dto.supplierId && { supplierId: dto.supplierId }),
        ...(dto.itemId && { itemId: dto.itemId }),
        ...queryFilter.searchFilter,
      },
      distinct: true,
      order: [
        !dto.orderBy
          ? [
              literal(`
              CASE 
                WHEN "ItemOrder"."status" = 'draft' THEN 1
                WHEN "ItemOrder"."status" = 'requested' THEN 2
                WHEN "ItemOrder"."status" = 'delivering' THEN 3
                WHEN "ItemOrder"."status" = 'received' THEN 4
                WHEN "ItemOrder"."status" = 'cancelled' THEN 5
              END
            `),
              'ASC',
            ]
          : order,
      ],
      limit,
      offset,
      attributes: [
        'id',
        'itemId',
        'orderNumber',
        ['updated_at', 'date'],
        'quantity',
        'expectedDeliveryDate',
        'status',
      ],
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name'],
          where: dto.searchBy == SearchBy.SUPPLIER_NAME && {
            name: { [Op.iLike]: `%${dto.search}%` },
          },
        },
        {
          model: Item,
          attributes: ['id', 'name'],
          where: (dto.searchBy == SearchBy.ITEM_NAME || dto.search) && {
            name: { [Op.iLike]: `%${dto.search}%` },
          },
        },
      ],
    };

    const orders = await this.itemOrderModel.findAndCountAll(queryOptions);
    return new PaginatedDataResponseDto(
      orders.rows,
      dto.page,
      dto.pageSize,
      orders.count,
    );
  }

  // Fetch a specific item order by ID
  async findItemOrder(id: string): Promise<ItemOrder> {
    const res = await this.itemOrderModel.findOne({
      where: { id },
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        { model: Item, attributes: ['id', 'name'] },
      ],
    });

    if (!res) {
      throw new NotFoundException('Item order not found');
    }
    return res;
  }

  // Update a specific item order by ID
  async updateItemOrder(
    id: string,
    dto: UpdateItemOrderDto,
    userId: string,
  ): Promise<ItemOrder> {
    const itemOrder = await this.itemOrderModel.findOne({ where: { id } });
    if (!itemOrder) {
      throw new NotFoundException('User not found');
    }
    await itemOrder.update({ ...dto, updatedById: userId });
    return;
  }

  async changeState(dto: ChangeOrderStatusDto, id: string, userId: string) {
    const itemOrder = await this.itemOrderModel.update(
      { ...dto, updatedById: userId },
      { where: { id } },
    );
    const affected = itemOrder[0];
    if (affected == 0) {
      throw new NotFoundException(`Item Order not found`);
    }
    return;
  }

  // Delete a specific item order by ID
  async deleteItemOrder(id: string) {
    const rows = await this.itemOrderModel.destroy({
      where: { id },
      force: true,
    });
    if (rows == 0) {
      throw new NotFoundException('Item Order not found');
    }
    return;
  }
}
