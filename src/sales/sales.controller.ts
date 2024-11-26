import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import {
  GetSalesDto,
  CreateSaleDto,
  UpdateSalesDto,
  GetSalesPaginationDto,
} from './dto/';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators';
import { ApiSuccessResponseDto } from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  private logger = new Logger(SalesController.name);

  constructor(private readonly salesService: SalesService) {}

  @CustomApiResponse(['authorize', 'success'], {
    type: GetSalesDto,
    message: 'Sales created successfully',
  })
  @Post()
  async create(@Body() createSaleDto: CreateSaleDto) {
    try {
      const response = await this.salesService.create(createSaleDto);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'sale created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetSalesDto,
    message: 'Sales retrieved successfully',
  })
  @Get()
  getSales(@Query() query: GetSalesPaginationDto) {
    try {
      return this.salesService.fetchAll(query);
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull'], {
    message: 'Sale updated  successfully',
  })
  @Patch('/:id')
  updateSale(@Body() dto: UpdateSalesDto, @Param('id') id: string) {
    try {
      return this.salesService.update(id, dto);
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'success'], {
    type: GetSalesDto,
    message: 'Sale fetched successfully',
  })
  @Get('/:id')
  getSale(@Param('id') id: string) {
    try {
      return this.salesService.fetchOne(id);
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull'], {
    message: 'Sale deleted successfully',
  })
  @Delete('/:id')
  deleteSale(@Param('id') id: string) {
    try {
      this.salesService.removeOne(id);
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
