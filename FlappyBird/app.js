const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const path = require("path");

const PORT = process.env.PORT ?? 3000

app.use(express.static(path.resolve(__dirname, 'client')))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', (socket) => {
    socket.join('some room')
    console.log('connection')
    socket.on('start', (state) => {
        io.emit('start', state)
    })

    socket.on('gameOver', (bool) => {
        io.emit('gameOver', bool)
    })

    socket.on('users', (inc) => {
        io.emit('users', inc)
    })

    socket.on('disconnect', () => {
    });

});


server.listen(PORT, () => {
    console.log(`Server has been started on ${PORT} ...`)
    console.log('http://localhost:3000/')
});