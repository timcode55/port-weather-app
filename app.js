const express = require('express');
const path = require('path');
const request = require('request');
require('dotenv').config();
const axios = require('axios');
const cors = require('cors');

// FETCH BACKGROUND IMAGE FOR STATIC HOME PAGE

const PORT = process.env.PORT || 9000;

let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname + '/static')));
app.use(cors());
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

app.get('/background', function(req, res) {
	const randomPage = Math.floor(Math.random() * 10);
	let background = axios(
		'https://api.unsplash.com/search/photos?page=' +
			randomPage +
			'&query=' +
			'miami' +
			'&client_id=LyTILpYq9RlxI2Zefq96p9KRqORAkQyQ6cYqjngIUVg'
	).then((response) => {
		(response) => response.data;
		const random = Math.floor(Math.random() * 10);
		let result = response.data.results[random].urls.full;
		res.send(result);
		// let resultMiami =
		// 	'https://images.unsplash.com/photo-1543968332-f99478b1ebdc?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';
		// let resultLA = 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0'
		// document.body.style.backgroundImage = `url('${result}')`;
		// document.body.style.backgroundSize = 'center/cover';
		// document.body.style.height = '100vh';
	});
});

app.listen(PORT, () => {
	console.log('Server is up on port ' + PORT);
});
