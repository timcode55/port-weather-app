const urlBackground =
  "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjEyNDk1NX0";

document.body.style.backgroundImage = `url('${urlBackground}')`;
document.body.style.backgroundSize = "cover";
document.body.style.height = "120vh";
const messageOne = document.querySelector("#message-one");
let forecast = document.querySelector("#target");
const messageTwo = document.querySelector("#message-two");
const weatherForm = document.querySelector("form");
const search = document.querySelector("input");

weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Immediately hide all data when searching for a new city
  let toggle = document.querySelectorAll(".hidden, .container > div:not(.hidden)");
  toggle.forEach((item) => {
    if (!item.classList.contains("hidden")) {
      item.classList.add("hidden");
    }
  });

  display = [];
  const location = search.value;
  getOpenMeteoWeather(location);
  search.value = "";
  const randomPage = Math.floor(Math.random() * 10);
  let editTitle = document.querySelector(".title");
  editTitle.classList.add("background-title");
  editTitle.innerHTML = `${location} local weather`;
  getUnsplashImage(location);

  // FETCH UNSPLASH API DATA FOR BACKGROUND IMAGE FROM QUERIED CITY
  async function getUnsplashImage(location) {
    console.log(location, "LOCATION");
    // Encode the location properly and add cache-busting timestamp
    const encodedLocation = encodeURIComponent(location);
    const timestamp = Date.now();

    // Clear existing background immediately to force browser to reload
    document.body.style.backgroundImage = 'none';

    await axios.get(`/unsplash/${encodedLocation}?t=${timestamp}`)
      .then((response) => {
        if (!response.data.results || response.data.results.length === 0) {
          console.log("No images found for location, using default");
          const defaultUrl = `https://images.unsplash.com/photo-1583847323635-7ad5b93640ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3572&q=80&t=${timestamp}`;
          preloadAndSetBackground(defaultUrl);
          return;
        }

        // Use a different random index each time to avoid same image
        const random = Math.floor(Math.random() * response.data.results.length);
        let result = response.data.results[random]?.urls.full ||
          "https://images.unsplash.com/photo-1583847323635-7ad5b93640ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3572&q=80";

        // Add cache-busting parameter to the image URL to force fresh load
        const cacheBustingUrl = result + (result.includes('?') ? '&' : '?') + `t=${timestamp}`;

        console.log(cacheBustingUrl, "result with cache busting");
        console.log(`Selected image ${random + 1} of ${response.data.results.length}`);

        // Preload image before setting as background to ensure it's fresh
        preloadAndSetBackground(cacheBustingUrl);
      })
      .catch((error) => {
        console.error("Error fetching Unsplash image:", error);
        console.error("Error response:", error.response?.data);
        // Use default image on error with cache-busting
        const defaultUrl = `https://images.unsplash.com/photo-1583847323635-7ad5b93640ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3572&q=80&t=${timestamp}`;
        preloadAndSetBackground(defaultUrl);
      });
  }

  // Helper function to preload image and set as background
  function preloadAndSetBackground(imageUrl) {
    const img = new Image();
    img.onload = function() {
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.height = "100vh";
    };
    img.onerror = function() {
      console.error("Failed to load image:", imageUrl);
      // Still set it as background even if preload fails
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.height = "100vh";
    };
    img.src = imageUrl;
  }
});

// GET LATITUDE AND LONGITUDE FOR ENTERED LOCATION

// let getLatLong = async (location) => {
//   await axios.get(`/mapbox/${location}`).then((response) => {
//     const data = response.data;
//     let lat = data.features[0].center[1];
//     let lon = data.features[0].center[0];
//     //   fetchData(lat, lon, location);
//   });
// };

let lat = 36.5964139832728;
let lon = -121.943692018703;

// GET FORECAST WITH THE LATITUDE AND LONGITUDE
let display = [];

// GET OPEN-METEO WEATHER DATA (Free, with air quality & pollen!)

async function getOpenMeteoWeather(location) {
  // Fetch both Open-Meteo weather data and AccuWeather pollen data
  const [weatherResponse, pollenResponse] = await Promise.all([
    axios.get(`/weather/${location}`),
    axios.get(`/pollen/${location}`)
  ]);

  const data = weatherResponse.data;
  const weather = data.weather;
  const airQuality = data.airQuality;
  const accuPollen = pollenResponse.data; // Real AccuWeather pollen data

  // Continue processing weather data
  (async function processWeatherData() {
    try {

      const current = weather.current;
      const daily = weather.daily;

      // Helper functions
      const getAQICategory = (aqi) => {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive Groups";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
      };

      const getPollenLevel = (value) => {
        if (value === 0) return "None";
        if (value <= 10) return "Low";
        if (value <= 50) return "Medium";
        if (value <= 100) return "High";
        return "Very High";
      };

      const getWindDirection = (degrees) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
      };

      const getWindArrow = (degrees) => {
        // Returns a rotated arrow icon based on wind direction
        // Wind direction is "from" direction, so arrow points opposite way
        const rotation = (degrees + 180) % 360;
        return `<i class="fas fa-long-arrow-alt-up" style="transform: rotate(${rotation}deg); display: inline-block;"></i>`;
      };

      const getWeatherDescription = (code) => {
        const descriptions = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Foggy",
          48: "Depositing rime fog",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          61: "Slight rain",
          63: "Moderate rain",
          65: "Heavy rain",
          71: "Slight snow",
          73: "Moderate snow",
          75: "Heavy snow",
          77: "Snow grains",
          80: "Slight rain showers",
          81: "Moderate rain showers",
          82: "Violent rain showers",
          85: "Slight snow showers",
          86: "Heavy snow showers",
          95: "Thunderstorm",
          96: "Thunderstorm with slight hail",
          99: "Thunderstorm with heavy hail"
        };
        return descriptions[code] || "Unknown";
      };

      const getWeatherIcon = (code) => {
        // Map weather codes to Font Awesome icons
        const icons = {
          0: "fas fa-sun",                    // Clear sky
          1: "fas fa-sun",                    // Mainly clear
          2: "fas fa-cloud-sun",              // Partly cloudy
          3: "fas fa-cloud",                  // Overcast
          45: "fas fa-smog",                  // Foggy
          48: "fas fa-smog",                  // Depositing rime fog
          51: "fas fa-cloud-rain",            // Light drizzle
          53: "fas fa-cloud-rain",            // Moderate drizzle
          55: "fas fa-cloud-showers-heavy",   // Dense drizzle
          61: "fas fa-cloud-rain",            // Slight rain
          63: "fas fa-cloud-showers-heavy",   // Moderate rain
          65: "fas fa-cloud-showers-heavy",   // Heavy rain
          71: "fas fa-snowflake",             // Slight snow
          73: "fas fa-snowflake",             // Moderate snow
          75: "fas fa-snowflake",             // Heavy snow
          77: "fas fa-snowflake",             // Snow grains
          80: "fas fa-cloud-rain",            // Slight rain showers
          81: "fas fa-cloud-showers-heavy",   // Moderate rain showers
          82: "fas fa-cloud-showers-heavy",   // Violent rain showers
          85: "fas fa-snowflake",             // Slight snow showers
          86: "fas fa-snowflake",             // Heavy snow showers
          95: "fas fa-bolt",                  // Thunderstorm
          96: "fas fa-bolt",                  // Thunderstorm with slight hail
          99: "fas fa-bolt"                   // Thunderstorm with heavy hail
        };
        return icons[code] || "fas fa-question";
      };

      // AIR QUALITY DATA - Using AccuWeather data
      display.push({
        airQuality: `${accuPollen.airQuality.Value} - ${accuPollen.airQuality.Category}`,
      });

      // POLLEN DATA - Real AccuWeather pollen data
      display.push({
        grass: `${accuPollen.grass.Value} - ${accuPollen.grass.Category}`,
      });
      display.push({
        mold: `${accuPollen.mold.Value} - ${accuPollen.mold.Category}`,
      });
      display.push({
        ragweed: `${accuPollen.ragweed.Value} - ${accuPollen.ragweed.Category}`,
      });
      display.push({
        tree: `${accuPollen.tree.Value} - ${accuPollen.tree.Category}`,
      });

      // TEMPERATURE DATA (already in Fahrenheit from API)
      display.push({
        minTemp: Math.round(daily.temperature_2m_min[0]),
      });
      display.push({
        maxTemp: Math.round(daily.temperature_2m_max[0]),
      });
      display.push({
        currentTemp: `${Math.round(current.temperature_2m)}`,
      });

      // Debug cloud cover
      console.log('Cloud cover raw value:', current.cloud_cover);
      display.push({
        cloudCover: `${Math.round(current.cloud_cover || 0)}`,
      });

      // WIND DATA (already in mph from API)
      display.push({
        windGust: `${Math.round(current.wind_gusts_10m || 0)}`,
      });
      display.push({
        windGustDirection: `${getWindArrow(current.wind_direction_10m || 0)} ${getWindDirection(current.wind_direction_10m || 0)}`,
      });
      display.push({
        windSpeed: `${Math.round(current.wind_speed_10m || 0)}`,
      });
      display.push({
        windSpeedDirection: `${getWindArrow(current.wind_direction_10m || 0)} ${getWindDirection(current.wind_direction_10m || 0)}`,
      });
      display.push({
        soilTemp: Math.round(current.soil_temperature_6cm),
      });

      // WEATHER FORECAST
      display.push({
        forecastToday: getWeatherDescription(daily.weather_code[0]),
      });
      display.push({
        weatherIcon: getWeatherIcon(daily.weather_code[0]),
      });

      // Tomorrow's forecast
      if (daily.weather_code.length > 1) {
        display.push({
          forecastTomorrow: `${getWeatherDescription(daily.weather_code[1])} - Low: ${Math.round(daily.temperature_2m_min[1])}°F, High: ${Math.round(daily.temperature_2m_max[1])}°F`,
        });
      } else {
        display.push({
          forecastTomorrow: "Not available",
        });
      }

      // SUNRISE/SUNSET
      display.push({
        sunrise: new Date(daily.sunrise[0]).toLocaleString(),
      });
      display.push({
        sunset: new Date(daily.sunset[0]).toLocaleString(),
      });

      // OTHER CONDITIONS
      display.push({
        humidity: `${Math.round(current.relative_humidity_2m || 0)}`,
      });
      display.push({
        uvIndex: `${daily.uv_index_max?.[0] || 0}`,
      });

      // Debug precipitation
      console.log('Precipitation raw value:', daily.precipitation_sum?.[0]);
      console.log('Daily object:', daily);
      const precipValue = daily.precipitation_sum?.[0];
      display.push({
        precipitation: precipValue !== undefined && precipValue !== null ? precipValue.toFixed(2) : '0.00',
      });

      temp(display);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      console.error("Error details:", error.response?.data);
      alert(`Error: ${error.response?.data?.message || error.message}\n\nUnable to fetch weather data for this location.`);
    }
  })();
}

// DISPLAY DATA ON THE PAGE

async function temp(display) {
  let toggle = document.querySelectorAll(".hidden");
  toggle.forEach((item) => {
    item.classList.toggle("hidden");
  });

  let tempMin = document.getElementById("temp-min");
  let tempMax = document.getElementById("temp-max");
  let weekSummary = document.getElementById("week-summary");
  let airQuality = document.getElementById("air-quality");
  let grass = document.getElementById("grass");
  let mold = document.getElementById("mold");
  let ragweed = document.getElementById("ragweed");
  let tree = document.getElementById("tree");
  let sunrise = document.getElementById("sunrise");
  let sunset = document.getElementById("sunset");
  let humidity = document.getElementById("humidity");
  let windGust = document.getElementById("wind-gust");
  let windSpeed = document.getElementById("wind-speed");
  let soilTemp = document.getElementById("soil-temp");
  let cloudCover = document.getElementById("cloud-cover");
  let forecastToday = document.getElementById("forecast-today");
  let forecastTomorrow = document.getElementById("forecast-tomorrow");
  let currentTemp = document.getElementById("current-temp");
  let uvIndex = document.getElementById("uvIndex");
  let weatherIcon = document.getElementById("weather-icon");
  let precipitation = document.getElementById("precipitation");

  let weatherObj = {};

  const delayDisplay = async () => {
    setTimeout(() => {
      for (let i = 0; i < display.length; i++) {
        for (item in display[i]) {
          weatherObj[item] = display[i][item];
        }
      }
      tempMin.textContent = `${~~weatherObj["minTemp"]}°`;
      tempMax.textContent = `${~~weatherObj["maxTemp"]}°`;
      weekSummary.textContent = weatherObj["weekSummary"];
      airQuality.textContent = weatherObj["airQuality"];
      grass.textContent = weatherObj["grass"];
      mold.textContent = weatherObj["mold"];
      ragweed.textContent = weatherObj["ragweed"];
      tree.textContent = weatherObj["tree"];
      sunrise.textContent = weatherObj["sunrise"];
      sunset.textContent = weatherObj["sunset"];
      humidity.textContent = `${~~weatherObj["humidity"]}%`;
      windGust.innerHTML = `${weatherObj["windGustDirection"]} ${~~weatherObj["windGust"]} mph`;
      windSpeed.innerHTML = `${weatherObj["windSpeedDirection"]} ${~~weatherObj["windSpeed"]} mph`;
      soilTemp.textContent = `${~~weatherObj["soilTemp"]}°`;
      cloudCover.textContent = `${~~weatherObj["cloudCover"]}%`;
      forecastToday.textContent = weatherObj["forecastToday"];
      forecastTomorrow.textContent = weatherObj["forecastTomorrow"];
      currentTemp.textContent = `${~~weatherObj["currentTemp"]}°`;
      uvIndex.textContent = weatherObj["uvIndex"];
      precipitation.textContent = `${weatherObj["precipitation"]}"`;

      // Update weather icon
      if (weatherObj["weatherIcon"]) {
        weatherIcon.innerHTML = `<i class="${weatherObj["weatherIcon"]}"></i>`;
      }
    }, 1500);
  };
  delayDisplay();
}

function displayData(display) {
  let div = document.createElement("div");
  for (let item of display) {
    for (let key in item) {
      div.innerHTML += `<article class="notification is-primary today">
  <p class="forecastTitle">${key}</p>
  <p class="forecast">${item[key]}</p>
  </article>`;
    }
  }

  div.classList.add("main-div");
  target.innerHTML = "";
  target.appendChild(div);
}
