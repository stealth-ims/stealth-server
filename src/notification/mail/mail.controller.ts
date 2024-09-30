import { ConfigService } from '@nestjs/config';
import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private configService: ConfigService,
    private readonly mailservice: MailService,
  ) {}
}
