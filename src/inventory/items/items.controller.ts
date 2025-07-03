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
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, Permission } from 'src/auth/decorator';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { CustomApiResponse } from 'src/core/shared/docs/decorators/default.response.decorators';
import { throwError } from 'src/core/shared/responses/error.response';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/core/shared/responses/success.response';
import {
  Features,
  PermissionLevel,
} from '../../core/shared/enums/permissions.enum';
import {
  AdjustPriceDto,
  CreateItemDto,
  FetchExpiredQueryDto,
  GetExpiredItemsDto,
  ItemAnalytics,
  ItemCounts,
  ItemPaginationDto,
  ManyItem,
  OneItem,
  UpdateItemDto,
} from './dto';
import { ItemService } from './items.service';
import { GetNoPaginateDto } from '../../core/shared/dto/get-no_paginate.dto';
import { ExportQueryDto } from '../../exports/dto';
import { ItemExportsService } from './exports.service';

@ApiTags('Items')
@Controller('items')
export class ItemController {
  private readonly logger: Logger;
  constructor(
    private readonly itemsService: ItemService,

    private readonly itemsExportsService: ItemExportsService,
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
      dto.facilityId = dto.facilityId || user.facility;
      dto.departmentId = dto.departmentId || user.department;
      dto.createdById = user.sub;
      const createdItem = await this.itemsService.create(dto);
      return new ApiSuccessResponseDto(
        createdItem,
        HttpStatus.CREATED,
        'Item created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'items exported successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('export')
  async exportItems(
    @Query() query: ExportQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.itemsExportsService.exportItems(query, user);
      return new StreamableFile(response.data, {
        type: response.meta.type,
        disposition: `attachment; filename="${response.meta.fileName}"`,
      });
    } catch (error) {
      throwError(this.logger, error);
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
      query.facilityId = query.facilityId || user.facility;
      query.departmentId = query.departmentId || user.department;
      const items = await this.itemsService.findAll(query);
      return new ApiSuccessResponseDto(
        items,
        HttpStatus.OK,
        'Items retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetExpiredItemsDto,
    message: 'Items retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('validity')
  async findAllWithValidity(
    @Query() query: FetchExpiredQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.itemsService.fetchItemsWithValidity(
        query,
        user,
      );

      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          response.rows,
          query.page || 1,
          query.pageSize,
          response.count,
        ),
        HttpStatus.OK,
        'Items retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetNoPaginateDto,
    isArray: true,
    message: 'Items retrieved successfully',
  })
  // @Permission(Features.ITEMS, PermissionLevel.READ)
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
      throwError(this.logger, error);
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
      throwError(this.logger, error);
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
      throwError(this.logger, error);
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
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.itemsService.update(id, updateItemDto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.itemsService.update(id, dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item prices adjusted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Item deleted successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.itemsService.remove(id, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
