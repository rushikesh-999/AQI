let historyData = [];
let aqiHistory = [];
let timeLabels = [];
let chartInstance = null;

// 🔴 CHANGE THIS ONCE
const API_BASE_URL = "https://aqi-backend-production.up.railway.app/"; 
// example: https://aqi-backend-production.up.railway.app

async function getAQI() {
  const city = document.getElementById("cityInput").value;
  const compareCity = document.getElementById("compareCityInput").value;

  if (!city) {
    alert("Enter a city name");
    return;
  }

  // ---------- FETCH MAIN CITY ----------
  const response = await fetch(`${API_BASE_URL}/api/aqi?city=${city}`);
  const data = await response.json();

  // ---------- MAIN RESULT UI ----------
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("cityName").innerText =
    data.city.charAt(0).toUpperCase() + data.city.slice(1);

  document.getElementById("aqiValue").innerText = data.aqi;

  const badge = document.getElementById("categoryBadge");
  badge.innerText = `${data.category} (${data.riskLevel})`;
  badge.style.background = data.color;

  const alertBox = document.getElementById("alertBox");
  alertBox.classList.remove("hidden");

  if (data.aqi >= 4) {
    alertBox.className = "alert alert-danger";
    alertBox.innerText =
      "🚨 High Pollution Alert: Air quality is dangerous. Wear a mask and avoid outdoor activities.";
  } else {
    alertBox.className = "alert alert-safe";
    alertBox.innerText =
      "✅ Air quality is within acceptable limits. Normal activities are safe.";
  }

  document.getElementById("advice").innerText = data.advice;

  document.getElementById("result").style.borderTop =
    `6px solid ${data.color}`;

  // ---------- POLLUTANTS ----------
  const list = document.getElementById("pollutants");
  list.innerHTML = "";
  for (let key in data.pollutants) {
    const li = document.createElement("li");
    li.innerText = `${key.toUpperCase()}: ${data.pollutants[key]}`;
    list.appendChild(li);
  }

  // ---------- TIME ----------
  const time = new Date(data.timestamp).toLocaleTimeString();

  // ---------- AQI CHART ----------
  aqiHistory.push(data.aqi);
  timeLabels.push(time);

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById("aqiChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "AQI Trend",
          data: aqiHistory,
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // ---------- HISTORY TABLE ----------
  historyData.unshift({
    city: data.city,
    aqi: data.aqi,
    category: data.category,
    time: time
  });

  if (historyData.length > 5) {
    historyData.pop();
  }

  const tableBody = document.querySelector("#historyTable tbody");
  tableBody.innerHTML = "";

  historyData.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.city}</td>
      <td>${item.aqi}</td>
      <td>${item.category}</td>
      <td>${item.time}</td>
    `;
    tableBody.appendChild(row);
  });

  // ---------- CITY COMPARISON ----------
  if (compareCity) {
    document.getElementById("comparison").classList.remove("hidden");

    const res2 = await fetch(
      `${API_BASE_URL}/api/aqi?city=${compareCity}`
    );
    const data2 = await res2.json();

    document.getElementById("city1").innerHTML = `
      <h4>${data.city}</h4>
      <p>AQI: ${data.aqi}</p>
      <p>${data.category}</p>
    `;

    document.getElementById("city2").innerHTML = `
      <h4>${data2.city}</h4>
      <p>AQI: ${data2.aqi}</p>
      <p>${data2.category}</p>
    `;
  }
}
