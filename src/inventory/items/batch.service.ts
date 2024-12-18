import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Batch } from './models';
import { CreateBatchDto, UpdateBatchDto } from './dto';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { FindAndCountOptions } from 'sequelize';

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

    this.logger.log(`Creating batch for itemId: ${createBatchDto.itemId}...`);
    const batch = await this.batchRepo.create({ ...createBatchDto });
    this.logger.log(`Batch created successfully. ID: ${batch.id}`);
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    const result = await this.batchRepo.update(
      { ...dto },
      { where: { id: id } },
    );
    if (result[0] == 0) {
      throw new NotFoundException(`batch with id ${id} not found`);
    }
    this.logger.log(`Updated item with ID: ${id}`);
    return;
  }

  async findAll(): Promise<Batch[]> {
    return this.batchRepo.findAll({ include: [Supplier] });
  }

  async findBySpecs(options?: FindAndCountOptions<Batch>) {
    return this.batchRepo.findAndCountAll(options);
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepo.findByPk(id, { include: [Supplier] });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async removeStock(id: string, qty: number): Promise<void> {
    const batch = await this.findOne(id);
    if (batch.quantity - qty < 0)
      throw new BadRequestException('Insufficient stock in batch');

    batch.quantity -= qty;
    await batch.save();
    if (batch.quantity - qty == 0) await batch.destroy();
    this.logger.log(`Stock removed from batch. ID: ${id}`);
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
