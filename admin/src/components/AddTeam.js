import React, { useEffect, useState } from "react";
import { Table, Alert, Spinner, Button, Container, Row, Col } from "react-bootstrap";

export default function AdminTeams({ socket }) {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all teams from the backend
  const fetchTeams = () => {
    setLoading(true);
    setError("");

    socket.emit("getAllTeams");

    socket.once("getAllTeamsSuccessMsg", (message) => {
      setLoading(false);
      if (message.success) {
        setTeams(message.teams);
      } else {
        setError("Failed to load teams.");
      }
    });
  };

  // Create a new team
  const createNewTeam = () => {
    const teamName = prompt("Enter new team name:");
    if (teamName && teamName.trim()) {
      socket.emit("createTeam", { teamName });

      socket.once("createTeamSuccessMsg", (message) => {
        if (message.success) {
          fetchTeams(); // Reload teams after creating a new one
        } else {
          setError("Error creating team: " + message.error);
        }
      });
    }
  };

  // Update the team name
  const updateTeamName = (teamId, currentName) => {
    const newName = prompt("Enter new team name:", currentName);
    if (newName && newName.trim() && newName !== currentName) {
      socket.emit("updateTeamName", { teamId, teamName: newName });

      socket.once("updateTeamNameSuccessMsg", (message) => {
        if (message.success) {
          setTeams(message.teams); // Reload the updated teams list
        } else {
          setError(message.error || "Error updating team name.");
        }
      });
    }
  };

  useEffect(() => {
    fetchTeams();

    // Cleanup listener on unmount
    return () => {
      socket.off("getAllTeamsSuccessMsg");
      socket.off("createTeamSuccessMsg");
      socket.off("updateTeamNameSuccessMsg");
    };
  }, [socket]);

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row className="mb-3 align-items-center">
        <Col xs={8}>
          <h2 className="fw-bold text-start">Team Management</h2>
        </Col>
        <Col xs={4} className="text-end">
          <Button
            style={{ backgroundColor: "white", color: "black", fontSize: "1.5rem" }}
            size="bg"
            onClick={fetchTeams}
          >
            🔄️
          </Button>
        </Col>
      </Row>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="text-center">
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Teams Table */}
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-dark text-center">
              <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>List</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.length > 0 ? (
                teams.map((team, index) => (
                  <tr key={team._id} className="text-center">
                    <td className="fw-bold">{index + 1}</td>
                    <td>{team.teamName}</td>
                    <td> Member </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => updateTeamName(team._id, team.teamName)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3 text-muted">
                    <Col className="text-end">
                      {teams.length === 0  &&  (
                        <Button variant="success" onClick={createNewTeam} className="me-2">
                          + Create New Team
                        </Button>
                      )}
                    </Col>
                  </td>
                </tr>
              )}
            </tbody>

            <td colSpan="3" className="text-end">
              {teams.length === 0 || teams.length < 2 && (
                <Button variant="success" onClick={createNewTeam} className="me-2">
                  + Create New Team
                </Button>
              )}
            </td>

          </Table>
        </>
      )}
    </Container>
  );
}
