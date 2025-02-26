require('dotenv').config()
const express = require('express');
const http = require('http');
const SocketService = require('./src/services/socket');

const app = express();
const port = 8082;
const server = http.createServer(app);
const socketService = new SocketService(server);



server.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    try {
        
    } catch (error) {
        console.error('Error setting up RabbitMQ:', error);
    }
});
