import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateItemOrderDto, GetOrdersDto, UpdateItemOrderDto } from './dto';
import { ItemOrder } from './models/itemOrder.model';
import { Op } from 'sequelize'; // Sequelize operators for filtering
import { generateOrderNumber } from 'src/orders/utils/orders.utils';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';

@Injectable()
export class ItemOrdersService {
  constructor(
    @InjectModel(ItemOrder)
    private itemOrderModel: typeof ItemOrder,
  ) {}

  // Create a new item order
  public async createItemOrder(dto: CreateItemOrderDto): Promise<ItemOrder> {
    // Convert DTO to a plain object to match the Sequelize model format
    const orderData: any = {
      itemName: dto.itemName,
      orderNumber: generateOrderNumber(),
      supplier: dto.supplier,
      date: dto.dateCreated,
      quantity: dto.quantity,
      status: dto.status,
    };

    // Include optional fields only if they are defined
    if (dto.expectedDeliveryDate) {
      orderData.expectedDeliveryDate = dto.expectedDeliveryDate;
    }

    // Use the plain object to create a new order
    return this.itemOrderModel.create(orderData);
  }

  // Fetch multiple item orders with optional filters
  public async findItemOrders(
    dto: GetOrdersDto,
  ): Promise<PaginatedDataResponseDto<ItemOrder[]>> {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
      status,
      supplier,
      itemName,
    } = dto;

    // Define query options
    const queryOptions: any = {
      where: {},
      order: [[orderBy, orderDirection.toUpperCase()]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    // Apply status filter if provided
    if (status) {
      queryOptions.where.status = status;
    }

    // Apply supplier filter if provided
    if (supplier) {
      queryOptions.where.supplier = {
        [Op.like]: `%${supplier}%`,
      };
    }

    // Apply item name filter if provided
    if (itemName) {
      queryOptions.where.itemName = {
        [Op.like]: `%${itemName}%`,
      };
    }

    const orders = await this.itemOrderModel.findAndCountAll(queryOptions);
    return new PaginatedDataResponseDto(
      orders.rows,
      page,
      pageSize,
      orders.count,
    );
  }

  // Fetch a specific item order by ID
  public async findItemOrder(id: string): Promise<ItemOrder> {
    const res = await this.itemOrderModel.findOne({
      where: { id },
    });

    if (!res) {
      throw new NotFoundException('Item order not found');
    }
    return res;
  }

  // Update a specific item order by ID
  public async updateItemOrder(
    id: string,
    dto: UpdateItemOrderDto,
  ): Promise<ItemOrder> {
    const itemOrder = await this.itemOrderModel.findOne({ where: { id } });
    if (!itemOrder) {
      throw new NotFoundException('User not found');
    }
    return itemOrder.update(dto);
  }

  // Delete a specific item order by ID
  public async deleteItemOrder(id: string) {
    const rows = await this.itemOrderModel.destroy({ where: { id } });
    if (rows == 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'item order deleted successfully' };
  }
}
