import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class TwilioWebhookDto {
  @ApiProperty({
    description: 'Unique ID for this SMS message',
    name: 'SmsMessageSid',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Expose({ name: 'SmsMessageSid' })
  smsMessageSid: string;

  @ApiProperty({
    description: 'Number of media items attached',
    name: 'NumMedia',
    example: '0',
  })
  @IsString()
  @Expose({ name: 'NumMedia' })
  numMedia: string;

  @ApiPropertyOptional({
    description: 'Profile name of WhatsApp sender (WhatsApp only)',
    name: 'ProfileName',
    example: 'Jane Smith',
  })
  @IsOptional()
  @IsString()
  @Expose({ name: 'ProfileName' })
  profileName?: string;

  @ApiProperty({
    description: 'Same as SmsMessageSid',
    name: 'SmsSid',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Expose({ name: 'SmsSid' })
  smsSid: string;

  @ApiPropertyOptional({
    description: 'WhatsApp sender ID (WhatsApp only)',
    name: 'WaId',
    example: '14155552671',
  })
  @IsOptional()
  @IsString()
  @Expose({ name: 'WaId' })
  waId?: string;

  @ApiProperty({
    description: 'Status of the SMS message (e.g., "received")',
    name: 'SmsStatus',
    example: 'received',
  })
  @IsString()
  @Expose({ name: 'SmsStatus' })
  smsStatus: string;

  @ApiProperty({
    description: 'Message body/content sent by the user',
    name: 'Body',
    example: 'Yes, I confirm my appointment.',
  })
  @IsString()
  @Expose({ name: 'Body' })
  body: string;

  @ApiProperty({
    description: 'Twilio number the message was sent to',
    name: 'To',
    example: '+14155552671',
  })
  @IsString()
  @Expose({ name: 'To' })
  to: string;

  @ApiProperty({
    description: 'Number of message segments (usually "1")',
    name: 'NumSegments',
    example: '1',
  })
  @IsString()
  @Expose({ name: 'NumSegments' })
  numSegments: string;

  @ApiProperty({
    description: 'Unique message identifier',
    name: 'MessageSid',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Expose({ name: 'MessageSid' })
  messageSid: string;

  @ApiProperty({
    description: 'Your Twilio account SID',
    name: 'AccountSid',
    example: 'AC1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Expose({ name: 'AccountSid' })
  accountSid: string;

  @ApiProperty({
    description: 'Sender number (with or without whatsapp prefix)',
    name: 'From',
    example: 'whatsapp:+233244335567',
  })
  @IsString()
  @Expose({ name: 'From' })
  from: string;

  @ApiProperty({
    description: 'Twilio API version used',
    name: 'ApiVersion',
    example: '2010-04-01',
  })
  @IsString()
  @Expose({ name: 'ApiVersion' })
  apiVersion: string;
}
