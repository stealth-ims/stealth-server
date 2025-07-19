import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class TwilioWebhookDto {
  @ApiProperty({
    description: 'The country the message is being sent to',
    name: 'ToCountry',
    example: 'US',
  })
  @IsString()
  @Expose({ name: 'ToCountry' })
  toCountry: string;

  @ApiProperty({
    description: 'The state in the country',
    name: 'ToState',
    example: 'GA',
  })
  @IsString()
  @Expose({ name: 'ToState' })
  toState: string;

  @ApiProperty({
    description: 'Unique ID for this SMS message',
    name: 'SmsMessageSid',
    example: 'SM9b5f70c16141e709c09c797f3befcf10',
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

  @ApiProperty({
    description: 'The city the message is intended to land',
    name: 'ToCity',
    example: 'Atlanta',
  })
  @IsString()
  @Expose({ name: 'ToCity' })
  toCity: string;

  @ApiProperty({
    description:
      "The zip code of the country/state/city of the message's origin",
    name: 'FromZip',
    example: '30002',
  })
  @IsString()
  @Expose({ name: 'FromZip' })
  fromZip: string;

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
    example: 'SM9b5f70c16141e709c09c797f3befcf10',
  })
  @IsString()
  @Expose({ name: 'SmsSid' })
  smsSid: string;

  @ApiProperty({
    description: 'The state the message originated from',
    name: 'FromState',
    example: 'NY',
  })
  @IsString()
  @Expose({ name: 'FromState' })
  fromState: string;

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
    description: 'The city the message originated from',
    name: 'FromCity',
    example: 'Queens',
  })
  @IsString()
  @Expose({ name: 'FromCity' })
  fromCity: string;

  @ApiProperty({
    description: 'Message body/content sent by the user',
    name: 'Body',
    example: 'Yes, I confirm my appointment.',
  })
  @IsString()
  @Expose({ name: 'Body' })
  body: string;

  @ApiProperty({
    description: 'The country the message originated from',
    name: 'FromCountry',
    example: 'US',
  })
  @IsString()
  @Expose({ name: 'FromCountry' })
  fromCountry: string;

  @ApiProperty({
    description: 'Twilio number the message was sent to',
    name: 'To',
    example: '+14155552671',
  })
  @IsString()
  @Expose({ name: 'To' })
  to: string;

  @ApiProperty({
    description:
      "The zip code of the country/state/city of the message's destination",
    name: 'ToZip',
    example: '11368',
  })
  @IsString()
  @Expose({ name: 'ToZip' })
  toZip: string;

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
    example: 'SM9b5f70c16141e709c09c797f3befcf10',
  })
  @IsString()
  @Expose({ name: 'MessageSid' })
  messageSid: string;

  @ApiProperty({
    description: 'The Twilio account SID',
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

export class AtskWebhookDto {
  @ApiProperty({
    description: 'Link ID for the webhook event',
    example: '5a2e3960-236d-429c-9a11-717181a39c4f',
  })
  @IsString()
  linkId: string;

  @ApiProperty({
    description: 'Message text',
    example: 'Hello',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Recipient identifier',
    example: '98615',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Unique webhook event ID',
    example: '562ae9b8-f7f5-4dd0-881e-1ea70d121687',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2025-06-14 15:27:39',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Sender identifier',
    example: '+233244668899',
  })
  @IsString()
  from: string;
}
