const urlBackground =
	'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';

document.body.style.backgroundImage = `url('${urlBackground}')`;
document.body.style.backgroundSize = 'cover';
document.body.style.height = '100vh';
const weatherForm = document.querySelector('form');
const search = document.querySelector('input');

let display = [];

weatherForm.addEventListener('submit', (e) => {
	e.preventDefault();
	display = [];
	const location = search.value;
	getLatLong(location);
	getAccu(location);
	search.value = '';
	const randomPage = Math.floor(Math.random() * 10);
	let editTitle = document.querySelector('.title');
	editTitle.classList.add('background-title');
	editTitle.innerHTML = `${location} local weather`;

	// FETCH UNSPLASH API DATA FOR BACKGROUND IMAGE FROM QUERIED CITY

	fetch(
		'https://api.unsplash.com/search/photos?page=' +
			randomPage +
			'&query=' +
			location +
			'&client_id=LyTILpYq9RlxI2Zefq96p9KRqORAkQyQ6cYqjngIUVg'
	).then((response) => {
		response.json().then((data) => {
			const random = Math.floor(Math.random() * 10);
			let result = data.results[random].urls.full;
			// let resultMiami =
			// 	'https://images.unsplash.com/photo-1543968332-f99478b1ebdc?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';
			// let resultLA = 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0'
			document.body.style.backgroundImage = `url('${result}')`;
			document.body.style.backgroundSize = 'cover';
			document.body.style.height = '100vh';
		});
	});
});

// GET LATITUDE AND LONGITUDE FOR ENTERED LOCATION

let getLatLong = (location) => {
	fetch(
		'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			encodeURIComponent(location) +
			'.json?access_token=pk.eyJ1IjoicGV0bWFwNTUiLCJhIjoiY2s3NmZiYzl2MHFpZTNtbzNycHh0aDlnMCJ9.oERa5PVzkVL4oEZXMOWnxA&limit=1'
	).then((response) => {
		response.json().then((data) => {
			let lat = data.features[0].bbox[1];
			let lon = data.features[0].bbox[0];
			fetchData(lat, lon);
		});
	});
};

let lat = 36.5964139832728;
let lon = -121.943692018703;

// GET FORECAST WITH THE LATITUDE AND LONGITUDE

async function fetchData(lat, lon) {
	const testingData = await axios
		.get(`/weatherdark/${lat},${lon}`)
		.then((response) => {
			display.push({ 'Week Summary': response.data.daily.summary });
			display.push({ 'Forecast Today': response.data.currently.summary });
			display.push({ Tomorrow: response.data.daily.data[1].summary });
			display.push({ 'Current Temp': response.data.currently.temperature });
			display.push({ 'Min Temp': response.data.daily.data[0].temperatureMin });
			display.push({ 'Max Temp': response.data.daily.data[0].temperatureMax });
			display.push({ 'Wind Speed': response.data.currently.windSpeed });
			display.push({ 'Wind Gust': response.data.currently.windGust });
			display.push({
				'Wind Gust Time': new Date(response.data.daily.data[0].windGustTime * 1000).toLocaleString()
			});
			display.push({ 'Cur Humidity': response.data.currently.humidity * 100 });
			display.push({ 'Dew Point': response.data.currently.dewPoint });
			display.push({ Sunrise: new Date(response.data.daily.data[0].sunriseTime * 1000).toLocaleString() });
			displayData(display);
			display.push({ Sunset: new Date(response.data.daily.data[0].sunsetTime * 1000).toLocaleString() });
			displayData(display);
		})
		.catch((error) => {
			console.log(error);
		});
}

// GET ACCUWEATHER DATA FOR THE POLLEN LEVELS

let getAccu = async (location) => {
	await fetch(
		'https://dataservice.accuweather.com/locations/v1/cities/search?apikey=GJKGfMXiYFeHPUV3p3oHc28uvCAEvLTY&q=' +
			location +
			'&details=true'
	).then((response) => {
		response.json().then((data) => {
			let locationKey = data[0].Key;
			pollenForecast(locationKey);
		});
	});
	let pollenForecast = (locationKey) => {
		fetch(
			'https://dataservice.accuweather.com/forecasts/v1/daily/1day/' +
				locationKey +
				'?apikey=GJKGfMXiYFeHPUV3p3oHc28uvCAEvLTY&details=true'
		).then((response) => {
			response.json().then((data) => {
				display.push({
					'Air Quality': `${data.DailyForecasts[0].AirAndPollen[0].Value} - ${data.DailyForecasts[0]
						.AirAndPollen[0].Category}`
				});
				display.push({
					Grass: `${data.DailyForecasts[0].AirAndPollen[1].Value} - ${data.DailyForecasts[0].AirAndPollen[1]
						.Category}`
				});
				display.push({
					Mold: `${data.DailyForecasts[0].AirAndPollen[2].Value} - ${data.DailyForecasts[0].AirAndPollen[2]
						.Category}`
				});
				display.push({
					Ragweed: `${data.DailyForecasts[0].AirAndPollen[3].Value} - ${data.DailyForecasts[0].AirAndPollen[3]
						.Category}`
				});
				display.push({
					Tree: `${data.DailyForecasts[0].AirAndPollen[4].Value} - ${data.DailyForecasts[0].AirAndPollen[4]
						.Category}`
				});
				// displayData();
			});
		});
	};
};

// DISPLAY DATA ON THE PAGE

function displayData(display) {
	let div = document.createElement('div');
	for (let item of display) {
		for (let key in item) {
			div.innerHTML += `<article class="notification is-primary today">
  <p class="forecastTitle">${key}</p>
  <p class="forecast">${item[key]}</p>
  </article>`;
		}
	}

	div.classList.add('main-div');
	target.innerHTML = '';
	target.appendChild(div);
}
