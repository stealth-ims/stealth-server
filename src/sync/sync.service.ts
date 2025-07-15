import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSyncDto, FindSyncRequestsQueryDto } from './dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/sequelize';
import { SyncRequest } from './models/sync.model';
import { generateFilter } from '../core/shared/factory';
import { InstanceDestroyOptions, Op } from 'sequelize';
import { IUserPayload } from '../auth/interface/payload.interface';

@Injectable()
export class SyncService {
  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    @InjectModel(SyncRequest) private syncRequestRepository: typeof SyncRequest,
  ) {}

  async create(dto: CreateSyncDto) {
    //queue producer goes here.
    // const payload = dto.data[0];

    const jobs = dto.data.map((data) => {
      const job = {
        name: 'sync-requests',
        data: data,
        opts: { removeOnComplete: true, removeOnFail: true },
      };
      return job;
    });
    const _job = await this.syncQueue.addBulk(jobs);

    return;
  }

  async findAll(query: FindSyncRequestsQueryDto, user: IUserPayload) {
    const whereConditions: Record<string, any> = {
      facilityId: user.facility,
      departmentId: user.department,
    };

    const queryFilter = generateFilter(query, {
      [Op.or]: [
        { message: { [Op.iLike]: `%${query.search}%` } },
        { action: { [Op.iLike]: `%${query.search}%` } },
        { url: { [Op.iLike]: `%${query.search}%` } },
        { statusCode: { [Op.iLike]: `%${query.search}%` } },
      ],
    });

    const { rows, count } = await this.syncRequestRepository.findAndCountAll({
      where: {
        ...whereConditions,
        ...queryFilter.searchFilter,
      },
      ...queryFilter.pageFilter,
      attributes: [
        'id',
        'method',
        'url',
        'action',
        'message',
        'statusCode',
        'createdAt',
      ],
    });

    return { rows, count };
  }

  async findOne(id: string) {
    const syncRequest = await this.syncRequestRepository.findByPk(id, {
      attributes: {
        exclude: ['departmentId', 'facilityId', 'createdById', 'updatedAt'],
      },
    });
    if (!syncRequest) {
      throw new NotFoundException('Sync Request not found');
    }
    return syncRequest;
  }

  async remove(id: string) {
    const syncRequest = await this.syncRequestRepository.findByPk(id, {
      attributes: ['id', 'method', 'url'],
    });
    if (!syncRequest) {
      throw new NotFoundException('Sync Request not found');
    }
    await syncRequest.destroy({
      force: true,
      skipAudit: true,
    } as InstanceDestroyOptions);
    return;
  }
}
