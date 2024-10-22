import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DrugOrder } from './models/drugOrder.model';
import { Op } from 'sequelize'; // Sequelize operators for filtering
import { generateOrderNumber } from 'src/orders/utils/orders.utils';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import {
  CreateDrugOrderDto,
  GetOrdersDto,
  UpdateDrugOrderDto,
} from 'src/orders/dto';

@Injectable()
export class DrugOrdersService {
  constructor(
    @InjectModel(DrugOrder)
    private drugOrderModel: typeof DrugOrder,
  ) {}

  // Create a new drug order
  public async createDrugOrder(dto: CreateDrugOrderDto): Promise<DrugOrder> {
    // Convert DTO to a plain object to match the Sequelize model format
    const orderData: any = {
      drugName: dto.drugName,
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
    return this.drugOrderModel.create(orderData);
  }

  // Fetch multiple drug orders with optional filters
  public async findDrugOrders(
    dto: GetOrdersDto,
  ): Promise<PaginatedDataResponseDto<DrugOrder[]>> {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
      status,
      supplier,
      drugName,
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

    // Apply drug name filter if provided
    if (drugName) {
      queryOptions.where.drugName = {
        [Op.like]: `%${drugName}%`,
      };
    }

    const orders = await this.drugOrderModel.findAndCountAll(queryOptions);
    return new PaginatedDataResponseDto(
      orders.rows,
      page,
      pageSize,
      orders.count,
    );
  }

  // Fetch a specific drug order by ID
  public async findDrugOrder(id: string): Promise<DrugOrder> {
    const res = await this.drugOrderModel.findOne({
      where: { id },
    });

    if (!res) {
      throw new NotFoundException('Drug order not found');
    }
    return res;
  }

  // Update a specific drug order by ID
  public async updateDrugOrder(
    id: string,
    dto: UpdateDrugOrderDto,
  ): Promise<DrugOrder> {
    const drugOrder = await this.drugOrderModel.findOne({ where: { id } });
    if (!drugOrder) {
      throw new NotFoundException('User not found');
    }
    return drugOrder.update(dto);
  }

  // Delete a specific drug order by ID
  public async deleteDrugOrder(id: string) {
    const rows = await this.drugOrderModel.destroy({ where: { id } });
    if (rows == 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'drug order deleted successfully' };
  }
}
