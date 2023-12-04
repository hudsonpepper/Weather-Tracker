// API Key for the weather
const apiKey = "76270777d3f53b47d91433b7022b4743";

// Img src for the icons (Sunny, cloudy, night, etc.)
const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

// Link for the current weather + lat and longitude
const apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${cityName}&units=imperial`;
// 3 hour forcast for every 3 hours.
// Should be array of data for 5 days (roughly 40 inputs)
const threeHourWeatherArr = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API key}`


// NOTE: Prevent Default on form;

