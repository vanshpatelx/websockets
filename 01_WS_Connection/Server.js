const WebSocket = require('ws');

const socket = new WebSocket.Server({ port: 3000 });

const clients = new Set();
let whoami = null;

socket.on('connection', (socket) => {
    console.log('Client connected');
    clients.add(socket);

    socket.on('message', (message) => {
        clients.forEach(client => {
            client.send(`${client._socket.remoteAddress} says: ${message}`);
        });
    });
    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
    });
});


// problems : send data to eachone without knowing which one send