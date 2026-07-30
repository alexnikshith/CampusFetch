import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user personal channel
    socket.on('join_user_channel', (userId: string) => {
      socket.join(`user_${userId}`);
    });

    // Join order chat room
    socket.on('join_order_room', (orderId: string) => {
      socket.join(`order_${orderId}`);
    });

    // Leave order chat room
    socket.on('leave_order_room', (orderId: string) => {
      socket.leave(`order_${orderId}`);
    });

    // Realtime chat message dispatch (socket.to emits to everyone EXCEPT sender)
    socket.on('send_chat_message', (payload: { id?: string; orderId: string; senderId: string; receiverId: string; message: string; senderName?: string; createdAt?: string }) => {
      const msgPayload = {
        ...payload,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      // Send to order room excluding sender
      socket.to(`order_${payload.orderId}`).emit('receive_chat_message', msgPayload);
      // Notify receiver channel
      socket.to(`user_${payload.receiverId}`).emit('chat_notification', msgPayload);
    });

    // Runner Trip Announcement Broadcast ("I'm Going To")
    socket.on('broadcast_runner_trip', (tripData: any) => {
      socket.broadcast.emit('new_runner_trip', tripData);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const notifyOrderUpdate = (orderId: string, orderData: any) => {
  if (io) {
    io.to(`order_${orderId}`).emit('order_updated', orderData);
    if (orderData.customerId) {
      io.to(`user_${orderData.customerId}`).emit('user_order_notification', orderData);
    }
    if (orderData.runnerId) {
      io.to(`user_${orderData.runnerId}`).emit('user_order_notification', orderData);
    }
  }
};
