const socket = io('/') //Access to socketIO server at root path
//Get reference to video grid so we can add videos to it
const videoGrid = document.getElementById('video-grid')
//Create a peer with an undefined ID so server will generate it itself
//Takes all WebRTC data from a user and turns it into a user ID
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
//Creates our video element
const myVideo = document.createElement('video')
//Mute it so we can't hear ourselves
myVideo.muted = true
//Empty object of all peers connected to a room
const peers = {}
//Navigator interface represents the state / identity of the user
//Allows scripts to query it and register themselves to carry on activities
//This creates our video stream with a video and audio
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
//Pass in video stream and add our stream to the webpage
}).then(stream => {
  //Function at bottom of file
  addVideoStream(myVideo, stream)
  //When a user calls us
  myPeer.on('call', call => {
    //Answer the call and send them our stream
    call.answer(stream)
    //Create new video element to place new video stream
    const video = document.createElement('video')
    //When we get a new stream
    call.on('stream', userVideoStream => {
      //Add the video stream to the grid
      addVideoStream(video, userVideoStream)
    })
  })

  //When user is connected from server.js 
  socket.on('user-connected', userId => {
    //Pass in user ID and our video stream to send to the user that's trying to connect
    connectToNewUser(userId, stream)
  })
})

//Event listener for user disconnect
socket.on('user-disconnected', userId => {
  //If the user is still in the peers object, close the call connection.
  if (peers[userId]) peers[userId].close()
})

//As soon as the user loads the host directory '/', trigger this event and
//pass in user ID
myPeer.on('open', id => {
  //Calls join-room event with roomID and user ID
  socket.emit('join-room', ROOM_ID, id)
})

//Function that's called when a new user wants to connect
function connectToNewUser(userId, stream) {
  //Call function to send user with the userId, our video stream
  const call = myPeer.call(userId, stream)
  //Create new video element for new user's video stream
  const video = document.createElement('video')
  //When they send us back their video stream, add it to our grid
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  //When call ends, remove the video
  call.on('close', () => {
    video.remove()
  })
  //Add the call to the peers object identified by each userID
  peers[userId] = call
}

//Function to add a video stream to a video element.
function addVideoStream(video, stream) {
  //Sets the video's source object to the stream
  video.srcObject = stream
  //Add ID to each video for use by selenium
  let div = document.getElementById("video-grid");
  let numberOfChildren = div.children.length;
  video.setAttribute("id", "video" + (numberOfChildren));
  //When the video element loads, play the video
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  //Append the video to the video grid 
  videoGrid.append(video)
}

