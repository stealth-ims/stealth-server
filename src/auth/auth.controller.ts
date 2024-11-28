import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, GetUserDto, UpdateUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { User } from './models/user.model';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
  ApiSuccessResponseNullData,
} from '../shared/docs/decorators/response.decorators';
import {
  ChangePasswordDto,
  CheckCodeDto,
  ImageUploadDto,
  LoginDto,
  LoginTokenDto,
  ResetPasswordDto,
  SendForgotPasswordEmailDto,
  TokenDto,
} from './dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authorize, GetUser } from './decorator';
import { ApiErrorResponse } from '../utils/responses/error.response';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../utils/responses/success.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLoginSessionDto } from './dto/login-session.dto';
import { CustomApiResponse } from '../shared/docs/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @ApiBearerAuth('access-token')
  @Authorize()
  @UseInterceptors(FileInterceptor('file'))
  @Put('profile-picture')
  @ApiSuccessResponseNullData({
    description: 'Picture uploaded successfully',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'A validtion error occured',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile Picture',
    type: ImageUploadDto,
  })
  @HttpCode(HttpStatus.OK)
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('sub') userId: string,
  ) {
    try {
      await this.authService.uploadUserPicture(userId, file);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Image has been uploaded successfully',
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
    type: CreateLoginSessionDto,
    description: 'Login Sessions retrieved successfully',
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
  @Get('sessions')
  async getSessions(@GetUser('sub') id: string) {
    try {
      const response = await this.authService.retrieveSessions(id);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'login sessions retrieved successfully',
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
  async refreshTokens(
    @GetUser('sub') id: string,
    @GetUser('session') sessionId: string,
  ) {
    try {
      const response = await this.authService.refreshToken(id, sessionId);
      return new ApiSuccessResponseDto<TokenDto>(
        response,
        HttpStatus.OK,
        'tokens refreshed successfully',
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
  @ApiSuccessResponseNullData({
    description: 'Email sent successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() dto: SendForgotPasswordEmailDto) {
    try {
      await this.authService.sendResetPasswordCode(dto.email);
      return new ApiSuccessResponseNoData(
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
  @ApiSuccessResponseNullData({
    description: 'Code has been validated successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async validateCode(@Body() dto: CheckCodeDto) {
    try {
      await this.authService.checkCode(dto);
      return new ApiSuccessResponseNoData(
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
  @ApiSuccessResponseNullData({
    description: 'Password has been reset successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(dto);
      return new ApiSuccessResponseNoData(
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

  @Patch('')
  @ApiBearerAuth('access-token')
  @Authorize()
  @ApiSuccessResponseNullData({
    description: 'User updated successfully',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'A validtion error occured',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async updateUserDetails(
    @Body() dto: UpdateUserDto,
    @GetUser('sub') userId: string,
  ) {
    try {
      await this.authService.updateUser(userId, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'user has been updated successfully',
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

  @ApiBearerAuth('access-token')
  @Authorize()
  @Post('change-email/validate-otp')
  @ApiSuccessResponseNullData({
    description: 'OTP validated. User email updated successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async validateEmailCode(
    @Body() dto: CheckCodeDto,
    @GetUser('sub') userId: string,
  ) {
    try {
      await this.authService.verifychangeEmailCode(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'OTP validated. User email updated successfully',
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

  @ApiBearerAuth('access-token')
  @Authorize()
  @Put('/change-password')
  @ApiSuccessResponseNullData({
    description: 'User password updated successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async passwordChange(
    @Body() dto: ChangePasswordDto,
    @GetUser('sub') userId: string,
  ) {
    try {
      await this.authService.changePassword(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'user password changed successfully',
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

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Session deleted successfully',
  })
  @Delete('/session/:id')
  async deleteSession(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.authService.removeSession(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'session deleted successfully',
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
