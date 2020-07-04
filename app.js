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
app.get('/weatherdark/:latlon', async (req, res) => {
	console.log(request.params);
	const latlon = req.params.latlon.split(',');
	console.log(latlon);
	const lat = latlon[0];
	const lon = latlon[1];
	console.log(lat, lon);
	url = `https://api.darksky.net/forecast/757c5a5c185c90b230b94d7c401fe771/${lat},${lon}`;
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
