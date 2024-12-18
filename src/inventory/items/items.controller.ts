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
} from 'src/utils/responses/success.response';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';
import {
  AdjustPriceDto,
  CreateBatchDto,
  CreateItemDto,
  ItemAnalytics,
  ItemPaginationDto,
  ManyItem,
  OneItem,
  UpdateBatchDto,
  UpdateItemDto,
} from './dto';
import { ItemService } from './items.service';
import { Batch } from './models';
import { BatchService } from './batch.service';

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
      dto.createdBy = user.stamp;
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
    type: Batch,
    message: 'Batch created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post('add-batch')
  async addBatch(@Body() dto: CreateBatchDto, @GetUser() user: IUserPayload) {
    try {
      dto.createdBy = user.stamp;
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

  @CustomApiResponse(['successNull', 'authorize'], {
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
    type: ManyItem,
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

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemAnalytics,
    message: 'Item analytics retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('/analytics')
  async analytics() {
    return await this.itemsService.getAnalytics();
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemAnalytics,
    message: 'Item counts retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('/counts')
  async itemCounts() {
    try {
      const res = await this.itemsService.getItemCount();
      return res;
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

  @CustomApiResponse(['successNull', 'authorize'], {
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
