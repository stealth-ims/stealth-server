import { PickType } from '@nestjs/swagger';
import { TokenDto } from './token.dto';

export class RefreshTokenDto extends PickType(TokenDto, ['refreshToken']) {}
