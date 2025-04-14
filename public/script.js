let pumpIsOn = false;
let lightIsOn = false;

let tempChart, humChart;

const tempData = {
  labels: [],
  datasets: [
    {
      label: "Temperature (°C)",
      data: [],
      borderColor: "red",
      fill: false,
    },
  ],
};

const humData = {
  labels: [],
  datasets: [
    {
      label: "Humidity (%)",
      data: [],
      borderColor: "blue",
      fill: false,
    },
  ],
};

window.addEventListener("load", () => {
  const ctxT = document.getElementById("tempChart").getContext("2d");
  const ctxH = document.getElementById("humChart").getContext("2d");

  tempChart = new Chart(ctxT, {
    type: "line",
    data: tempData,
    options: {
      responsive: true,
      animation: { duration: 300 },
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { beginAtZero: true },
      },
      elements: {
        point: {
          radius: 2,
        },
      },
    },
  });

  humChart = new Chart(ctxH, {
    type: "line",
    data: humData,
    options: {
      responsive: true,
      animation: { duration: 300 },
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { beginAtZero: true },
      },
      elements: {
        point: {
          radius: 2,
        },
      },
    },
  });
});

async function togglePump() {
  const command = pumpIsOn ? "pump_off" : "pump_on";
  console.log("Sending command:", command);
  try {
    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    const text = await res.text();
    console.log("Server response:", text);
    pumpIsOn = !pumpIsOn;
    updatePumpButtonLabel();
  } catch (err) {
    console.error("Pump command failed:", err);
  }
}

async function toggleLight() {
  const command = lightIsOn ? "light_off" : "light_on";
  console.log("Sending command:", command);
  try {
    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    const text = await res.text();
    console.log("Server response:", text);
    lightIsOn = !lightIsOn;
    updateLightButtonLabel();
  } catch (err) {
    console.error("Light command failed:", err);
  }
}

function updatePumpButtonLabel() {
  const btn = document.getElementById("pumpBtn");
  btn.innerText = pumpIsOn ? "Pump OFF" : "Pump ON";
}

function updateLightButtonLabel() {
  const btn = document.getElementById("lightBtn");
  btn.innerText = lightIsOn ? "Light OFF" : "Light ON";
}

async function fetchSensorAndStateData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();

    document.getElementById("temp").innerText = data.temperature ?? "--";
    document.getElementById("hum").innerText = data.humidity ?? "--";
    const time = new Date().toLocaleTimeString();

    if (!isNaN(data.temperature)) {
      tempData.labels.push(time);
      tempData.datasets[0].data.push(data.temperature);
      if (tempData.labels.length > 20) {
        tempData.labels.shift();
        tempData.datasets[0].data.shift();
      }
      tempChart.update();
    }

    if (!isNaN(data.humidity)) {
      humData.labels.push(time);
      humData.datasets[0].data.push(data.humidity);
      if (humData.labels.length > 20) {
        humData.labels.shift();
        humData.datasets[0].data.shift();
      }
      humChart.update();
    }

    pumpIsOn = data.pump ?? pumpIsOn;
    lightIsOn = data.light ?? lightIsOn;
    updatePumpButtonLabel();
    updateLightButtonLabel();
  } catch (err) {
    console.error("Failed to fetch sensor data:", err);
    document.getElementById("temp").innerText = "--";
    document.getElementById("hum").innerText = "--";
  }
}

setInterval(fetchSensorAndStateData, 5000);
fetchSensorAndStateData();
