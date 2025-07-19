import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUssdDto {
  @ApiProperty({
    example: '+233244335567',
    description: 'The phone number of the user.',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: '*384*25552#',
    description: 'The USSD service code.',
  })
  @IsString()
  @IsNotEmpty()
  serviceCode: string;

  @ApiPropertyOptional({
    example: '',
    description: 'The USSD text input from the user.',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    example: 'ATUid_5795f41cbc390231888b842bed441e30',
    description: 'The session ID for the USSD request.',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    example: '99999',
    description: 'The network code of the user.',
  })
  @IsString()
  @IsNotEmpty()
  networkCode: string;
}
