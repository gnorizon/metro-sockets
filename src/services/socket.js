const { Server } = require("socket.io");

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.buses = new Map();
    this.setupEvents();
  }

  setupEvents() {
    this.io.on("connection", (socket) => {
      console.log(`Socket ${socket.id} connected`);


      socket.on('global_message', (message) => {
        this.broadcast('global_message', message);
      });

      // Handle joining a room
      socket.on("join_room", (room) => {
        console.log('room', room)
        this.joinRoom(socket, room);
      });

      // Handle leaving a room
      socket.on("leave_room", (room) => {
        this.leaveRoom(socket, room);
      });

      // Handle broadcasting to a room
      socket.on("broadcast_to_room", ({ room, event, data }) => {
        this.broadcastToRoom(room, event, data);
      });

      // // Handle custom client messages
      // socket.on("client_message", (data) => {
      //   console.log(`Received message from client ${socket.id}:`, data);
      // });




      // Handle disconnection
      socket.on("disconnect", () => {
        try {
          const bus = this.buses.get(socket.id);
          if (bus) {
            this.buses.delete(socket.id);
            console.log(`Bus ${bus.busId} disconnected and details removed.`);
          }
        } catch (error) {
          console.error("Error removing bus details:", error);
        }
      });
    });
  }

  /**
   * Create a room.
   * @param {string} room - The room name
   * @returns {boolean} - Returns true if room creation is successful
   */
  createRoom(room) {
    this.io.emit("room_created", { room });
    console.log(`Room created: ${room}`);
    return true;
  }

  /**
   * Join a room
   * @param {Socket} socket - The socket instance
   * @param {string} room - The room name
   */
  joinRoom(socket, room) {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
    this.io.to(room).emit("room_message", `${socket.id} joined room: ${room}`);
  }

  /**
   * Leave a room
   * @param {Socket} socket - The socket instance
   * @param {string} room - The room name
   */
  leaveRoom(socket, room) {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
    this.io.to(room).emit("room_message", `${socket.id} left room: ${room}`);
  }

  /**
   * Broadcast a message to all clients in a specific room
   * @param {string} room - The room name
   * @param {string} event - The event name
   * @param {any} data - The data to send
   */
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
    console.log(`Broadcasted to room "${room}":`, data);
  }

  /**
   * Calculate the nearest bus to a given location
   * @param {object} location - The target location { lat, long }
   * @returns {string|null} - The socket ID of the nearest bus, or null if no buses are available
   */
  getNearestBus(location) {
    if (this.buses.size === 0) return null;

    let nearestBusId = null;
    let minDistance = Infinity;

    // Iterate over all the buses in memory to find the nearest
    for (const [socketId, bus] of this.buses.entries()) {
      const distance = this.calculateDistance(location, bus.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearestBusId = socketId;
      }
    }

    return nearestBusId;
  }

  /**
   * Calculate distance between two locations using the Haversine formula
   * @param {object} loc1 - Location 1 { lat, long }
   * @param {object} loc2 - Location 2 { lat, long }
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(loc1, loc2) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in km

    const dLat = toRadians(loc2.lat - loc1.lat);
    const dLong = toRadians(loc2.long - loc1.long);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(loc1.lat)) *
      Math.cos(toRadians(loc2.lat)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Broadcast a message to all connected clients
   * @param {string} event - The event name
   * @param {any} data - The data to send
   */
  broadcast(event, data) {
    this.io.emit(event, data);
    console.log("Broadcasted to all clients:", data);
  }
}

module.exports = SocketService;
