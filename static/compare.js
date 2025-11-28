// Weather API Comparison Tool

document.getElementById('compare-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const location = document.getElementById('location-input').value.trim();

  if (!location) {
    return;
  }

  await compareWeatherData(location);
});

async function compareWeatherData(location) {
  const contentDiv = document.getElementById('comparison-content');
  contentDiv.innerHTML = '<p class="loading">Loading data from multiple sources...</p>';

  try {
    // Fetch data from both APIs in parallel
    const [openMeteoData, accuWeatherData] = await Promise.all([
      fetchOpenMeteoData(location),
      fetchAccuWeatherData(location)
    ]);

    console.log('Open-Meteo data:', openMeteoData);
    console.log('AccuWeather data:', accuWeatherData);

    displayComparison(location, openMeteoData, accuWeatherData);
  } catch (error) {
    console.error('Comparison error:', error);
    console.error('Error stack:', error.stack);
    contentDiv.innerHTML = `
      <div class="error-message">
        <h3>Error loading weather data</h3>
        <p>${error.message}</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Check console for details</p>
      </div>
    `;
  }
}

async function fetchOpenMeteoData(location) {
  const response = await fetch(`/weather/${encodeURIComponent(location)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Open-Meteo data');
  }
  return await response.json();
}

async function fetchAccuWeatherData(location) {
  try {
    // Get location key
    const locationResponse = await fetch(`/accu/${encodeURIComponent(location)}`);
    if (!locationResponse.ok) {
      throw new Error('Failed to fetch AccuWeather location');
    }
    const locationData = await locationResponse.json();

    if (!locationData || locationData.length === 0) {
      throw new Error('Location not found in AccuWeather');
    }

    const locationKey = locationData[0].Key;

    // Get current conditions and forecast
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`/accuCurrent/${locationKey}`),
      fetch(`/accuWeather/${locationKey}`)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch AccuWeather data');
    }

    const current = await currentResponse.json();
    const forecast = await forecastResponse.json();

    return { current: current[0], forecast, locationData: locationData[0] };
  } catch (error) {
    console.error('AccuWeather error:', error);
    return null;
  }
}

function displayComparison(location, openMeteo, accuWeather) {
  const contentDiv = document.getElementById('comparison-content');

  // Validate data structure
  if (!openMeteo || !openMeteo.weather || !openMeteo.weather.current || !openMeteo.weather.daily) {
    throw new Error('Invalid Open-Meteo data structure');
  }

  const omCurrent = openMeteo.weather.current;
  const omDaily = openMeteo.weather.daily;
  const omAir = openMeteo.airQuality?.current || {};

  console.log('Daily times:', omDaily.time);

  // Find today's index in the daily array (skip past days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let todayIndex = 0;

  // Find today or use first future date
  for (let i = 0; i < omDaily.time.length; i++) {
    const date = new Date(omDaily.time[i]);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      todayIndex = i;
      break;
    }
    if (date.getTime() > today.getTime()) {
      todayIndex = i;
      break;
    }
  }

  console.log('Using today index:', todayIndex, 'for date:', omDaily.time[todayIndex]);
  console.log('Open-Meteo daily data keys:', Object.keys(omDaily));
  console.log('Precip prob array:', omDaily.precipitation_probability_max);

  let comparisonHTML = `
    <h2 style="text-align: center; margin-bottom: 30px; font-size: 2rem; font-weight: 300;">
      Comparing Weather Data for: ${location}
    </h2>
    <div class="comparison-grid">
  `;

  // Open-Meteo Card
  comparisonHTML += `
    <div class="api-card">
      <h2>Open-Meteo (Free)</h2>
      <div class="data-row">
        <span class="data-label">Current Temperature</span>
        <span class="data-value">${Math.round(omCurrent.temperature_2m)}°F</span>
      </div>
      <div class="data-row">
        <span class="data-label">Feels Like</span>
        <span class="data-value">${Math.round(omCurrent.apparent_temperature)}°F</span>
      </div>
      <div class="data-row">
        <span class="data-label">Humidity</span>
        <span class="data-value">${Math.round(omCurrent.relative_humidity_2m)}%</span>
      </div>
      <div class="data-row">
        <span class="data-label">Wind Speed</span>
        <span class="data-value">${Math.round(omCurrent.wind_speed_10m)} mph</span>
      </div>
      <div class="data-row">
        <span class="data-label">Wind Gusts</span>
        <span class="data-value">${Math.round(omCurrent.wind_gusts_10m)} mph</span>
      </div>
      <div class="data-row">
        <span class="data-label">Cloud Cover</span>
        <span class="data-value">${Math.round(omCurrent.cloud_cover)}%</span>
      </div>
      <div class="data-row">
        <span class="data-label">Today's High</span>
        <span class="data-value">${Math.round(omDaily.temperature_2m_max[todayIndex])}°F</span>
      </div>
      <div class="data-row">
        <span class="data-label">Today's Low</span>
        <span class="data-value">${Math.round(omDaily.temperature_2m_min[todayIndex])}°F</span>
      </div>
      <div class="data-row">
        <span class="data-label">Precipitation Amount</span>
        <span class="data-value">${(omDaily.precipitation_sum?.[todayIndex] || 0).toFixed(2)} in</span>
      </div>
      <div class="data-row">
        <span class="data-label">UV Index</span>
        <span class="data-value">${omDaily.uv_index_max[todayIndex] || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Air Quality (US AQI)</span>
        <span class="data-value">${omAir.us_aqi || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Data Source</span>
        <span class="data-value" style="font-size: 0.85rem;">NOAA/ECMWF/DWD</span>
      </div>
    </div>
  `;

  // AccuWeather Card
  if (accuWeather && accuWeather.current && accuWeather.forecast && accuWeather.forecast.DailyForecasts && accuWeather.forecast.DailyForecasts.length > 0) {
    const accuCurrent = accuWeather.current;
    const accuForecast = accuWeather.forecast.DailyForecasts[0];

    console.log('AccuWeather current:', accuCurrent);
    console.log('AccuWeather forecast:', accuForecast);

    // Calculate differences
    const tempDiff = Math.abs(Math.round(omCurrent.temperature_2m) - Math.round(accuCurrent.Temperature.Imperial.Value));
    const humidityDiff = Math.abs(Math.round(omCurrent.relative_humidity_2m) - accuCurrent.RelativeHumidity);
    const windDiff = Math.abs(Math.round(omCurrent.wind_speed_10m) - Math.round(accuCurrent.Wind.Speed.Imperial.Value));
    const highDiff = Math.abs(Math.round(omDaily.temperature_2m_max[todayIndex]) - Math.round(accuForecast.Temperature.Maximum.Value));
    const lowDiff = Math.abs(Math.round(omDaily.temperature_2m_min[todayIndex]) - Math.round(accuForecast.Temperature.Minimum.Value));

    comparisonHTML += `
      <div class="api-card">
        <h2>AccuWeather (Paid)</h2>
        <div class="data-row">
          <span class="data-label">Current Temperature</span>
          <span class="data-value">
            ${Math.round(accuCurrent.Temperature.Imperial.Value)}°F
            ${getDifferenceIndicator(tempDiff, 'temp')}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">Feels Like</span>
          <span class="data-value">${Math.round(accuCurrent.RealFeelTemperature.Imperial.Value)}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">Humidity</span>
          <span class="data-value">
            ${accuCurrent.RelativeHumidity}%
            ${getDifferenceIndicator(humidityDiff, 'humidity')}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">Wind Speed</span>
          <span class="data-value">
            ${Math.round(accuCurrent.Wind.Speed.Imperial.Value)} mph
            ${getDifferenceIndicator(windDiff, 'wind')}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">Wind Gusts</span>
          <span class="data-value">${Math.round(accuCurrent.WindGust?.Speed?.Imperial?.Value || 0)} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">Cloud Cover</span>
          <span class="data-value">${accuCurrent.CloudCover}%</span>
        </div>
        <div class="data-row">
          <span class="data-label">Today's High</span>
          <span class="data-value">
            ${Math.round(accuForecast.Temperature.Maximum.Value)}°F
            ${getDifferenceIndicator(highDiff, 'temp')}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">Today's Low</span>
          <span class="data-value">
            ${Math.round(accuForecast.Temperature.Minimum.Value)}°F
            ${getDifferenceIndicator(lowDiff, 'temp')}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">Precipitation Amount</span>
          <span class="data-value">${(accuForecast.Day?.TotalLiquid?.Value || 0).toFixed(2)} in (${accuForecast.Day.PrecipitationProbability}% chance)</span>
        </div>
        <div class="data-row">
          <span class="data-label">UV Index</span>
          <span class="data-value">${accuForecast.AirAndPollen.find(x => x.Name === 'UVIndex')?.Value || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Air Quality (Index)</span>
          <span class="data-value">${accuForecast.AirAndPollen.find(x => x.Name === 'AirQuality')?.Value || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Data Source</span>
          <span class="data-value" style="font-size: 0.85rem;">AccuWeather Proprietary</span>
        </div>
      </div>
    `;

    // Summary Card
    comparisonHTML += `
      <div class="api-card" style="grid-column: 1 / -1; background: rgba(172, 172, 170, 0.15);">
        <h2>Analysis & Differences</h2>
        <div class="data-row">
          <span class="data-label">Temperature Difference</span>
          <span class="data-value">${tempDiff}°F ${tempDiff <= 2 ? '✓ Excellent agreement' : tempDiff <= 5 ? '⚠ Acceptable variance' : '⚠ Significant difference'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">High/Low Forecast Diff</span>
          <span class="data-value">High: ${highDiff}°F, Low: ${lowDiff}°F</span>
        </div>
        <div class="data-row">
          <span class="data-label">Wind Speed Difference</span>
          <span class="data-value">${windDiff} mph</span>
        </div>
        <div class="data-row">
          <span class="data-label">Humidity Difference</span>
          <span class="data-value">${humidityDiff}%</span>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
          <p style="font-size: 1rem; line-height: 1.6;">
            <strong>Recommendation:</strong> ${getRecommendation(tempDiff, highDiff, lowDiff)}
          </p>
        </div>
      </div>
    `;
  } else {
    comparisonHTML += `
      <div class="api-card">
        <h2>AccuWeather (Paid)</h2>
        <p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">
          AccuWeather data unavailable. This could be due to API limits or location not found.
        </p>
      </div>
    `;
  }

  comparisonHTML += '</div>';
  contentDiv.innerHTML = comparisonHTML;
}

function getDifferenceIndicator(diff, type) {
  let threshold1, threshold2;

  switch(type) {
    case 'temp':
      threshold1 = 2;
      threshold2 = 5;
      break;
    case 'humidity':
      threshold1 = 5;
      threshold2 = 10;
      break;
    case 'wind':
      threshold1 = 3;
      threshold2 = 7;
      break;
    default:
      threshold1 = 2;
      threshold2 = 5;
  }

  if (diff <= threshold1) {
    return `<span class="difference-indicator match">±${diff}</span>`;
  } else if (diff <= threshold2) {
    return `<span class="difference-indicator close">±${diff}</span>`;
  } else {
    return `<span class="difference-indicator different">±${diff}</span>`;
  }
}

function getRecommendation(tempDiff, highDiff, lowDiff) {
  const avgDiff = (tempDiff + highDiff + lowDiff) / 3;

  if (avgDiff <= 2) {
    return "Both APIs show excellent agreement. You can confidently use either source. Open-Meteo is free and appears just as accurate.";
  } else if (avgDiff <= 4) {
    return "Both APIs show good agreement with minor differences. These small variations are normal and both sources are reliable. Open-Meteo provides excellent value for free.";
  } else {
    return "There are some differences between the sources. This can happen due to different model blends or update timing. Consider checking National Weather Service (weather.gov) as a third reference for US locations.";
  }
}
