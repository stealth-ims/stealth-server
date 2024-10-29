import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { CreateSaleDto } from './create.dto';

export class GetSalesDto extends CreateSaleDto {}

export class GetSalesPaginationDto extends PaginationRequestDto {}
