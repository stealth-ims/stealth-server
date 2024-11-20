import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ItemService } from './items.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  AdjustPriceDto,
  CreateItemDto,
  ItemAnalytics,
  ItemPaginationDto,
  ManyItem,
  OneItem,
  UpdateItemDto,
} from './dto';
import { Permission } from 'src/auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';

@ApiTags('Items')
@Controller('items')
export class ItemController {
  private readonly logger: Logger;
  constructor(private readonly itemsService: ItemService) {
    this.logger = new Logger(ItemController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: OneItem,
    message: 'Item created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    try {
      const createdItem = await this.itemsService.create(createItemDto);
      return new ApiSuccessResponseDto(
        createdItem,
        HttpStatus.CREATED,
        'Item category created successfully',
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
  async findAll(@Query() query: ItemPaginationDto) {
    try {
      const items = await this.itemsService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          items[0],
          query.page || 1,
          query.pageSize,
          items[1],
        ),
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
