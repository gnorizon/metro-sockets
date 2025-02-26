const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.channel = null;
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect('amqp://142.93.118.27');
            this.channel = await this.connection.createChannel();
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async createQueue(queueName, options = { durable: true, 'x-max-priority': 10 }) {
        try {
            await this.channel.assertQueue(queueName, options);
            console.log(`Queue "${queueName}" created or asserted`);
        } catch (error) {
            console.error('Error creating queue:', error);
            throw error;
        }
    }

    async deleteQueue(queueName) {
        try {
            await this.channel.deleteQueue(queueName);
            console.log(`Queue "${queueName}" deleted`);
        } catch (error) {
            console.error('Error deleting queue:', error);
        }
    }

    async consume(queueName, callback) {
        try {
            await this.channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const message = msg.content.toString();
                    callback(message);
                    this.channel.ack(msg);
                }
            });
            console.log(`Listening for messages on queue "${queueName}"`);
        } catch (error) {
            console.error('Error consuming messages:', error);
            throw error;
        }
    }

    async sendToQueue(queueName, message, options = { persistent: true }) {
        try {
            this.channel.sendToQueue(queueName, Buffer.from(message), options);
            console.log(`Sent message to queue "${queueName}": ${message}`);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQService();