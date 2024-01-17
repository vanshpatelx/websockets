const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });
const clients = new Map();
const { v4: uuidv4 } = require('uuid');

wss.on('connection', (socket) => {
    const uniqueId = uuidv4();
    clients.set(socket, { id: uniqueId });
    console.log('Client connected', uniqueId);

    socket.on('message', (message) => {
        const sender = clients.get(socket);
    
        clients.forEach((clientInfo, clientConnection) => {
            if (clientConnection === socket) {
                clientConnection.send(`me says: ${message}`);
            } else {
                clientConnection.send(`${sender.id} says: ${message}`);
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
    });
});
