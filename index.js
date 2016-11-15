// stock code from amqplib example, 1000 requests: 2 - 2.5 seconds
// same with noDelay=true: similar requets
// re-write code to create channel once and assert queue once: TBC ???

var async = require('async');
var q = 'tasks';

function bail(err) {
	console.error(err);
	process.exit(1);
}

// Publisher
function publisher(conn, callback) {
	conn.createChannel(on_open);
	function on_open(err, ch) {
		if (err != null) bail(err);
		ch.assertQueue(q);
		ch.sendToQueue(q, new Buffer('something to do'));
		callback(null, 'sent');
	}
}

// Consumer
function consumer(conn) {
	var ok = conn.createChannel(on_open);
	function on_open(err, ch) {
		if (err != null) bail(err);
		ch.assertQueue(q);
		ch.consume(q, function (msg) {
			if (msg !== null) {
				// console.log('consumer: ' + msg.content.toString());
				ch.ack(msg);
			}
		});
	}
}

require('amqplib/callback_api')
	.connect('amqp://localhost?noDelay=true', function (err, conn) {
		if (err != null) bail(err);
		consumer(conn);
		// publisher(conn);

		let numberOfRequests = 1000;
		let requests = [];
		function delegate() {
			return function (callback) {
				// console.log('calling consumer');
				publisher(conn, callback);
			}
		}

		for (let i = 0; i < numberOfRequests; i++) {
			requests.push(delegate());
		}

		let start = new Date();
		async.series(requests, () => {
			console.log('all done');
			let end = new Date() - start;
			console.log('%d requests in %dms', numberOfRequests, (end));

			process.exit(0);
		})
	});
