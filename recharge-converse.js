'use strict';


let Wit = null;

try {
  // if running from repo
  Wit = require('../').Wit;
  
} catch (e) {
  Wit = require('node-wit').Wit;
  
}

const accessToken = 'IHGHJWTWWBUKX7AC6RYF4JXIWE6Z4DWM';

const client = new Wit({accessToken});

var express = require('express')
var request = require('sync-request');
var cors = require('cors')
var players = [];
var gameStarted = false;
var thx = false;

var port = 8001;
var app = express()
var bodyParser = require('body-parser');

  function countAccomplishedTasks(tasks) {
	  if (!tasks) {
		  return 0;
	  }
    var count = 0;
    if (tasks.recharge) {
      count++;
    }
    if (tasks.sms) {
      count++;
    }
    if (tasks.invoice) {
      count++;
    }
	return count;
  }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());
app.post('/converse', function (req, res) {
	client.message(req.body.query)
	.then((data) => {
	  res.send(data);
	})
	.catch((e) => {
	  console.log('Oops! Got an error: ' + e);
	});
});
app.post('/startGame', function (req, res) {
	console.log('game started');
	gameStarted = true;
	res.send({'msg' : 'Konkurs uruchomiony'});
});
app.post('/stopGame', function (req, res) {
	gameStarted = false;
	res.send({'msg' : 'Konkurs zatrzymany', 'players' : players});
});
app.post('/resetGame', function (req, res) {
	gameStarted = false;
	thx = false;
	players = [];
	res.send({'msg' : 'Konkurs zresetowany'});
});
app.post('/login', function (req, res) {
	if (!gameStarted) {
		res.send({'msg' : 'Konkurs jeszcze nie jest rozpoczęty'});
		return;
	}
	var reqBody = req.body;
	var playerId = reqBody.id;
	var player = players.find(p => p.id == playerId);
	if (!player) {
		player = {'id' : playerId, 'accomplishedTasks' : 0, 'lastAccomplishDate' : new Date() }
		players.push(player);
		res.send({'msg' : 'Jesteś zalogowany', 'logged' : true});
		return;
	} else {
		res.send({'msg' : 'Login ' + playerId + ' jest już zajęty'});
		return;
	}
});
app.post('/thx', function (req, res) {
	thx = !thx;
	res.send({'msg' : 'Dziękuję za uwagę', 'thx' : thx});
});
app.post('/pollPlayers', function (req, res) {
	players.sort(function(a,b) { 
		var d1 = new Date(a.lastAccomplishDate);
		var d2 = new Date(b.lastAccomplishDate);
		var c1 = a.accomplishedTasks;
		var c2 = b.accomplishedTasks;
		if(c1 == c2) {
		  return d1 - d2;
		} else {
		  return c2 - c1;
		}
	});
	res.send({'playersSorted' : players});
});


app.post('/completeTask', function (req, res) {
	if (!gameStarted) {
		res.send({'player' : {}, 'msg' : ''});
		return;
	}
	var reqBody = req.body;
	var playerId = reqBody.id;
	var player = players.find(p => p.id == playerId);
	if (player && (reqBody.recharge || reqBody.sms || reqBody.invoice)) {
		if (!player.recharge && reqBody.recharge) {
			player.recharge = reqBody.recharge;
		}
		if (!player.sms && reqBody.sms) {
			player.sms = reqBody.sms;
		}
		if (!player.invoice && reqBody.invoice) {
			player.invoice = reqBody.invoice;
		}		
		player.accomplishedTasks = countAccomplishedTasks(player);
		player.lastAccomplishDate = new Date().toUTCString();
		res.send({'player' : player, 'msg' : 'Zadanie wykonane poprawnie :-)'});
		return;
	} else {
		res.send({'player' : {}, 'msg' : 'Nie przesłano żadnego zadania do ukończenia.'});
		return;
	}
});



app.listen(port);

