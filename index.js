// API KEYS

// weather
const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=-37.987440,145.246058&days=1';
const rapidApiKey = '5382c9f31dmsh152e2f8e48fa6dfp113c20jsnd40be36d07ab';
const rapidApiHost = 'weatherapi-com.p.rapidapi.com'

// amber electric
const amberKey = 'psk_636774e0461a10b3bcc960532f51afae';
const amberSite = '01EWZ1KPMH2F981DW2HMJB2B27';
const amberUrl = `https://api.amber.com.au/v1/sites/${amberSite}/prices/current?next=5&previous=1&resolution=30`

// timetree
const authorizationToken = 'Bearer dLeYbhJ6iwCwjuCOHydLg0iNoOvlx9dd2ywrkNA_mAFc6stu';
const calendarId = 'DGgPowYJxy4h';
const apiUrl = `https://timetreeapis.com/calendars/${calendarId}/upcoming_events?timezone=Asia/Tokyo&days=1&include=creator`;

(function(){
const timeElement = document.getElementById("time");
const dryerButton = document.getElementById("dryer-button");
const washingSwitch = document.getElementById("washing-switch");

setInterval(function() {
    const date = new Date();
    const time = date.toLocaleTimeString();
    timeElement.textContent = time;
}, 1000);

let dryerState = 0; // Initial state of dryer button (0: off, 1: on)
dryerButton.addEventListener("click", function() {
    dryerState = (dryerState === 0) ? 1 : 0;
    dryerButton.textContent = dryerState;
        if (dryerState === 1) {
        dryerButton.style.backgroundColor = "limegreen";
        dryerButton.style.color = 'white';
    } else {
        dryerButton.style.backgroundColor = "#ccc";
    }
});
})()

// This function tracks the time after the first execution to update data every fixed interval like 11:15, 11:30
function updateMillisecs(minutes) {
    const currentDate = new Date();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();

  // Calculate the time until the next interval
  const minutesUntilNextInterval = (minutes - 1) - (currentMinutes % minutes);

  // Calculate the seconds until the next interval
  const secondsUntilNextInterval = 60 - (currentSeconds);

  // Calculate the milliseconds until the next interval
  const millisecondsUntilNextInterval =
    (minutesUntilNextInterval * 60 + secondsUntilNextInterval) * 1000;

  return millisecondsUntilNextInterval;
}

// This function get the data from weather api
function updateWeatherData() {
  const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': rapidApiHost
    }
  };
  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      const currentTime = new Date().getHours();
      const forecastHours = data.forecast.forecastday[0].hour;
      const futureHours = forecastHours
        .filter(hour => {
          const hourValue = parseInt(hour.time.split(' ')[1].split(':')[0]);
          return hourValue >= currentTime;
        })
        .slice(0, 7);
      const maxDayTemp = data.forecast.forecastday[0].day.maxtemp_c;
      const minDayTemp = data.forecast.forecastday[0].day.mintemp_c;

      futureHours.forEach((hour, index) => {
        const hourValue = parseInt(hour.time.split(' ')[1].split(':')[0]);
        const formattedTime = index === 0 ? 'Current' : formatTime(hourValue);

        const temperature = hour.temp_c;
        const uv = hour.uv;
        const text = hour.condition.text.toLowerCase();
        let icon;

        if (text.includes("rain") || text.includes("drizzle")) {
          icon = "🌧";
        } else if (text.includes("sun")) {
          icon = "☀️";
        } else if (text.includes("cold")) {
          icon = "🥶";
        }else if (text.includes("windy")){
          icon = "💨";
        } else if (text.includes("cloudy")){
          icon = "☁️";
        } else if (text.includes("overcast")){
          icon = "☁️☁️";
        } else {
          icon = "🌡";
        }
        console.log('Text:', [text,icon]);
        console.log('----------------------');

        const placeholderBox = document.getElementById(`placeholder-box-${index+1}`);
        const timeElement = placeholderBox.querySelector('.time-placeholder');
        const iconElement = placeholderBox.querySelector('.icon-placeholder');
        const tempElement = placeholderBox.querySelector('.temp-placeholder');
        const uvElement = placeholderBox.querySelector('.uv-placeholder');

        timeElement.textContent = formattedTime;
        iconElement.textContent = `${icon}`;
        tempElement.textContent = `${temperature}°C`;
        // uvElement.textContent = `UV: ${uv}`;

      });

      function formatTime(hour) {
        if (hour === 0) {
          return '12am';
        } else if (hour === 12) {
          return '12pm';
        } else if (hour < 12) {
          return hour + 'am';
        } else {
          return hour - 12 + 'pm';
        }
      }
      const millisecondsUntilNextInterval = updateMillisecs(30);

    // Update the data every 30 minutes
    setInterval(updateWeatherData, 30 * 60 * 1000);
        console.log(`weather updated at ${new Date().toLocaleTimeString()}`)
 
    })
    .catch(error => {
      console.error(error);
    });
}

// This function get the data from amber api
function displayEnergyPrices() {
  const placeholderBoxes = document.querySelectorAll('.placeholder-boxx');

  fetch(amberUrl, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${amberKey}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      // Adjust the first interval based on the current hour
      if (currentHour === 2) {
        data[0].startTime = currentDate.setMinutes(0) - 30 * 60000;
      }

      // Iterate over the array
      data.forEach((item, index) => {
        const perKwh = item.perKwh;
        const startTime = new Date(item.startTime);

        // Convert interval start time to 12-hour format without leading zeros
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        const period = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes === 0 ? '' : `:${minutes}`;

        const placeholderBox = placeholderBoxes[index];
        const timeElement = placeholderBox.querySelector('.time-placeholder');
        const circleElement = placeholderBox.querySelector('.circle-placeholder');
        const priceElement = placeholderBox.querySelector('.price-placeholder');

        timeElement.textContent = `${formattedHours}${formattedMinutes}${period}`;
        priceElement.textContent = `${Math.round(perKwh)} ¢`;

        // Set color based on price range
        if (perKwh <= 14) {
          circleElement.style.backgroundColor = 'transparent';
          circleElement.textContent = '🍀'
        }else if (perKwh < 24) {
          circleElement.style.backgroundColor = 'green';
        } else if (perKwh >= 24 && perKwh <= 38) {
          circleElement.style.backgroundColor = 'orange';
        } else {
          circleElement.style.backgroundColor = 'red';
        }
      });
    
    setInterval(displayEnergyPrices, 15 * 60 * 1000);
      console.log(`electricity prices updated at ${new Date().toLocaleTimeString()}`)
    })
    .catch(error => {
      console.error(error);
    });
}

function displayCalendarEvents() {
  const section4 = document.getElementById('section2');

  fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.timetree.v1+json',
      'Authorization': authorizationToken
    }
  })
    .then(response => response.json())
    .then(data => {
      const events = data.data; // Array of events

      // Create a div for each event and display the event details
      events.forEach(event => {
        const { title, start_at, end_at } = event.attributes;

        // Create event details elements
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('calender-events');
        const titleElement = document.createElement('div');
        const timeElement = document.createElement('div');
        const startAtMelbourne = new Date(start_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
        const start = startAtMelbourne.slice(11, 16) + startAtMelbourne.slice(19);
        const endAtMelbourne = new Date(end_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
        const end = endAtMelbourne.slice(11, 16) + endAtMelbourne.slice(19);

        // Set event details
        titleElement.textContent = title;
        timeElement.textContent = `${start} - ${end}`;

        // Append event details to event div
        eventDiv.appendChild(titleElement);
        eventDiv.appendChild(timeElement);

        // Append event div to section 4
        section4.appendChild(eventDiv);
      });
    
      setInterval(displayEnergyPrices, 120 * 60 * 1000);
      console.log(`Timetree events updated at ${new Date().toLocaleTimeString()}`)
    })
    .catch(error => {
      console.error(error);
    });
}

async function fetchProjectData() {
  try {
    const response = await fetch('https://projectzerothree.info/api.php?format=json');
    const data = await response.json();

    const prices = data.regions[0].prices;
    const u91Price = prices.find(price => price.type === 'U91').price;

    const fuelPriceElement = document.getElementById('fuel-price');
    fuelPriceElement.textContent = `\🚘 $${u91Price}`;
    
        
    setInterval(displayEnergyPrices, 120 * 60 * 1000);
    console.log(`Timetree events updated at ${new Date().toLocaleTimeString()}`)

  } catch (error) {
    console.error(error);
  }
}

// Call the displayCalendarEvents function initially
displayCalendarEvents();
// Call the updateWeatherData function initially
updateWeatherData();
// Call the displayEnergyPrices function initially
displayEnergyPrices();
// Call the fetchProjectData function initially
fetchProjectData();

const millisecondsUntilNextInterval = updateMillisecs(15);

setTimeout(() => {
  displayEnergyPrices();
  updateWeatherData();
}, millisecondsUntilNextInterval);

