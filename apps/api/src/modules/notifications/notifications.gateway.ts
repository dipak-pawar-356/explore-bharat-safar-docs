// Explore Bharat Safar — In-App Real-Time Notification Gateway
// Reference: EBS-DOC-19-NOTIF Section 1 & Section 4
// Manages real-time in-app pushes, connection rooms, and Redis Pub/Sub backplane
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { INotification } from '@ebs/types';

export type NotificationEventListener = (event: string, payload: unknown) => void;

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly activeSubscriptions = new Map<string, Set<NotificationEventListener>>();
  private redisPub?: Redis;
  private redisSub?: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    if (redisHost) {
      try {
        this.redisPub = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          lazyConnect: true,
        });
        this.redisSub = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          lazyConnect: true,
        });

        this.redisSub
          .connect()
          .then(() => {
            this.redisSub?.subscribe('ebs:notifications:realtime', err => {
              if (!err) this.logger.log('Clustered Redis pub/sub backplane active for WebSockets.');
            });
            this.redisSub?.on('message', (channel, message) => {
              if (channel === 'ebs:notifications:realtime') {
                try {
                  const { userId, event, data } = JSON.parse(message);
                  this.localEmit(userId, event, data);
                } catch {
                  // Ignore parse errors
                }
              }
            });
          })
          .catch(() => {
            this.logger.warn('Redis pub/sub unavailable, falling back to in-memory gateway.');
          });
      } catch {
        // Fall back to in-memory
      }
    }
  }

  public emitToUser(userId: string, event: string, payload: unknown): void {
    // 1. Emit locally on current node
    this.localEmit(userId, event, payload);

    // 2. Publish to Redis backplane to reach other server nodes if clustered
    if (this.redisPub && this.redisPub.status === 'ready') {
      try {
        this.redisPub.publish(
          'ebs:notifications:realtime',
          JSON.stringify({ userId, event, data: payload }),
        );
      } catch (err) {
        this.logger.warn(`Redis pub failed: ${String(err)}`);
      }
    }
  }

  public emitNotification(notification: INotification): void {
    this.emitToUser(notification.userId, 'notification:new', notification);
  }

  public emitUnreadCount(userId: string, count: number): void {
    this.emitToUser(userId, 'notification:unread_count', { count });
  }

  public subscribe(userId: string, listener: NotificationEventListener): () => void {
    let listeners = this.activeSubscriptions.get(userId);
    if (!listeners) {
      listeners = new Set();
      this.activeSubscriptions.set(userId, listeners);
    }
    listeners.add(listener);

    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) {
        this.activeSubscriptions.delete(userId);
      }
    };
  }

  private localEmit(userId: string, event: string, payload: unknown): void {
    const listeners = this.activeSubscriptions.get(userId);
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          listener(event, payload);
        } catch (err) {
          this.logger.error(`Error in notification event listener: ${String(err)}`);
        }
      }
    }
  }

  public getConnectedClientsCount(): number {
    let total = 0;
    for (const listeners of this.activeSubscriptions.values()) {
      total += listeners.size;
    }
    return total;
  }
}
