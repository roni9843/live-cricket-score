import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BallAds from './BallAds';
import { Form } from 'react-bootstrap';
import { Modal, Button, Box } from '@mui/material';
import RunningPlayer from './RunningPlayer';

// Add this CSS animation keyframes
const popupStyles = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: scale(0.8); }
    20% { opacity: 1; transform: scale(1.05); }
    80% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8); }
  }
`;

export default function RoundBall({ socket }) {
  const [db_pass_state, setDb_pass_state] = useState({
    strikerBatsman_id: null,
    non_strikerBatsman_id: null,
    bowler_id: null,
    ball_type: null,
    bats_type: "Bat",
    runs: 0,
    wicket: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [isPlayerOut, setIsPlayerOut] = useState(false);
  const [outPlayerDetails, setOutPlayerDetails] = useState(null);
  const [runningPlayer, setRunningPlayer] = useState(null);
  const [selectedBatsman, setSelectedBatsman] = useState(null);
  const [isMatchRunning, setIsMatchRunning] = useState(null);
  const [outPlayer, setOutPlayer] = useState(null);
  const [match_currently_live, set_is_match_currently_live] = useState(false);
  const [batsmen_final, setBatsmen_final] = useState({
    striker: null,
    nonStriker: null,
  });
  const [roundHistory, setRoundHistory] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsPlayerOut(false); // Reset when modal closes
    setDb_pass_state((prev) => ({ ...prev, wicket: null })); // Reset wicket
    setOutPlayerDetails(null); // Reset out player details
  };

  const handleClickBatsman = ({ name, id }) => {
    setSelectedBatsman(name);
    setOutPlayer(name);

    setBatsmen_final((prevState) => ({
      striker: runningPlayer?.nonStrikerBatsman?._id === id ? runningPlayer?.nonStrikerBatsman : runningPlayer?.strikerBatsman,
      nonStriker: runningPlayer?.nonStrikerBatsman?._id === id ? runningPlayer?.strikerBatsman : runningPlayer?.nonStrikerBatsman,
    }));

    const data = {
      strikerBatsman: runningPlayer?.nonStrikerBatsman?._id === id ? runningPlayer?.nonStrikerBatsman._id : runningPlayer?.strikerBatsman._id,
      nonStrikerBatsman: runningPlayer?.nonStrikerBatsman?._id === id ? runningPlayer?.strikerBatsman._id : runningPlayer?.nonStrikerBatsman._id,
      bowler: runningPlayer?.bowler._id,
    };

    socket.emit("set_just_RunningPlayer", data);

    setDb_pass_state((prev) => ({
      ...prev,
      strikerBatsman_id: id,
      non_strikerBatsman_id: runningPlayer?.nonStrikerBatsman?._id === id ? runningPlayer?.strikerBatsman?._id : runningPlayer?.nonStrikerBatsman?._id,
    }));
  };

  useEffect(() => {
    socket.on('getRunningPlayer_emit_for_round_page', (message) => {
      setRunningPlayer(message);
      setSelectedBatsman(message?.strikerBatsman?.name);
      setDb_pass_state((prev) => ({
        ...prev,
        strikerBatsman_id: message?.strikerBatsman?._id,
        non_strikerBatsman_id: message?.nonStrikerBatsman?._id,
        bowler_id: message?.bowler?._id,
      }));
      setBatsmen_final((prevState) => ({
        striker: message?.strikerBatsman,
        nonStriker: message?.nonStrikerBatsman,
      }));
    });

    socket.on("getRunningPlayerSuccessMsg", (message) => {
      if (message.success) {
        setBatsmen_final((prevState) => ({
          striker: message?.runningPlayer?.strikerBatsman,
          nonStriker: message?.runningPlayer?.nonStrikerBatsman,
        }));
        setRunningPlayer(message.runningPlayer);
        setSelectedBatsman(message?.runningPlayer?.strikerBatsman?.name);
        setDb_pass_state((prev) => ({
          ...prev,
          strikerBatsman_id: message?.runningPlayer?.strikerBatsman?._id,
          non_strikerBatsman_id: message?.runningPlayer?.nonStrikerBatsman?._id,
          bowler_id: message?.runningPlayer?.bowler?._id,
        }));
      } else {
        setRunningPlayer(null);
      }
    });

    socket.on("get_live_score", (message) => {
      setRoundHistory(message?.liveMatch?.roundHistory);
      setIsMatchRunning(message?.liveMatch?.isMatchRunning === true ? true : false);
      set_is_match_currently_live(message?.liveMatch?.isMatchLive === "live" ? true : false);
      setRunningPlayer(message.runningPlayer);
      setSelectedBatsman(message?.runningPlayer?.strikerBatsman?.name);
      setBatsmen_final((prevState) => ({
        striker: message?.runningPlayer?.strikerBatsman,
        nonStriker: message?.runningPlayer?.nonStrikerBatsman,
      }));
      setDb_pass_state((prev) => ({
        ...prev,
        strikerBatsman_id: message?.runningPlayer?.strikerBatsman?._id,
        non_strikerBatsman_id: message?.runningPlayer?.nonStrikerBatsman?._id,
        bowler_id: message?.runningPlayer?.bowler?._id,
      }));
    });

    return () => {
      socket.off("getRunningPlayerSuccessMsg");
      socket.off('getRunningPlayer_emit');
      socket.off("get_live_score");
    };
  }, [socket]);

  const handleSubmit = () => {
    if (db_pass_state.wicket !== null && db_pass_state.bats_type !== null) {
      if (db_pass_state.wicket === "Bold" || db_pass_state.wicket === "Catch" || db_pass_state.wicket === "LBW") {
        if (db_pass_state.ball_type !== null) {
          alert("At a same time you can't select ball type and wicket type (without runout)");
          return;
        }
      }
    }
    if (db_pass_state.wicket === "Runout" && outPlayerDetails === null) {
      alert("For Runout, please select out player");
      return;
    }

    if (!db_pass_state.strikerBatsman_id || !db_pass_state.non_strikerBatsman_id || !db_pass_state.bowler_id || db_pass_state.runs === null) {
      alert("Striker Batsman, Non Striker Batsman, Bowler and Runs are required");
      return;
    }


    if (db_pass_state.strikerBatsman_id === db_pass_state.non_strikerBatsman_id) {
      alert("Striker Batsman and Non Striker Batsman can't be same, please change the batsman and open Running Player modal");

      setShowModal(true);

      return;
    }



    const roundData = {
      strikerBatsman: db_pass_state.strikerBatsman_id,
      nonStrikerBatsman: db_pass_state.non_strikerBatsman_id,
      bowler: db_pass_state.bowler_id,
      ball_type: db_pass_state.ball_type,
      bats_type: db_pass_state.bats_type,
      runs: db_pass_state.runs,
      wicket: db_pass_state.wicket,
      wicketPlayerDetailsID: outPlayerDetails?.details?._id || null,
    };

    socket.emit("createRound", roundData);

    socket.on("createRoundSuccessMsg", (message) => {
      if (message.success) {
        setSuccessMsg("Round created successfully!");
        setTimeout(() => {
          setSuccessMsg(null);
  
        const lastRound = message.rounds[0];


          if (lastRound?.wicketPlayerDetails) {
            setIsPlayerOut(true);
            setShowModal(true);
          } else {
            setIsPlayerOut(false);
            setDb_pass_state((prev) => ({ ...prev, wicket: null })); // Reset wicket for normal runs
            setOutPlayerDetails(null);
          }
   
        }, 3000);
      } else {
        setSuccessMsg(
          `Error : ${message.error}`
        );
        setShowModal(true);


        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  };

  if (isMatchRunning === null) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4 position-relative">
      <style>{popupStyles}</style>

      {successMsg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              minWidth: '300px',
              maxWidth: '500px',
              animation: 'fadeInOut 3s ease-in-out forwards',
              border: successMsg.includes("Error") ? '2px solid red' : '2px solid #28a745',
            }}
          >
            <h2 className={successMsg.includes("Error") ? "text-danger" : "text-success"}>
              {successMsg.includes("Error") ? "Error" : "Success!"}
            </h2>
            <p className="mt-3" style={{ fontSize: '1.2rem' }}>
              {successMsg}
            </p>
            <div
              className="mt-3"
              style={{
                width: '60%',
                height: '4px',
                backgroundColor: '#28a745',
                margin: '0 auto',
                animation: 'progressAnimation 3s linear forwards',
              }}
            />
          </div>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <RunningPlayer
            socket={socket}
            roundHistory={roundHistory}
            setBatsmen_final={setBatsmen_final}
            setOutPlayer={setOutPlayer}
            setOutPlayerDetails={setOutPlayerDetails}
            outPlayerDetails={outPlayerDetails}
            wicket={db_pass_state.wicket}
            isPlayerOut={isPlayerOut}
            onPlayerReplaced={() => {
              setIsPlayerOut(false);
              setDb_pass_state((prev) => ({ ...prev, wicket: null }));
              setOutPlayerDetails(null);
            }} // Reset states after replacement
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {isMatchRunning ? (
        <div>
          <div className="d-flex flex-column flex-md-row flex-lg-column justify-content-md-center rounded shadow-sm">
            <div className="row bg-light p-3 mb-3">
              <div className="col-6 col-md-12 col-lg-6">
                <h6 className="text-primary">Runs : <span className="font-weight-bold">77</span></h6>
                <h6 className="text-primary">Extra : <span className="font-weight-bold">77</span></h6>
                <h6 className="text-primary">Over: <span className="font-weight-bold">5.5</span></h6>
              </div>
              <div className="col-6 col-md-12 col-lg-6 d-flex align-items-center justifyContent-center border border-primary rounded">
                <h6 className="text-center"> 🥎 {runningPlayer ? runningPlayer?.bowler?.name : "No Added"} </h6>
              </div>
            </div>

            {!(db_pass_state.strikerBatsman_id === null || db_pass_state.strikerBatsman_id === undefined || db_pass_state.non_strikerBatsman_id === null || db_pass_state.non_strikerBatsman_id === undefined || db_pass_state.bowler_id === null || db_pass_state.bowler_id === undefined) ? (
              <div className="row bg-light p-3 d-flex justify-content-between">
                <div className="col-5 d-flex justify-content-center">
                  <button
                    className={`btn mx-1 ${selectedBatsman === runningPlayer?.strikerBatsman?.name ? 'bg-success text-white' : 'bg-light text-primary'}`}
                    style={{ width: '150px', height: '100%', border: '2px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => handleClickBatsman({ name: runningPlayer?.strikerBatsman?.name, id: runningPlayer?.strikerBatsman?._id })}
                  >
                    <h6 className="font-weight-bold">{runningPlayer ? runningPlayer?.strikerBatsman?.name : "No Added"}</h6>
                  </button>
                </div>

                <div className="col-5 d-flex justify-content-center">
                  <button
                    className={`btn mx-1 ${selectedBatsman === runningPlayer?.nonStrikerBatsman?.name ? 'bg-success text-white' : 'bg-light text-primary'}`}
                    style={{ width: '150px', height: '100%', border: '2px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => handleClickBatsman({ name: runningPlayer?.nonStrikerBatsman?.name, id: runningPlayer?.nonStrikerBatsman?._id })}
                  >
                    <h6 className="font-weight-bold">{runningPlayer ? runningPlayer?.nonStrikerBatsman?.name : "No Added"}</h6>
                  </button>
                </div>

                <div className="col-2 d-flex justify-content-center">
                  <button
                    className="btn mx-1 rounded"
                    style={{ height: '100%' }}
                    onClick={() => setShowModal(true)}
                  >
                    🔄️
                  </button>
                </div>
              </div>
            ) : (
              <div className="col-12 d-flex justify-content-center btn btn-warning" style={{ height: '100%', border: '2px solid #ffcc00', fontSize: '1.1rem', fontWeight: 'bold' }}>
                <button
                  className="btn mx-1 rounded"
                  style={{ height: '100%' }}
                  onClick={() => setShowModal(true)}
                >
                  Please select the player 🔄️
                </button>
              </div>
            )}

            <div className="border border-primary rounded p-2 mb-3 mt-3" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="text-primary">Select Runs</h6>
              <BallAds
                setDb_pass_state={setDb_pass_state}
                batsmen_final={batsmen_final}
                outPlayerDetails={outPlayerDetails}
                setOutPlayerDetails={setOutPlayerDetails}
                outPlayer={outPlayer}
                setOutPlayer={setOutPlayer}
              />
            </div>

            {match_currently_live ? (
              <div className="row mt-3">
                <div className="col-12 text-center">
                  <button
                    className="btn btn-primary btn-lg w-100"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-3">
                <h6 className="text-muted">Please change match condition to start the game</h6>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-3">
          <h6 className="text-muted">Please change match condition to start the game</h6>
        </div>
      )}
    </div>
  );
}