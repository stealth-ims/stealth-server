import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetUserDto, UpdateUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { User } from './models/user.model';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
  ApiSuccessResponseNullData,
} from '../core/shared/docs/decorators/response.decorators';
import {
  ChangePasswordDto,
  CheckCodeDto,
  ImageUploadDto,
  LoginDto,
  LoginTokenDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendForgotPasswordEmailDto,
  ValidateCodeDto,
  VerifyEmailDto,
} from './dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authorize, GetUser } from './decorator';
import {
  ApiErrorResponse,
  throwError,
} from '../core/shared/responses/error.response';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../core/shared/responses/success.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLoginSessionDto } from './dto/login-session.dto';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { AdminSignUpDto } from '../user/dto/signup.dto';
import { Request } from 'express';
import { CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiCreatedSuccessResponse({
    type: LoginTokenDto,
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
  async signUp(@Body() dto: AdminSignUpDto, @Req() req: Request) {
    try {
      const response = await this.authService.register(dto, req);
      return new ApiSuccessResponseDto<LoginTokenDto>(
        response,
        HttpStatus.CREATED,
        'User created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.authService.uploadUserPicture(userId, file);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Image has been uploaded successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiBearerAuth('access-token')
  @Authorize()
  @Delete('profile-picture')
  @ApiSuccessResponseNullData({
    description: 'Picture deleted successfully',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'User not found',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'Image not found',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async deleteProfilePicture(@GetUser('sub', ParseUUIDPipe) userId: string) {
    try {
      await this.authService.deletePicture(userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Image has been deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
      throwError(this.logger, error);
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
  @CacheTTL(0.000001)
  @Get('user')
  async getUser(@GetUser('sub', ParseUUIDPipe) id: string) {
    try {
      const response = await this.authService.retrieveUser(id);
      const output = new ApiSuccessResponseDto<User>(
        response,
        HttpStatus.OK,
        'user retrieved successfully',
      );
      // res.status(HttpStatus.OK).json(output);
      return output;
    } catch (error) {
      throwError(this.logger, error);
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
  async getSessions(@GetUser('sub', ParseUUIDPipe) id: string) {
    try {
      const response = await this.authService.retrieveSessions(id);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'login sessions retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiSuccessResponse({
    type: RefreshTokenDto,
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
  @Get('refresh')
  async refreshTokens(@Query('token') token: string) {
    try {
      const response = await this.authService.refreshToken(token);
      return new ApiSuccessResponseDto<RefreshTokenDto>(
        response,
        HttpStatus.OK,
        'Tokens refreshed successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Post('forgot-password/send')
  @ApiSuccessResponseNullData({
    description: 'Code sent successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() dto: SendForgotPasswordEmailDto) {
    try {
      await this.authService.sendResetPasswordCode(dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'code has been sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Post('verification/send-mail')
  @ApiSuccessResponseNullData({
    description: 'Email sent successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async sendVerificationMail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    try {
      await this.authService.sendVerificationEmail(dto.email, req);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'email has been sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Get('verify')
  @ApiOkResponse({
    type: String,
    description: 'Account verified successfully',
  })
  @ApiForbiddenResponse({
    type: ApiErrorResponse,
    description: 'Cannot be verified',
  })
  // @ApiSuccessResponseNullData({
  //   description: 'Account verified successfully',
  // })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async verifyAccount(@Query('token') token: string) {
    try {
      const response = await this.authService.verifyAccount(token);
      return response;
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Post('forgot-password/validate-code')
  @ApiSuccessResponseNullData({
    description: 'Code has been validated successfully',
  })
  @ApiGoneResponse({
    type: ApiErrorResponse,
    description: 'Code has expired',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async validateCode(@Body() dto: ValidateCodeDto) {
    try {
      await this.authService.checkCode(dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'code has been validated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
      throwError(this.logger, error);
    }
  }

  @Patch()
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
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.authService.updateUser(userId, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'user has been updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiBearerAuth('access-token')
  @Authorize()
  @Post('change-email/send-mail')
  @ApiSuccessResponseNullData({
    description: 'Email sent successfully',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @HttpCode(HttpStatus.OK)
  async sendResetMail(
    @Body() dto: VerifyEmailDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.authService.sendChangeEmailCode(dto.email, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'email has been sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.authService.verifychangeEmailCode(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'OTP validated. User email updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
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
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.authService.changePassword(dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'user password changed successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Session deleted successfully',
  })
  @Delete('/session/:id')
  async deleteSession(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) adminId: string,
  ) {
    try {
      await this.authService.removeSession(id, adminId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'session deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
