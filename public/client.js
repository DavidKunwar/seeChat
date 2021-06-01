var socket = io();
var myPeer = new Peer();
const peers = {};

let videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video')
myVideo.muted = true

const constraints = {'video': true, 'audio': {'echoCancellation': true}};
navigator.mediaDevices.getUserMedia(constraints).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', function(call){
    call.answer(stream);

    const video = document.createElement('video');
    call.on('stream', function(incomingStream){
      addVideoStream(video, incomingStream);
    });
  });

  socket.on('user-connected', function(userId){
    connectToNewUser(userId, stream);
  });

})

socket.on('user-disconnected', function(userId){
  if (peers[userId]) peers[userId].close()
});

myPeer.on('open', function(id){
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream){
  const call = myPeer.call(userId, stream);

  const video = document.createElement('video');
  call.on('stream', function(userStream){
    addVideoStream(video, userStream);
  });
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call

}

function addVideoStream(video, stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}