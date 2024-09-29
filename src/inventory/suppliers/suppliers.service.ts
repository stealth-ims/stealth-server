import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Supplier } from './models/supplier.model';
import { CreateSupplierDto, SupplierResponse, UpdateSupplierDto } from './dto';
import { throwError } from 'src/utils/responses/error.response';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import {
  ApiSuccessResponseDto,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { FindAndCountOptions, Op } from 'sequelize';
import { Drug } from '../drugs/models/drug.model';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Supplier) private readonly supplierRepo: typeof Supplier,
  ) {
    this.logger = new Logger(SuppliersService.name);
  }
  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<ApiSuccessResponseDto<SupplierResponse>> {
    try {
      const supplier = await this.supplierRepo.create({ ...createSupplierDto });

      this.logger.log(`Created supplier with ID: ${supplier.id}`);

      return new ApiSuccessResponseDto(
        supplier,
        HttpStatus.CREATED,
        `Supplier created successfully`,
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findAll(
    query: PaginationRequestDto,
  ): Promise<
    ApiSuccessResponseDto<PaginatedDataResponseDto<SupplierResponse[]>>
  > {
    try {
      // todo: refactor filter
      const filter: FindAndCountOptions<Supplier> = {
        where:
          (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {},
        limit: query.pageSize || 10,
        offset: query.pageSize * (query.page - 1) || 0,
        order: query.orderBy && [[query.orderBy, 'ASC']],
      };
      const suppliers = await this.supplierRepo.findAndCountAll(filter);
      this.logger.log(`Retrieved ${suppliers.count} supplier(s)`);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          suppliers.rows,
          query.page || 1,
          query.pageSize,
          suppliers.count,
        ),
        HttpStatus.FOUND,
        'Suppliers retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findOne(id: string): Promise<ApiSuccessResponseDto<SupplierResponse>> {
    try {
      this.logger.log(`Finding supplier with ID: ${id}`);
      const supplier = await this.supplierRepo.findByPk(id, {
        include: [Drug],
      });

      if (!supplier) {
        this.logger.warn('supplier not found');
        throw new NotFoundException(`supplier with id: ${id} not found`);
      }
      this.logger.log(`Found suppliier with ID: ${id}`);
      return new ApiSuccessResponseDto(
        supplier,
        HttpStatus.FOUND,
        'supplier retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  update(_id: string, _updateSupplierDto: UpdateSupplierDto) {
    throw new NotImplementedException('Updating supplier not implemented');
  }

  remove(_id: string) {
    throw new NotImplementedException(`Deleting supplier not implemented`);
  }
}
