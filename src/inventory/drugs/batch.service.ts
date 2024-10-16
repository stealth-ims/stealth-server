import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Batch } from './models';
import { CreateBatchDto } from './dto';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { SuppliersService } from '../suppliers/suppliers.service';

@Injectable()
export class BatchService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Batch) private readonly batchRepo: typeof Batch,
    private readonly supplierService: SuppliersService,
  ) {
    this.logger = new Logger(BatchService.name);
  }

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const supplier = await this.supplierService.exists(
      createBatchDto.supplierId,
    );
    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${createBatchDto.supplierId} not found`,
      );
    }

    this.logger.log(`Creating batch for drugId: ${createBatchDto.drugId}...`);
    const batch = await this.batchRepo.create({ ...createBatchDto });
    this.logger.log(`Batch created successfully. ID: ${batch.id}`);
    return batch;
  }

  async findAll(): Promise<Batch[]> {
    return this.batchRepo.findAll({ include: [Supplier] });
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepo.findByPk(id, { include: [Supplier] });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  // async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
  //   const batch = await this.findOne(id);
  //   await batch.update(updateBatchDto);
  //   this.logger.log(`Batch updated successfully. ID: ${id}`);
  //   return batch;
  // }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    await batch.destroy();
    this.logger.log(`Batch deleted successfully. ID: ${id}`);
  }
}
