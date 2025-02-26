const client = require('../config/redis');

class RiderRepository {
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
     * Add or update a rider
     * @param {string} riderId - The unique ID of the rider
     * @param {object} riderData - The rider's data { lat, long, address }
     */
    async addOrUpdateRider(riderId, riderData) {
        try {
            await this.client.hSet(`rider:${riderId}`, riderData);
            console.log(`Rider ${riderId} added/updated:`, riderData);
        } catch (error) {
            console.error('Error adding/updating rider:', error);
            throw error;
        }
    }

    /**
     * Get a rider by ID
     * @param {string} riderId - The unique ID of the rider
     * @returns {object|null} - The rider's data or null if not found
     */
    async getRider(riderId) {
        try {
            const riderData = await this.client.hGetAll(`rider:${riderId}`);
            if (Object.keys(riderData).length === 0) return null;
            return riderData;
        } catch (error) {
            console.error('Error getting rider:', error);
            throw error;
        }
    }

    /**
     * Delete a rider by ID
     * @param {string} riderId - The unique ID of the rider
     */
    async deleteRider(riderId) {
        try {
            await this.client.del(`rider:${riderId}`);
            console.log(`Rider ${riderId} deleted`);
        } catch (error) {
            console.error('Error deleting rider:', error);
            throw error;
        }
    }

    /**
     * Get all riders
     * @returns {Array} - Array of rider objects
     */
    async getAllRiders() {
        try {
            const riderKeys = await this.client.keys('rider:*');
            const riders = [];

            for (const key of riderKeys) {
                const riderData = await this.client.hGetAll(key);
                riders.push({ id: key.split(':')[1], ...riderData });
            }

            return riders;
        } catch (error) {
            console.error('Error getting all riders:', error);
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

module.exports = new RiderRepository();
