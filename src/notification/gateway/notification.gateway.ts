import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for your frontend URL
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private sub: Redis;
  private pub: Redis;

  constructor() {
    this.sub = new Redis(process.env.REDIS_URL, { family: 0 });
    this.pub = new Redis(process.env.REDIS_URL, { family: 0 });
  }

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private NOTIFICATIONS_NEW = 'notification.new';

  afterInit() {
    this.sub.subscribe(this.NOTIFICATIONS_NEW, (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe: ' + err.message);
      } else {
        this.logger.log(
          `Subscribed successfully! This client is currently subscribed to ${count as number} channels.`,
        );
      }
    });

    this.sub.on('message', (channel, message) => {
      this.logger.log(`Received message from ${channel}: ${message}`);
      const data = JSON.parse(message);
      this.server.to(data.topic).emit(channel, data.notification);
    });

    this.logger.log('🚀 Notifications Gateway initialized');
  }

  // Handles new client connections
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Handles client disconnections
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribeToTopic(
    @MessageBody('topic') topic: string,
    @ConnectedSocket() client: Socket,
  ): { topic: string; message: string } {
    client.join(topic);

    this.logger.debug('I am subscribed to topic: ' + topic);

    return {
      topic: topic,
      message: `You are now subscribed to ${topic}`,
    };
  }

  async handleNewNotification(event: string, data: any) {
    const newData = data as { topic: string; notification: any };
    this.logger.log(`📩 Redis event [${event}] on ${newData.topic}`);
    this.server.to(newData.topic).emit(event, data.notification);
  }

  async sendNotificationToTopic(topic: string, notification: any) {
    console.log(
      `Sending notification to topic '${topic}': ${JSON.stringify(notification)}`,
    );

    await this.pub.publish(
      this.NOTIFICATIONS_NEW,
      JSON.stringify({ topic, notification }),
    );
  }
}
