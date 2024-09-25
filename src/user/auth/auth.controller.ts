import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { CreateUserDto, GetUserDto } from '../dto';
import { AuthService } from './auth.service';
import { ApiSuccessResponseDto } from '../../utils/responses/success.response';
import { User } from '../models/user.model';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
} from '../../shared/docs/decorators/response.decorators';
import { LoginDto, LoginTokenDto } from './dto';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '../../utils/responses/error.response';

@ApiTags('User Authentication')
@Controller('/users/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly userAuthService: AuthService) {}

  @ApiCreatedSuccessResponse({
    type: GetUserDto,
    description: 'User created successfully',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @Post()
  async signUp(@Body() dto: CreateUserDto) {
    try {
      const response = await this.userAuthService.register(dto);
      return new ApiSuccessResponseDto<User>(
        response,
        HttpStatus.CREATED,
        'User created successfully awaiting approval from admin',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(`An error occured: ${error.message}`, error);
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }

  @ApiSuccessResponse({
    type: LoginTokenDto,
    description: 'User logged in successfully',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDto) {
    try {
      const response = await this.userAuthService.login(dto);
      return new ApiSuccessResponseDto<LoginTokenDto>(
        response,
        HttpStatus.OK,
        'User logged in successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(`An error occured: ${error.message}`, error);
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }
}
