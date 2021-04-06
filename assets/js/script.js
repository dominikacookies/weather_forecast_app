function getCityName () {
  currentTarget.sibling("input").val();
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

    weatherApiUrlForWeatherInfo = `https://api.openweathermap.org/data/2.5/onecall?lat=${lonLatObject.lat}&lon=${lonLatObject.lon}&appid=f1fdda4864afff5226ddcc1a17f0350f`

    const functionForJSON = (responseObject) => {
      return responseObject.json();
    };

    const getCurrentWeather = (dataFromServer) => {
      currentWeatherObject = {
        temp: dataFromServer.current.temp,
        humidity: dataFromServer.current.humidity,
        windSpeed: dataFromServer.current.wind_speed,
        uvIndex: dataFromServer.current.uvi,
      }
      console.log(currentWeatherObject)
    }

    const functionForApplication = (dataFromServer) => {
      currentWeather = getCurrentWeather(dataFromServer);
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