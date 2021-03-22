// INITIAL BACKGROUND IMAGE
const urlBackground =
	'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';

document.body.style.backgroundImage = `url('${urlBackground}')`;
document.body.style.backgroundSize = 'cover';
document.body.style.height = '100vh';
const weatherForm = document.querySelector('form');
const search = document.querySelector('input');

let display = [];

// SEARCH FORM FOR CITY WEATHER FORECAST
const weatherSearch = async () => {
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
};
weatherSearch();

// GET LATITUDE AND LONGITUDE FOR ENTERED LOCATION

let getLatLong = async (location) => {
	console.log('location', location);
	await axios.get(`/mapbox/${location}`).then((response) => {
		const data = response.data;
		console.log(data, 'data in mapbox route');
		let lat = data.features[0].bbox[1];
		let lon = data.features[0].bbox[0];
		fetchData(lat, lon);
	});
};

let lat = 36.5964139832728;
let lon = -121.943692018703;

// GET FORECAST WITH THE LATITUDE AND LONGITUDE

async function fetchData(lat, lon) {
	await axios
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
			display.push({ 'Cur Humidity': (response.data.currently.humidity * 100).toFixed(2) });
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

async function getAccu(location) {
	const pollenForecast = async (locationKey) => {
		await axios.get(`/accuweather/${locationKey}`).then((response) => {
			const data = response.data;
			console.log(data, 'pollen data');
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
	};
	await axios.get(`/accu/${location}`).then((response) => {
		let locationKey = response.data[0].Key;
		pollenForecast(locationKey);
	});
}

// DISPLAY DATA ON THE PAGE

async function displayData(display) {
	console.log(display, 'display data in displayData function', display.length);
	let div = await document.createElement('div');

	setTimeout(() => {
		for (let item of display) {
			// console.log(item, 'item');
			for (let key in item) {
				// console.log(key, 'key');
				div.innerHTML += `<article class="notification is-primary today">
    <p class="forecastTitle">${key}</p>
    <p class="forecast">${item[key]}</p>
    </article>`;
			}
		}
	}, 1000);

	div.classList.add('main-div');
	target.innerHTML = '';
	target.appendChild(div);
}
