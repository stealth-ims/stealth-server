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
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  CreateSupplierDto,
  GetSupplierResponse,
  GetSuppliersResponse,
  SupplierResponse,
  UpdateSupplierDto,
} from './dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { StatusType } from './models/supplier.model';
import { Permission } from '../../auth/decorator';
import { DeleteItemsDto } from '../../shared/docs/dto/delete.dto';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';

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
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    try {
      const supplier = await this.suppliersService.create(createSupplierDto);
      return new ApiSuccessResponseDto(
        supplier,
        HttpStatus.CREATED,
        `Supplier created successfully`,
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetSuppliersResponse,
    isArray: true,
    message: 'Suppliers retrieved successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ)
  @Get()
  async findAll(@Query() query: PaginationRequestDto) {
    try {
      const suppliers = await this.suppliersService.findAll(query);
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
      throw throwError(this.logger, error);
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
      throw throwError(this.logger, error);
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
  ) {
    try {
      await this.suppliersService.update(id, updateSupplierDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'supplier updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier deactivated successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Patch(':id/deactivate')
  async deactivateSupplier(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.suppliersService.changeStatus(id, StatusType.DEACTIVATED);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Supplier deactivated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Supplier activated successfully',
  })
  @Permission(Features.SUPPLIERS, PermissionLevel.READ_WRITE)
  @Patch(':id/activate')
  async activateSupplier(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.suppliersService.changeStatus(id, StatusType.ACTIVE);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Supplier activated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
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
      throw throwError(this.logger, error);
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
      throw throwError(this.logger, error);
    }
  }
}
