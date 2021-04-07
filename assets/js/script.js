function getCityName () {
  currentTarget.sibling("input").val();
}

function buildCurrentWeatherSection (cityName, currentWeatherObject) {
 const article = $(".current-Weather").append(`
  <h1>
    Today's weather in CITY
  </h1>
  <div class="row">
    <div class="col-lg-5 col-sm-12 p-3 currentWeather__Icon">
      Icon here
    </div>
    <div class="col-lg-7 col-sm-12 p-3 currentWeather__Info ">
      <ul class="list-group">
        <li class="list-group-item currentWeather__Info--li">Temp</li>
        <li class="list-group-item currentWeather__Info--li">Humidity</li>
        <li class="list-group-item currentWeather__Info--li">Wind speed</li>
        <li class="list-group-item currentWeather__Info--li">UV index</li>
      </ul>
    </div>`);

  console.log(article)
}

function fetchWeatherData (cityName) {
  let weatherApiUrlForLonLat = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=f1fdda4864afff5226ddcc1a17f0350f`;
  
  const functionForJSON = (responseObject) => {
    return responseObject.json();
  };

  const functionForApplication = (dataFromServer) => {
    const lonLatObject = {
      lon: dataFromServer.coord.lon,
      lat: dataFromServer.coord.lat,
    };

    weatherApiUrlForWeatherInfo = `https://api.openweathermap.org/data/2.5/onecall?lat=${lonLatObject.lat}&lon=${lonLatObject.lon}&exclude=minutely,hourly&appid=f1fdda4864afff5226ddcc1a17f0350f`

    const functionForJSON = (responseObject) => {
      return responseObject.json();
    };

    const getCurrentWeather = (dataFromServer) => {
      currentWeatherObject = {
        temp: dataFromServer.current.temp,
        humidity: dataFromServer.current.humidity,
        windSpeed: dataFromServer.current.wind_speed,
        uvIndex: dataFromServer.current.uvi,
        icon: dataFromServer.current.weather[0].icon,
      }
      return currentWeatherObject;
    }

    const getForecastWeather = (dataFromServer) => {
      console.log ("got it")
    }

    const functionForApplication = (dataFromServer) => {
      currentWeather = getCurrentWeather(dataFromServer);
      forecastWeather = getForecastWeather(dataFromServer);
      buildCurrentWeatherSection (cityName, currentWeather);
    }

    fetch(weatherApiUrlForWeatherInfo)
      .then(functionForJSON)
      .then(functionForApplication);

  }

  fetch(weatherApiUrlForLonLat)
    .then(functionForJSON)
    .then(functionForApplication);
}

function searchForCityWeather (event) {
  event.preventDefault();
  // retrieve form input
  let cityName = $(event.currentTarget).siblings("input").val();
  // fetch weather data
  fetchWeatherData(cityName);
}

$("#searchForCityWeather").on( "click", "button", searchForCityWeather)