const weatherForm = document.querySelector(".weatherform");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const forecastDiv = document.querySelector(".forecast");
const forecastRow = document.querySelector(".forecastRow");
const apiKey = "f63fd9fe103f4bdf139a49cdfe7b5729";

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    
    // Input validation
    if (!validateInput(city)) {
        return;
    }
    
    try {
        const weatherData = await getWeatherData(city);
        const forecastData = await getForecastData(city);
        displayWeatherInfo(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        console.error(error);
        displayError(error.message);
        forecastDiv.style.display = "none";
    }
});

function validateInput(city) {
    // Check if empty
    if (!city) {
        displayError("Please enter a city");
        return false;
    }

    const validCityRegex = /^[a-zA-Z\s\-']+$/;
    if (!validCityRegex.test(city)) {
        displayError("Please enter a valid city name (letters only)");
        return false;
    }
    
    // Check length
    if (city.length < 2) {
        displayError("City name must be at least 2 characters long");
        return false;
    }
    
    if (city.length > 50) {
        displayError("City name is too long");
        return false;
    }
    
    return true;
}

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("City not found. Please check the spelling.");
        } else if (response.status === 401) {
            throw new Error("API key error. Please try again later.");
        } else {
            throw new Error("Could not fetch weather data. Please try again.");
        }
    }
    
    return await response.json();
}

async function getForecastData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error("Could not fetch forecast data");
    }
    
    return await response.json();
}

function displayWeatherInfo(data) {
    const {name: city, 
           main: {temp, humidity}, 
           weather: [{description, id}]} = data;

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${Math.round(temp)}°C`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);
}

function displayForecast(data) {
    forecastRow.textContent = "";
    
    // Get daily forecasts (every 8th item represents roughly 24 hours since data is every 3 hours)
    const dailyForecasts = [];
    const today = new Date().getDate();
    

    for (let i = 0; i < data.list.length; i += 8) {
        if (dailyForecasts.length >= 7) break;
        
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        
        // Skip today's forecast to show next 7 days I think the API only returns 5 days of forecast
        if (date.getDate() !== today || dailyForecasts.length > 0) {
            dailyForecasts.push(forecast);
        }
    }
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = dayNames[date.getDay()];
        const temp = Math.round(forecast.main.temp);
        const tempMin = Math.round(forecast.main.temp_min);
        const description = forecast.weather[0].description;
        const weatherId = forecast.weather[0].id;
        const emoji = getWeatherEmoji(weatherId);
        
        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecastItem");
        
        forecastItem.innerHTML = `
            <h2>${dayName}</h2>
            <h3>${emoji}</h3>
            <p>${temp}°/${tempMin}° ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        `;
        
        forecastRow.appendChild(forecastItem);
    });
    
    forecastDiv.style.display = "block";
}

function getWeatherEmoji(weatherId) {
    switch(true) {
        case (weatherId >= 200 && weatherId < 300):
            return "⛈️";
        case (weatherId >= 300 && weatherId < 400):
            return "🌦️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧️";
        case (weatherId >= 600 && weatherId < 700):
            return "❄️";
        case (weatherId >= 700 && weatherId < 800):
            return "🌫️";
        case (weatherId === 800):
            return "☀️";
        case (weatherId >= 801 && weatherId < 810):
            return "☁️";
        default:
            return "🛸";
    }
}

function displayError(message) {
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");
    
    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}