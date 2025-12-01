1)Sockets = A Socket is one end of a connection
[ip + port] localhost(ip) 3000(host)
when we make a connection b/w two devices over the internet or without internet (intranet) is called socket connections

2)Data travels in the form of packets

3)webRTC (Web Real Time Communication[bi directional]) for video communciation => connection between clients in a server less way
Steps of webRtc
i>Signalling server
ii>Connecting through ice protocol
iii>Securing thorugh DLTS and SRTP protocol
iv>Communication through rtp and sctp protocol

4)There are three types of webrtc Architecture
i>P2P{peer to peer}(Serverless Arch , client based arch) [If computer i.e nodes there will be more pessure in client server so we try to minimize the nodes as far possible]
ii>SFU{selecting forwarding unit}
Computers sent the data to the server and server sent the data to the other computuers i.e client [server based] ref from the png {more heavy on server and less on client}
iii>MCU{Multi Point Control Unit}
refer from photo [uplaod - one time, download - one time ] eg - 1000 people downloading a live lecture from youtube they will get each a single reliable stream

5)We will kick things with the database
BackEnd Tech will use (ChatGpt)
i)Bcrypt
ii)Crypto

iii)Socket(smartly manage the long polling)
Long Polling-Is a technique where the client makes a request to the server , and the server holds the response until new data data is available, effectively keeping the connection open longer to reduce latency for real time updates

iv) Express js [fastify(faster), nest js ] other options

6)FrontEnd
i)CSS ii)Material UI iii)WebRtc iv)AXIOS v)React

7)Nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

8)HTTP status codes are like traffic signals 🚦 between the client and server:

2xx = Green (Success)

4xx = Yellow (Client mistake)

5xx = Red (Server problem)

9.  "type": "module", = to use modern import export

10)Tokens (To prove user identity (authentication))

11)Schema helps define the structure (fields, types, and rules) of your MongoDB document.

12)An early return means you exit a function early — before reaching the end —
when a certain condition is met.

Instead of nesting your logic deeply with a lot of if statements,
you simply return early when you already know you don’t need to continue.

13)All the data stored in mongo are in BSON(Binary) format faster than json

14)whenever there is any error in modules check for .js

15)Stun Servers fetches public ip of your device 
[STUN servers are lightweight servers running on the public internet ehich retuen the ip address of the requester's device]

16)canvas is use to create beautiful designs