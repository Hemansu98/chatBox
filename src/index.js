const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

// Configuring the static middleware
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('Websocket is connected');

    
    socket.on('join', ({ username, room }, callback) => {
        
        const { error, user } = addUser({ id:socket.id, username, room });

        if(error) {
            return callback(error);
        }

        socket.join(user.room);
        // Sending welcome message when new user connect to the user
        socket.emit('message', generateMessage('admin', 'Welcome'));

        // Notifying that a new user has connected to all other users
        socket.to(user.room).broadcast.emit('message', generateMessage('admin', `${user.username} joined!`));

        // Sending the userlist in a room 
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    });

    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('share-location', (position, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('shareLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback();
    });

    // Notifying that a user has left tha chatBox to all other users
    socket.on('disconnect', () => {
        const user =  removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message' , generateMessage('admin', `${user.username} left!`));
            
            // Sending the userlist in a room 
            io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
    });

});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});  
