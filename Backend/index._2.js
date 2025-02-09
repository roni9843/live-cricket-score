const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// In-memory storage for live match data
let liveMatch = {
  team1: "India",
  team2: "Pakistan",
  status: ["Stop","Live"],
  message : "Match Is Live",
  totalRuns: 0,
  battingLineup: [
    { name: "Player 1", id: 1 },
    { name: "Player 2", id: 2 }
  ],
  bowlingLineup: [
    { name: "Player A", id: 101 },
    { name: "Player B", id: 102 }
  ],
  strikerBatsman: "Player 1",
  nonStrikerBatsman: "Player 2",
  currentDelivery: 0,
  extraRuns: 0,
  validDeliveries: [0, 1, 2, 3, 4, 6],
  invalidDeliveries: [
    { type: "wide", run: 1 },
    { type: "noball", run: 1 }
  ],
  dismissalTypes: ["Bat", "LB", "By"],
  totalOvers: 20,
  currentOverStatus: "0.0",
  ballsInOver: 0,
  totalDeliveries: [],
  currentBatsMan:"",
};


// let liveMatch = {
//   team1: "India",
//   team2: "Pakistan",
//   status: ["Stop","Live"],
//   message : "Match Is Live",
//   totalRuns: 0,
//   battingLineup: "",
//   bowlingLineup:"",
//   batsman_1: "Player 1",
//   batsman_2: "Player 2",
//   totalOversWithBalls: 20,
//   strikerBatsman: "",
// };




// Socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected",liveMatch);

  // Send initial match data when a client connects
  socket.emit("matchUpdated", liveMatch);

  // When admin sends an update
  socket.on("updateMatch", (data) => {
    liveMatch = { ...data }; // Update the in-memory data
    console.log("Match updated:", liveMatch);

    io.emit("matchUpdated", liveMatch); // Emit updated match data to all connected clients
  });


  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
  
  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
