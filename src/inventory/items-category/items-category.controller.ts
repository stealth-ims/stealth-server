import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
  Patch,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ItemCategoryService } from './items-category.service';
import {
  CreateItemsCategoryDto,
  FindItemCategoryDto,
  ItemCategoryResponse,
  UpdateItemCategoryDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/core/shared/docs/decorators/default.response.decorators';
import { GetUser, Permission } from 'src/auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/core/shared/responses/success.response';
import { throwError } from 'src/core/shared/responses/error.response';
import {
  Features,
  PermissionLevel,
} from '../../core/shared/enums/permissions.enum';
import { GetNoPaginateDto } from '../../core/shared/dto/get-no_paginate.dto';
import { IUserPayload } from '../../auth/interface/payload.interface';

@ApiTags('Item Category')
@Controller('item-categories')
export class ItemCategoryController {
  private readonly logger: Logger;
  constructor(private readonly itemCategoryService: ItemCategoryService) {
    this.logger = new Logger(ItemCategoryController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemCategoryResponse,
    message: 'Item category created successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() dto: CreateItemsCategoryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const createdCategory = await this.itemCategoryService.create(dto, user);
      return new ApiSuccessResponseDto(
        createdCategory,
        HttpStatus.CREATED,
        'Item category created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: ItemCategoryResponse,
    message: 'Item categories retrieved successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ)
  @Get()
  async findAll(
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
    @Query() query?: FindItemCategoryDto,
  ) {
    try {
      const categories = await this.itemCategoryService.findAll(
        facilityId,
        query,
      );
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          categories[0],
          query.page || 1,
          query.pageSize,
          categories[1],
        ),
        HttpStatus.OK,
        'Item categories retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetNoPaginateDto,
    isArray: true,
    message: 'Item categories retrieved successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ)
  @Get('no-paginate')
  async findAllNoPaginate(
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
  ) {
    try {
      const categories =
        await this.itemCategoryService.findAllNoPaginate(facilityId);
      return new ApiSuccessResponseDto(
        categories,
        HttpStatus.OK,
        'Item categories retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: ItemCategoryResponse,
    message: 'Item category retrieved successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const category = await this.itemCategoryService.findOne(id);
      return new ApiSuccessResponseDto(
        category,
        HttpStatus.OK,
        'Item category retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Item category updated successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async changeName(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemCategoryDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.itemCategoryService.changeName(id, dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Item updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  // @CustomApiResponse(['successNull', 'authorize'], {
  //   message: 'Item category status updated successfully',
  // })
  // @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ_WRITE)
  // @Patch(':id/status')
  // async toggleStatus(@Param('id', ParseUUIDPipe) id: string, @GetUser('sub', ParseUUIDPipe) userId: string) {
  //   try {
  //     await this.itemCategoryService.toggleStatus(id, userId);
  //     return new ApiSuccessResponseNoData(
  //       HttpStatus.OK,
  //       'Item category status updated successfully',
  //     );
  //   } catch (error) {
  //     throwError(this.logger, error);
  //   }
  // }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Item category deleted successfully',
  })
  @Permission(Features.ITEMS_CATEGORIES, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.itemCategoryService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Item deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
