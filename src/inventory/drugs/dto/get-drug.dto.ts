import { ApiProperty, ApiQuery, IntersectionType, } from "@nestjs/swagger";
import { CreateDrugDto } from "./create-drug.dto";
import { GenericResponseDto } from "src/shared/docs/dto/base.dto";
import { IsNumber, IsString } from "class-validator";
import { GetManyDto } from "src/shared/docs/dto/get-may.dto";

export class GetDrugDto extends IntersectionType(GetManyDto) {
  @ApiProperty({ example: "44220956-0962-4dd0-9e65-1564c585563c", description: 'Search drugs by supplier id' })
  supplierId: string;

  @ApiProperty({ example: 'laxatives', description: 'The dosage form of the drug', isArray: true, required: false })
  @IsString({ each: true })
  categories: string[];
}

export class DrugAnalytics {
  @ApiProperty({ example: 100, description: 'The total number of drugs in the system' })
  totalDrugs: number;

  @ApiProperty({ example: 10, description: 'The number of drug requests' })
  drugRequests: number;

  @ApiProperty({ example: 5, description: 'The percentage increment of drug requests' })
  drugIncrement: number;

  @ApiProperty({ example: 10, description: 'The number of drug request increments' })
  requestIncrement: number;

  @ApiProperty({ example: 20, description: 'The number of drugs that are out of stock' })
  outOfStock: number;

  @ApiProperty({ example: 50, description: 'The number of drugs that are in stock' })
  stocked: number;

  @ApiProperty({ example: 80, description: 'The number of drugs that are low in stock' })
  lowStocked: number;
}

export class DrugResponse extends IntersectionType(CreateDrugDto) { }