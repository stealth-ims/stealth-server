import { Controller, Get, HttpStatus, Logger, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { UserService } from './user.service';
import { throwError } from '../core/shared/responses/error.response';
import { GetUser } from '../auth/decorator';
import { ApiSuccessResponseDto } from '../core/shared/responses/success.response';
import { FindUserDto, GetUsersNoPaginateDto } from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(private readonly userService: UserService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: GetUsersNoPaginateDto,
    message: 'Users fetched successfully',
  })
  @Get('no-paginate')
  async findSettings(
    @Query() query: FindUserDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      query.facilityId = user.facility;
      query.departmentId = user.department;
      const response = await this.userService.findNoPaginate(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Users fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
