let pastSearchesArray = [];

function displayPastSearches () {
  retrievedPastSearchesArray = JSON.parse(localStorage.getItem('pastCityWeatherSearches'))
  // reverse the array so that the most recent search is first
  reversedPastSearchesArray = retrievedPastSearchesArray.reverse()
  // empy the past searches container
  $("#pastSearches").empty()
  // display each item in array on page
  $(reversedPastSearchesArray).each(function buildListItem () {
    $("#pastSearches").append(`<li class="list-group-item">${this}</li>`)
  })
  orderedPastSearches = reversedPastSearchesArray
  return orderedPastSearches;
};

function onLoad () {
  // check if data is present in local storage
  if (localStorage.getItem("pastCityWeatherSearches") !== null) {
    // display past searches and retrieve the correctly ordered array (search recency order)
    orderedPastSearches = displayPastSearches();
    // get name of most recent city search
    cityName = orderedPastSearches[0]
    //get and display weather for that city
    fetchWeatherData (cityName);
  } else {
    // if local storage is empty prompt user to search 
    $(".currentWeather").append(`
    <p class="infoText">
      Search for a city to find it's current and 5 day forecasted weather.
    </p>`);
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
  // convert unix time to date, month and year
  var a = new Date(unixTime * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  // return the time in as date, month, year format
  var time = date + ' ' + month + ' ' + year;
  return time;
}

const clearInformation = () => {
  $(".currentWeather").empty();
  $("#forecastWeather").empty();
}

const colourCodeUvIndex = (currentWeather) => {
  if (currentWeather.uvIndex < 3) {
    $("#uvIndex").addClass("safe");
  } else if (currentWeather.uvIndex > 2 && currentWeather.uvIndex < 5) {
    $("#uvIndex").addClass("moderate");
  } else {
    $("#uvIndex").addClass("high");
  }
};

function buildCurrentWeatherSection (cityName, currentWeather) {
  // construct url to obtain icon
  iconUrl = "https://openweathermap.org/img/wn/" + currentWeather.icon + "@2x.png" ;
  
  $(".currentWeather").append(`
    <h1>
      Current weather in ${cityName}
    </h1>
    <p>
    ${currentWeather.date}
    </p>
    <div class="row">
      <div class="col-lg-5 col-xs-12 p-3">
        <img src= ${iconUrl} class="currentWeather__Icon">
      </div>
      <div class="col-lg-7 col-xs-12 p-3 currentWeather__Info ">
        <ul class="list-group">
          <li class="list-group-item currentWeather__Info--li"> Temperature: ${currentWeather.temp}°C</li>
          <li class="list-group-item currentWeather__Info--li">Humidity: ${currentWeather.humidity}%</li>
          <li class="list-group-item currentWeather__Info--li">Wind speed: ${currentWeather.windSpeed}mph </li>
          <li class="list-group-item currentWeather__Info--li" id="uvIndex" >UV index: ${currentWeather.uvIndex}</li>
        </ul>
      </div>
    </div>`
  );
  colourCodeUvIndex(currentWeather);
}

function buildForecastWeatherSection (item) {
  // construc url to obtain weather icon
  iconUrl = "https://openweathermap.org/img/wn/" + item.icon + "@2x.png" ;
  $("#forecastWeather").append(
    `<div class="card mt-2" style="width: 200px;">
      <img src= ${iconUrl} class="card-img-top forecastWeatherIcon" alt="...">
    <div class="card-body">
      <h5 class="card-title">${item.date}</h5>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Temp: ${item.temp}°C</li>
        <li class="list-group-item">Humidity: ${item.humidity}%</li>
      </ul>
    </div>`
  );
};

function fetchWeatherData (cityName) {
  // construct url to obtain lon and lat values of city
  let weatherApiUrlForLonLat = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=f1fdda4864afff5226ddcc1a17f0350f`;
  
  // convert response to json
  const functionForJSON = (responseObject) => {

    return responseObject.json();
  };

  const functionForApplication = (dataFromServer) => {
      //get lon and lat values for second API call
      const lonLatObject = {
        lon: dataFromServer.coord.lon,
        lat: dataFromServer.coord.lat,
      };

      //construct url for second API call to obtain weather info
      weatherApiUrlForWeatherInfo = `https://api.openweathermap.org/data/2.5/onecall?lat=${lonLatObject.lat}&lon=${lonLatObject.lon}&exclude=minutely,hourly&units=metric&appid=f1fdda4864afff5226ddcc1a17f0350f`

      const functionForJSON = (responseObject) => {
        return responseObject.json();
      };
      
      // get info for current weather and store it in an object
      const getCurrentWeather = (dataFromServer) => {
        unixTime = dataFromServer.current.dt
        normalTime = convertUnixtoNormalDate(unixTime) 
        currentWeatherObject = {
          date: normalTime,
          temp: dataFromServer.current.temp,
          humidity: dataFromServer.current.humidity,
          windSpeed: dataFromServer.current.wind_speed,
          uvIndex: dataFromServer.current.uvi,
          icon: dataFromServer.current.weather[0].icon,
        }
        return currentWeatherObject;
      };

      // for each daily forecast create a weather info object
      const createDailyForecastObject = (item) => {
        // convert unix time stamp to normal date format
        unixTime = item.dt
        normalTime = convertUnixtoNormalDate (unixTime) 
        dailyForecastInfoObject = {
          date: normalTime,
          icon: item.weather[0].icon,
          temp: item.temp.day,
          humidity: item.humidity,
        }
        return dailyForecastInfoObject;
      }

      const getForecastWeather = (dataFromServer) => {
        // get daily forecasted data
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
        // add searched city name to list of past searches
        displayPastSearches ();
    }

    fetch(weatherApiUrlForWeatherInfo)
      .then(functionForJSON)  // convert response to json
      .then(functionForApplication)
      .catch(handleErrors)
  }

  fetch(weatherApiUrlForLonLat)
    .then(functionForJSON) // convert response to json
    .then(functionForApplication)
    .catch(handleErrors)
}

function handleErrors (errorObject) {
  $(".currentWeather").empty();
  $("#forecastWeather").empty();
  $(".currentWeather").append(`
    <p class="infoText">
      Sorry, we couldn't find your city! <br> Please check your spelling and search again.
    </p>`
  );
}

const storeSearchedCity = (cityName) => {
  if (localStorage.getItem("pastCityWeatherSearches") !== null) {
    retrievedPastSearchesArray = JSON.parse(localStorage.getItem('pastCityWeatherSearches'))
    
    // remove an object from the array if its value is the same as the name of the city being searched
    function removeCityIfSearchedBefore (item) {
      if (item !== cityName) {
        return true
      } else {
        return false;
      }
    }
    pastSearchesArray = retrievedPastSearchesArray.filter(removeCityIfSearchedBefore);
  }
  
  // add searched city name to array and store it in local storage
  pastSearchesArray.push(cityName)
  localStorage.setItem("pastCityWeatherSearches",(JSON.stringify(pastSearchesArray)));
} 

function searchForCityWeather (event) {
  event.preventDefault();
  // store form input value in a variable
  let formInput = $(event.currentTarget).siblings("input").val();

  //reject empty inputs
  if (formInput == "") { 
    $(".inputError").remove();
    $("#searchForm").append(`
      <p class="pt-2 inputError">
       Please insert a city name to search. 
      </p>`
    );
  } else {
  $(".inputError").remove();
  // format city name for consistency in local storage
  cityName = formatSearchedCityName(formInput);
  // fetch weather data
  fetchWeatherData(cityName);
  };
}

function searchForPastCityWeather (event) {
  cityName = $(event.currentTarget).text();
  fetchWeatherData(cityName);
}

$("document").ready(onLoad)
$("#searchForCityWeather").on("click", "button", searchForCityWeather)
$("#pastSearches").on("click", "li", searchForPastCityWeather)
