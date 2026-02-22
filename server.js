const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Mock Database (In a real app, use MongoDB)
let serverData = {
    channels: [
        { id: 'c1', name: 'announcements', type: 'announcement', followedBy: [] },
        { id: 'c2', name: 'general', type: 'text' },
        { id: 'c3', name: 'dev-forum', type: 'forum', threads: [] }
    ],
    roles: [
        { name: 'Admin', permissions: ['MANAGE_CHANNELS', 'MODERATE'], color: '#ed4245' },
        { name: 'Member', permissions: ['SEND_MESSAGES'], color: '#9ba44d' }
    ],
    analytics: { joins: 0, messagesSent: 0 }
};

io.on('connection', (socket) => {
    // Community Onboarding Logic
    serverData.analytics.joins++;
    socket.emit('onboarding-start', {
        welcomeMsg: "Welcome! Agree to the rules to continue.",
        rules: ["Be kind", "No spam"]
    });

    // Handle Polls
    socket.on('create-poll', (pollData) => {
        // pollData = { question: "Pizza?", options: ["Yes", "No"] }
        io.emit('new-poll', pollData);
    });

    // Handle Announcement Broadcasting
    socket.on('broadcast', (msg) => {
        // Sends to this server AND "followed" servers
        io.emit('announcement-received', msg);
    });

    socket.on('send-chat', (data) => {
        serverData.analytics.messagesSent++;
        io.emit('new-message', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
