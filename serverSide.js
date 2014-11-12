var mongojs = require('mongojs');
var db = mongojs.connect('localhost:27017/bunny', [ 'newstuff' ]);

var queueSocket = process.env.queueSocket || 'amqp://localhost';
var messageName = 'app.message';

var context = require('rabbit.js').createContext(queueSocket, function () {
	console.log('context created');
});

context.on('ready', function () {

	var reply = context.socket('REP');
	
	reply.connect(messageName, function () {
		reply.on('data', function (inMessage) {
			console.log('SERVER, client said: ' + inMessage);
			
			db.newstuff.insert( { a: 1 }, function () {
				console.log('SERVER, inserted new data');
				var replyData = { now2: new Date() };
				reply.write(JSON.stringify(replyData), 'utf8');
			});
			
		});
	});

});

console.log('Server is listening for requests');