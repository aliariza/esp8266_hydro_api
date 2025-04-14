const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// === Store latest sensor data and connection ===
let latestData = null;
let wsClient = null;

// === WebSocket Server Setup ===
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function connection(ws) {
  console.log("🔌 ESP8266 connected via WebSocket");
  wsClient = ws;

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
    wsClient = null;
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.temperature && data.humidity) {
        latestData = data;
        console.log("🌡️ Sensor data:", latestData);
      }
    } catch (err) {
      console.error("⚠️ Bad WebSocket message:", msg.toString());
    }
  });
});

// === REST API Routes ===

// 🌡️ Dashboard fetches latest sensor values
app.get("/api/data", (req, res) => {
  res.send(latestData || { temperature: null, humidity: null });
});

// 💡 Trigger device commands via dashboard
app.post("/api/command", (req, res) => {
  const command = req.body.command;
  console.log("📲 Command received:", command);

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ command }));
    console.log("📤 Command sent to ESP via WebSocket");
    res.send({ status: "Command sent" });
  } else {
    console.warn("⚠️ No ESP connected via WebSocket");
    res.status(503).send({ status: "ESP not connected" });
  }
});

// 🖼️ Serve dashboard UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 🔌 Start Express server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🔁 Handle WebSocket upgrade requests
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
