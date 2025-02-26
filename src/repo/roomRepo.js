const client = require('../config/redis');

class RoomRepository {
    constructor() {
        this.client = client;
    }

    /**
     * Connect to Redis
     */
    async connect() {
        await this.client.connect();
        console.log('Connected to Redis');
    }

    /**
     * Adds a new room to the repository.
     * @param {Object} room - The room object to add.
     * @param {string} room.id - The unique ID of the room.
     * @returns {boolean} - Returns `true` if the room was added successfully, or `false` if a room with the same ID already exists.
     */
    async addRoom(room) {
        try {
            const exists = await this.client.exists(`room:${room.id}`);
            if (!exists) {
                await this.client.hSet(`room:${room.id}`, room);
                console.log(`Room ${room.id} added:`, room);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding room:', error);
            throw error;
        }
    }

    /**
     * Retrieves a room by its ID.
     * @param {string} id - The unique ID of the room.
     * @returns {Object|null} - Returns the room object if found, or `null` if the room does not exist.
     */
    async getRoom(id) {
        try {
            const roomData = await this.client.hGetAll(`room:${id}`);
            if (Object.keys(roomData).length === 0) return null;
            return roomData;
        } catch (error) {
            console.error('Error getting room:', error);
            throw error;
        }
    }

    /**
     * Retrieves all rooms in the repository.
     * @returns {Array<Object>} - Returns an array of all room objects.
     */
    async getAllRooms() {
        try {
            const roomKeys = await this.client.keys('room:*');
            const rooms = [];

            for (const key of roomKeys) {
                const roomData = await this.client.hGetAll(key);
                rooms.push({ id: key.split(':')[1], ...roomData });
            }

            return rooms;
        } catch (error) {
            console.error('Error getting all rooms:', error);
            throw error;
        }
    }

    /**
     * Updates an existing room in the repository.
     * @param {string} id - The unique ID of the room to update.
     * @param {Object} updatedRoom - An object containing the updated properties for the room.
     * @returns {boolean} - Returns `true` if the room was updated successfully, or `false` if the room does not exist.
     */
    async updateRoom(id, updatedRoom) {
        try {
            const exists = await this.client.exists(`room:${id}`);
            if (exists) {
                await this.client.hSet(`room:${id}`, updatedRoom);
                console.log(`Room ${id} updated:`, updatedRoom);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    }

    /**
     * Deletes a room from the repository.
     * @param {string} id - The unique ID of the room to delete.
     * @returns {boolean} - Returns `true` if the room was deleted successfully, or `false` if the room does not exist.
     */
    async deleteRoom(id) {
        try {
            const result = await this.client.del(`room:${id}`);
            if (result) {
                console.log(`Room ${id} deleted`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting room:', error);
            throw error;
        }
    }

    /**
     * Close the Redis connection
     */
    async close() {
        await this.client.quit();
        console.log('Redis connection closed');
    }
}

module.exports = new RoomRepository();