import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from '../shared/docs/decorators';
import { UserService } from './user.service';
import { throwError } from '../utils/responses/error.response';
import { GetUser } from '../auth/decorator';
import { ApiSuccessResponseNoData } from '../utils/responses/success.response';
import { CreateSettingsDto } from './dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  private logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @CustomApiResponse(['successNull', 'notfound', 'authorize'], {
    message: 'Settings added successfully',
  })
  @Patch('setting')
  async addSettings(
    @Body() dto: CreateSettingsDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      const _response = await this.userService.addService(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Settings added successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
