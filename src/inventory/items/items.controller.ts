import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DrugsService } from './items.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  AdjustPriceDto,
  CreateItemDto,
  ItemAnalytics,
  ItemPaginationDto,
  ManyItem,
  OneItem,
  UpdateItemDto,
} from './dto';
import { Permission } from 'src/auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';

@ApiTags('Drugs')
@Controller('drugs')
export class DrugsController {
  private readonly logger: Logger;
  constructor(private readonly drugsService: DrugsService) {
    this.logger = new Logger(DrugsController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: OneItem,
    message: 'Drug created successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ_WRITE)
  @Post()
  async create(@Body() createDrugDto: CreateItemDto) {
    try {
      const createdDrug = await this.drugsService.create(createDrugDto);
      return new ApiSuccessResponseDto(
        createdDrug,
        HttpStatus.CREATED,
        'Drug category created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: ManyItem,
    isArray: true,
    message: 'Drugs retrieved successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ)
  @Get()
  async findAll(@Query() query: ItemPaginationDto) {
    try {
      const drugs = await this.drugsService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          drugs[0],
          query.page || 1,
          query.pageSize,
          drugs[1],
        ),
        HttpStatus.OK,
        'Drugs retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemAnalytics,
    message: 'Drug analytics retrieved successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ)
  @Get('/analytics')
  async analytics() {
    return await this.drugsService.getAnalytics();
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: OneItem,
    message: 'Drug retrieved successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const drug = await this.drugsService.findOne(id);
      return new ApiSuccessResponseDto(
        drug,
        HttpStatus.OK,
        'Drug retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Drug updated successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugDto: UpdateItemDto,
  ) {
    try {
      await this.drugsService.update(id, updateDrugDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Drug updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Drug prices adjusted successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ_WRITE)
  @Patch('/adjust-prices/:id')
  async adjustPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustPriceDto,
  ) {
    try {
      await this.drugsService.update(id, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Drug prices adjusted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Drug deleted successfully',
  })
  @Permission(Features.DRUGS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.drugsService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Drug deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
