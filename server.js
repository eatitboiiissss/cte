const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve your HTML files from the "public" folder
app.use(express.static('public'));

// This is the server's memory. 
// Note: If the server restarts on Render, this resets unless you use a Database.
let state = {
    servers: [
        { id: '1', name: 'Home', channels: ['general', 'lounge'] }
    ]
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. Send current servers to the new user
    socket.emit('init', state.servers);

    // 2. Handle Creating a Server
    socket.on('create-server', (serverName) => {
        const newServer = {
            id: Date.now().toString(),
            name: serverName,
            channels: ['general']
        };
        state.servers.push(newServer);
        // Tell EVERYONE a new server was created
        io.emit('server-list-updated', state.servers);
    });

    // 3. Handle Chat Messages
    socket.on('send-chat', (data) => {
        // data = { serverId, channel, user, text }
        // We broadcast it to everyone
        io.emit('new-message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live at http://localhost:${PORT}`);
});
