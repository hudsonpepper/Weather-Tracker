const apiKey = "76270777d3f53b47d91433b7022b4743";
const textData = $("#cityName");
const formEl = $("#cityData");
const errorEl = $("#errorMessage");
console.log(errorEl);
let cityName, lat, lon;
let priorNames = JSON.parse(localStorage.getItem("prevCities"));
priorNames = loadPriorNamesFn(priorNames);
console.log("priorNames: ", priorNames)
formEl.on("submit", function (event) {
  // console.log("click");
  event.preventDefault();
  cityName = textData.val();
  console.log(cityName);
  if (cityName != "") {
    cityData(cityName);
    errorEl.addClass("invisible");
  }
  else {
    console.log("empty message");
    errorEl.text("Error: Empty Input");
    errorEl.removeClass("invisible");
  }
});

function cityData(name) {
  // console.log("Function activate!")
  const apiUrlGeocode = `http://api.openweathermap.org/geo/1.0/direct?q=${name}&appid=${apiKey}`;
  //const apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${name}&units=imperial`;

  fetch(apiUrlGeocode).then(response => response.json()).then(function (data) {
    console.log("Raw Data: ", data)
    if (data.length > 0) {
      console.log("Geocode(here): ", data[0])
      let longName = `${data[0].name}, ${data[0].state}`;
      console.log(`LongerName: ${data[0].name}, ${data[0].state}`);
      addBtn(priorNames, data[0].name)
      console.log(`Lat: ${data[0].lat}| Lon: ${data[0].lon}`);
      //const apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${name}&units=imperial`
      apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${data[0].lat}&lon=${data[0].lon}&units=imperial`
      // console.log(apiUrlWeather);
      fetch(apiUrlWeather)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          const cod = data.cod;
          console.log("code: ", cod);
          if (cod == 200) {
            // console.log(data);
            dispCurWeather(longName, data);
            const lat = data.coord.lat
            const lon = data.coord.lon;
            console.log("Lat: ", lat, "| Lon: ", lon)
            // 3rd Party: Don't use
            /*
            fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`)
              .then(function (response) {
                return response.json();
              })
              .then(function (data) {
                console.log("Geocode(3rd party): ", data);
                let longCityName = `${data.address.city}, ${data.address.state}`;
                return longCityName;
              })
            */
            // console.log(lat, lon);
            const threeHourWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
            // console.log(threeHourWeatherUrl);
            fetch(threeHourWeatherUrl)
              .then(function (response) {
                // console.log("3 hour fetch")
                // Note: dt is Unix seconds
                return response.json();
              })
              .then(function (data) {
                // console.log(data);
                dispFutWeather(data);
              })
          }
          else {
            console.log("Invalid City Name: second catch");
            errorEl.text("Error: Cannot Find City");
            errorEl.removeClass("invisible");
          }
        })
    }
    else {
      console.log("Invalid City Name: first catch")
      errorEl.text("Error: Cannot Find City");
      errorEl.removeClass("invisible");
    }
  })
  //const lat, long = data.coord.lat, data.coord.lon;
}

function dispCurWeather(longName, curData) {
  //console.log("dispCurWeather: ", curData);

  $("#currWeather").children().eq(0).text(`${longName} (${dayjs.unix(curData.dt).format('MMM D, YYYY @ h:mm a')})`);
  const iconUrl = `https://openweathermap.org/img/w/${curData.weather[0].icon}.png`;
  $("#currWeather").children().eq(1).children().eq(0).attr("src", iconUrl);
  $("#currWeather").children().eq(1).children().eq(0).attr("alt", curData.weather[0].description);
  $("#currWeather").children().eq(1).children().eq(0).attr("height", "50px");
  $("#currWeather").children().eq(1).children().eq(0).attr("width", "50px");
  $("#currWeather").children().eq(1).children().eq(1).text(curData.weather[0].description);
  $("#currWeather").children().eq(2).children().eq(0).text(`Temp: ${curData.main.temp}°F`);
  $("#currWeather").children().eq(2).children().eq(1).text(`Wind: ${curData.wind.speed} MPH`);
  $("#currWeather").children().eq(2).children().eq(2).text(`Humidity: ${curData.main.humidity} %`);
}
function dispFutWeather(futDataArr) {
  //console.log("dispFutWeather: ", futDataArr);
  for (let i = 0; i < 5; i++) {
    let index = 8 * i + 7;
    let futData = futDataArr.list[index];
    //console.log("futData", futData)
    const curChild = $("#futWeather").children().eq(i);
    //console.log(curChild);
    $(curChild).children().eq(0).text(`(${dayjs.unix(futData.dt).format('M/D/YY')})`);
    const iconUrl = `https://openweathermap.org/img/w/${futData.weather[0].icon}.png`;
    $(curChild).children().eq(1).attr("src", iconUrl);
    $(curChild).children().eq(1).attr("alt", futData.weather[0].description);
    $(curChild).children().eq(1).attr("height", "50px");
    $(curChild).children().eq(1).attr("width", "50px");
    $(curChild).children().eq(2).children().eq(0).text(`Temp: ${futData.main.temp}°F`);
    $(curChild).children().eq(2).children().eq(1).text(`Wind: ${futData.wind.speed} MPH`);
    $(curChild).children().eq(2).children().eq(2).text(`Humidity: ${futData.main.humidity} %`);
  }
}
function addBtn(priorNames, cityName) {
  console.log("Add Button:", cityName);
  if (priorNames.includes(cityName)) {
    console.log("You've already Searched for ", cityName);
  }
  else {
    priorNames.push(cityName);
    localStorage.setItem("prevCities", JSON.stringify(priorNames));
    let btnEl = $("<button>");
    btnEl.text(cityName);
    btnEl.addClass("btn btn-secondary btn-lg btn-block my-1");
    $("#pastCities").append(btnEl);

  }
};

$("#pastCities").on("click", ".btn", function (event) {
  let btnText = event.currentTarget.textContent;
  console.log("click: ", btnText);
  if (btnText === "Clear Cities") {
    console.log("Clear Condition");
    clearCity();
  }
  else {
    console.log(btnText, " Weather");
    cityData(btnText);
  }
})

function clearCity() {
  console.log("Clear City Function Activate!");
  localStorage.removeItem("prevCities");
  window.location.reload();
}

function loadPriorNamesFn(myLocalPrior) {
  console.log("Local Prior", myLocalPrior);
  if (myLocalPrior === null) {
    console.log("No Local Prior")
    return [];
  }
  else {
    console.log("Local prior exists");
    for (let i = 0; i < myLocalPrior.length; i++) {
      addBtn([], myLocalPrior[i]);
    }
    return myLocalPrior;
  }
}