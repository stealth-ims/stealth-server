import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto, GetUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { User } from './models/user.model';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
} from '../shared/docs/decorators/response.decorators';
import {
  CheckCodeDto,
  LoginDto,
  LoginTokenDto,
  ResetPasswordDto,
  SendForgotPasswordEmailDto,
  TokenDto,
} from './dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authorize, GetUser } from './decorator';
import { ApiErrorResponse } from '../utils/responses/error.response';
import { ApiSuccessResponseDto } from '../utils/responses/success.response';

@ApiTags('Authentication')
@Controller('auth')
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
  @Post('signup')
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
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
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
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
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
  @Authorize()
  @Get('user')
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
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }

  @ApiSuccessResponse({
    type: TokenDto,
    description: 'Tokens refreshed successfully',
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
  @Authorize()
  @Get('refresh')
  async refreshTokens(@GetUser('sub') id: string) {
    try {
      const response = await this.authService.refreshToken(id);
      return new ApiSuccessResponseDto<TokenDto>(
        response,
        HttpStatus.OK,
        'user retrieved successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }

  @Post('forgot-password/send-mail')
  @ApiSuccessResponse({
    type: String,
    description: 'email sent successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() dto: SendForgotPasswordEmailDto) {
    try {
      await this.authService.sendResetPasswordCode(dto.email);
      return new ApiSuccessResponseDto<string>(
        'email sent successfully',
        HttpStatus.OK,
        'email has been sent successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }

  @Post('forgot-password/validate-code')
  @ApiSuccessResponse({
    type: String,
    description: 'code has been validated successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async validateCode(@Body() dto: CheckCodeDto) {
    try {
      await this.authService.checkCode(dto);
      return new ApiSuccessResponseDto<string>(
        'Code validated. Proceed with password reset',
        HttpStatus.OK,
        'code has been validated successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }

  @Patch('forgot-password/reset')
  @ApiSuccessResponse({
    type: String,
    description: 'password has been reset successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(dto);
      return new ApiSuccessResponseDto<string>(
        'Password reset successful',
        HttpStatus.OK,
        'password has been reset successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(error.message, error);
      }
    }
  }
}
