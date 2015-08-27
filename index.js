var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongo = require('mongodb');


var MongoClient = mongo.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/pickupDB';

var collect_msgs;
var collect_users;

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
	
	var collect_users = db.collection('users');
	var user1 = {name: 'matt', roles: ['admin', 'user']};

		collect_users.upsert(user1, function (err, result) {
			if(err) {
	 			console.log(err);
	        } else {
		        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
		    }
		});

	var collect_msgs = db.collection('messages');
	io.on('connection', function(socket) {
		socket.on('chat message', function(msg){
			console.log('message: ' + msg);
			var message = {message: msg, timestamp: new Date()};
			collect_msgs.insert(message, function (err, result) {
				if(err){
					console.log(err);
				} else {
					console.log('Inserted %d msgs into the "messages" collection. The documents inserted with "_id" are:', result.length, result);
				}
			});
		});
	});
  	}
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function () {
		console.log('a user disconnected');
	});
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		console.log(msg.length);
	});
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

http.listen(8080, function() {
  console.log('listening on *:8080');
});
