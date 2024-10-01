import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private readonly mailService: MailerService,
  ) {
    // SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  send(mail: ISendMailOptions) {
    this.mailService
      .sendMail(mail)
      .then((success) => {
        this.logger.log('mail sent!', success);
      })
      .catch((err) => {
        this.logger.error('mail sent!', err);
      });
  }
}
