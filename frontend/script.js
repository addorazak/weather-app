// SLIDER FUNCTIONALITY
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showNextSlide() {
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("active");
}

setInterval(showNextSlide, 5000);

// DOM Elements (Current Weather)
const cityInput = document.getElementById("input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");

// OpenWeatherMap API Key
// const API_KEY = "cb4893632b7bd1eafc7b4cfcd94e4a72";

// Event Listeners
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const city = cityInput.value;
  if (city) {
    getWeatherDataByCity(city);
  }
});

locationBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        getWeatherDataByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
});

// Fetch weather data by city (from your backend)
async function getWeatherDataByCity(city) {
  try {
    const response = await fetch(
      `https://weather-backend-uebj.onrender.com/api/weather?city=${city}`
    );
    const data = await response.json();
    displayCurrentWeather(data.current);
    displayWeatherForecast(data.forecast);
  } catch (error) {
    console.error("Error fetching city weather:", error);
    alert("Something went wrong.");
  }
}

// Fetch weather data by coordinates (from your backend)
async function getWeatherDataByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://weather-backend-uebj.onrender.com/api/weather?lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    displayCurrentWeather(data.current);
    displayWeatherForecast(data.forecast);
  } catch (error) {
    console.error("Error fetching coord weather:", error);
    alert("Something went wrong.");
  }
}

// Fetch weather data by city
// async function getWeatherDataByCity(city) {
//   try {
//     // Get Current Weather Data
//     const response = await fetch(
//       `http://localhost:8000/api/weather?city=${city}`
//     );
//     const data = await response.json();

//     // Get Weather Forecast Data
//     const forecastResponse = await fetch(
//       `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
//     );
//     const forecastData = await forecastResponse.json();

//     displayCurrentWeather(data.current);
//     displayWeatherForecast(forecastData.);
//   } catch (error) {
//     console.error("Error:", error);
//     alert("Error fetching weather data");
//   }
// }

// Fetch weather data by coordinates
// async function getWeatherDataByCoords(lat, lon) {
//   try {
//     // Get Current Weather Data
//     const currentResponse = await fetch(
//       `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
//     );
//     const currentData = await currentResponse.json();

//     // Get Weather Forecast Data
//     const forecastResponse = await fetch(
//       `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
//     );
//     const forecastData = await forecastResponse.json();

//     displayCurrentWeather(currentData);
//     displayWeatherForecast(forecastData);
//   } catch (error) {
//     console.error("Error:", error);
//     alert("Error fetching weather data");
//   }
// }

// Display Current Weather and Condition Metrics
function displayCurrentWeather(data) {
  // Show current weather section
  document.querySelector(".current-weather").style.display = "block";

  // Location (City & Country)
  cityName = data.name;
  country = data.sys.country;
  document.getElementById("city").textContent = `${cityName}, ${country}`;
  document.querySelector(".location").textContent = `${cityName}, ${country}`;

  // DateTime
  const formattedTime = formatTimestamp(data.dt, data.timezone);
  document.querySelector(".datetime").textContent = `${formattedTime}`;

  // Description
  desc = data.weather[0].description;
  document.getElementById("description").textContent = desc;

  // Image url
  url = generateIcon(data.weather[0].icon);
  document.querySelectorAll(".weather-icon").forEach((el) => {
    el.src = url;
  });

  // Temperature
  temp = Math.round(data.main.temp);
  document.querySelectorAll(".temperature").forEach((el) => {
    el.textContent = `${temp}°C`;
  });

  // Clouds
  clouds = data.clouds.all;
  document.getElementById("clouds").textContent = `${clouds}%`;

  // Humidity
  humid = data.main.humidity;
  document.querySelectorAll(".humidity").forEach((el) => {
    el.textContent = `${humid}%`;
  });

  // Feels Like
  feels_like = Math.round(data.main.feels_like);
  document.querySelectorAll(".feels-like").forEach((el) => {
    el.textContent = `${feels_like}°C`;
  });

  // Wind
  wind = data.wind.speed;
  document.querySelectorAll(".wind").forEach((el) => {
    el.textContent = `${wind} m/s`;
  });

  // Pressure
  press = data.main.pressure;
  document.querySelectorAll(".pressure").forEach((el) => {
    el.textContent = `${press} hPa`;
  });

  // Weather Summary
  windDesc = getWindDescription(data.wind.speed);
  document.querySelector(
    ".weather-summary"
  ).textContent = `Feels like ${feels_like}°C. ${desc}. ${windDesc} `;

  // Wind Direction
  windD = findWindDirection(data.wind.deg);
  document.querySelector(".wind-direction").textContent = `${windD}`;

  // Visibility in Kilometers
  visibilityKm = metersToKilometers(data.visibility);
  document.querySelectorAll(".visibility").forEach((el) => {
    el.textContent = `${visibilityKm}km`;
  });
}

// Display Weather Forecast and Conditions
function displayWeatherForecast(data) {
  document.querySelector(".current-weather-forecast").style.display = "flex";

  const forecasts = data.list;
  const container = document.getElementById("forecast-container");
  const template = container.querySelector(".dropdown-wrapper.template");

  // Clear old dropdowns (if any)
  container
    .querySelectorAll(".dropdown-wrapper:not(.template)")
    .forEach((el) => el.remove());

  // Create 5 dropdowns
  for (let day = 0; day < 5; day++) {
    const start = day * 8;
    const chunk = forecasts.slice(start, start + 8);
    const first = chunk[0];

    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "block";

    // DAY
    const date = new Date(first.dt_txt + " UTC");
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    clone.querySelector(".forecast-day").textContent = formatted;

    // ICON
    const iconUrl = generateIcon(first.weather[0].icon);
    clone
      .querySelectorAll(".forecast-icon")
      .forEach((img) => (img.src = iconUrl));

    // TEMP MAX / MIN
    const tempMax = Math.round(first.main.temp_max);
    const tempMin = Math.round(first.main.temp_min);
    clone.querySelector(".temp").textContent = `${tempMax} / ${tempMin}°C`;

    // DESCRIPTIONS
    const desc = first.weather[0].description;
    clone.querySelector(".weather-desc").textContent = desc;
    clone.querySelector(
      ".first-p"
    ).textContent = `${desc}. ${getWindDescription(first.wind.speed)}`;
    clone.querySelector(
      ".second-p"
    ).textContent = `The high will be ${tempMax}°C, the low will be ${tempMin}°C.`;

    // PRECIPITATION
    const pop = Math.round(first.pop * 100);
    const rain = first.rain ? first.rain["3h"] : 0;
    clone.querySelector(".precipitation").textContent =
      pop > 0 || rain > 0 ? `${rain}mm (${pop}%)` : "No Rain Expected";

    // WIND NAVIGATION
    clone.querySelector(".navigation").textContent = `${
      first.wind.speed
    }m/s ${findWindDirection(first.wind.deg)}`;

    // PRESSURE, HUMIDITY, CLOUDS
    clone.querySelector(
      ".forecast-pressure"
    ).textContent = `${first.main.pressure} hPa`;
    clone.querySelector(
      ".forecast-humidity"
    ).textContent = `${first.main.humidity}%`;
    clone.querySelector(".clouds").textContent = `${first.clouds.all}%`;

    // DEW POINT
    const dew = calculateDewPoint(first.main.temp, first.main.humidity);
    clone.querySelector(".forecast-dew").textContent = `${dew}%`;

    // SUNRISE & SUNSET
    const sunrise = formatTimestamp(
      data.city.sunrise,
      data.city.timezone
    ).split(",")[1];
    const sunset = formatTimestamp(data.city.sunset, data.city.timezone).split(
      ","
    )[1];
    clone.querySelector(".rise").textContent = sunrise;
    clone.querySelector(".set").textContent = sunset;

    // TEMPERATURE TABLE (avg every 2x 3hr entries)
    const getAvg = (arr, i1, i2) => Math.round((arr[i1] + arr[i2]) / 2);
    const temps = chunk.map((f) => f.main.temp);
    const feels = chunk.map((f) => f.main.feels_like);

    clone.querySelector(".tempOne").textContent = getAvg(temps, 0, 1);
    clone.querySelector(".tempTwo").textContent = getAvg(temps, 2, 3);
    clone.querySelector(".tempThree").textContent = getAvg(temps, 4, 5);
    clone.querySelector(".tempFour").textContent = getAvg(temps, 6, 7);

    clone.querySelector(".feelOne").textContent = getAvg(feels, 0, 1);
    clone.querySelector(".feelTwo").textContent = getAvg(feels, 2, 3);
    clone.querySelector(".feelThree").textContent = getAvg(feels, 4, 5);
    clone.querySelector(".feelFour").textContent = getAvg(feels, 6, 7);

    // Add toggle listener for dropdown
    const dropdownBtn = clone.querySelector(".dropdown-btn");
    const dropdownContent = clone.querySelector(".dropdown-content");
    const dropdownIcon = clone.querySelector(".dropdown-icon");

    dropdownBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownContent.classList.toggle("show");
      dropdownIcon.classList.toggle("active");
    });

    // Append to container
    container.appendChild(clone);
  }

  // Close dropdown if clicking outside
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      if (!content.parentElement.contains(e.target)) {
        content.classList.remove("show");
        content.parentElement
          .querySelector(".dropdown-icon")
          .classList.remove("active");
      }
    });
  });
}

// Build Weather Icon
function generateIcon(iconCode) {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return iconUrl;
}

// Get Wind Description
function getWindDescription(speed) {
  if (speed <= 0.2) return "Calm";
  if (speed <= 1.5) return "Light air";
  if (speed <= 3.3) return "Light breeze";
  if (speed <= 5.4) return "Gentle breeze";
  if (speed <= 7.9) return "Moderate breeze";
  if (speed <= 10.7) return "Fresh breeze";
  if (speed <= 13.8) return "Strong breeze";
  if (speed <= 17.1) return "Near gale";
  if (speed <= 20.7) return "Gale";
  if (speed <= 24.4) return "Severe gale";
  if (speed <= 28.4) return "Storm";
  if (speed <= 32.6) return "Violent storm";
  return "Hurricane";
}

// Covert Meters to Kilometers
function metersToKilometers(meters) {
  const kilometers = (meters / 1000).toFixed(1);
  return kilometers;
}

// Covert Degrees To Compass Direction
function findWindDirection(deg) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Calculate Dew Point
function calculateDewPoint(tempC, humidityPercent) {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidityPercent / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint);
}

// Format Timestamp
function formatTimestamp(timestamp, offsetInSeconds) {
  const adjustedTime = (timestamp + offsetInSeconds) * 1000;
  const date = new Date(adjustedTime);
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };
  let formatted = date.toLocaleString("en-US", options);
  formatted = formatted.replace(/\s?(AM|PM)/, (match) =>
    match.toLowerCase().trim()
  );

  return formatted;
}
