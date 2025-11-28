// Get data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let dayIndex = parseInt(urlParams.get('day'));
const cityLocation = urlParams.get('location');

// Set background to match main page
document.body.style.backgroundImage = urlParams.get('bg') ? `url('${decodeURIComponent(urlParams.get('bg'))}')` : 'none';
document.body.style.backgroundSize = "cover";
document.body.style.minHeight = "100vh";
document.body.style.backgroundAttachment = "fixed";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundRepeat = "no-repeat";

// Store chart instances globally so we can destroy them when switching days
let precipChart = null;
let windChart = null;
let cloudChart = null;
let temperatureChart = null;

// Fetch hourly data for the specific day
async function loadDayDetail(currentDayIndex) {
  if (currentDayIndex === undefined) {
    currentDayIndex = dayIndex;
  }
  dayIndex = currentDayIndex;
  try {
    const response = await fetch(`/weather/${cityLocation}`);
    const data = await response.json();

    const weather = data.weather;
    const daily = weather.daily;
    const hourly = weather.hourly;

    // Find the starting index (skip past days) - same logic as main page
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startIndex = 0;

    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      date.setHours(0, 0, 0, 0);
      if (date.getTime() >= today.getTime()) {
        startIndex = i;
        break;
      }
    }

    // Adjust the actual day index to account for skipped past days
    const actualDayIndex = startIndex + dayIndex;

    // Set page title
    const dayName = getDayName(dayIndex);
    document.getElementById('detail-title').textContent = `${cityLocation} - ${dayName}`;

    // Set summary cards
    const highTemp = Math.round(daily.temperature_2m_max[actualDayIndex]);
    const lowTemp = Math.round(daily.temperature_2m_min[actualDayIndex]);
    const weatherCode = daily.weather_code[actualDayIndex];
    const precipitation = daily.precipitation_sum[actualDayIndex] || 0;
    const maxWind = Math.round(daily.wind_speed_10m_max[actualDayIndex]);

    document.getElementById('day-high-low').textContent = `${highTemp}° / ${lowTemp}°`;
    document.getElementById('day-condition').textContent = getWeatherDescription(weatherCode);
    document.getElementById('day-precipitation').textContent = `${precipitation.toFixed(2)}"`;
    document.getElementById('day-wind').textContent = `${maxWind} mph`;

    // Get 24 hours of data for this day (using actual day index)
    const startHour = actualDayIndex * 24;
    const endHour = startHour + 24;

    const hours = [];
    const precipData = [];
    const windData = [];
    const cloudData = [];
    const tempData = [];

    for (let i = startHour; i < endHour && i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i]);
      hours.push(time.getHours() + ':00');
      precipData.push(hourly.precipitation[i] || 0);
      windData.push(Math.round(hourly.wind_speed_10m[i] || 0));
      cloudData.push(hourly.cloud_cover[i] || 0);
      tempData.push(Math.round(hourly.temperature_2m[i] || 0));
    }

    // Destroy existing charts before creating new ones
    if (precipChart) precipChart.destroy();
    if (windChart) windChart.destroy();
    if (cloudChart) cloudChart.destroy();
    if (temperatureChart) temperatureChart.destroy();

    // Create charts
    precipChart = createPrecipitationChart(hours, precipData);
    windChart = createWindChart(hours, windData);
    cloudChart = createCloudChart(hours, cloudData);
    temperatureChart = createTemperatureChart(hours, tempData);

    // Update navigation buttons
    updateNavigationButtons();

  } catch (error) {
    console.error('Error loading day detail:', error);
    document.getElementById('detail-title').textContent = 'Error loading data';
  }
}

function getDayName(index) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date();
  date.setDate(date.getDate() + index);

  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return days[date.getDay()];
}

function getWeatherDescription(code) {
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
}

function createPrecipitationChart(labels, data) {
  const ctx = document.getElementById('precipitation-chart').getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Precipitation (inches)',
        data: data,
        backgroundColor: 'rgba(44, 90, 160, 0.7)',
        borderColor: 'rgba(44, 90, 160, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#fff',
            font: {
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function createWindChart(labels, data) {
  const ctx = document.getElementById('wind-chart').getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Wind Speed (mph)',
        data: data,
        backgroundColor: 'rgba(100, 100, 100, 0.2)',
        borderColor: 'rgba(50, 50, 50, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#000',
            font: {
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#000'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#000'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

function createCloudChart(labels, data) {
  const ctx = document.getElementById('cloud-chart').getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cloud Cover (%)',
        data: data,
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        borderColor: 'rgba(150, 150, 150, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#fff',
            font: {
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

// Navigation button handlers
function updateNavigationButtons() {
  const prevButton = document.getElementById('prev-day');
  const nextButton = document.getElementById('next-day');

  // Disable prev button if on day 0
  prevButton.disabled = dayIndex <= 0;

  // Disable next button if on day 6 (last day)
  nextButton.disabled = dayIndex >= 6;
}

document.getElementById('prev-day').addEventListener('click', () => {
  if (dayIndex > 0) {
    loadDayDetail(dayIndex - 1);
  }
});

document.getElementById('next-day').addEventListener('click', () => {
  if (dayIndex < 6) {
    loadDayDetail(dayIndex + 1);
  }
});

// Also support keyboard arrow navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && dayIndex > 0) {
    loadDayDetail(dayIndex - 1);
  } else if (e.key === 'ArrowRight' && dayIndex < 6) {
    loadDayDetail(dayIndex + 1);
  }
});

function createTemperatureChart(labels, data) {
  const ctx = document.getElementById('temperature-chart').getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°F)',
        data: data,
        backgroundColor: 'rgba(220, 100, 50, 0.2)',
        borderColor: 'rgba(180, 70, 30, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#000',
            font: {
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#000'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#000'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

// Load data when page loads
loadDayDetail();
