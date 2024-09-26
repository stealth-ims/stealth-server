import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Supplier } from './models/supplier.model';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { throwError } from 'src/utils/responses/error.response';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Supplier) private readonly supplierRepo: typeof Supplier
  ) { this.logger = new Logger(SuppliersService.name); }
  async create(createSupplierDto: CreateSupplierDto) {
    return 'This action adds a new supplier';
  }

  findAll() {
    return `This action returns all suppliers`;
  }

  async findOne(id: string): Promise<Supplier> {
    try {
      const found = await this.supplierRepo.findByPk(id);
      if (!found) {
        throw new NotFoundException(`Supplier with id ${id} not found`);
      }
      return found;
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: string) {
    return `This action removes a #${id} supplier`;
  }
}
