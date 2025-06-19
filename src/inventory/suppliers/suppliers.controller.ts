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
import { SuppliersService } from './suppliers.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/core/shared/docs/decorators/default.response.decorators';
import {
  CreateSupplierDto,
  GetSupplierDto,
  GetSupplierResponse,
  GetSuppliersResponse,
  SupplierResponse,
  UpdateSupplierDto,
} from './dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/core/shared/responses/success.response';
import { throwError } from 'src/core/shared/responses/error.response';
import { StatusType } from './models/supplier.model';
import { GetUser, Permission } from '../../auth/decorator';
import { DeleteItemsDto } from '../../core/shared/dto/delete.dto';
import {
  Features,
  PermissionLevel,
} from '../../core/shared/enums/permissions.enum';
import { GetNoPaginateDto } from '../../core/shared/dto/get-no_paginate.dto';
import { IUserPayload } from '../../auth/interface/payload.interface';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  private readonly logger: Logger;
  constructor(private readonly suppliersService: SuppliersService) {
    this.logger = new Logger(SuppliersController.name);
  }

  @CustomApiResponse(['created', 'authorize'], {
    type: SupplierResponse,
    message: 'Supplier created successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const supplier = await this.suppliersService.create(
        createSupplierDto,
        user,
      );
      return new ApiSuccessResponseDto(
        supplier,
        HttpStatus.CREATED,
        `Supplier created successfully`,
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetSuppliersResponse,
    isArray: true,
    message: 'Suppliers retrieved successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ)
  @Get()
  async findAll(
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
    @Query() query: GetSupplierDto,
  ) {
    try {
      const suppliers = await this.suppliersService.findAll(facilityId, query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          suppliers[0],
          query.page || 1,
          query.pageSize,
          suppliers[1],
        ),
        HttpStatus.OK,
        'Suppliers retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetNoPaginateDto,
    isArray: true,
    message: 'Suppliers retrieved successfully',
  })
  // @Permission(Features.SUPPLIERS, PermissionLevel.READ)
  @Get('no-paginate')
  async findAllNoPaginate(
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
  ) {
    try {
      const suppliers =
        await this.suppliersService.findAllNoPaginate(facilityId);
      return new ApiSuccessResponseDto(
        suppliers,
        HttpStatus.OK,
        'Suppliers retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: GetSupplierResponse,
    message: 'Supplier retrieved successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const supplier = await this.suppliersService.findOne(id);
      return new ApiSuccessResponseDto(
        supplier,
        HttpStatus.OK,
        'supplier retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier updated successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.suppliersService.update(id, updateSupplierDto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'supplier updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier deactivated successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Patch(':id/deactivate')
  async deactivateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.suppliersService.changeStatus(
        id,
        StatusType.DEACTIVATED,
        userId,
      );
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Supplier deactivated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier activated successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Patch(':id/activate')
  async activateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.suppliersService.changeStatus(id, StatusType.ACTIVE, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Supplier activated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier deleted successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.suppliersService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Supplier deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Suppliers deleted successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE_DELETE)
  @Delete()
  async removeBulk(@Body() dto: DeleteItemsDto) {
    try {
      await this.suppliersService.removeBulk(dto.ids);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Suppliers deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
