// Elements from the HTML
const textDataEl = $("#cityName");
const formEl = $("#cityData");
const errorEl = $("#errorMessage");

// Basic initializations
const apiKey = "76270777d3f53b47d91433b7022b4743";
let cityName, lat, lon;

// Pulling and Populating Prior Names into the page from Local Storage
let priorNames = JSON.parse(localStorage.getItem("prevCities"));
priorNames = loadPriorNamesFn(priorNames);


// Start: Event Listeners
// --- Form Submissions ---
formEl.on("submit", function (event) {
  event.preventDefault();
  cityName = textDataEl.val();
  // Checking to Ensure Something was Entered
  if (cityName != "") {
    // Checks City Data of Given Name
    cityData(cityName);
    errorEl.addClass("invisible");
  }
  // If Submit without City, Adds Appropriate Error
  else {
    errorEl.text("Error: Empty Input");
    errorEl.removeClass("invisible");
  }
});
// --- Click Past Cities ---
$("#pastCities").on("click", ".btn", function (event) {
  let btnText = event.currentTarget.textContent;
  // If you clicked on the Clear Cities Btn
  if (btnText === "Clear Cities") {
    clearCity();
  }
  // If you clicked on a City Btn
  else {
    // Loads City Data for Given City
    cityData(btnText);
    // Removes Primary Coloration on Other City Buttons
    for (let i = 1; i < $(".btn-primary").length; i++) {
      $(event.currentTarget).parent().children().eq(i).removeClass("btn-primary");
      $(event.currentTarget).parent().children().eq(i).addClass("btn-secondary");
    }
    // Adds Primary Color to Button Clicked 
    $(event.currentTarget).removeClass("btn-secondary");
    $(event.currentTarget).addClass("btn-primary");
  }
})
// End: Event Listeners

// Start: Functions
// --- Loads Previous City Names into HTML Given: ---
//      (myLocalPrior: String Array of city names from local storage)
function loadPriorNamesFn(myLocalPrior) {
  console.log("Local Prior", myLocalPrior);
  // Checks If There is Prior Data
  if (myLocalPrior === null) {
    // If not, Returns Empty Array;
    return [];
  }
  else {
    // If there is, Populate Page With Prior City Buttons
    for (let i = 0; i < myLocalPrior.length; i++) {
      addBtn([], myLocalPrior[i], false);
    }
    // Return Array of Prior Cities from Local Storage
    return myLocalPrior;
  }
}
// --- Does OpenWeather API Calls and Loads Data into Functions Given: ---
//      (name: String containing raw or filtered city name)
function cityData(name) {
  // URL To Obtain API Geocode Data
  const apiUrlGeocode = `https://api.openweathermap.org/geo/1.0/direct?q=${name}&appid=${apiKey}`;
  fetch(apiUrlGeocode).then(response => response.json()).then(function (data) {
    // Checks to see if there is a city which matches
    if (data.length > 0) {
      // If Passes, Then City is Found
      let longName;
      // Checks to See if There is a State Listed (i.e. City is in the US)
      if (data[0].state == null) {
        // If not: have name be CityName, Country (e.g. London, England)
        longName = `${data[0].name}, ${data[0].country}`;
      }
      else {
        // If Yes: have name be CityName, State (e.g. Chicago, Illinois)
        longName = `${data[0].name}, ${data[0].state}`;
      }
      // Makes Button for Entered Name if Doesn't Exist
      addBtn(priorNames, data[0].name, true)
      // URL To Obtain API Current Weather Given Latitude and Longitude from Prior Fetch
      apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${data[0].lat}&lon=${data[0].lon}&units=imperial`
      fetch(apiUrlWeather)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // HTTP Response Code
          const cod = data.cod;
          // If Correct Response Code
          if (cod == 200) {
            // Display Current Weather Data
            dispCurWeather(longName, data);
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            // URL To Obtain API Forcasted Weather Given Lat and Long from Prior Fetch
            const threeHourWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
            fetch(threeHourWeatherUrl)
              .then(function (response) {
                return response.json();
              })
              .then(function (data) {
                // Displays Future Weather Data in 5-day Layout
                dispFutWeather(data);
              })
          }
          else {
            // If Response Code != 200 (i.e. is not correct)
            // Logs Response Code to Console
            console.log("Invalid City Name:", cod);
            // Displays Error to Screen
            errorEl.text("Error: Cannot Find City");
            errorEl.removeClass("invisible");
          }
        })
    }
    else {
      // Displays Error Message
      errorEl.text("Error: Cannot Find City");
      errorEl.removeClass("invisible");
    }
  })
}
// --- Displays Current Weather onto Top of Screen Given: ---
//       (longName: String of Filtered City Name, curData: Obj containing current weather data)
function dispCurWeather(longName, curData) {
  // Displays City Name, as well as Date and Time of Current Weather
  $("#currWeather").children().eq(0).text(`${longName} (${dayjs.unix(curData.dt).format('MMM D, YYYY @ h:mm a')})`);
  // Makes Icon and Icon Formatting for Current Weather Conditions
  const iconUrl = `https://openweathermap.org/img/w/${curData.weather[0].icon}.png`;
  $("#currWeather").children().eq(1).children().eq(0).children().eq(0).attr("src", iconUrl);
  $("#currWeather").children().eq(1).children().eq(0).children().eq(0).attr("alt", curData.weather[0].description);
  $("#currWeather").children().eq(1).children().eq(0).children().eq(0).attr("height", "50px");
  $("#currWeather").children().eq(1).children().eq(0).children().eq(0).attr("width", "50px");
  // Adds Icon Description
  let description = curData.weather[0].description;
  $("#currWeather").children().eq(1).children().eq(0).children().eq(1).text(`Conditions: ${description}`);
  $("#currWeather").children().eq(1).children().eq(0).children().eq(1).addClass("text-capitalize");
  // Adds Weather Data to Screen
  $("#currWeather").children().eq(1).children().eq(1).text(`Temp: ${curData.main.temp}°F`);
  $("#currWeather").children().eq(1).children().eq(2).text(`Wind: ${curData.wind.speed} MPH`);
  $("#currWeather").children().eq(1).children().eq(3).text(`Humidity: ${curData.main.humidity} %`);
}
// --- Displays Future Weather into 5-day forcast Given: ---
//      (futDataArr: Object Containing Array of Forcasted Weather Conditions)
function dispFutWeather(futDataArr) {
  // Note: Each entry is 3 hours apart
  // Find Weather for the next 5 days
  for (let i = 0; i < 5; i++) {
    // Entries Should be 24 hr apart (8*3hrs) + 8th entry (i.e. 7 or 24 hours from now)
    let index = 8 * i + 7;
    let futData = futDataArr.list[index];
    // Find Element
    const curChildEl = $("#futWeather").children().eq(i);
    // Adds Date to Each Element
    $(curChildEl).children().eq(0).text(`(${dayjs.unix(futData.dt).format('M/D/YY')})`);
    // Adds Icon and Icon Format
    const iconUrl = `https://openweathermap.org/img/w/${futData.weather[0].icon}.png`;
    $(curChildEl).children().eq(1).attr("src", iconUrl);
    $(curChildEl).children().eq(1).attr("alt", futData.weather[0].description);
    $(curChildEl).children().eq(1).attr("height", "50px");
    $(curChildEl).children().eq(1).attr("width", "50px");
    // Adds Weather Data
    $(curChildEl).children().eq(2).children().eq(0).text(`Temp: ${futData.main.temp}°F`);
    $(curChildEl).children().eq(2).children().eq(1).text(`Wind: ${futData.wind.speed} MPH`);
    $(curChildEl).children().eq(2).children().eq(2).text(`Humidity: ${futData.main.humidity} %`);
  }
}
// --- Handles Button Logic of Prior City Name Given: ---
//      (priorNames: String Array Containing Prior Btn Names,
//       cityName: Name of city you are trying to add,
//       isNew: Boolean to handle if this button is loaded from local or is a new entry)
function addBtn(priorNames, cityName, isNew) {
  // If cityName Already has an associated button
  if (priorNames.includes(cityName)) {
    // Loop through all existing buttons after .btn-danger (i=1)
    for (let i = 1; i < $(".btn-danger").parent().children().length; i++) {
      // If Button is Associated Name
      if ($(".btn-danger").parent().children().eq(i).text() == cityName) {
        // Change Button Color to Primary (Blue)
        $(".btn-danger").parent().children().eq(i).removeClass("btn-secondary");
        $(".btn-danger").parent().children().eq(i).addClass("btn-primary");
      }
      else {
        // Else Make Sure Button's Color is Secondary (Grey)
        $(".btn-danger").parent().children().eq(i).removeClass("btn-primary");
        $(".btn-danger").parent().children().eq(i).addClass("btn-secondary");
      }
    }
  }
  // If cityName Does Not have an Associated Button
  else {
    // Add cityName to set of prior button names, and store it updated list to local memory
    priorNames.push(cityName);
    localStorage.setItem("prevCities", JSON.stringify(priorNames));
    // Add New Button with New Name
    let btnEl = $("<button>");
    btnEl.text(cityName);
    // If this is a new btn name
    if (isNew) {
      // Remove Primary Color from all other buttons with that color
      $(".btn-primary").eq(1).addClass("btn-secondary")
      $(".btn-primary").eq(1).removeClass("btn-primary")
      // Add Button with Primary Color to the List
      btnEl.addClass("btn btn-primary btn-lg btn-block my-1");
      $("#pastCities").append(btnEl);
    }
    else {
      // Add Button with Secondary Color to the List
      btnEl.addClass("btn btn-secondary btn-lg btn-block my-1");
      $("#pastCities").append(btnEl);
    }
  }
};
// --- Handles Logic of What Should happen when Clear City Btn is clicked ---
function clearCity() {
  // Removes prevCities from Local Storage
  localStorage.removeItem("prevCities");
  // Refreshes Page to Remove Previously Stored Buttons and Weather
  window.location.reload();
}
// End: Functions