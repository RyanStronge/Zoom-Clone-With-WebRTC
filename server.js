//creates express server
const express = require('express')
//app variable dedicated to running the express server
const app = express() 
//server for SocketIO and pass in our express server
const server = require('http').Server(app)
//SocketIO - passing in HTTP server (which is linked to express server)
const io = require('socket.io')(server)
//Delcares UUID from v4 to uuidV4
const { v4: uuidV4 } = require('uuid')

//Sets up how we're going to render our views - using ejs
app.set('view engine', 'ejs')
//To hold all of our JS and CSS
app.use(express.static('public'))
//Default route (when you go to localhost:3000). 
//Takes in a request and response
app.get('/', (req, res) => {
  //Redirects user to random room ID using UUID and appends to end of URL
  res.redirect(`/${uuidV4()}`)
})
//Room route. Uses a dynamic parameter (:room) that we pass into URL

app.get('/:room', (req, res) => {
  //Renders a room and creates variable roomId which takes in room ID from 
  //URL parameter
  res.render('room', { roomId: req.params.room })
})

//Runs any time someone connects to our webpage and pass the socket
//that the user is connecting through
io.on('connection', socket => {
  //Set up an event for when a user joins a room with the room and user ID
  socket.on('join-room', (roomId, userId) => {
    //Joining this room 
    socket.join(roomId)
    //Send a message to the room and call user-connected event with userId
    socket.to(roomId).broadcast.emit('user-connected', userId)
    //When a user disconnects
    socket.on('disconnect', () => {
      //Send a user-disconnected event to all users in the room except us
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

//Starts server on port 3000
server.listen(3000)