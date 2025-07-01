import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AccountState, User } from '../models/user.model';
import { addSeconds } from 'date-fns';

export class TokenDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  @ApiResponseProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWFlYTcxNi0xYjM3LTQ0MTEtOTcyNS04MzIyYTBiZmRmMmQiLCJzZXNzaW9uIjpudWxsLCJpYXQiOjE3NTA5NDc0MDAsImV4cCI6MTc1MDk1MTAwMCwiYXVkIjoibG9jYWxob3N0OjU1MDAiLCJpc3MiOiJsb2NhbGhvc3Q6NTUwMCJ9.Uo3HlOhdc1G_lfUGinBnLUSyJqOPGzc6KwV0DQt5CIQcheck',
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
  constructor(user: User, tokens: TokenDto, expiresAt: number) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.status = user.status;
    this.tokens = tokens;
    this.expiresAt = addSeconds(new Date(), expiresAt);
  }
  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  id: string;

  @ApiResponseProperty({
    example: 'j.doe3256',
  })
  username: string;

  @ApiResponseProperty({
    example: 'example@email.com',
  })
  email: string;

  @ApiResponseProperty({
    example: 'Active',
    enum: AccountState,
  })
  status: AccountState;

  @ApiResponseProperty({
    type: TokenDto,
  })
  tokens: TokenDto;

  @ApiResponseProperty({
    example: addSeconds(new Date(), 3600),
  })
  expiresAt: Date;
}
