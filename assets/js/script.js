let pastSearchesArray = [];

function onLoad () {
  // check if data is present in local storage
  if (localStorage.getItem("pastCityWeatherSearches") !== null) {
    retrievedPastSearchesArray = JSON.parse(localStorage.getItem('pastCityWeatherSearches'))
    // reverse the array so that the most recent search is first
    reversedPastSearchesArray = retrievedPastSearchesArray.reverse()
    // fetch city name of most recent search and get its weather data
    cityName = reversedPastSearchesArray[0]
    fetchWeatherData (cityName)
    // display past searches on page
    $(reversedPastSearchesArray).each(function buildListItem () {
      $("#searchForCityWeather .list-group").append(`<li class="list-group-item">${this}</li>`)
    })
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

function clearInformation () {
  $(".currentWeather").empty();
  $("#forecastWeather").empty();
}

function buildCurrentWeatherSection (cityName, currentWeather) {
  iconUrl = "https://openweathermap.org/img/w/" + currentWeather.icon + ".png" ;
  $(".currentWeather").append(`
    <h1>
      Today's weather in ${cityName}
    </h1>
    <div class="row">
      <div class="col-lg-5 col-sm-12 p-3 currentWeather__Icon">
        <img src= ${iconUrl} class="currentIconSize">
      </div>
      <div class="col-lg-7 col-sm-12 p-3 currentWeather__Info ">
        <ul class="list-group">
          <li class="list-group-item currentWeather__Info--li"> Temperature: ${currentWeather.temp} </li>
          <li class="list-group-item currentWeather__Info--li">Humidity: ${currentWeather.humidity} </li>
          <li class="list-group-item currentWeather__Info--li">Wind speed: ${currentWeather.windSpeed}</li>
          <li class="list-group-item currentWeather__Info--li">UV index: ${currentWeather.uvIndex}</li>
        </ul>
      </div>
    </div>`
  );
}

function buildForecastWeatherSection (item) {
  iconUrl = "https://openweathermap.org/img/w/" + currentWeather.icon + ".png" ;
  console.log (item)
  $("#forecastWeather").append(
    `<div class="card mt-2" style="width: 200px;">
      <img src= ${iconUrl} class="card-img-top forecastIconSize" alt="...">
    <div class="card-body">
      <h5 class="card-title">${item.date}</h5>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Temp: ${currentWeather.temp}</li>
        <li class="list-group-item">Humidity: ${item.humidity}</li>
      </ul>
    </div>`
  );
};

function fetchWeatherData (cityName) {
  let weatherApiUrlForLonLat = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=f1fdda4864afff5226ddcc1a17f0350f`;
  
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
        // clear any data that was previously presented in the current and forecast weather sections
        clearInformation ();
        // get current weather information
        currentWeather = getCurrentWeather(dataFromServer);
        // get forecasted weather information for the next 5 days
        forecastWeather = getForecastWeather(dataFromServer);
        // build a html section to display the current weather information
        buildCurrentWeatherSection (cityName, currentWeather);
        // build a html section to display forecasted weather information
        forecastWeather.forEach(buildForecastWeatherSection);
    }

    fetch(weatherApiUrlForWeatherInfo)
      .then(functionForJSON)
      .then(functionForApplication)
      .catch(handleErrors)
  }

  function handleErrors (errorObject) {
    console.log(errorObject);
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

function searchForPastCityWeather (event) {
  cityName = $(event.currentTarget).text();
  fetchWeatherData(cityName);
}

$("document").ready(onLoad)
$("#searchForCityWeather").on("click", "button", searchForCityWeather)
$("#pastSearches").on("click", "li", searchForPastCityWeather)