const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });
const clients = new Map();
const { v4: uuidv4 } = require('uuid');


wss.on('connection', (socket) => {
    const userId = uuidv4();
    clients.set(socket, { id: userId });
    console.log('User connected : ', userId);

    // Broadcast to all connected clients
    broadcast(`${userId} has joined`, socket, false);

    socket.on('message', (messageBuffer) => {
        const message = messageBuffer.toString('utf8'); // Assuming 'utf8' encoding
        const sender = clients.get(socket);
        
        if (message.split(' ')[0] === '/msg') {
            const [_, targetUserId, privateMessage] = message.split(' ');
            const targetSocket = findSocketByUserId(targetUserId);

            if (targetSocket) {
                targetSocket.send(`(Private) ${sender.id} says: ${privateMessage}`);
                socket.send(`(Private to ${targetUserId}) You say: ${privateMessage}`);
            } else {
                socket.send(`User with ID ${targetUserId} not found`);
            }
        } else {
            // Broadcast the message to all clients
            broadcast(message, socket);
        }

    });

    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
        broadcast(`${userId} has left`, socket, false);
    });
});

const broadcast = ((message, socket, flag) => {
    const sender = clients.get(socket);
    if (flag == false) {
        clients.forEach((clientInfo, client) => {
            client.send(message);
        })
        return;
    }
    clients.forEach((clientInfo, clientConnection) => {
        if (clientConnection === socket) {
            clientConnection.send(`me says: ${message}`);
        } else {
            clientConnection.send(`${sender.id} says: ${message}`);
        }
    });
});



const findSocketByUserId = ((userId) => {
    for (const [socket, clientInfo] of clients.entries()) {
        if (clientInfo.id === userId) {
            return socket;
        }
    }
    return null;
});