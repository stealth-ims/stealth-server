import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MarkupService } from './markup.service';
import { CustomApiResponse } from '../../../core/shared/docs/decorators';
import { GetUser, Permission } from '../../../auth/decorator';
import { CreateMarkupDto, MarkupDto, UpdateMarkupDto } from './dto';
import {
  Features,
  PermissionLevel,
} from '../../../core/shared/enums/permissions.enum';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../../../core/shared/responses/success.response';
import { throwError } from '../../../core/shared/responses/error.response';
import { IUserPayload } from '../../../auth/interface/payload.interface';

@Controller('batches/:batchId/markup')
export class MarkupController {
  private logger = new Logger(MarkupController.name);
  constructor(private readonly markupService: MarkupService) {}

  @CustomApiResponse(['created', 'authorize'], {
    type: MarkupDto,
    message: 'Markup created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: CreateMarkupDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      dto.createdById = user.sub;
      dto.departmentId = user.department;
      dto.facilityId = user.facility;
      dto.batchId = batchId;
      const response = await this.markupService.create(dto);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'Markup added successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  // @Get()
  // findAll() {
  //   return this.markupService.findAll();
  // }

  @CustomApiResponse(['success', 'authorize'], {
    type: MarkupDto,
    message: 'Markup fetched successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Get()
  async findOne(@Param('batchId', ParseUUIDPipe) batchId: string) {
    try {
      const response = await this.markupService.findOne(batchId);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Markup fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: MarkupDto,
    message: 'Markup updated successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Patch()
  async update(
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() updateMarkupDto: UpdateMarkupDto,
  ) {
    try {
      const response = await this.markupService.update(
        batchId,
        updateMarkupDto,
      );
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Markup updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    type: MarkupDto,
    message: 'Markup deleted successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Delete()
  async remove(@Param('batchId', ParseUUIDPipe) batchId: string) {
    try {
      const _response = await this.markupService.remove(batchId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Markup deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
