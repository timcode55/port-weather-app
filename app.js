const express = require('express');
const path = require('path');
const request = require('request');
// const request = require('request-promise');

// FETCH BACKGROUND IMAGE FOR STATIC HOME PAGE

const PORT = process.env.PORT || 9000;

let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname + '/static')));
// CORS SOLUTION

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});
app.get('/weathercors', (req, res) => {
	url =
		'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';
	request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}

		res.json(JSON.parse(body));
	});
});
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});
app.get('/weatherdark', (req, res) => {
	url = `https://api.darksky.net/forecast/757c5a5c185c90b230b94d7c401fe771/36,-121`;
	request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}

		res.json(JSON.parse(body));
	});
});

// app.get('/weather', function(req, res) {
// 	res.sendFile(path.join(__dirname + '/static/index.html'));
// });

app.listen(PORT, () => {
	console.log('Server is up on port ' + PORT);
});
