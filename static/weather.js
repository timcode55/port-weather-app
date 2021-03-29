const urlBackground =
	'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';

document.body.style.backgroundImage = `url('${urlBackground}')`;
document.body.style.backgroundSize = 'cover';
document.body.style.height = '120vh';
const messageOne = document.querySelector('#message-one');
let forecast = document.querySelector('#target');
const messageTwo = document.querySelector('#message-two');
const weatherForm = document.querySelector('form');
const search = document.querySelector('input');

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

	axios.get(`/unsplash/${location}`).then((response) => {
		const random = Math.floor(Math.random() * 10);
		let result = response.data.results[random].urls.full;
		document.body.style.backgroundImage = `url('${result}')`;
		document.body.style.backgroundSize = 'cover';
		document.body.style.height = '100vh';
	});
});

// GET LATITUDE AND LONGITUDE FOR ENTERED LOCATION

let getLatLong = async (location) => {
	await axios.get(`/mapbox/${location}`).then((response) => {
		const data = response.data;
		let lat = data.features[0].bbox[1];
		let lon = data.features[0].bbox[0];
		fetchData(lat, lon, location);
	});
};

let lat = 36.5964139832728;
let lon = -121.943692018703;

// GET FORECAST WITH THE LATITUDE AND LONGITUDE
let display = [];
async function fetchData(lat, lon, location) {
	await axios
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
			display.push({ sunset: new Date(response.data.daily.data[0].sunsetTime * 1000).toLocaleString() });
			// let waitDisplay = async () => {
			// 	const delayDisplay = await display;
			// 	console.log(delayDisplay, 'delayDisplay will this work?');
			// };
			// waitDisplay();
		})
		.catch((error) => {
			console.log(error);
		});
}

// GET ACCUWEATHER DATA FOR THE POLLEN LEVELS

async function getAccu(location) {
	const pollenForecast = async (locationKey) => {
		await axios.get(`/accuweather/${locationKey}`).then((response) => {
			const data = response.data;
			display.push({
				airQuality: `${data.DailyForecasts[0].AirAndPollen[0].Value} - ${data.DailyForecasts[0].AirAndPollen[0]
					.Category}`
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
			temp(display);
		});
	};
	await axios.get(`/accu/${location}`).then((response) => {
		let locationKey = response.data[0].Key;
		pollenForecast(locationKey);
	});
}

// DISPLAY DATA ON THE PAGE

async function temp(display) {
	let toggle = document.querySelectorAll('.hidden');
	toggle.forEach((item) => {
		item.classList.toggle('hidden');
	});

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

	let weatherObj = {};
	// console.log(display, 'display at start of weatherObj creation');
	for (let i = 0; i < display.length; i++) {
		for (item in display[i]) {
			weatherObj[item] = display[i][item];
		}
	}
	// console.log(weatherObj, 'weatherObj before textContent section');
	tempMin.textContent = `${~~weatherObj['minTemp']}°`;
	tempMax.textContent = `${~~weatherObj['maxTemp']}°`;
	weekSummary.textContent = weatherObj['weekSummary'];
	airQuality.textContent = weatherObj['airQuality'];
	grass.textContent = weatherObj['grass'];
	// console.log(grass.textContent, 'grass.textContent');
	mold.textContent = weatherObj['mold'];
	ragweed.textContent = weatherObj['ragweed'];
	tree.textContent = weatherObj['tree'];
	sunrise.textContent = weatherObj['sunrise'];
	sunset.textContent = weatherObj['sunset'];
	humidity.textContent = `${~~weatherObj['humidity']}%`;
	windGust.textContent = `${~~weatherObj['windGust']} mph`;
	windGustTime.textContent = weatherObj['windGustTime'];
	windSpeed.textContent = `${~~weatherObj['windSpeed']} mph`;
	dewPoint.textContent = `${~~weatherObj['maxTemp']}°C Td`;
	forecastToday.textContent = weatherObj['forecastToday'];
	forecastTomorrow.textContent = weatherObj['forecastTomorrow'];
	currentTemp.textContent = ~~weatherObj['currentTemp'];
	visibility.textContent = `${~~weatherObj['visibility']} miles`;
	ozone.textContent = `${~~weatherObj['ozone']} units`;
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
