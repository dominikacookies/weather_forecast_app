let pastSearchesArray = [];

function onLoad () {
  // check if data is present in local storage
  if (localStorage.getItem("pastCityWeatherSearches") !== null) {
    retrievedPastSearchesArray = JSON.parse(localStorage.getItem('pastCityWeatherSearches'))
    // reverse the array so that the most recent search is first
    reversedPastSearchesArray = retrievedPastSearchesArray.reverse()
    console.log(reversedPastSearchesArray)
    // fetch info for most recent search
    // display past searches on page
  } else {
    return
  }
}

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

function buildForecastWeatherSection (forecastWeather) {
  console.log ("here")
}

function fetchWeatherData (cityName) {
  let weatherApiUrlForLonLat = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=f1fdda4864afff5226ddcc1a17f0350f`;
  
  const functionForJSON = (responseObject) => {
    return responseObject.json();
  };

  
  const functionForApplication = (dataFromServer) => {
    //get lon and lat values for second API call
    const lonLatObject = {
      lon: dataFromServer.coord.lon,
      lat: dataFromServer.coord.lat,
    };

    //construct url for second API call
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
      // convert unix time stamp to normal date format
      unixTime = item.dt
      normalTime = convertUnixtoNormalDate (unixTime) 
      // store forecast data in an object
      dailyForecastInfoObject = {
        date: normalTime,
        temp: item.temp.day,
        humidity: item.humidity,
      }
      return dailyForecastInfoObject;
    }

    const getForecastWeather = (dataFromServer) => {
      dailyForecastArray = dataFromServer.daily
      // form an array with forecast for only the upcoming 5 days
      fiveDayForecastDataArray = dailyForecastArray.slice(1,6)
      // retrieve and store required information for each day in a new array
      let forecastFiveDayWeatherInfo = fiveDayForecastDataArray.map(createDailyForecastObject)
      return forecastFiveDayWeatherInfo;
    };

    const functionForApplication = (dataFromServer) => {
        // store city name in local storage
        storeSearchedCity(cityName);
      // get current weather information
      currentWeather = getCurrentWeather(dataFromServer);
      // get forecasted weather information for the next 5 days
      forecastWeather = getForecastWeather(dataFromServer);
      // build a html section to display the current weather information
      buildCurrentWeatherSection (cityName, currentWeather);
      // build a html section to display forecasted weather information
      buildForecastWeatherSection (forecastWeather);
    }

    fetch(weatherApiUrlForWeatherInfo)
      .then(functionForJSON)
      .then(functionForApplication)
      .catch(handleErrors)
  }

  function handleErrors (errorObject) {
    console.log("there's an error")
  }

  fetch(weatherApiUrlForLonLat)
    .then(functionForJSON)
    .then(functionForApplication)
    .catch(handleErrors)
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
}

$("document").ready(onLoad)
$("#searchForCityWeather").on( "click", "button", searchForCityWeather)