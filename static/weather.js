const urlBackground =
	'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';

// const getBackground = () => {
// 	axios.get('/background').then((res) => {
// 		console.log(res.data);
// 		document.body.style.backgroundImage = `url('${res.data}')`;
// 	});
// };

// getBackground();

document.body.style.backgroundImage = `url('${urlBackground}')`;
document.body.style.backgroundSize = 'cover';
document.body.style.height = '100vh';
const messageOne = document.querySelector('#message-one');
let forecast = document.querySelector('#target');
const messageTwo = document.querySelector('#message-two');
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
			document.body.style.backgroundSize = 'center/cover';
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
			display.push({ weekSummary: response.data.daily.summary });
			display.push({ forecastToday: response.data.currently.summary });
			display.push({ forecastTomorrow: response.data.daily.data[1].summary });
			display.push({ currentTemp: response.data.currently.temperature });
			display.push({ minTemp: Math.round(response.data.daily.data[0].temperatureMin) });
			display.push({ maxTemp: Math.round(response.data.daily.data[0].temperatureMax) });
			display.push({ windSpeed: response.data.currently.windSpeed });
			display.push({ windGust: response.data.currently.windGust });
			display.push({
				windGustTime: new Date(response.data.daily.data[0].windGustTime * 1000).toLocaleString()
			});
			display.push({ humidity: (response.data.currently.humidity * 100).toFixed(2) });
			display.push({ dewPoint: response.data.currently.dewPoint });
			display.push({ visibility: response.data.currently.visibility });
			display.push({ ozone: response.data.currently.ozone });
			display.push({ sunrise: new Date(response.data.daily.data[0].sunriseTime * 1000).toLocaleString() });
			// displayData(display);
			display.push({ sunset: new Date(response.data.daily.data[0].sunsetTime * 1000).toLocaleString() });
			// displayData(display);
			temp(display);
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
					airQuality: `${data.DailyForecasts[0].AirAndPollen[0].Value} - ${data.DailyForecasts[0]
						.AirAndPollen[0].Category}`
				});
				display.push({
					grass: `${data.DailyForecasts[0].AirAndPollen[1].Value} - ${data.DailyForecasts[0].AirAndPollen[1]
						.Category}`
				});
				display.push({
					mold: `${data.DailyForecasts[0].AirAndPollen[2].Value} - ${data.DailyForecasts[0].AirAndPollen[2]
						.Category}`
				});
				display.push({
					ragweed: `${data.DailyForecasts[0].AirAndPollen[3].Value} - ${data.DailyForecasts[0].AirAndPollen[3]
						.Category}`
				});
				display.push({
					tree: `${data.DailyForecasts[0].AirAndPollen[4].Value} - ${data.DailyForecasts[0].AirAndPollen[4]
						.Category}`
				});
				// displayData();
			});
		});
	};
};

// DISPLAY DATA ON THE PAGE

function temp(display) {
	let toggle = document.querySelectorAll('.hidden');
	toggle.forEach((item) => {
		item.classList.toggle('hidden');
	});
	console.log(display, 'display');
	let temp = document.getElementById('temp');
	let tempMin = document.getElementById('temp-min');
	let tempMax = document.getElementById('temp-max');
	let weekSummary = document.getElementById('week-summary');
	let airQuality = document.getElementById('air-quality');
	let grass = document.getElementById('grass');
	let mold = document.getElementById('mold');
	let ragweed = document.getElementById('ragweed');
	let tree = document.getElementById('tree');
	let sunrise = document.getElementById('sunrise');
	let sunset = document.getElementById('sunset');
	let humidity = document.getElementById('humidity');
	let windGust = document.getElementById('wind-gust');
	let windGustTime = document.getElementById('wind-gust-time');
	let windSpeed = document.getElementById('wind-speed');
	let dewPoint = document.getElementById('dew-point');
	let forecastToday = document.getElementById('forecast-today');
	let forecastTomorrow = document.getElementById('forecast-tomorrow');
	let currentTemp = document.getElementById('current-temp');
	let visibility = document.getElementById('visibility');
	let ozone = document.getElementById('ozone');
	// temp.textContent = display[10].maxTemp;
	tempMin.textContent = display[9].minTemp;
	tempMax.textContent = display[10].maxTemp;
	weekSummary.textContent = display[5].weekSummary;
	airQuality.textContent = display[0].airQuality;
	grass.textContent = display[1].grass;
	mold.textContent = display[2].mold;
	ragweed.textContent = display[3].ragweed;
	tree.textContent = display[4].tree;
	sunrise.textContent = display[18].sunrise;
	sunset.textContent = display[19].sunset;
	humidity.textContent = display[14].humidity;
	windGust.textContent = display[12].windGust;
	windGustTime.textContent = display[13].windGustTime;
	windSpeed.textContent = display[11].windSpeed;
	dewPoint.textContent = display[15].dewPoint;
	forecastToday.textContent = display[6].forecastToday;
	forecastTomorrow.textContent = display[7].forecastTomorrow;
	currentTemp.textContent = display[8].currentTemp;
	visibility.textContent = display[16].visibility;
	ozone.textContent = display[17].ozone;
}

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
