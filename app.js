const express = require('express');
const ejs = require('ejs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { v4: uuidV4 } = require('uuid');
const bodyParser = require('body-parser');
const alert = require('alert');

const nickNames = [];

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
    // res.redirect(`/${uuidV4()}`)
});

app.post('/', function(req, res){
    if(req.body.create){
        res.redirect(`/${uuidV4()}`);
    }
    if(req.body.join){
        if(req.body.id){
            res.redirect(`/${req.body.id}`);
        }
    }
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  })

io.on('connection', (socket) => {

    //HANDLING VIDEO STREAM
    socket.on('join-room', function(roomId, id){
        socket.join(roomId);
        //socket.nickname = id;
        socket.to(roomId).emit('user-connected', id);

        socket.on('new user', function(nickname, callback){
            if(nickNames.indexOf(nickname) !== -1){
                callback(false);
            }else{
                callback(true);
                socket.nickname = nickname;
                nickNames.push(socket.nickname);
                updateNicknames();
            }
        });
    
        function updateNicknames(){
            io.emit('usernames', nickNames);
        }

        socket.on('send message', function(message){
            io.to(roomId).emit('new message', {message: message, name: socket.nickname});
        });

        socket.on('disconnect', function(data){
            if(!socket.nickname){
                return ;
            }else{
                nickNames.splice(nickNames.indexOf(socket.nickname), 1);
                updateNicknames();
            }

            socket.to(roomId).emit('user-disconnected', id);
        });
    });

    //HANDLING MESSAGES
    // socket.on('send message', function(message, roomId){
    //     socket.join(roomId);
    //     socket.to(roomId).emit('new message', message);
    // });
});











let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


server.listen(port, () => {
    console.log(`Server is up and running on PORT: ${port}`);
});