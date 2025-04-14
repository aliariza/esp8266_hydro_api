let pumpIsOn = false;
let lightIsOn = false;

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

    // Sync ESP-reported relay states if present
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
fetchSensorAndStateData(); // initial fetch on load
