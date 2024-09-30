import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  InternalServerErrorException,
  BadRequestException,
  Logger,
  NotFoundException,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiSuccessResponseDto } from '../utils/responses/success.response';
import { ApiErrorResponse } from '../utils/responses/error.response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateDrugOrderDto } from './dto/createOrder.dto';
import { UpdateDrugOrderDto } from './dto/updateOrder.dto';
import { GetOrdersDto } from './dto/getOrder.dto';
import { DrugOrdersService } from './orders.service';
import { DrugOrder } from './models/drugOrder.model';
import { Authorize } from 'src/auth/decorator';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
} from '../shared/docs/decorators/response.decorators';
import { transformAndValidate } from 'class-transformer-validator';

@ApiTags('Drug Orders')
@Controller('drug-orders')
@ApiBearerAuth('access-token')
@Authorize()
export class DrugOrdersController {
  private readonly logger = new Logger(Controller.name);
  constructor(private readonly orderService: DrugOrdersService) {}

  @Post()
  @ApiCreatedSuccessResponse({
    type: DrugOrder,
    description: 'Drug order created successfully',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiOperation({ summary: 'Create a new drug order' })
  @ApiBody({ type: CreateDrugOrderDto })
  async create(
    @Body() req: CreateDrugOrderDto,
  ): Promise<ApiSuccessResponseDto<DrugOrder> | ApiErrorResponse> {
    try {
      let dto;
      try {
        dto = transformAndValidate(CreateDrugOrderDto, req);
      } catch (error) {
        throw new BadRequestException(error);
      }
      const result = await this.orderService.createDrugOrder(dto);
      return new ApiSuccessResponseDto(
        result,
        201,
        'Drug order created successfully',
      );
    } catch (error: any) {
      this.logger.error(
        `Error creating drug order: ${error.name} :: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve multiple drug orders' })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiResponse({
    status: 200,
    description: 'List multiple drug orders.',
    type: [DrugOrder],
  })
  @ApiResponse({ status: 400, description: 'Invalid request body provided' })
  @UsePipes(
    new ValidationPipe({ transform: true, skipUndefinedProperties: true }),
  ) // Apply validation and auto-transform query params
  async getDrugOrders(
    @Query() query: GetOrdersDto,
  ): Promise<ApiSuccessResponseDto<DrugOrder[]> | ApiErrorResponse> {
    try {
      const result = await this.orderService.findDrugOrders(query);
      return new ApiSuccessResponseDto(
        result,
        201,
        'Drug orders retrieved successfully',
      );
    } catch (error: any) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific drug order by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the drug order',
    type: String,
  })
  @ApiSuccessResponse({
    description: 'Drug order retrieved successfully.',
    type: DrugOrder,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'Drug order not found.',
  })
  async getDrugOrder(
    @Param('id') id: string,
  ): Promise<ApiSuccessResponseDto<DrugOrder> | ApiErrorResponse> {
    try {
      const result = await this.orderService.findDrugOrder(id);

      if (!result) {
        throw new NotFoundException('Drug order not found');
      }

      return new ApiSuccessResponseDto(
        result,
        200,
        'Drug order retrieved successfully',
      );
    } catch (error: any) {
      this.logger.error(
        `Error retrieving drug order: ${error.name} :: ${error.message}`,
        error.stack,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a drug order by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the drug order',
    type: String,
  })
  @ApiBody({ type: UpdateDrugOrderDto })
  @ApiSuccessResponse({
    description: 'Drug order updated successfully',
    type: DrugOrder,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occured',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'Drug order not found.',
  })
  async updateDrugOrder(
    @Param('id') id: string,
    @Body() req: UpdateDrugOrderDto,
  ): Promise<ApiSuccessResponseDto<DrugOrder> | ApiErrorResponse> {
    try {
      let dto;
      try {
        dto = transformAndValidate(UpdateDrugOrderDto, req);
      } catch (error) {
        throw new BadRequestException(error);
      }
      const result = await this.orderService.updateDrugOrder(id, dto);
      return new ApiSuccessResponseDto(
        result,
        200,
        'Drug order updated successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error updating drug order: ${error.name} :: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Unexpected error updating drug order',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a drug order by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the drug order',
    type: String,
  })
  @ApiSuccessResponse({
    description: 'Drug order deleted successfully.',
    type: DrugOrder,
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponse,
    description: 'Drug order not found.',
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  async deleteDrugOrder(@Param('id') id: string) {
    try {
      return await this.orderService.deleteDrugOrder(id);
    } catch (error) {
      this.logger.error(
        `Error deleting drug order: ${error.name} :: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Unexpected error deleting drug order',
      );
    }
  }
}
