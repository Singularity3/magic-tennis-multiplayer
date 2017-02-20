// HTTP PORTION

var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}


// WEBSOCKET PORTION

var io = require('socket.io').listen(httpServer);

var lastID = 0;

io.sockets.on('connection', 

	function (socket) {
    
        var conn = 0;
    	
		console.log("We have a new client: " + socket.id);
            
        if(lastID == 0){
            lastID = socket.id;
        }
    else {
        conn = lastID;
        lastID = 0;
        socket.broadcast.to(conn).emit('userConn', socket.id);
        socket.emit('start');
    }
    
    socket.on('otherConn', function(id) {
        conn = id;
        console.log("Client " + socket.id + " connected to client " + conn);
    });
		
		socket.on('createBall', function(data) {
            socket.broadcast.to(conn).emit('ballCreated', data);
        });
    
    socket.on('ballPoke', function(data) {
            socket.broadcast.to(conn).emit('ballPoked', data);
        });
    socket.on('score', function(data){
        socket.broadcast.to(conn).emit('scoreReg', data);
    });


		socket.on('disconnect', function() {
            if(lastID == socket.id){
                lastID = 0;
            }
            socket.broadcast.to(conn).emit('otherDis');
			console.log("Client has disconnected " + socket.id);
		});
	}
);