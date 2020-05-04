("url('img_tree.png')");
const urlBackground =
	'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';
document.body.style.backgroundImage = `url('${urlBackground}')`;

document.body.style.backgroundSize = 'cover';

document.body.style.height = '100vh';

const messageOne = document.querySelector('#message-one');
let forecast = document.querySelector('#target');
const messageTwo = document.querySelector('#message-two');
const weatherForm = document.querySelector('form');
const search = document.querySelector('input');
let display = [];
// console.log(display);
weatherForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const location = search.value;
	// console.log(location);
	testFunction(location);
	search.value = '';
	const randomPage = Math.floor(Math.random() * 10);
	console.log(randomPage);
	let editTitle = document.querySelector('.title');
	editTitle.classList.add('background-title');
	editTitle.innerHTML = `${location} local weather`;
	// console.log(randomPage);

	fetch(
		'https://api.unsplash.com/search/photos?page=' +
			randomPage +
			'&query=' +
			location +
			'&client_id=LyTILpYq9RlxI2Zefq96p9KRqORAkQyQ6cYqjngIUVg'
	).then((response) => {
		response.json().then((data) => {
			// console.log(data.results[{}]);
			const random = Math.floor(Math.random() * 10);
			console.log(random);
			let result = data.results[random].urls.full;
			// let resultMiami =
			// 	'https://images.unsplash.com/photo-1543968332-f99478b1ebdc?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0';
			// let resultLA = 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0'
			console.log(result);
			document.body.style.backgroundImage = `url('${result}')`;
			document.body.style.backgroundSize = 'cover';
			document.body.style.height = '100vh';
			// getAccu(location);
		});
	});
});

// GET LATITUDE AND LONGITUDE FOR ENTERED LOCATION

let testFunction = (location) => {
	fetch(
		'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			encodeURIComponent(location) +
			'.json?access_token=pk.eyJ1IjoicGV0bWFwNTUiLCJhIjoiY2s3NmZiYzl2MHFpZTNtbzNycHh0aDlnMCJ9.oERa5PVzkVL4oEZXMOWnxA&limit=1'
	).then((response) => {
		response.json().then((data) => {
			console.log(data);
			let latitude = data.features[0].bbox[1];
			let longitude = data.features[0].bbox[0];
			// display.push({ latitude: data.features[0].bbox[1] });
			// display.push({ longitude: data.features[0].bbox[0] });
			fetchData(latitude, longitude);
		});
	});
};

let latitude = 36.5964139832728;
let longitude = -121.943692018703;

// GET FORECAST WITH THE LATITUDE AND LONGITUDE

let fetchData = (latitude, longitude) => {
	fetch(
		'https://api.darksky.net/forecast/757c5a5c185c90b230b94d7c401fe771/' + latitude + ',' + longitude
	).then((response) => {
		response.json().then((data) => {
			// console.log(data);
			// let display = {
			display.push({ 'Forecast Today': data.currently.summary });
			display.push({ 'Current Temp': data.currently.temperature });
			display.push({ 'Wind Speed': data.currently.windSpeed });
			display.push({ 'Wind Gust': data.currently.windGust });
			display.push({ Tomorrow: data.daily.data[1].summary });
			display.push({ 'Cur Humidity': data.currently.humidity * 100 });
			display.push({ 'Dew Point': data.currently.dewPoint });
			display.push({ 'UV Index': data.currently.uvIndex });
			display.push({ 'Ozone Level': data.currently.ozone });
			display.push({ 'Cloud Cover': data.currently.cloudCover * 100 });
			display.push({ Sunset: new Date(data.daily.data[0].sunsetTime * 1000).toLocaleString() });
			// 'Wind Gust': data.currently.windGust,
			// Tomorrow: data.daily.data[1].summary,
			// 'Current Humidity': data.currently.humidity * 100,
			// 'Dew Point': data.currently.dewPoint,
			// 'UV Index': data.currently.uvIndex,
			// 'Ozone Level': data.currently.ozone,
			// 'Cloud Cover': data.currently.cloudCover * 100,
			// 'Sunset Time': new Date(data.daily.data[0].sunsetTime * 1000).toLocaleString()
			// };

			let div = document.createElement('div');
			// let myArray = Object.values(display);
			// let keyArray = Object.keys(display);
			// console.log(Object.keys(display));
			// console.log(display);
			//
			// console.log(display);
			for (let item of display) {
				for (let key in item) {
					// console.log(item[key]);

					// console.log(item);
					div.innerHTML += `<article class="notification is-primary today">
      <p class="forecastTitle">${key}</p>
      <p class="forecast">${item[key]}</p>
      </article>`;
				}
			}

			div.classList.add('main-div');
			target.appendChild(div);
		});
	});
};

// let getAccu = (location) => {
// 	fetch(
// 		'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=GJKGfMXiYFeHPUV3p3oHc28uvCAEvLTY&q=' +
// 			location +
// 			'&details=true'
// 	).then((response) => {
// 		response.json().then((data) => {
// 			// console.log(data);
// 			let locationKey = data[0].Key;
// 			console.log(locationKey);
// 			// display.push({ 'Location Key': data[0].Key });
// 			pollenForecast(locationKey);
// 		});
// 	});
// 	let pollenForecast = (locationKey) => {
// 		fetch(
// 			'http://dataservice.accuweather.com/forecasts/v1/daily/1day/' +
// 				locationKey +
// 				'?apikey=GJKGfMXiYFeHPUV3p3oHc28uvCAEvLTY&details=true'
// 		).then((response) => {
// 			response.json().then((data) => {
// 				// console.log(data);
// 				// console.log(data.DailyForecasts[0].AirAndPollen[1].Category);
// 				display.push({
// 					'Air Quality': `${data.DailyForecasts[0].AirAndPollen[0].Value} - ${data.DailyForecasts[0]
// 						.AirAndPollen[0].Category}`
// 				});
// 				display.push({
// 					Grass: `${data.DailyForecasts[0].AirAndPollen[1].Value} - ${data.DailyForecasts[0].AirAndPollen[1]
// 						.Category}`
// 				});
// 				display.push({
// 					Mold: `${data.DailyForecasts[0].AirAndPollen[2].Value} - ${data.DailyForecasts[0].AirAndPollen[2]
// 						.Category}`
// 				});
// 				display.push({
// 					Ragweed: `${data.DailyForecasts[0].AirAndPollen[3].Value} - ${data.DailyForecasts[0].AirAndPollen[3]
// 						.Category}`
// 				});
// 				display.push({
// 					Tree: `${data.DailyForecasts[0].AirAndPollen[4].Value} - ${data.DailyForecasts[0].AirAndPollen[4]
// 						.Category}`
// 				});
// 			});
// 		});
// 	};
// };

// fetch(
// 	'https://api.unsplash.com/collections/featured?query=&client_id=LyTILpYq9RlxI2Zefq96p9KRqORAkQyQ6cYqjngIUVg'
// ).then((response) => {
// 	response.json().then((data) => {
// 		display.push({ image1: data[4].links.self });
// 	});
// });
