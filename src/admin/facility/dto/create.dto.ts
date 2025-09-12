import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacilityDto {
  @ApiProperty({
    example: 'Hospital A',
    description: 'The name of the hospital',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '@kRhCnlAtrqe1gr',
    description: 'The password for the facility',
  })
  @IsNotEmpty()
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
  //   {
  //     message:
  //       'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
  //   },
  // )
  password: string;

  email: string;
}
export enum IntervalUnit {
  Years = 'years',
  Months = 'months',
  Weeks = 'weeks',
  Days = 'days',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  Milliseconds = 'milliseconds',
  Microseconds = 'microseconds',
}
