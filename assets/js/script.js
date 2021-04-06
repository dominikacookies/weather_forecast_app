function getCityName () {
  currentTarget.sibling("input").val();
}

function fetchWeatherData (cityName) {
  console.log(cityName)
  let weatherApiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=f1fdda4864afff5226ddcc1a17f0350f`;
    
  const functionForJSON = (responseObject) => {
      console.log(responseObject)
    };

  fetch(weatherApiUrl)
  .then(functionForJSON)
}

function searchForCityWeather (event) {
  event.preventDefault();
  // retrieve form input
  let cityName = $(event.currentTarget).siblings("input").val();
  // fetch weather data
  fetchWeatherData(cityName);
}

$("#searchForCityWeather").on( "click", "button", searchForCityWeather)