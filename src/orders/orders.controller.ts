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
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../core/shared/responses/success.response';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  UpdateItemOrderDto,
  CreateItemOrderDto,
  GetOrdersDto,
  GetItemOrdersResponseDto,
  GetItemOrderResponseDto,
  ChangeOrderStatusDto,
} from './dto';
import { ItemOrdersService } from './orders.service';
import { ItemOrder } from './models/itemOrder.model';
import { GetUser, Permission } from 'src/auth/decorator';
import { CustomApiResponse } from 'src/core/shared/docs/decorators';
import { throwError } from '../core/shared/responses/error.response';
import {
  Features,
  PermissionLevel,
} from '../core/shared/enums/permissions.enum';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Item Orders')
@Controller('item-orders')
export class ItemOrdersController {
  private readonly logger = new Logger(ItemOrdersController.name);
  constructor(private readonly orderService: ItemOrdersService) {}

  @ApiOperation({ summary: 'Create a new item order' })
  @CustomApiResponse(['authorize', 'created'], {
    type: CreateItemOrderDto,
    message: 'Item order created successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @GetUser() user: IUserPayload,
    @Body() dto: CreateItemOrderDto,
  ): Promise<ApiSuccessResponseDto<ItemOrder>> {
    try {
      const result = await this.orderService.createItemOrder(dto, user);
      return new ApiSuccessResponseDto<ItemOrder>(
        result,
        HttpStatus.CREATED,
        'Item order created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Retrieve multiple item orders' })
  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetItemOrdersResponseDto,
    message: 'Multiple item orders retrieved successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ)
  @Get()
  async getItemOrders(
    @GetUser('facility') facilityId: string,
    @Query() query: GetOrdersDto,
  ): Promise<ApiSuccessResponseDto<PaginatedDataResponseDto<ItemOrder[]>>> {
    try {
      const result = await this.orderService.findItemOrders(query, facilityId);
      return new ApiSuccessResponseDto(
        result,
        HttpStatus.OK,
        'Item orders retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Get a specific item order by ID' })
  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: GetItemOrderResponseDto,
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
      throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Update a item order by ID' })
  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Item order updated successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async updateItemOrder(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateItemOrderDto,
  ): Promise<ApiSuccessResponseDto<ItemOrder>> {
    try {
      const _result = await this.orderService.updateItemOrder(id, dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item order updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: "Change an item order's state by ID" })
  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Item order state changed successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE)
  @Put('/state/:id')
  async changeItemOrderState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeOrderStatusDto,
  ) {
    try {
      const _result = await this.orderService.changeState(dto, id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item order state changed successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiOperation({ summary: 'Delete a item order by ID' })
  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    type: ItemOrder,
    message: 'Multiple item orders retrieved successfully',
  })
  @Permission(Features.DRUG_ORDERS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async deleteItemOrder(@Param('id') id: string) {
    try {
      const _deletedOrder = await this.orderService.deleteItemOrder(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item order deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
