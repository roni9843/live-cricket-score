const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = "mongodb://yeestoc2_db_liveUser:8lFnmBnjT6@160.25.226.5:27017/yeestoc2_live_DB?authSource=admin";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Team Schema
const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true,  },
});
const Team = mongoose.model("Team", TeamSchema);

// Batsman Schema
const BatsmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
});
const Batsman = mongoose.model("Batsman", BatsmanSchema);

// Bowler Schema
const BowlerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
});
const Bowler = mongoose.model("Bowler", BowlerSchema);




// Round Schema
const RoundSchema = new mongoose.Schema({
  tempory_run: { type: Number, required: true },
  Striker_batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  NonStriker_batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  timestamp: { type: Date, default: Date.now },
  ball_type: { type: String, enum: ["wide", "no_ball"], },
  bats_type: { type: String, enum: ["bat", "lb", "by"], required: true },
  bawler: { type: mongoose.Schema.Types.ObjectId, ref: "Bowler" },
});
const Round = mongoose.model("Round", RoundSchema);

// In-memory storage for live match data
let liveMatch = {};

let runningPlayer = null; // Initially, no running player exists

// Socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  // Send initial match data when a client connects
  socket.emit("matchUpdated", liveMatch);

  // When admin sends an update
  socket.on("updateMatch", async (data) => {
    liveMatch = { ...data };
    console.log("Match updated:", liveMatch);

    // Save round data to MongoDB
    try {
      const newRound = new Round({
        tempory_run: data.tempory_run,
        Striker_batsman: data.Striker_batsman,
        NonStriker_batsman: data.NonStriker_batsman,
        ball_type: data.ball_type,
        bats_type: data.bats_type,
      });
      await newRound.save();
    } catch (err) {
      console.error("Error saving round:", err);
    }

    io.emit("matchUpdated", liveMatch);
  });



  // * createBowler
  socket.on("createBowler", async (data) => {

    console.log("data",data);
    

    const newBowler = new Bowler({
      name: data.name,
      teamId: data.teamId,
    });
    try {
      await newBowler.save();
      const allBowlers = await Bowler.find().sort({name: 1});
      io.emit("createBowlerSuccessMsg", {success: true, bowlers: allBowlers});
    } catch (err) {
      console.error("Error creating bowler:", err);
      io.emit("createBowlerSuccessMsg", {success: false, error: err});
    }
  });

  // * get all bowlers
  socket.on("getAllBowlers", async () => {

    
    

    try {
      const allBowlers = await Bowler.find().populate('teamId').sort({createdAt: -1});

      console.log("getAllBowlers allBowlers",allBowlers);

      io.emit("getAllBowlersSuccessMsg", {success: true, bowlers: allBowlers});
    } catch (err) {
      console.error("Error getting all bowlers:", err);
      io.emit("getAllBowlersSuccessMsg", {success: false, error: err});
    }
  });

  // * createBatsman
  socket.on("createBatsman", async (data) => {

    console.log("data",data);

    const newBatsman = new Batsman({
      name: data.name,
      teamId: data.teamId,
    });
    try {
      await newBatsman.save();
      const allBatsmen = await Batsman.find().populate('teamId').sort({name: 1});
      io.emit("createBatsmanSuccessMsg", {success: true, batsmen: allBatsmen});
    } catch (err) {
      console.error("Error creating batsman:", err);
      io.emit("createBatsmanSuccessMsg", {success: false, error: err});
    }
  });


  // * get all batsmen
  socket.on("getAllBatsmen", async () => {

    try {
      const allBatsmen = await Batsman.find().populate('teamId').sort({name: 1});
      io.emit("getAllBatsmenSuccessMsg", {success: true, batsmen: allBatsmen});
    } catch (err) {
      console.error("Error getting all batsmen:", err);
      io.emit("getAllBatsmenSuccessMsg", {success: false, error: err});
    }
  });


  // * create team
  socket.on("createTeam", async (data) => {
    const teams = await Team.find();
    if (teams.length >= 2) {
      io.emit("createTeamSuccessMsg", { success: false, error: "Only two teams are allowed" });
      return;
    }
    const newTeam = new Team({
      teamName: data.teamName,
    });
    try {
      await newTeam.save();
      const allTeams = await Team.find().sort({ createdAt: -1 });
      io.emit("createTeamSuccessMsg", { success: true, teams: allTeams });
    } catch (err) {
      console.error("Error creating team:", err);
      io.emit("createTeamSuccessMsg", { success: false, error: err });
    }
  });

  
  // * update team name
  socket.on("updateTeamName", async (data) => {
    try {
      const team = await Team.findById(data.teamId);
      if (!team) {
        io.emit("updateTeamNameSuccessMsg", { success: false, error: "Team not found" });
        return;
      }
      team.teamName = data.teamName;
      await team.save();
      const allTeams = await Team.find().sort({ createdAt: -1 });
      io.emit("updateTeamNameSuccessMsg", { success: true, teams: allTeams });
    } catch (err) {
      console.error("Error updating team name:", err);
      io.emit("updateTeamNameSuccessMsg", { success: false, error: err });
    }
  });
  

  // * get all teams
  socket.on("getAllTeams", async () => {
    try {
      const allTeams = await Team.find().sort({ createdAt: -1 });

      console.log("allTeams",allTeams);
      

      io.emit("getAllTeamsSuccessMsg", { success: true, teams: allTeams });
    } catch (err) {
      console.error("Error getting all teams:", err);
      io.emit("getAllTeamsSuccessMsg", { success: false, error: err });
    }
  });



// * get all players
socket.on("getAllPlayers", async () => {
  try {
    const allBatsmen = await Batsman.find().populate('teamId').sort({ name: 1 });
    const allBowlers = await Bowler.find().populate('teamId').sort({ name: 1 });

    io.emit("getAllPlayersSuccessMsg", { success: true, batsmen: allBatsmen, bowlers: allBowlers });
  } catch (err) {
    console.error("Error getting all players:", err);
    io.emit("getAllPlayersSuccessMsg", { success: false, error: err });
  }
});



// * Get Running Player
socket.on("getRunningPlayer", async () => {
  try {
    if (!runningPlayer) {
      io.emit("getRunningPlayerSuccessMsg", { success: false, message: "No running player set yet." });
    } else {
      io.emit("getRunningPlayerSuccessMsg", { success: true, runningPlayer });
    }
  } catch (err) {
    console.error("Error getting running player:", err);
    io.emit("getRunningPlayerSuccessMsg", { success: false, error: err });
  }
});

// * Set Running Player (Add if not exists)
socket.on("setRunningPlayer", async (data) => {
  try {
    // If there's no running player, create one
    if (!runningPlayer) {
      runningPlayer = {
        strikerBatsman: data.strikerBatsman,
        nonStrikerBatsman: data.nonStrikerBatsman,
        bowler: data.bowler,
      };
    } else {
      // Update existing running player
      runningPlayer.strikerBatsman = data.strikerBatsman;
      runningPlayer.nonStrikerBatsman = data.nonStrikerBatsman;
      runningPlayer.bowler = data.bowler;
    }

    io.emit("setRunningPlayerSuccessMsg", { success: true, runningPlayer });
  } catch (err) {
    console.error("Error setting running player:", err);
    io.emit("setRunningPlayerSuccessMsg", { success: false, error: err });
  }
});



  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
