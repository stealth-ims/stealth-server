import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ChangeOrderStatusDto,
  CreateItemOrderDto,
  GetOrdersDto,
  UpdateItemOrderDto,
} from './dto';
import { ItemOrder } from './models/itemOrder.model';
import { FindAndCountOptions, literal } from 'sequelize'; // Sequelize operators for filtering
import { generateOrderNumber } from 'src/orders/utils/orders.utils';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { Supplier } from '../inventory/suppliers/models/supplier.model';
import { Item } from '../inventory/items/models';

@Injectable()
export class ItemOrdersService {
  constructor(
    @InjectModel(ItemOrder)
    private itemOrderModel: typeof ItemOrder,
  ) {}

  // Create a new item order
  async createItemOrder(dto: CreateItemOrderDto): Promise<ItemOrder> {
    if (!dto.orderNumber) {
      dto.orderNumber = generateOrderNumber();
    }

    return this.itemOrderModel.create({ ...dto });
  }

  // Fetch multiple item orders with optional filters
  async findItemOrders(
    dto: GetOrdersDto,
  ): Promise<PaginatedDataResponseDto<ItemOrder[]>> {
    const {
      page = 1,
      pageSize = 10,
      orderBy,
      orderDirection = 'DESC',
      status,
      supplierId,
      itemId,
    } = dto;

    // Define query options
    const queryOptions: FindAndCountOptions<ItemOrder> = {
      where: {
        ...(status && { status }),
        ...(supplierId && { supplierId }),
        ...(itemId && { itemId }),
      },
      distinct: true,
      order: [
        !orderBy
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
          : [
              orderBy && orderBy,
              orderDirection && orderDirection.toUpperCase(),
            ],
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
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
        { model: Supplier, attributes: ['id', 'name'] },
        { model: Item, attributes: ['id', 'name'] },
      ],
    };

    const orders = await this.itemOrderModel.findAndCountAll(queryOptions);
    return new PaginatedDataResponseDto(
      orders.rows,
      page,
      pageSize,
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
  ): Promise<ItemOrder> {
    const itemOrder = await this.itemOrderModel.findOne({ where: { id } });
    if (!itemOrder) {
      throw new NotFoundException('User not found');
    }
    await itemOrder.update(dto);
    return;
  }

  async changeState(dto: ChangeOrderStatusDto, id: string) {
    const itemOrder = await this.itemOrderModel.update(
      { ...dto },
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
    const rows = await this.itemOrderModel.destroy({ where: { id } });
    if (rows == 0) {
      throw new NotFoundException('Item Order not found');
    }
    return;
  }
}
