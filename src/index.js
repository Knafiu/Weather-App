import "./styles.css";

async function getWeather(location){
    
    const url = await fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"+ encodeURIComponent(location) + "?key=BSUHKDGY4KL48QJ9ANLBA6F3N");
    if (!url.ok){
        throw new Error("fetch failed");
    }
    return await url.json();
}

async function getImage(condition){
    const url = await fetch("https://api.giphy.com/v1/stickers/translate?api_key=P72ZhxoHFX29cM3Grhpe6fUGKC7yhoIY&s=" + encodeURIComponent(condition)); 
    if (!url.ok){
        throw new Error("Giphy fetch failedd");
    }
    const res = await url.json(); 
    return res.data.images.original.url;
}

function processWeather(raw){
    const today = raw.days[0];
    
    return {
        location : raw.resolvedAddress || raw.address || "Unknown location",
        fahrenheit : today.temp,
        description : today.description,
        humidity : today.humidity,
        precipitation : today.precip,
        next_precip : raw.days[1]?.precip ?? "N/A",
        sunrise : today.sunrise,
        sunset : today.sunset,
        dew : today.dew,
        conditions : today.conditions, 
        days: raw.days
    }
}



function degrees(data){
    const degreeBox = document.querySelector(".degrees");
    degreeBox.innerHTML = "";
    const location = document.createElement("h2");
    location.classList.add("header");
    location.textContent = data.location;
    const temp = document.createElement("div");
    temp.classList.add("big-temp");
    temp.textContent = `${Math.round(data.fahrenheit)}°F`;
    const description = document.createElement("p");
    description.classList.add("description");
    description.textContent = data.description;
    degreeBox.append(location, temp, description);
}

function humidity(data){
    const humidity = document.querySelector(".humidity");
    humidity.innerHTML = "";
    const header = document.createElement("h3");
    header.classList.add("header");
    header.textContent = "Humidity";
    const percentage = document.createElement("div");
    percentage.classList.add("val");
    percentage.textContent = data.humidity + "%";
    const info = document.createElement("p");
    info.classList.add("description");
    info.textContent = `Dew point: ${data.dew}°`;
    
    humidity.append(header, percentage, info);
}

function precipitation(data){
    const precipitation = document.querySelector(".precipitation");
    precipitation.innerHTML = "";
    const precip = document.createElement("h3");
    precip.classList.add("header");
    precip.textContent = "Precipitation";
    const val = document.createElement("div");
    val.classList.add("val");
    val.textContent = data.precipitation;
    const today = document.createElement("p");
    today.classList.add("description");
    today.textContent = "Today";
    const next_precip = document.createElement("p");
    next_precip.classList.add("description");
    next_precip.textContent = data.next_precip + " is expected for tomorrow"
    
    precipitation.append(precip, val, today, next_precip);
}

async function display(data){
    const display = document.querySelector(".display");
    display.innerHTML = "";
    const title = document.createElement("h3");
    title.classList.add("header");
    title.textContent = "Today";
    const image = document.createElement("img");
    image.alt = data.conditions;
    image.src = await getImage(data.conditions);
    image.classList.add("image");
    const sunrise = document.createElement("p");
    sunrise.classList.add("description");
    sunrise.textContent = `Sunrise: ${data.sunrise}`;
    const sunset = document.createElement("p");
    sunset.classList.add("description");
    sunset.textContent = `Sunset: ${data.sunset}`;
    display.append(title, image, sunrise, sunset);
}
async function forecast(info){
    "iterate from data starting todday and going on for the next 10 days and get day, image, high, low"
    const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    const forecastEl = document.querySelector(".forecast");
    forecastEl.innerHTML = "";
    const header = document.createElement("h3");
    header.classList.add("header");
    header.textContent = "10-Day Forecast";
    forecastEl.appendChild(header);
    for (let i = 0; i<10; i++){
        const dayData = data.days[i];
        if (!dayData) break;
        const box = document.createElement("div");
        box.classList.add("forecast-row");
        const dateStr = `${dayData.datetime}T00:00:00`;
        const dayIndex = new Date(dateStr).getDay();
        const day = document.createElement("span");
        day.classList.add("forecast-day");
        day.textContent = days[dayIndex];
        const low = document.createElement("span");
        low.classList.add("forecast-low");
        low.textContent = `${Math.round(dayData.tempmin)}°`;
        const high = document.createElement("span");
        high.classList.add("forecast-high");
        high.textContent = `${Math.round(dayData.tempmax)}°`;
        box.append(day, low, high);
        forecastEl.appendChild(box);
    }

}
async function render(data){
    await display(data);
    humidity(data);
    precipitation(data);
    degrees(data);
}
function applyTheme(conditionsText = "") {
    const body = document.body;
    body.classList.remove("theme-clear", "theme-cloudy", "theme-rain", "theme-snow", "theme-fog");
  
    const c = conditionsText.toLowerCase();
  
    if (c.includes("snow")) body.classList.add("theme-snow");
    else if (c.includes("rain") || c.includes("shower") || c.includes("storm")) body.classList.add("theme-rain");
    else if (c.includes("fog") || c.includes("mist") || c.includes("haze")) body.classList.add("theme-fog");
    else if (c.includes("cloud")) body.classList.add("theme-cloudy");
    else body.classList.add("theme-clear");
  }
  

const form = document.getElementById("searchForm");

form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const input = document.getElementById("input").value.trim();
    if (!input) return;
    try{
        const res = await getWeather(input);
        const data = processWeather(res);
        await render(data);
        await forecast(input);
        applyTheme(data.conditions);
        console.log(data);
    }
    catch (error){
        console.error("ERROR:", error);
        alert("something went wrong");
    }
});

const res = await getWeather("New York");
const data = processWeather(res);
await render(data);
await forecast("New York");
applyTheme(data.conditions);


