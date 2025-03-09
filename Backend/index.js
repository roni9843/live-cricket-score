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


// Match State Schema
const MatchStateSchema = new mongoose.Schema({
  strikerBatsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  nonStrikerBatsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Bowler" },
  batsTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  bowlerTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  isMatchLive: { type: String, enum: ["live", "stop", "paused"], default: "stop" },
  matchTarget: { type: Boolean, default: false },
  targetRun: { type: Number, default: 0 },
  totalOver: { type: Number, default: 0 },
  isMatchRunning: { type: Boolean, default: false },
  matchAdminMeg: { type: String, default: "Match is not live" },
});
const MatchState = mongoose.model("MatchState", MatchStateSchema);


// Round Schema
const RoundSchema = new mongoose.Schema({
  tempore_run: { type: Number, required: true },
  Striker_batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  NonStriker_batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman" },
  timestamp: { type: Date, default: Date.now },
  ball_type: { type: String,  },
  bats_type: { type: String, required: true },
  bawler: { type: mongoose.Schema.Types.ObjectId, ref: "Bowler" },
  wicket: { type: String},
  overNumber: { type: Number ,require : true },
  overData: { type: mongoose.Schema.Types.ObjectId, ref: "Over" },
  wicketPlayerDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman", default: null },

});
const Round = mongoose.model("Round", RoundSchema);


// Over Schema
const OverSchema = new mongoose.Schema({
  overNumber: { type: Number, required: true },
  ballsPerOver: { type: Number, required: true },
  strikerBatsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman", required: true },
  nonStrikerBatsman: { type: mongoose.Schema.Types.ObjectId, ref: "Batsman", required: true },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Bowler", required: true },
  totalRun : { type: Number, required: true },
  extraRun : { type: Number, required: true },
  wicket: { type: Number},
});
const Over = mongoose.model("Over", OverSchema);




 let runningPlayer = null; // Initially, no running player exists



 // In-memory storage for live match data
let liveMatch = {
  isMatchRunning: false,
  batsTeam: null,
  bowlerTeam: null,
  isMatchLive: "stop",
  matchTarget: false,
  targetRun: 0,
  totalOver: 0,
  matchAdminMeg: "",
  roundHistory: [],
};


// Socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected");




  // Check if a match is live
  MatchState.findOne().sort({ _id: -1 })
    .populate("batsTeam bowlerTeam strikerBatsman nonStrikerBatsman bowler")
    .then((liveMatchFromDB) => {

        // If no match state is found, create one
    if (!liveMatchFromDB) {
      const newMatchState = new MatchState({
        isMatchRunning: false,
      });
      newMatchState.save().then((savedMatchState) => 

        console.log("Created new match state:", savedMatchState)
   
      );
    }

      if (liveMatchFromDB) {
        liveMatch = {
          ...liveMatch,
          batsTeam: liveMatchFromDB?.batsTeam,
          bowlerTeam: liveMatchFromDB?.bowlerTeam,
          isMatchLive: liveMatchFromDB?.isMatchLive,
          matchTarget: liveMatchFromDB?.matchTarget,
          targetRun: liveMatchFromDB?.targetRun,
          totalOver: liveMatchFromDB?.totalOver,
          matchAdminMeg: liveMatchFromDB?.matchAdminMeg,
          isMatchRunning : liveMatchFromDB?.isMatchRunning,
        };

        // Fetch all rounds with populated references
        Round.find()
          .populate("Striker_batsman NonStriker_batsman bawler")
          .sort({ timestamp: -1 })
          .then((roundHistoryFromDB) => {
            liveMatch.roundHistory = roundHistoryFromDB;
       
              runningPlayer = {
                strikerBatsman: liveMatchFromDB.strikerBatsman,
                nonStrikerBatsman: liveMatchFromDB.nonStrikerBatsman,
                bowler: liveMatchFromDB.bowler,
              };

          //    console.log("this is running player ___ 2", runningPlayer);
              
         
           
              socket.emit("get_live_score_to_clint_first_load", {liveMatch,runningPlayer});


              // ---- 

              socket.emit("getRunningPlayer_emit", runningPlayer);

              
          
              socket.emit("get_live_score", {liveMatch,runningPlayer});
          
        

          });
      } else {
     //   console.log("No match is live");
      }
    })
    .catch((err) => console.error("Error finding match state:", err));

  


  socket.emit("getRunningPlayer_emit", runningPlayer);

    // Send initial score to client
    console.log("this is running player ___ 1"); 

    socket.emit("get_live_score", {liveMatch,runningPlayer});

    socket.emit("get_live_score_to_clint_first_load", {liveMatch,runningPlayer});

 


    // * Set Running Player 
socket.on("set_just_RunningPlayer", async (data) => {
  try {
   
    const [strikerBatsman, nonStrikerBatsman, bowler] = await Promise.all([
      Batsman.findById(data.strikerBatsman).populate('teamId'),
      Batsman.findById(data.nonStrikerBatsman).populate('teamId'),
      Bowler.findById(data.bowler).populate('teamId'),
    ]);


        // Update match state with the new running player
        await MatchState.findOneAndUpdate(
          {},
          {
            bowler: data.bowler,
            nonStrikerBatsman: data.nonStrikerBatsman,
            strikerBatsman: data.strikerBatsman,
          },
          { new: true }
        );


    
    
    // If there's no running player, create one
    if (!runningPlayer) {
      runningPlayer = {
        strikerBatsman: strikerBatsman,
        nonStrikerBatsman: nonStrikerBatsman,
        bowler: bowler,
      };
    } else {
      // Update existing running player
      runningPlayer.strikerBatsman = strikerBatsman;
      runningPlayer.nonStrikerBatsman = nonStrikerBatsman;
      runningPlayer.bowler = bowler;
    }

    console.log("this is running player ___ 2"); 
    socket.broadcast.emit("get_live_score", {liveMatch,runningPlayer});
    socket.broadcast.emit("get_live_score_to_client", {liveMatch,runningPlayer});

  } catch (err) {
    console.error("Error setting running player:", err);
  
  }
});







  // ! When admin sends an update ( not used now)
  socket.on("updateMatch", async (data) => {
    liveMatch = { ...data };
   

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
    console.log("this is running player ___ 3"); 
    socket.broadcast.emit("get_live_score", {liveMatch,runningPlayer});
  });



  // * createBowler
  socket.on("createBowler", async (data) => {

  
    

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

     

      io.emit("getAllBowlersSuccessMsg", {success: true, bowlers: allBowlers});
    } catch (err) {
      console.error("Error getting all bowlers:", err);
      io.emit("getAllBowlersSuccessMsg", {success: false, error: err});
    }
  });

  // * createBatsman
  socket.on("createBatsman", async (data) => {


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
   
    const [strikerBatsman, nonStrikerBatsman, bowler] = await Promise.all([
      Batsman.findById(data.strikerBatsman).populate('teamId'),
      Batsman.findById(data.nonStrikerBatsman).populate('teamId'),
      Bowler.findById(data.bowler).populate('teamId'),
    ]);

    // Update match state with the new running player
    await MatchState.findOneAndUpdate(
      {},
      {
        bowler: data.bowler,
        nonStrikerBatsman: data.nonStrikerBatsman,
        strikerBatsman: data.strikerBatsman,
      },
      { new: true }
    );

    
    
    // If there's no running player, create one
    if (!runningPlayer) {
      runningPlayer = {
        strikerBatsman: strikerBatsman,
        nonStrikerBatsman: nonStrikerBatsman,
        bowler: bowler,
      };
    } else {
      // Update existing running player
      runningPlayer.strikerBatsman = strikerBatsman;
      runningPlayer.nonStrikerBatsman = nonStrikerBatsman;
      runningPlayer.bowler = bowler;
    }

    console.log("this is running player ->", runningPlayer);
    


    io.emit("setRunningPlayerSuccessMsg", { success: true, runningPlayer });
    socket.broadcast.emit("get_live_score_to_client", {liveMatch,runningPlayer});



    io.emit("getRunningPlayer_emit", {runningPlayer});
    io.emit("getRunningPlayer_emit_for_round_page", runningPlayer);
// console.log("Emitting runningPlayer:", runningPlayer); // Log the data


  } catch (err) {
    console.error("Error setting running player:", err);
    io.emit("setRunningPlayerSuccessMsg", { success: false, error: err });
  }
});


socket.on("createRound", async (data) => {
  try {
   // console.log("create round -> ", data);


   console.log("create round -> ", data);

   


    const outPlayer = await Round.findOne({
      $or: [
        { "wicketPlayerDetails": { $in: [data.strikerBatsman, data.nonStrikerBatsman] } }
      ]
    });


    console.log("outPlayer -> ", outPlayer);

    if (outPlayer) {
      return io.emit("createRoundSuccessMsg", { success: false, error: "This player already out on the match. Please change the player." });
    }



    


    // Check if the over already exists based on the over number
    let existingOver = await Over.findOne().sort({ _id: -1 });


    // ! =================== start
    // If no over exists, create a new over
    // if (!existingOver) {
    //   existingOver = new Over({
    //     overNumber: 1,  // Set overNumber as required
    //     ballsPerOver: 1,              // Ball starts at 1 for the first ball of the over
    //     totalRun: 0,                  // Initialize totalRun for this over
    //     extraRun: 0,                  // Initialize extraRun for no-balls or wide balls
    //     wicket: 0,                    // Initialize wicket count
    //     strikerBatsman: data.strikerBatsman,
    //     nonStrikerBatsman: data.nonStrikerBatsman,
    //     bowler: data.bowler,
    //   });
    // } else {
    //   // If over exists, update it based on events
    //   if (data.wicket !== null) {
        
    //     if(data.ball_type === null){
    //       // Wicket Handling
    //       existingOver.ballsPerOver += 1;  
    //       if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
    //         existingOver.ballsPerOver = 1;
    //         existingOver.overNumber += 1;
    //       }
    //     }

      

    //     if( data.wicket === "Runout" ){
    //     //  existingOver.totalRun += 1;
       
    //     }
     

    //     existingOver.extraRun += data.runs;

    //    existingOver.totalRun += data.runs;  // Increment ball count
    //     existingOver.wicket += 1;   
    //   //  return
    //     // Increment wicket count
    //   } else if(data.ball_type !== null){
    //     existingOver.totalRun += data.runs;  // Increment ball count

    //     existingOver.extraRun += data.runs;


    //   }else if (data.ball_type === null) {  // No-ball Handling
        
        
        
        
    //     existingOver.ballsPerOver += 1;    // Increment ball count for no-ball
    //    // existingOver.extraRun += data.runs;
    //     existingOver.totalRun += data.runs;  // Increment ball count

    //     if( data.bats_type !== "Bat" ) {
    //       existingOver.extraRun += data.runs;
    //     }


    //     if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
    //       existingOver.ballsPerOver = 1;
    //       existingOver.overNumber += 1;
    //     }
    //    // existingOver.totalRun += data.runs;  // Add extra runs for no-balls
    //   } else if (data.bats_type !== null) {
    //       // Batsman action
    //   //  existingOver.ballsPerOver += 1;    // Increment ball count for batsman play
    //     // if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
    //     //   existingOver.ballsPerOver = 1;
    //     //   existingOver.overNumber += 1;
    //     // }




    //   }
    // }
    // ! ===================== end 



    if (!existingOver) {
      existingOver = new Over({
        overNumber: 1,  // Set overNumber as required
        ballsPerOver: 0,              // Ball starts at 1 for the first ball of the over
        totalRun: 0,                  // Initialize totalRun for this over
        extraRun: 0,                  // Initialize extraRun for no-balls or wide balls
        wicket: 0,                    // Initialize wicket count
        strikerBatsman: data.strikerBatsman,
        nonStrikerBatsman: data.nonStrikerBatsman,
        bowler: data.bowler,
        wicketPlayerDetails : null
      });
    }
      // If over exists, update it based on events
      if (data.wicket !== null) {
        
        if(data.ball_type === null){
          // Wicket Handling
          existingOver.ballsPerOver += 1;  
          if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
            existingOver.ballsPerOver = 1;
            existingOver.overNumber += 1;
          }
        }

      

        if( data.ball_type !== null ){
        //  existingOver.totalRun += 1;

        existingOver.extraRun += 1;

       existingOver.totalRun += 1; 



      //  // * for set wicket player details 
      //   existingOver.wicketPlayerDetails = data.wicketPlayerDetailsID;

       
       
        }
     

    

       existingOver.totalRun += data.runs;  // Increment ball count
        existingOver.wicket += 1;   
      //  return
        // Increment wicket count
      } else if(data.ball_type !== null){
        existingOver.totalRun += data.runs;  // Increment ball count

        //existingOver.extraRun += data.runs;

        existingOver.totalRun += 1;  // Increment ball count

        existingOver.extraRun += 1;

      }else if (data.ball_type === null) {  // No-ball Handling
        
        
        
        
        existingOver.ballsPerOver += 1;    // Increment ball count for no-ball
       // existingOver.extraRun += data.runs;
        existingOver.totalRun += data.runs;  // Increment ball count

        if( data.bats_type !== "Bat" ) {
          existingOver.extraRun += 1;
        }


        if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
          existingOver.ballsPerOver = 1;
          existingOver.overNumber += 1;
        }
       // existingOver.totalRun += data.runs;  // Add extra runs for no-balls
      } else if (data.bats_type !== null) {
          // Batsman action
      //  existingOver.ballsPerOver += 1;    // Increment ball count for batsman play
        // if (existingOver.ballsPerOver > 6) { // If more than 6 balls, reset and move to next over
        //   existingOver.ballsPerOver = 1;
        //   existingOver.overNumber += 1;
        // }




      }
    

    // 

    // Create a new over
    const newOver = new Over({
      overNumber: existingOver.overNumber,
      ballsPerOver: existingOver.ballsPerOver,
      strikerBatsman: existingOver.strikerBatsman,
      nonStrikerBatsman: existingOver.nonStrikerBatsman,
      bowler: existingOver.bowler,
      totalRun: existingOver.totalRun,
      extraRun: existingOver.extraRun,
      wicket: existingOver.wicket,
    });
    // Save the new over
    const savedOver = await newOver.save();
    

    // Create a new round entry in the Round model
    const newRound = new Round({
      tempore_run: data.runs,
      Striker_batsman: data.strikerBatsman,
      NonStriker_batsman: data.nonStrikerBatsman,
      ball_type: data.ball_type,
      bats_type: data.bats_type,
      bawler: data.bowler,
      wicket: data.wicket,
      overNumber : existingOver.overNumber,
      overData : savedOver._id,
      wicketPlayerDetails : data.wicketPlayerDetailsID
    });

    await newRound.save();

    // Fetch all rounds with populated references
    const allRounds = await Round.find()
      .populate("Striker_batsman NonStriker_batsman bawler")
      .sort({ timestamp: -1 });


   //   console.log("===========================",allRounds);
      
   // liveMatch.isMatchLive = true;
    liveMatch.runningPlayer = runningPlayer;
    liveMatch.roundHistory = allRounds;




    // Emit success message with the latest rounds
    io.emit("createRoundSuccessMsg", { success: true, rounds: allRounds });
    socket.broadcast.emit("get_live_score_to_client", {liveMatch,runningPlayer});

    
    // Update liveMatch data on successful round creation

  //  console.log("this is running player ___ 4"); 
    socket.broadcast.emit("get_live_score", {liveMatch,runningPlayer});


    io.emit("get_live_score_to_clint_first_load", {liveMatch,runningPlayer});


    // ---- 

    io.emit("getRunningPlayer_emit", runningPlayer);

    

    io.emit("get_live_score", {liveMatch,runningPlayer});




  } catch (err) {
    console.error("Error creating round:", err);
    io.emit("createRoundSuccessMsg", { success: false, error: err.message });
  }
});





socket.on("setMatchState", async (data) => {
  try {
    let matchState = await MatchState.findOne().sort({ _id: -1 }).populate("batsTeam bowlerTeam");

 


    if (data.isMatchRunning === false) {
      if (matchState) {
        await MatchState.deleteMany({});

         runningPlayer = null; // Initially, no running player exists
         liveMatch = {
          isMatchRunning: false,
          batsTeam: null,
          bowlerTeam: null,
          isMatchLive: "stop",
          matchTarget: false,
          targetRun: 0,
          totalOver: 0,
          matchAdminMeg: "",
         };

           // Delete all documents from Round
         await Round.deleteMany();

        // Delete all documents from Over
         await Over.deleteMany();

      }
      matchState = new MatchState({ isMatchRunning: false });
    } else {
      if (!matchState) {
        matchState = new MatchState({ isMatchRunning: true });
      }
      matchState.batsTeam = data.batsTeam;
      matchState.bowlerTeam = data.bowlerTeam;
      matchState.isMatchLive = data.isMatchLive;
      matchState.matchTarget = data.matchTarget;
      matchState.targetRun = data.targetRun;
      matchState.totalOver = data.totalOver;
      matchState.matchAdminMeg = data.matchAdminMeg;
      matchState.isMatchRunning = data.isMatchRunning !== undefined ? data.isMatchRunning : matchState.isMatchRunning;
    }

   // console.log("this is match state ->", matchState,"data ->",data);
    



    await matchState.save();
    io.emit("setMatchStateSuccessMsg", { success: true, matchState });


    liveMatch = {
      ...liveMatch,
      batsTeam: matchState?.batsTeam,
      bowlerTeam: matchState?.bowlerTeam,
      isMatchLive: matchState?.isMatchLive,
      matchTarget: matchState?.matchTarget,
      targetRun: matchState?.targetRun,
      totalOver: matchState?.totalOver,
      matchAdminMeg: matchState?.matchAdminMeg,
      isMatchRunning : matchState?.isMatchRunning,
    };





    io.emit("get_live_score_to_clint_first_load", {liveMatch,runningPlayer});


    // ---- 

    io.emit("getRunningPlayer_emit", runningPlayer);

    

    io.emit("get_live_score", {liveMatch,runningPlayer});



  } catch (err) {
    console.error("Error setting match state:", err);
    io.emit("setMatchStateSuccessMsg", { success: false, error: err.message });
  }
});

socket.on("getMatchState", async () => {
  try {
    const matchState = await MatchState.findOne().sort({ _id: -1 }).populate("batsTeam bowlerTeam bowler");
    if (matchState) {
      io.emit("getMatchStateSuccessMsg", { success: true, matchState });
    } else {
      io.emit("getMatchStateSuccessMsg", { success: false, message: "No match state found." });
    }
  } catch (err) {
    console.error("Error getting match state:", err);
    io.emit("getMatchStateSuccessMsg", { success: false, error: err.message });
  }
});



// Delete Match History
socket.on("deleteMatchHistory", async () => {
  try {
    // Delete all documents from MatchState
    await MatchState.deleteMany();

    // Delete all documents from Round
    await Round.deleteMany();

    // Delete all documents from Over
    await Over.deleteMany();

    // Reset runningPlayer and liveMatch to default values
    runningPlayer = null;
    liveMatch = {
      isMatchRunning: false,
      batsTeam: null,
      bowlerTeam: null,
      isMatchLive: "stop", // live or stop
      matchTarget: false,
      targetRun: 0,
      totalOver: 0,
      matchAdminMeg: "",
    };

    io.emit("deleteMatchHistorySuccessMsg", { success: true,MatchState });


    io.emit("get_live_score_to_clint_first_load", {liveMatch,runningPlayer});


    // ---- 

    io.emit("getRunningPlayer_emit", runningPlayer);

    

    io.emit("get_live_score", {liveMatch,runningPlayer});



  } catch (err) {
    console.error("Error deleting match history:", err);
    io.emit("deleteMatchHistorySuccessMsg", { success: false, error: err.message });
  }
});





// Delete Over
socket.on("deleteOver", async () => {
  try {
    const over = await Over.findOne();
    if (over) {
      await Over.findByIdAndDelete(over._id);
    }
    
    // Delete all documents from Round
    await Round.deleteMany();

    const allOvers = await Over.find().sort({ overNumber: 1 });
    io.emit("deleteOverSuccessMsg", { success: true, overs: allOvers });
  } catch (err) {
    console.error("Error deleting over:", err);
    io.emit("deleteOverSuccessMsg", { success: false, error: err.message });
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





