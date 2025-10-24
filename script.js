// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');
const mainContent = document.getElementById('main-content');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');
const hourlyContainer = document.getElementById('hourly-container');
const aqi = document.getElementById('aqi');
const aqiText = document.getElementById('aqi-text');

// API Configuration
const API_KEY = 'c7283fa9d1ac5b4c281aa1c1ba15fa45';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Format day for forecast
function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
}

// Format time for hourly forecast
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit'});
}

// Get weather icon class based on OpenWeather condition code
function getWeatherIcon(conditionCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[conditionCode] || 'fas fa-cloud';
}

// Show loading state
function showLoading() {
    loadingIndicator.style.display = 'block';
    mainContent.style.display = 'none';
    errorMessage.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingIndicator.style.display = 'none';
    mainContent.style.display = 'grid';
}

// Show error message
function showError(message = 'City not found. Please try again.') {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    mainContent.style.display = 'none';
    loadingIndicator.style.display = 'none';
}

// Update AQI display
function updateAQI(value) {
    aqi.textContent = value;
    
    if (value <= 50) {
        aqi.className = 'aqi-value aqi-good';
        aqiText.textContent = 'Good';
    } else if (value <= 100) {
        aqi.className = 'aqi-value aqi-moderate';
        aqiText.textContent = 'Moderate';
    } else {
        aqi.className = 'aqi-value aqi-poor';
        aqiText.textContent = 'Poor';
    }
}

// Fetch weather data from API
async function fetchWeatherData(city) {
    showLoading();
    
    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        // Update UI with data
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        updateHourlyForecast(forecastData);
        
        // For demo purposes, we're using mock AQI data
        // In a real app, you would fetch this from the Air Pollution API
        updateAQI(42);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError();
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = formatDate(data.dt);
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update weather icon
    const iconClass = getWeatherIcon(data.weather[0].icon);
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
}

// Update forecast display
function updateForecast(data) {
    forecastContainer.innerHTML = '';
    
    // We'll show one forecast per day (every 24 hours)
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        
        forecastDay.innerHTML = `
            <div class="forecast-date">${formatDay(forecast.dt)}</div>
            <div class="forecast-icon">
                <i class="${getWeatherIcon(forecast.weather[0].icon)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    }
}

// Update hourly forecast
function updateHourlyForecast(data) {
    hourlyContainer.innerHTML = '';
    
    // Show next 8 hours of forecast
    for (let i = 0; i < 8; i++) {
        const forecast = data.list[i];
        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';
        
        hourItem.innerHTML = `
            <div class="hour-time">${formatTime(forecast.dt)}</div>
            <div class="hour-icon">
                <i class="${getWeatherIcon(forecast.weather[0].icon)}"></i>
            </div>
            <div class="hour-temp">${Math.round(forecast.main.temp)}°C</div>
        `;
        
        hourlyContainer.appendChild(hourItem);
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    }
});

// Initialize with default city
window.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('New York');
});