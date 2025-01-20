import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, Permission } from 'src/auth/decorator';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { throwError } from 'src/utils/responses/error.response';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';
import {
  AdjustPriceDto,
  CreateItemDto,
  ItemAnalytics,
  ItemCounts,
  ItemPaginationDto,
  OneItem,
  UpdateItemDto,
} from './dto';
import { ItemService } from './items.service';

import { BatchService } from './batches/batch.service';
import { GetNoPaginateDto } from '../../shared/docs/dto/get-no_paginate.dto';
import {
  BatchesNoPaginate,
  CreateBatchDto,
  OneBatch,
  BatchResponseDto,
  UpdateBatchDto,
} from './batches/dto';
import { PaginationRequestDto } from '../../shared/docs/dto/pagination.dto';

@ApiTags('Items')
@Controller('items')
export class ItemController {
  private readonly logger: Logger;
  constructor(
    private readonly itemsService: ItemService,
    private batchService: BatchService,
  ) {
    this.logger = new Logger(ItemController.name);
  }

  @CustomApiResponse(['created', 'authorize'], {
    type: OneItem,
    message: 'Item created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post()
  async create(@Body() dto: CreateItemDto, @GetUser() user: IUserPayload) {
    try {
      !dto.facilityId && (dto.facilityId = user.facility);
      !dto.departmentId && (dto.departmentId = user.department);
      dto.createdBy = user.sub;
      const createdItem = await this.itemsService.create(dto);
      return new ApiSuccessResponseDto(
        createdItem,
        HttpStatus.CREATED,
        'Item created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['created', 'authorize'], {
    type: OneBatch,
    message: 'Batch created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post('add-batch')
  async addBatch(@Body() dto: CreateBatchDto, @GetUser() user: IUserPayload) {
    try {
      dto.createdBy = user.sub;
      const createdItem = await this.batchService.create(dto);
      return new ApiSuccessResponseDto(
        createdItem,
        HttpStatus.CREATED,
        'Batch created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: BatchesNoPaginate,
    isArray: true,
    message: 'Batches retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('batches/:itemId/no-paginate')
  async retrieveBatchesNoPaginate(
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    try {
      const batches = await this.batchService.findAllNoPaginate(itemId);
      return new ApiSuccessResponseDto(
        batches,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: BatchResponseDto,
    isArray: true,
    message: 'Batches retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get(':id/batches')
  async retrieveBatches(
    @Param('id', ParseUUIDPipe) itemId: string,
    @Query() query: PaginationRequestDto,
  ) {
    try {
      const batches = await this.batchService.fetchAllPaginate(itemId, query);
      const paginated = new PaginatedDataResponseDto(
        batches.rows,
        query.page || 1,
        query.pageSize || 10,
        batches.count,
      );
      return new ApiSuccessResponseDto(
        paginated,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: BatchResponseDto,
    message: 'Batch retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('batches/:id')
  async retrieveBatch(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const batches = await this.batchService.findOne(id, true);
      return new ApiSuccessResponseDto(
        batches,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'batch updated successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Patch('edit-batch/:id')
  async updateBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateBatchDto,
  ) {
    try {
      await this.batchService.update(id, updateItemDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Batch updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: CreateItemDto,
    isArray: true,
    message: 'Items retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get()
  async findAll(
    @Query() query: ItemPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      !query.facilityId && (query.facilityId = user.facility);
      !query.departmentId && (query.departmentId = user.department);
      const items = await this.itemsService.findAll(query);
      return new ApiSuccessResponseDto(
        items,
        HttpStatus.OK,
        'Items retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  // @CustomApiResponse(['success', 'authorize'], {
  //   type: GetNoPaginateDto,
  //   isArray: true,
  //   message: 'Item status updated successfully',
  // })
  // @Put()
  // async assignStatus() {
  //   const response = await this.itemsService.assignStatus();
  //   return response;
  // }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetNoPaginateDto,
    isArray: true,
    message: 'Items retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('no-paginate')
  async findAllNoPaginate(
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
  ) {
    try {
      const items = await this.itemsService.findWithNoPaginate(facilityId);
      return new ApiSuccessResponseDto(
        items,
        HttpStatus.OK,
        'Items retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemAnalytics,
    message: 'Item analytics retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('/analytics/:id')
  async analytics(@Param('id', ParseUUIDPipe) itemId: string) {
    return await this.itemsService.getAnalytics(itemId);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemCounts,
    message: 'Item counts retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('/counts')
  async itemCounts(@GetUser() user: IUserPayload) {
    try {
      const response = await this.itemsService.getItemCount(user);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'item counts retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: OneItem,
    message: 'Item retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const item = await this.itemsService.findOne(id);
      return new ApiSuccessResponseDto(
        item,
        HttpStatus.OK,
        'Item retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Item updated successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    try {
      await this.itemsService.update(id, updateItemDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Item prices adjusted successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Patch('/adjust-prices/:id')
  async adjustPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustPriceDto,
  ) {
    try {
      await this.itemsService.update(id, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item prices adjusted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Item deleted successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.itemsService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
