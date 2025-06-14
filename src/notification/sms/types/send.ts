export interface SMSMessageData {
  Message: string;
  Recipients: {
    statusCode: number;
    number: string;
    status: 'fulfilled' | 'failed';
    cost: string;
    messageId: string;
  };
}
