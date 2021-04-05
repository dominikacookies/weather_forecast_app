function getCityName () {
  currentTarget.sibling("input").val();
}

function searchForCityWeather (event) {
  event.preventDefault();
  // retrieve form input
  let cityName = $(event.currentTarget).siblings("input").val();
  console.log(cityName);
  // fetch weather data
}

$("#searchForCityWeather").on( "click", "button", searchForCityWeather)