import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { User } from '../models/user.model';
import { Role } from '../interface/roles.enum';

export class TokenDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  @ApiResponseProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDc4OGZiYy1lOWVjLTQxYTYtOWQ2OC1jZWM1OTc1YTlmYjciLCJlbWFpbCI6ImV4YW1wbGVAZW1haWwuY29tIiwiZmFjaWxpdHkiOiJHcmVhdGVyIEFjY3JhIFJlZ2lvbmFsIEhvc3BpdGFsIiwiZGVwYXJ0bWVudCI6InBoYXJtYWN5Iiwicm9sZSI6InBoYXJtYWNpc3QiLCJpYXQiOjE3MjcyNTI2ODMsImV4cCI6MTcyNzI1NjI4MywiYXVkIjoibG9jYWxob3N0OjQwMDAiLCJpc3MiOiJsb2NhbGhvc3Q6NDAwMCJ9.RSoeXrKAlTKyh5_WXX-CoJTZX72FKRKg9VGf80UI1CI',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDc4OGZiYy1lOWVjLTQxYTYtOWQ2OC1jZWM1OTc1YTlmYjciLCJpYXQiOjE3MjcyNTI2ODMsImV4cCI6MTcyNzI1NjI4MywiYXVkIjoibG9jYWxob3N0OjQwMDAiLCJpc3MiOiJsb2NhbGhvc3Q6NDAwMCJ9.-PCNzlYL0klY81iOGdyO2e9LSWzIwuGaQvOwhW1nKIc',
    description: 'Refresh token',
  })
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginTokenDto {
  constructor(user: User, tokens: TokenDto) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.facilityId = user.facilityId;
    this.departmentId = user.departmentId;
    this.permissions = user.permissions;
    this.role = user.role as Role;
    this.tokens = tokens;
  }
  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  id: string;

  @ApiResponseProperty({
    example: 'John Doe',
  })
  fullName: string;

  @ApiResponseProperty({
    example: 'example@email.com',
  })
  email: string;

  @ApiResponseProperty({
    example: '0244335567',
  })
  phoneNumber: string;

  @ApiResponseProperty({
    example: '9dcf380d-a58b-4f35-8870-9948af717cb8',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: 'b683e942-d167-48c3-8a67-b6ebde4676a2',
  })
  departmentId: string;

  @ApiResponseProperty({
    example: 'healthcare_worker',
    enum: Role,
  })
  role: Role;

  @ApiResponseProperty({
    example: [
      'items:READ',
      'item_categories:READ_WRITE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
    ],
  })
  permissions: string[];

  @ApiResponseProperty({
    type: TokenDto,
  })
  tokens: TokenDto;
}
