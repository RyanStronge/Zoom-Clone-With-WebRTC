- When express server is shut down, you can still see your live video feed because
the video chat doesn't communicate through the server, rather communicates
directly with the person's computer so we don't have to worry about
sending our traffic through the server. 
The express server is purely just for setting up our rooms.

- To run, just execute server.js file and go to localhost:3000 and run peerJS server with "peerjs --port 3001"
- Some networks like QUB WiFi won't let you host servers so may not work