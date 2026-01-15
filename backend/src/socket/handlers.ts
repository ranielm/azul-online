import { Server, Socket } from 'socket.io';
import * as roomManager from '../room/manager';
import {
  CreateRoomPayload,
  JoinRoomPayload,
  GameMovePayload,
  RoomIdPayload,
  ReconnectPayload,
  ChangeRoomCodePayload,
} from '../shared/types';
import { isValidPlayerName } from '../shared/validation';

// Track which room each socket is in
const socketRooms: Map<string, string> = new Map();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Create a new room
    socket.on('room:create', (payload: CreateRoomPayload) => {
      const { playerName, maxPlayers } = payload;

      if (!isValidPlayerName(playerName)) {
        socket.emit('room:error', { message: 'Invalid player name' });
        return;
      }

      if (![2, 3, 4].includes(maxPlayers)) {
        socket.emit('room:error', { message: 'Invalid max players' });
        return;
      }

      const room = roomManager.createNewRoom(socket.id, playerName.trim(), maxPlayers);
      socket.join(room.id);
      socketRooms.set(socket.id, room.id);

      socket.emit('room:created', { room, playerId: socket.id });
      console.log(`Room created: ${room.id} by ${playerName}`);
    });

    // Join an existing room
    socket.on('room:join', (payload: JoinRoomPayload) => {
      const { roomId, playerName } = payload;

      if (!isValidPlayerName(playerName)) {
        socket.emit('room:error', { message: 'Invalid player name' });
        return;
      }

      const result = roomManager.joinRoom(roomId.toUpperCase(), socket.id, playerName.trim());

      if (!result.success || !result.room) {
        socket.emit('room:error', { message: result.error || 'Failed to join room' });
        return;
      }

      socket.join(result.room.id);
      socketRooms.set(socket.id, result.room.id);

      // Notify the joining player
      socket.emit('room:joined', { room: result.room, playerId: socket.id });

      // Notify other players in the room
      socket.to(result.room.id).emit('room:player-joined', {
        player: result.room.gameState.players.find((p) => p.id === socket.id),
      });

      console.log(`Player ${playerName} joined room ${roomId}`);
    });

    // Leave a room
    socket.on('room:leave', (payload: RoomIdPayload) => {
      const { roomId } = payload;
      handleLeaveRoom(socket, io, roomId);
    });

    // Start the game
    socket.on('game:start', (payload: RoomIdPayload) => {
      const { roomId } = payload;

      const result = roomManager.startGame(roomId, socket.id);

      if (!result.success || !result.gameState) {
        socket.emit('game:error', { message: result.error || 'Failed to start game' });
        return;
      }

      io.to(roomId).emit('game:started', { gameState: result.gameState });
      console.log(`Game started in room ${roomId}`);
    });

    // Make a move
    socket.on('game:move', (payload: GameMovePayload) => {
      const { roomId, move } = payload;

      const result = roomManager.makeMove(roomId, move);

      if (!result.success || !result.gameState) {
        socket.emit('game:error', { message: result.error || 'Invalid move' });
        return;
      }

      io.to(roomId).emit('game:state-updated', { gameState: result.gameState });

      if (result.gameState.phase === 'finished') {
        io.to(roomId).emit('game:finished', { gameState: result.gameState });
        console.log(`Game finished in room ${roomId}`);
      }
    });

    // Restart the game
    socket.on('game:restart', (payload: RoomIdPayload) => {
      const { roomId } = payload;

      const result = roomManager.restartGame(roomId, socket.id);

      if (!result.success || !result.gameState) {
        socket.emit('game:error', { message: result.error || 'Failed to restart game' });
        return;
      }

      io.to(roomId).emit('game:started', { gameState: result.gameState });
      console.log(`Game restarted in room ${roomId}`);
    });

    // Reconnect to a room
    socket.on('player:reconnect', (payload: ReconnectPayload) => {
      const { roomId, playerId } = payload;

      const result = roomManager.reconnectPlayer(roomId, playerId, socket.id);

      if (!result.success || !result.room) {
        socket.emit('room:error', { message: result.error || 'Failed to reconnect' });
        return;
      }

      socket.join(roomId);
      socketRooms.set(socket.id, roomId);

      socket.emit('player:reconnected', { gameState: result.room.gameState });
      socket.to(roomId).emit('room:updated', { room: result.room });

      console.log(`Player reconnected to room ${roomId}`);
    });

    // Change room code
    socket.on('room:change-code', (payload: ChangeRoomCodePayload) => {
      const { roomId, newRoomId } = payload;

      const result = roomManager.changeRoomCode(roomId, newRoomId, socket.id);

      if (!result.success || !result.room) {
        socket.emit('room:error', { message: result.error || 'Failed to change room code' });
        return;
      }

      // Move all sockets from old room to new room
      const oldRoomId = result.oldRoomId!;
      const newRoom = result.room;

      // Update socketRooms map for all players in this room
      for (const player of newRoom.gameState.players) {
        socketRooms.set(player.id, newRoom.id);
      }

      // Leave old room and join new room for this socket
      socket.leave(oldRoomId);
      socket.join(newRoom.id);

      // Notify all players about the room code change
      io.to(newRoom.id).emit('room:code-changed', { room: newRoom, oldRoomId });

      // Also emit to old room in case any sockets are still there
      io.to(oldRoomId).emit('room:code-changed', { room: newRoom, oldRoomId });

      console.log(`Room code changed from ${oldRoomId} to ${newRoom.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const roomId = socketRooms.get(socket.id);

      if (roomId) {
        const room = roomManager.setPlayerConnection(roomId, socket.id, false);

        if (room) {
          socket.to(roomId).emit('player:disconnected', { playerId: socket.id });

          // Check if all players are disconnected
          const allDisconnected = room.gameState.players.every((p) => !p.isConnected);
          if (allDisconnected) {
            console.log(`All players disconnected from room ${roomId}, keeping room for reconnection`);
          }
        }

        socketRooms.delete(socket.id);
      }

      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function handleLeaveRoom(socket: Socket, io: Server, roomId: string): void {
  const result = roomManager.leaveRoom(roomId, socket.id);

  socket.leave(roomId);
  socketRooms.delete(socket.id);

  if (result.roomDeleted) {
    console.log(`Room ${roomId} deleted (empty)`);
  } else if (result.room) {
    socket.to(roomId).emit('room:player-left', { playerId: socket.id });
    socket.to(roomId).emit('room:updated', { room: result.room });
  }
}
