import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Message } from '@prisma/client';

/**
 * Chat Session Service
 * 
 * Manages WebSocket sessions and real-time features using Redis:
 * - Track active socket connections per user
 * - Online/offline status
 * - Last seen timestamps
 * - Typing indicators (with TTL)
 * - Offline message queue
 * 
 * Redis is critical for horizontal scaling of WebSocket servers.
 */
@Injectable()
export class ChatSessionService {
  private readonly logger = new Logger(ChatSessionService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Add socket connection for a user
   * Users can have multiple connections (multiple devices/tabs)
   * 
   * @param userId - User ID
   * @param socketId - Socket ID
   */
  async addConnection(userId: string, socketId: string): Promise<void> {
    const key = `user:${userId}:sockets`;
    await this.redis.sadd(key, socketId);
    await this.redis.expire(key, 86400); // 24 hours
    
    this.logger.log(`Added connection for user ${userId}: ${socketId}`);
  }

  /**
   * Remove socket connection for a user
   * 
   * @param userId - User ID
   * @param socketId - Socket ID
   */
  async removeConnection(userId: string, socketId: string): Promise<void> {
    const key = `user:${userId}:sockets`;
    await this.redis.srem(key, socketId);
    
    this.logger.log(`Removed connection for user ${userId}: ${socketId}`);
  }

  /**
   * Get all active socket connections for a user
   * 
   * @param userId - User ID
   * @returns Array of socket IDs
   */
  async getUserConnections(userId: string): Promise<string[]> {
    const key = `user:${userId}:sockets`;
    return await this.redis.smembers(key);
  }

  /**
   * Check if user is currently online
   * User is online if they have at least one active connection
   * 
   * @param userId - User ID
   * @returns true if user is online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const connections = await this.getUserConnections(userId);
    return connections.length > 0;
  }

  /**
   * Update last seen timestamp for a user
   * 
   * @param userId - User ID
   */
  async updateLastSeen(userId: string): Promise<void> {
    const key = `user:${userId}:last_seen`;
    const timestamp = Date.now().toString();
    await this.redis.set(key, timestamp, 'EX', 86400); // 24 hours TTL
  }

  /**
   * Get last seen timestamp for a user
   * 
   * @param userId - User ID
   * @returns Timestamp in milliseconds or null if not found
   */
  async getLastSeen(userId: string): Promise<number | null> {
    const key = `user:${userId}:last_seen`;
    const lastSeen = await this.redis.get(key);
    return lastSeen ? parseInt(lastSeen, 10) : null;
  }

  /**
   * Set user as typing in an order chat
   * Typing indicator expires after 5 seconds
   * 
   * @param orderId - Order ID
   * @param userId - User ID who is typing
   */
  async setTyping(orderId: string, userId: string): Promise<void> {
    const key = `order:${orderId}:typing`;
    await this.redis.sadd(key, userId);
    await this.redis.expire(key, 5); // 5 seconds TTL
    
    this.logger.debug(`User ${userId} is typing in order ${orderId}`);
  }

  /**
   * Remove typing indicator for a user
   * 
   * @param orderId - Order ID
   * @param userId - User ID who stopped typing
   */
  async removeTyping(orderId: string, userId: string): Promise<void> {
    const key = `order:${orderId}:typing`;
    await this.redis.srem(key, userId);
    
    this.logger.debug(`User ${userId} stopped typing in order ${orderId}`);
  }

  /**
   * Get list of users currently typing in an order chat
   * 
   * @param orderId - Order ID
   * @returns Array of user IDs who are typing
   */
  async getTypingUsers(orderId: string): Promise<string[]> {
    const key = `order:${orderId}:typing`;
    return await this.redis.smembers(key);
  }

  /**
   * Queue message for offline user
   * Messages are stored for 7 days and delivered when user comes online
   * 
   * @param userId - User ID who is offline
   * @param message - Message object to queue
   */
  async queueOfflineMessage(userId: string, message: Message): Promise<void> {
    const key = `user:${userId}:offline_messages`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 86400 * 7); // 7 days TTL
    
    this.logger.log(`Queued offline message for user ${userId}`);
  }

  /**
   * Get and clear offline messages for a user
   * Called when user comes online
   * 
   * @param userId - User ID
   * @returns Array of queued messages
   */
  async getOfflineMessages(userId: string): Promise<Message[]> {
    const key = `user:${userId}:offline_messages`;
    const messagesJson = await this.redis.lrange(key, 0, -1);
    
    if (messagesJson.length > 0) {
      // Clear the queue
      await this.redis.del(key);
      
      this.logger.log(`Retrieved ${messagesJson.length} offline messages for user ${userId}`);
      
      // Parse messages
      return messagesJson.map((json) => JSON.parse(json));
    }
    
    return [];
  }

  /**
   * Store unread count in Redis for fast access
   * 
   * @param orderId - Order ID
   * @param userId - User ID
   * @param count - Unread count
   */
  async setUnreadCount(orderId: string, userId: string, count: number): Promise<void> {
    const key = `order:${orderId}:unread:${userId}`;
    await this.redis.set(key, count.toString(), 'EX', 3600); // 1 hour TTL
  }

  /**
   * Get unread count from Redis cache
   * 
   * @param orderId - Order ID
   * @param userId - User ID
   * @returns Unread count or null if not cached
   */
  async getUnreadCount(orderId: string, userId: string): Promise<number | null> {
    const key = `order:${orderId}:unread:${userId}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : null;
  }

  /**
   * Increment unread count in Redis
   * 
   * @param orderId - Order ID
   * @param userId - User ID
   */
  async incrementUnreadCount(orderId: string, userId: string): Promise<void> {
    const key = `order:${orderId}:unread:${userId}`;
    const exists = await this.redis.exists(key);
    
    if (exists) {
      await this.redis.incr(key);
      await this.redis.expire(key, 3600); // Refresh TTL
    } else {
      await this.redis.set(key, '1', 'EX', 3600);
    }
  }

  /**
   * Clear unread count in Redis
   * 
   * @param orderId - Order ID
   * @param userId - User ID
   */
  async clearUnreadCount(orderId: string, userId: string): Promise<void> {
    const key = `order:${orderId}:unread:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Cleanup all data for a user
   * Used when user disconnects or deletes account
   * 
   * @param userId - User ID
   */
  async cleanupUserData(userId: string): Promise<void> {
    const keys = await this.redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.log(`Cleaned up ${keys.length} keys for user ${userId}`);
    }
  }
}



