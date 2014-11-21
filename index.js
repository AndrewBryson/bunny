var express = require('express');
var http = require('http');
var app = express.app = express();
var server = http.createServer(app);

var queueSocket = process.env.queueSocket || 'amqp://localhost';
var messageName = 'app.message';

var context = require('rabbit.js').createContext(queueSocket, function () {
	console.log('context created');
});

app.get('/', function (req, res) {
	console.log('Request received');
	var request = context.socket('REQ');
		
	request.connect(messageName, function () {
		var data = { message: 'From client:' };
		request.write(JSON.stringify(data), 'utf8');
	});
	
	request.on('data', function (message) {
		console.log('CLIENT, server said: ' + message);
		res.write(message);
		res.end();
	});
});

var port = process.env.port || 3000;
server.listen(port);
console.log('Server listening on port: ' + port);
