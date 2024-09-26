import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { CreateUserDto, GetUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { ApiSuccessResponseDto } from '../utils/responses/success.response';
import { User } from './models/user.model';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
} from '../shared/docs/decorators/response.decorators';
import { LoginDto, LoginTokenDto } from './dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '../utils/responses/error.response';
import { Authorize, GetUser } from './decorator';

@ApiTags('User Authentication')
@Controller('/users/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

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
      const response = await this.authService.register(dto);
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
      const response = await this.authService.login(dto);
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

  @ApiSuccessResponse({
    type: GetUserDto,
    description: 'User retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorResponse,
    description: 'invalid user',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiBearerAuth('access-token')
  @Get('user')
  @Authorize()
  async getUser(@GetUser('sub') id: string) {
    try {
      const response = await this.authService.retrieveUser(id);
      return new ApiSuccessResponseDto<User>(
        response,
        HttpStatus.OK,
        'user retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(`An error occured: ${error.message}`, error);
        throw new InternalServerErrorException(
          error.message ?? 'An unknown error occured',
          error,
        );
      }
    }
  }
}
