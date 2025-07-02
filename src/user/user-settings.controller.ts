import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { UserService } from './user.service';
import { throwError } from '../core/shared/responses/error.response';
import { GetUser } from '../auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../core/shared/responses/success.response';
import { CreateSettingsDto, GetSettingsDto } from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';
import { UpdateExpiryIntervalDto } from '../admin/facility/dto';

@ApiTags('User Settings')
@Controller('user')
export class UserSettingsController {
  private logger = new Logger(UserSettingsController.name);
  constructor(private readonly userService: UserService) {}

  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    message: 'Settings added successfully',
  })
  @Patch('settings')
  async addSettings(
    @Body() dto: CreateSettingsDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      const _response = await this.userService.addSettings(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Settings added successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: GetSettingsDto,
    message: 'Settings fetched successfully',
  })
  @Get('settings')
  async findSettings(@GetUser('sub', ParseUUIDPipe) userId: string) {
    try {
      const response = await this.userService.findSettings(userId);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Settings fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    message: 'Expiry interval set successfully',
  })
  @Patch('settings/expiry')
  async addExpiryInterval(
    @Body() dto: UpdateExpiryIntervalDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const _response = await this.userService.updateExpiryInterval(dto, user);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Expiry interval set successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: GetSettingsDto,
    message: 'Expiry interval fetched successfully',
  })
  @Get('settings/expiry')
  async fetchExpiryInterval(@GetUser() user: IUserPayload) {
    try {
      const response = await this.userService.fetchExpiryInterval(user);
      return new ApiSuccessResponseDto(
        response.facilityJson,
        HttpStatus.OK,
        'Expiry interval fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
