import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bullmq';
import { SyncRequest } from './models/sync.model';
import { User } from '../auth/models/user.model';
import { RequestMethodActionMap, SyncBodyDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../core/shared/responses/error.response';
import { isUUID } from 'class-validator';
import { IUserPayload } from '../auth/interface/payload.interface';
import { JwtService } from '@nestjs/jwt';

@Processor('sync')
export class SyncConsumer extends WorkerHost {
  private logger = new Logger(SyncConsumer.name);
  constructor(
    @InjectModel(SyncRequest) private syncRequestRepository: typeof SyncRequest,
    @InjectModel(User) private userRepository: typeof User,
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'sync-requests':
        await this.makeRequests(job.data as SyncBodyDto);
        break;
    }
  }

  private async makeRequests(payload: SyncBodyDto) {
    const obsRequest = this.httpService
      .request({
        method: payload.method,
        url: payload.url,
        data: payload.body,
        headers: payload.headers,
      })
      .pipe(
        catchError(async (error: AxiosError) => {
          this.logger.error(error.response.data);
          const errorResponse = error.response.data as ApiErrorResponse;
          payload.statusCode = error.status;
          await this.persistData(payload, errorResponse);

          throw error.response.data;
        }),
      );

    const _request = await firstValueFrom(obsRequest);
  }

  private async persistData(payload: SyncBodyDto, errorData: ApiErrorResponse) {
    payload.message = errorData.message;
    payload.action = RequestMethodActionMap[payload.method];
    if (!payload.headers.authorization) {
      return;
    }
    const [_, token] = payload.headers.authorization.split(' ') ?? [];

    let userId: string = token;
    if (!isUUID(token)) {
      try {
        const decoded: Partial<IUserPayload> =
          await this.jwtService.verifyAsync(token);
        userId = decoded.sub;
      } catch (error) {
        this.logger.error('token verification error: ', error);
        throw error;
      }
    }

    const user = await this.fetchUser(userId);
    payload.createdById = user.id;
    payload.facilityId = user.facilityId;
    payload.departmentId = user.departmentId;

    await this.syncRequestRepository.create({ ...payload });
    this.logger.debug('failed request logged successfully');
  }

  private async fetchUser(token: string) {
    const user = await this.userRepository.findByPk(token, {
      attributes: ['id', 'facilityId', 'departmentId'],
    });
    if (!user) {
      this.logger.error('user not found in fetch');
      throw new NotFoundException('user not found');
    }
    return user;
  }
}
