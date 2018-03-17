const express = require('express');
const app = express();
const server = require('http').Server(app);
const chalk = require('chalk');

const port = 8888;

app.use(express.static('public'));

server.listen(port, null, null, () => {
    console.log(chalk.green(`Server running on http://localhost:${port}`));
   	console.log("Ionut was here");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
