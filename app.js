const express = require('express');
const path = require('path');
const request = require('request');
require('dotenv').config();
const cors = require('cors');

// FETCH BACKGROUND IMAGE FOR STATIC HOME PAGE

const PORT = process.env.PORT || 9000;

let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname + '/static')));
app.use(cors());

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

app.get('/accu/:location', async (req, res) => {
	const location = req.params.location;
	let api_key = process.env.ACCU_KEY;
	url = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${api_key}&q=${location}&details=true`;
	await request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}
		res.json(JSON.parse(body));
	});
});

app.get('/accuweather/:locationKey', async (req, res) => {
	const locationKey = req.params.locationKey;
	let api_key = process.env.ACCU_KEY;
	url = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${api_key}&details=true`;
	await request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}
		res.json(JSON.parse(body));
	});
});

app.get('/unsplash/:location', async (req, res) => {
	const location = req.params.location;
	let api_key = process.env.UNSPLASH_KEY;
	const randomPage = Math.floor(Math.random() * 10);
	url = `https://api.unsplash.com/search/photos?page=${randomPage}&query=${location}&client_id=${api_key}`;
	await request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}
		res.json(JSON.parse(body));
	});
});

app.get('/mapbox/:location', async (req, res) => {
	const location = req.params.location;
	let api_key = process.env.MAPBOX_KEY;
	url = `https://api.mapbox.com/geocoding/v5/mapbox.places/' +
  encodeURIComponent(${location}) +
  '.json?access_token=${api_key}&limit=1`;
	await request({ url }, (error, response, body) => {
		if (error || response.statusCode !== 200) {
			return res.status(500).json({ type: 'error', message: err.message });
		}
		res.json(JSON.parse(body));
	});
});

app.listen(PORT, () => {
	console.log('Server is up on port ' + PORT);
});
