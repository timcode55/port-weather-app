const express = require("express");
const path = require("path");
const request = require("request");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");

// FETCH BACKGROUND IMAGE FOR STATIC HOME PAGE

const PORT = process.env.PORT || 4050;

let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));
app.use(cors());
// CORS SOLUTION

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/test", (req, res) => {
  res.send("its working");
});

app.get("/accu/:location", async (req, res) => {
  const location = req.params.location;
  let api_key = process.env.ACCU_KEY;
  url = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${api_key}&q=${location}&details=true`;
  await request({ url, gzip: true }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ type: "error", message: error.message });
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ type: "error", message: body });
    }
    res.json(JSON.parse(body));
  });
});

app.get("/accuWeather/:locationKey", async (req, res) => {
  const locationKey = req.params.locationKey;
  let api_key = process.env.ACCU_KEY;
  url = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${api_key}&details=true`;
  await request({ url, gzip: true }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ type: "error", message: error.message });
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ type: "error", message: body });
    }
    console.log("BODY IN ACCUWEATHER");
    res.json(JSON.parse(body));
  });
});

app.get("/accuCurrent/:locationKey", async (req, res) => {
  const locationKey = req.params.locationKey;
  console.log("accuCurrent Called", locationKey);
  let api_key = process.env.ACCU_KEY;
  let url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${api_key}&details=true`; // Define url as a local variable
  await request({ url, gzip: true }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ type: "error", message: error.message });
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ type: "error", message: body });
    }
    // console.log(body, "BODY IN ACCUCURRENT");
    res.json(JSON.parse(body));
  });
});

app.get("/unsplash/:location", async (req, res) => {
  const location = decodeURIComponent(req.params.location);
  let api_key = process.env.UNSPLASH_KEY;
  // Use a more varied random page to get different results
  const randomPage = Math.floor(Math.random() * 20) + 1;
  const encodedQuery = encodeURIComponent(location);
  url = `https://api.unsplash.com/search/photos?page=${randomPage}&query=${encodedQuery}&orientation=landscape&per_page=30&client_id=${api_key}`;
  console.log(`Fetching Unsplash images for: ${location} (page ${randomPage})`);
  await request({ url, gzip: true }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ type: "error", message: error.message });
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ type: "error", message: body });
    }
    res.json(JSON.parse(body));
  });
});

// app.get("/mapbox/:location", async (req, res) => {
//   const location = req.params.location;
//   console.log(location, "location");
//   console.log(typeof location, "locationtype");
//   let api_key = process.env.MAPBOX_KEY;
//   let newLocation = encodeURIComponent(location);
//   console.log(newLocation, "newLocation");
//   url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLocation}.json?access_token=${api_key}&limit=1`;
//   // url = `https://api.mapbox.com/geocoding/v5/mapbox.places/pacific%20grove.json?access_token=${api_key}&limit=1`;
//   await request({ url }, (error, response, body) => {
//     if (error || response.statusCode !== 200) {
//       return res.status(500).json({ type: "error", message: err.message });
//     }
//     res.json(JSON.parse(body));
//   });
// });

// OPEN-METEO ROUTES (Free, no API key needed!)
app.get("/weather/:location", async (req, res) => {
  const location = req.params.location;

  try {
    // First, geocode the location to get coordinates
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeResponse = await axios.get(geocodeUrl);

    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      return res.status(404).json({ type: "error", message: "Location not found" });
    }

    const { latitude, longitude, timezone } = geocodeResponse.data.results[0];

    // Get weather forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${timezone}`;

    // Get air quality data
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&hourly=pm10,pm2_5&timezone=${timezone}`;

    // Get pollen data (European pollen forecast)
    const pollenUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=${timezone}`;

    // Fetch all data in parallel
    const [weatherResponse, airQualityResponse, pollenResponse] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(airQualityUrl),
      axios.get(pollenUrl)
    ]);

    // Combine all data
    const combinedData = {
      location: geocodeResponse.data.results[0],
      weather: weatherResponse.data,
      airQuality: airQualityResponse.data,
      pollen: pollenResponse.data
    };

    res.json(combinedData);
  } catch (error) {
    console.error("Open-Meteo API Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      type: "error",
      message: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server is up on port " + PORT);
});
