require('dotenv').config();
const express = require('express');
const http = require('http');
const SocketService = require('./src/services/socket');

const app = express();
const port = 8082;
const server = http.createServer(app);
const socketService = new SocketService(server);

// Example route
app.get('/', (req, res) => {
    return res.json({ message: 'Welcome to the Socket Server' });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});