import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Logger,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiSuccessResponseDto,
  PaginatedDataResponseDto,
} from '../utils/responses/success.response';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateItemOrderDto, CreateItemOrderDto, GetOrdersDto } from './dto';
import { ItemOrdersService } from './orders.service';
import { ItemOrder } from './models/itemOrder.model';
import { Authorize, Permission } from 'src/auth/decorator';
import { CustomApiResponse } from 'src/shared/docs/decorators';
import { throwError } from '../utils/responses/error.response';
import { Features, PermissionLevel } from '../shared/enums/permissions.enum';

@ApiTags('Item Orders')
@Controller('item-orders')
@ApiBearerAuth('access-token')
@Authorize()
export class ItemOrdersController {
  private readonly logger = new Logger(ItemOrdersController.name);
  constructor(private readonly orderService: ItemOrdersService) {}

  @ApiOperation({ summary: 'Create a new item order' })
  @CustomApiResponse(['authorize', 'success'], {
    type: ItemOrder,
    message: 'Item order created successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() dto: CreateItemOrderDto,
  ): Promise<ApiSuccessResponseDto<ItemOrder>> {
    try {
      const result = await this.orderService.createItemOrder(dto);
      return new ApiSuccessResponseDto<ItemOrder>(
        result,
        HttpStatus.CREATED,
        'Item order created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Retrieve multiple item orders' })
  @CustomApiResponse(['paginated', 'authorize'], {
    type: ItemOrder,
    message: 'Multiple item orders retrieved successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ)
  @Get()
  async getItemOrders(
    @Query() query: GetOrdersDto,
  ): Promise<ApiSuccessResponseDto<PaginatedDataResponseDto<ItemOrder[]>>> {
    try {
      const result = await this.orderService.findItemOrders(query);
      return new ApiSuccessResponseDto(
        result,
        HttpStatus.OK,
        'Item orders retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Get a specific item order by ID' })
  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Item order retrieved successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ)
  @Get(':id')
  async getItemOrder(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponseDto<ItemOrder>> {
    try {
      const result = await this.orderService.findItemOrder(id);

      return new ApiSuccessResponseDto<ItemOrder>(
        result,
        HttpStatus.OK,
        'Item order retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Update a item order by ID' })
  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Item order updated successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async updateItemOrder(
    @Param('id') id: string,
    @Body() dto: UpdateItemOrderDto,
  ): Promise<ApiSuccessResponseDto<ItemOrder>> {
    try {
      const result = await this.orderService.updateItemOrder(id, dto);
      return new ApiSuccessResponseDto<ItemOrder>(
        result,
        HttpStatus.ACCEPTED,
        'Item order updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Delete a item order by ID' })
  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Multiple item orders retrieved successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async deleteItemOrder(@Param('id') id: string) {
    try {
      const msg = await this.orderService.deleteItemOrder(id);
      return new ApiSuccessResponseDto(
        msg,
        HttpStatus.OK,
        'Item order deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
