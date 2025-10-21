import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token';
import { logger } from '../utils/logger';
import prisma from '../config/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  role?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<number, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:8081',
          process.env.FRONTEND_URL || 'http://localhost:3000'
        ],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
    
    logger.info('WebSocket server initialized');
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
          return next(new Error('Invalid token'));
        }

        const user = await prisma.user.findFirst({
          where: {
            user_id: payload.userId,
            is_active: true,
            deleted_at: null
          }
        });

        if (!user) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = payload.userId;
        socket.role = payload.role || 'user';

        logger.info('WebSocket authenticated', { 
          socketId: socket.id, 
          userId: payload.userId,
          role: socket.role 
        });

        next();
      } catch (error) {
        logger.error('WebSocket authentication error', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const role = socket.role!;

      logger.info('Client connected', { socketId: socket.id, userId, role });

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);

      if (role === 'admin') {
        socket.join('admins');
      }

      socket.emit('connected', {
        message: 'Connected to Craftopia real-time server',
        userId,
        role,
        timestamp: new Date().toISOString()
      });

      socket.on('disconnect', (reason) => {
        logger.info('Client disconnected', { socketId: socket.id, userId, reason });
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      socket.on('error', (error) => {
        logger.error('WebSocket error', error, { socketId: socket.id, userId });
      });

      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  emitToUser(userId: number, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    logger.debug('Emitted to user', { userId, event });
  }

  emitToAdmins(event: string, data: any) {
    this.io.to('admins').emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    logger.debug('Emitted to admins', { event });
  }

  emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    logger.debug('Emitted to role', { role, event });
  }

  broadcast(event: string, data: any) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    logger.debug('Broadcasted', { event });
  }

  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  getUserConnectionsCount(userId: number): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

let wsServer: WebSocketServer | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketServer => {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer);
  }
  return wsServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
};
