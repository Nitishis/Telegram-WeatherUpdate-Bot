import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WEATHER_API_KEY = process.env.WEATHER_API;
const WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/forecast";

// Function to fetch weather data and check for valid city
export async function getWeather(city) {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: "metric", // Convert temperature to Celsius directly
      },
    });

    // Check if the city is valid (OpenWeatherMap API will return an error if city is invalid)
    if (response.data.cod !== "200") {
      throw new Error("Invalid city name");
    }

    // If the city is valid, format the weather data and return it
    return formatWeatherForecast(response);
  } catch (error) {
    // If there's an error (e.g., city not found), throw a custom error
    throw new Error("Invalid city name");
  }
}

// Function to format the weather forecast into a message
function formatWeatherForecast(response) {
  const forecast = response.data.list; // Weather forecast entries
  const cityName = response.data.city.name;
  const countryName = response.data.city.country;

  // Get current weather (first entry in the forecast)
  const currentWeather = forecast[0];
  const currentTemp = currentWeather.main.temp.toFixed(1); // Already in Celsius due to 'units: metric'
  const currentHumidity = currentWeather.main.humidity;
  const currentWeatherDescription = currentWeather.weather[0].description;
  const currentWindSpeed = currentWeather.wind.speed;

  const now = new Date();
  // Format the date without the "at"
  let formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata", // Set the desired time zone, e.g., 'UTC' or 'America/New_York'
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);


  // Prepare the response message
  let message = `*Weather Forecast for ${cityName}, ${countryName}* 🌍\n\n`;

  // Display current weather
  message += `*Current Weather Report:*\n`;
  message += `🌡️ Temperature: ${currentTemp}°C\n`;
  message += `💧 Humidity: ${currentHumidity}%\n`;
  message += `🌬️ Wind Speed: ${currentWindSpeed} m/s\n`;
  message += `🌦️ Condition: ${
    currentWeatherDescription.charAt(0).toUpperCase() +
    currentWeatherDescription.slice(1)
  }\n`;
  message += `📅 Date and Time: ${formattedDate}\n\n`;

  // Forecast for the next 3 intervals (3-hour forecast entries)
  message += `*Next 3-hour Forecast:*\n`;
  for (let i = 1; i < 4; i++) {
    const forecastEntry = forecast[i];
    const date = new Date(forecastEntry.dt * 1000).toLocaleString();
    const temp = forecastEntry.main.temp.toFixed(1); // Already in Celsius
    const humidity = forecastEntry.main.humidity;
    const windSpeed = forecastEntry.wind.speed;
    const weatherDescription = forecastEntry.weather[0].description;

    message += `\n*${date}*\n`;
    message += `🌡️ Temp: ${temp}°C | 💧 Humidity: ${humidity}% | 🌬️ Wind: ${windSpeed} m/s\n`;
    message += `🌦️ Condition: ${
      weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)
    }\n`;
  }

  // Return the formatted weather forecast message
  return message;
}
