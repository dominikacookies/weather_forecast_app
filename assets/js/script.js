let pastSearchesArray = [];

const formatSearchedCityName = (searchedCityName) => {
  // decapitalise city name
  lowercaseCityName = searchedCityName.toLowerCase();
  // capitalise first letter of city name
  let cityName = lowercaseCityName.charAt(0).toUpperCase() + lowercaseCityName.slice(1); 
  return cityName;
}

const convertUnixtoNormalDate = (unixTime) => {
  var a = new Date(unixTime * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = date + ' ' + month + ' ' + year;
  return time;
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
    };

    const createDailyForecastObject = (item) => {
      unixTime = item.dt
      normalTime = convertUnixtoNormalDate (unixTime)

      dailyForecastInfoObject = {
        date: normalTime,
        temp: item.temp.day,
        humidity: item.humidity,
      }
      return dailyForecastInfoObject;
    }

    const getForecastWeather = (dataFromServer) => {
      dailyForecastArray = dataFromServer.daily
      fiveDayForecastDataArray = dailyForecastArray.slice(1,6)
      let forecastFiveDayWeatherInfo = fiveDayForecastDataArray.map(createDailyForecastObject)
      console.log (forecastFiveDayWeatherInfo)
    };

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

const storeSearchedCity = (cityName) => {
  if (localStorage.getItem("pastCityWeatherSearches") !== null) {
    retrievedPastSearchesArray = JSON.parse(localStorage.getItem('pastCityWeatherSearches'))
    
    // remove a city from the array if it's the same as the one that is being searched
    function removeCityIfSearchedBefore (item) {
      if (item !== cityName) {
        return true
      } else {
        return false;
      }
    }
    pastSearchesArray = retrievedPastSearchesArray.filter(removeCityIfSearchedBefore);
  }
  
  pastSearchesArray.push(cityName)
  localStorage.setItem("pastCityWeatherSearches",(JSON.stringify(pastSearchesArray)));
} 

function searchForCityWeather (event) {
  event.preventDefault();
  // retrieve form input
  let searchedCityName = $(event.currentTarget).siblings("input").val()
  // format city name for consistency in local storage
  cityName = formatSearchedCityName(searchedCityName);
  // fetch weather data
  fetchWeatherData(cityName);
  // store city name in local storage
  storeSearchedCity(cityName);
}

$("#searchForCityWeather").on( "click", "button", searchForCityWeather)