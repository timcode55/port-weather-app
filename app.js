const express = require('express');
const path = require('path');
const request = require('request');
require('dotenv').config();

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
app.get('/weatherdark/:latlon', async (req, res) => {
	const latlon = req.params.latlon.split(',');
	const lat = latlon[0];
	const lon = latlon[1];
	let api_key = process.env.API_KEY;
	url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon}`;
	await request({ url }, (error, response, body) => {
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
