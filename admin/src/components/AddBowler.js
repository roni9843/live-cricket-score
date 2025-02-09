import React, { useEffect, useState } from "react";
import { Button, Modal, ListGroup, Badge, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AddBowler({ socket }) {
  const [allBowlers, setAllBowlers] = useState([]);
  const [bowlerName, setBowlerName] = useState("");
  const [totalBowlers, setTotalBowlers] = useState(0);
  const [showModalForCreate, setShowModalForCreate] = useState(false);
  const [teams, setTeams] = useState([]); // Store teams
  const [selectedTeam, setSelectedTeam] = useState(""); // Store selected team

  useEffect(() => {
    // Fetch all bowlers
    socket.emit("getAllBowlers");
    socket.on("getAllBowlersSuccessMsg", (message) => {
      setAllBowlers(message.bowlers);
      setTotalBowlers(message.bowlers.length);
    });

    // Fetch teams
    socket.emit("getAllTeams");
    socket.on("getAllTeamsSuccessMsg", (message) => {
      if (message.success) {
        setTeams(message.teams);
      }
    });
  }, [socket,showModalForCreate]);

  const handleAddBowler = () => {
    if (bowlerName.trim() && selectedTeam) {
      const newBowler = { name: bowlerName, teamId: selectedTeam };


      socket.emit("createBowler", newBowler);

      socket.on("createBowlerSuccessMsg", (message) => {
        if (message.success) {
          setAllBowlers(message.bowlers);
          setTotalBowlers(message.bowlers.length);
        }
        setBowlerName("");
        setSelectedTeam("");
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h2 className="card-title me-2">Bowler 🥎</h2>
          
          <Button onClick={() => setShowModalForCreate(true)} size="sm" style={{ backgroundColor: 'yellow',color: 'black' }}>
            ➕ ( {totalBowlers } )
          </Button>
        </div>
      </div>

      {/* Bootstrap Modal for Adding Bowler */}
      <Modal show={showModalForCreate} onHide={() => setShowModalForCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Bowler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Bowler Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter bowler name"
                value={bowlerName}
                onChange={(e) => setBowlerName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Team</Form.Label>
              <Form.Select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.teamName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalForCreate(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddBowler}>
            Add
          </Button>
        </Modal.Footer>

        {/* List of Bowlers */}
        <ListGroup style={{ borderRadius: "15px", padding: "5px" }}>
          {allBowlers.map((bowler) => (
            <ListGroup.Item
              key={bowler.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: bowler?.teamId?.teamColor,
              }}
            >
              <span style={{ fontWeight: "bold" }}>{bowler.name}</span>
              <span
              className="px-3"
                style={{
                  border: "1px solid black",
                  borderRadius: "5px",
                
                }}
              >
               {bowler?.teamId?.teamName}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal>
    </div>
  );
}
