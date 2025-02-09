import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to backend

const Admin = () => {
  const [team1, setTeam1] = useState("India");
  const [team2, setTeam2] = useState("Pakistan");
  const [status, setStatus] = useState("Match is live");
  const [totalRuns, setTotalRuns] = useState(0);
  const [strikerBatsman, setStrikerBatsman] = useState("");
  const [nonStrikerBatsman, setNonStrikerBatsman] = useState("");
  const [currentBowler, setCurrentBowler] = useState("");
  const [currentDelivery, setCurrentDelivery] = useState(0);
  const [extraRuns, setExtraRuns] = useState(0);
  const [totalOvers, setTotalOvers] = useState(20);
  const [currentOverStatus, setCurrentOverStatus] = useState("0.0");
  const [ballsInOver, setBallsInOver] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState([]);

  const [battingLineup, setBattingLineup] = useState([]);
  const [bowlingLineup, setBowlingLineup] = useState([]);
  const [newBatsman, setNewBatsman] = useState("");
  const [newBowler, setNewBowler] = useState("");
  const [validDelivery,setValidDelivery] = useState([0, 1, 2, 3, 4, 6])

  const [invalidDeliveries, setInvalidDeliveries] = useState([
    { type: "wide", run: 1 },
    { type: "noball", run: 1 },
  ]);

  const [dismissalTypes, setDismissalTypes] = useState([
    "Bat",
    "LB",
    "By",
  ]);

  const addBatsman = () => {
    if (newBatsman.trim()) {
      setBattingLineup([...battingLineup, { name: newBatsman, id: Date.now() }]);
      setNewBatsman("");
    }
  };

  const addBowler = () => {
    if (newBowler.trim()) {
      setBowlingLineup([...bowlingLineup, { name: newBowler, id: Date.now() }]);
      setNewBowler("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchData = {
      team1,
      team2,
      status,
      totalRuns,
      battingLineup,
      bowlingLineup,
      strikerBatsman,
      nonStrikerBatsman,
      currentBowler,
      currentDelivery,
      extraRuns,
      totalOvers,
      currentOverStatus,
      ballsInOver,
      totalDeliveries,
    };
    console.log("Sending match update:", matchData);
    socket.emit("updateMatch", matchData);
  };

  return (

    <div>
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="card-title text-center mb-0">Admin - Live Cricket Score Update</h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
              

                {/* Runs, Overs, Batsmen, and Bowler */}
                <div className="mb-3">
                  <h4 className="text-center">Match Details 🏏</h4>
                  <div className="row g-2 row-cols-1">
                    <div className="col">
                      <div className="d-flex">
                        <div className="me-2">
                          <label className="form-label">Total Runs 🏃‍♂️</label>
                          <p className="form-control-plaintext">{totalRuns}</p>
                        </div>
                        <div className="me-2">
                          <label htmlFor="totalOvers" className="form-label">
                            Total Overs ⏰
                          </label>
                          <p className="form-control-plaintext">{totalOvers}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row g-2 row-cols-1 row-cols-md-2">
                    <div className="col">
                      <label htmlFor="strikerBatsman" className="form-label">
                        Striker Batsman 🟩 🏏
                      </label>
                      <select
                        id="strikerBatsman"
                        value={strikerBatsman}
                        onChange={(e) => setStrikerBatsman(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Striker Batsman</option>
                        {battingLineup.map((batsman) => (
                          <option key={batsman.id} value={batsman.name}>
                            {batsman.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col">
                      <label htmlFor="nonStrikerBatsman" className="form-label">
                        Non-Striker Batsman 🏃‍♂️
                      </label>
                      <select
                        id="nonStrikerBatsman"
                        value={nonStrikerBatsman}
                        onChange={(e) => setNonStrikerBatsman(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Non-Striker Batsman</option>
                        {battingLineup.map((batsman) => (
                          <option key={batsman.id} value={batsman.name}>
                            {batsman.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col">
                      <label htmlFor="currentBowler" className="form-label">
                        Current Bowler 🥎
                      </label>
                      <select
                        id="currentBowler"
                        value={currentBowler}
                        onChange={(e) => setCurrentBowler(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Current Bowler</option>
                        {bowlingLineup.map((bowler) => (
                          <option key={bowler.id} value={bowler.name}>
                            {bowler.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Delivery and Over Details */}
                <div className="mb-3">
                  <h4 className="text-center">Delivery and Over Details</h4>

                  <div className="row">
                    <div className="col">
                      <label className="form-label">Valid Deliveries</label>
                      <div className="d-flex flex-wrap">
                        {validDelivery.map((delivery, index) => (
                          <div
                            key={index}
                            className="border p-3 m-1"
                            style={{ cursor: "pointer" }}
                        //    onClick={() => handleSelect(delivery)}
                          >
                            {delivery}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <label className="form-label">Invalid Deliveries</label>
                      <div className="d-flex flex-wrap">
                        {invalidDeliveries.map((delivery, index) => (
                          <div
                            key={index}
                            className="border p-3 m-1"
                            style={{ cursor: "pointer" }}
                        //    onClick={() => handleSelect(delivery)}
                          >
                            {delivery.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <label className="form-label">Dismissal Types</label>
                      <div className="d-flex flex-wrap">
                        {dismissalTypes.map((dismissalType, index) => (
                          <div
                            key={index}
                            className="border p-3 m-1"
                            style={{ cursor: "pointer" }}
                            // onClick={() => handleSelect(dismissalType)}
                          >
                            {dismissalType}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <label htmlFor="currentDelivery" className="form-label">
                        Current Delivery
                      </label>
                      <input
                        type="number"
                        id="currentDelivery"
                        value={currentDelivery}
                        onChange={(e) => setCurrentDelivery(Number(e.target.value))}
                        className="form-control"
                        placeholder="Current Delivery"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="extraRuns" className="form-label">
                        Extra Runs
                      </label>
                      <input
                        type="number"
                        id="extraRuns"
                        value={extraRuns}
                        onChange={(e) => setExtraRuns(Number(e.target.value))}
                        className="form-control"
                        placeholder="Extra Runs"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="ballsInOver" className="form-label">
                        Balls in Over
                      </label>
                      <input
                        type="number"
                        id="ballsInOver"
                        value={ballsInOver}
                        onChange={(e) => setBallsInOver(Number(e.target.value))}
                        className="form-control"
                        placeholder="Balls in Over"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Over Status */}
                <div className="mb-3">
                  <h4 className="text-center">Current Over Status</h4>
                  <div className="input-group">
                    <label htmlFor="currentOverStatus" className="input-group-text">
                      Current Over Status
                    </label>
                    <input
                      type="text"
                      id="currentOverStatus"
                      value={currentOverStatus}
                      onChange={(e) => setCurrentOverStatus(e.target.value)}
                      className="form-control"
                      placeholder="Current Over Status"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Update Match
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>





  {/* write game setting UI here */}

  <div className="container-fluid bg-light min-vh-100 py-5">
  <div className="row justify-content-center">
    <div className="col-md-8 col-lg-6">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h1 className="card-title text-center mb-0">Game Setting</h1>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="p-4">
            <h4 className="text-center">Batting Lineup</h4>
            <div className="mb-3">
              <div className="list-group">
                {battingLineup.map((player) => (
                  <div key={player.id} className="list-group-item d-flex justify-content-between">
                    <span>{player.name}</span>
                    <button type="button" className="btn btn-outline-danger btn-sm">X</button>
                  </div>
                ))}
              </div>
              <div className="input-group mt-3">
                <input
                  type="text"
                  value={newBatsman}
                  onChange={(e) => setNewBatsman(e.target.value)}
                  className="form-control"
                  placeholder="New Batsman"
                />
                <button type="button" onClick={addBatsman} className="btn btn-success">+</button>
              </div>
            </div>

            <h4 className="text-center">Bowling Lineup</h4>
            <div className="mb-3">
              <div className="list-group">
                {bowlingLineup.map((player) => (
                  <div key={player.id} className="list-group-item d-flex justify-content-between">
                    <span>{player.name}</span>
                    <button type="button" className="btn btn-outline-danger btn-sm">X</button>
                  </div>
                ))}
              </div>
              <div className="input-group mt-3">
                <input
                  type="text"
                  value={newBowler}
                  onChange={(e) => setNewBowler(e.target.value)}
                  className="form-control"
                  placeholder="New Bowler"
                />
                <button type="button" onClick={addBowler} className="btn btn-success">+</button>
              </div>
            </div>
        
          


              {/* Team Information */}
              <div className="mb-3">
              <h4 className="text-center">Team Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="team1" className="form-label">
                    Team 1
                  </label>
                  <input
                    type="text"
                    id="team1"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                    className="form-control"
                    placeholder="Team 1"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="team2" className="form-label">
                    Team 2
                  </label>
                  <input
                    type="text"
                    id="team2"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                    className="form-control"
                    placeholder="Team 2"
                  />
                </div>
              </div>
            </div>

            {/* Match Status */}
            <div className="mb-3">
              <h4 className="text-center">Match Status</h4>
              <div className="input-group">
                <label htmlFor="status" className="input-group-text">
                  Match Status
                </label>
                <input
                  type="text"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                  placeholder="Match Status"
                />
              </div>
            </div>


            <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary">Update Match</button>
          </div>

          </form>

          

        </div>

        

      </div>
    </div>
  </div>
</div>

    </div>
   
  );
};

export default Admin;