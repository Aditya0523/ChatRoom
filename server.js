// for setting up the static folder
const path = require('path') ;
const http = require('http') ;
const formatMessage =  require('./utils/messages') ;
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users') ;
const express = require('express') ;
// socket is like an open door between client and server. We can emit events back and forth
const socketio = require('socket.io') ;

const PORT = 3000 || process.env.PORT;

const app = express() ;
const server = http.createServer(app) ;
const io = socketio(server) ;


//Set static folder...to actually connect the html,css,js to the node
app.use(express.static(path.join(__dirname, 'public'))) ;
const botName = 'Wassuuup bot' ;

app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html')) ;
})

//Run when client connects
// io.on listens for an event ( here conncetion) and passes socket as parameter to an arrow function.
// so it is "watch out for this" then "do that".

io.on('connection', socket => {

    // |----------- HANDLING THE USERS ------------|

    socket.on('joinRoom', ({username, room})  => {
       
        // User joinig a particular room
        const user = userJoin(socket.id, username, room) ;
        socket.join(user.room) ;

        // So i wanna emit my message to client from my server
        // first parameter is the event (you can call it anything) and second is a string
        // This message will be sent to the user that's connecting 

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to Wassuuup!')) ;

        // This message will be sent to everyone EXCEPT the user that's connecting. That's why broadcast

        // Broadcast when a user connects
        // use .to() for broadcasting to a specific room and not all rooms
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`)) ;

        // Send user and room info
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)}) ;

        //This message will be sent to ALL the clients in general
        // io.emit() ;
    }) ;

    // |----------- HANDLING THE MESSAGES ------------|

    // Listen for messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id) ;
        io.to(user.room).emit('message', formatMessage(user.username , msg)) ;
    })


    // Runs when a client DISCONNECTS
    socket.on('disconnect', () => {

        const user = userLeave(socket.id);

        if(user) {
            // wanna send the msg to everyone, hence io
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`)) ;

            // Send users and room
            io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)}) ;
        }   
 
    })
}) ;


server.listen(PORT, () => console.log(`Server running on port ${PORT}`)) ;