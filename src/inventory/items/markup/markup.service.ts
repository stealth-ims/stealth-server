import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Batch, Item, Markup } from '../models';
import { CreateMarkupDto, UpdateMarkupDto } from './dto';
import { QueryOptionsDto } from '../../../core/shared/dto/query-options.dto';
import { buildQuery } from '../../../core/shared/factory/query-builder.factory';
import { IncludeOptions } from 'sequelize';
import { User } from '../../../auth/models/user.model';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';

@Injectable()
export class MarkupService {
  constructor(
    @InjectModel(Markup) private readonly markupRepo: typeof Markup,
    @InjectModel(Batch) private readonly batchRepo: typeof Batch,
  ) {}

  private populates: Record<string, IncludeOptions> = {
    batch: { model: Batch, attributes: ['id', 'batchNumber'] },

    createdBy: { model: User, attributes: ['id', 'fullName', 'email'] },

    item: { model: Item, attributes: ['id', 'name'] },

    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },
  };

  async create(dto: CreateMarkupDto) {
    const batch = await this.batchRepo.findByPk(dto.batchId, {
      attributes: ['id', 'itemId'],
    });
    if (!batch) {
      throw new NotFoundException('batch not found');
    }
    dto.itemId = batch.itemId;

    const markup = await this.markupRepo.create({
      ...dto,
    });
    return markup;
  }

  findAll() {
    return `This action returns all markup`;
  }

  async findOne(batchId: string) {
    const markup = await this.markupRepo.findOne({ where: { batchId } });
    if (!markup) {
      throw new NotFoundException('markup not found');
    }
    return markup;
  }

  async fetchOne(options: QueryOptionsDto<Markup>) {
    const queryOptions = buildQuery<Markup>(options, this.populates);
    const markup = await this.markupRepo.findOne(queryOptions);

    return markup;
  }

  async update(batchId: string, dto: UpdateMarkupDto) {
    const markup = await this.findOne(batchId);
    const batch = await this.batchRepo.findByPk(batchId, {
      attributes: ['id', 'itemId'],
    });
    dto.itemId = batch.itemId;

    await markup.update({ ...dto });
    return markup;
  }

  async remove(batchId: string) {
    const markup = await this.findOne(batchId);
    await markup.destroy();
  }
}
