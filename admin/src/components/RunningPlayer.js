import React, { useEffect, useState } from "react";
import { Button, Container, Form, Spinner, Alert, Card } from "react-bootstrap";

export default function RunningPlayer({ socket }) {
  const [batsmen, setBatsmen] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [selectedBatsman1, setSelectedBatsman1] = useState("");
  const [selectedBatsman2, setSelectedBatsman2] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [runningPlayer, setRunningPlayer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [oldRunningPlayer, setOldRunningPlayer] = useState(null);

  useEffect(() => {
    // Fetch all players
    socket.emit("getAllPlayers");


    socket.on("getAllPlayersSuccessMsg", (message) => {

      

      setLoading(false);
      if (message.success) {
        setBatsmen(message.batsmen);
        setBowlers(message.bowlers);
      } else {
        setError("Failed to load players.");
      }
    });

    return () => {
      socket.off("getRunningPlayerSuccessMsg");
    };
  }, [socket,runningPlayer]);

  useEffect(() => {
    // Fetch the current running player
    socket.emit("getRunningPlayer");

    socket.on("getRunningPlayerSuccessMsg", (message) => {
      if (message.success) {
        setRunningPlayer(message.runningPlayer);
        setOldRunningPlayer(message.runningPlayer);
      } else {
        setRunningPlayer(null); // No running player set yet
      }
    });

    return () => {
      socket.off("getRunningPlayerSuccessMsg");
    };
  }, [socket]);

  // Function to set running players
  const setRunningPlayerHandler = () => {
    if (!selectedBatsman1 || !selectedBatsman2 || !selectedBowler) {
      setError("Please select both batsmen and a bowler.");
      return;
    }

    const data = {
      strikerBatsman: selectedBatsman1,
      nonStrikerBatsman: selectedBatsman2,
      bowler: selectedBowler,
    };

    socket.emit("setRunningPlayer", data);

    socket.on("setRunningPlayerSuccessMsg", (message) => {
      if (message.success) {
        setRunningPlayer(message.runningPlayer);
        setOldRunningPlayer(message.runningPlayer);
      } else {
        setError("Error setting running player: " + message.error);
      }
    });
  };


  


  return (
    <Container className="mt-4">
 

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* If no running player, allow user to add */}
          {!runningPlayer ? (
            <>
             

              {/* Select Striker Batsman */}
              <Form.Group className="mb-3" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <Form.Label>Select Striker Batsman</Form.Label>
                <Form.Select onChange={(e) => setSelectedBatsman1(e.target.value)}>
                  <option value="">Select a batsman</option>
                  {batsmen.map((batsman) => (
                    <option key={batsman._id} value={batsman.name}>
                      {batsman.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Select Non-Striker Batsman */}
              <Form.Group className="mb-3" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <Form.Label>Select Non-Striker Batsman</Form.Label>
                <Form.Select onChange={(e) => setSelectedBatsman2(e.target.value)}>
                  <option value="">Select a batsman</option>
                  {batsmen.map((batsman) => (
                    <option key={batsman._id} value={batsman.name}>
                      {batsman.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Select Bowler */}
              <Form.Group className="mb-3" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <Form.Label>Select Bowler</Form.Label>
                <Form.Select onChange={(e) => setSelectedBowler(e.target.value)}>
                  <option value="">Select a bowler</option>
                  {bowlers.map((bowler) => (
                    <option key={bowler._id} value={bowler.name}>
                      {bowler.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>


             

              <div className="d-flex justify-content-between">
                {/* Cancel Button */}
                <Button variant="secondary" onClick={() => {
                  setRunningPlayer(oldRunningPlayer);
                }}>
                  Cancel
                </Button>

                {/* Change Running Player Button */}
                <Button variant="warning" onClick={setRunningPlayerHandler}>
                  Change Running Player
                </Button>
              </div>

            </>
          ) : (
            <Card className="mt-4 p-3">
              <h4 className="fw-bold">Current Running Player</h4>
              <p>
                <strong>Striker:</strong> {runningPlayer.strikerBatsman}
              </p>
              <p>
                <strong>Non-Striker:</strong> {runningPlayer.nonStrikerBatsman}
              </p>
              <p>
                <strong>Bowler:</strong> {runningPlayer.bowler}
              </p>

              {/* Allow Changing Player */}
              <Button variant="warning" onClick={() => setRunningPlayer(null)}>
                Change Running Player
              </Button>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
