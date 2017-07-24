var http = require('http');

const express = require('express');

var app = express();
var staticRoot = __dirname;

app.set('port', 7443);

app.use(express.static(staticRoot));

app.use((req, res) => res.sendFile(`${__dirname}/index.html`));

var httpServer = http.createServer(app);

httpServer.listen(7443);


