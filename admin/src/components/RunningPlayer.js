import React, { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function RunningPlayer({
  socket,
  roundHistory,
  setOutPlayer,
  setOutPlayerDetails,
  outPlayerDetails,
  wicket,
  isPlayerOut,
  onPlayerReplaced,
}) {
  const [batsmen, setBatsmen] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [runningPlayer, setRunningPlayer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [showChangePopup, setShowChangePopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false); // Track if popup has been shown for this out event

  useEffect(() => {
    socket.emit("getAllPlayers");
    socket.on("getAllPlayersSuccessMsg", (message) => {
      setLoading(false);
      if (message.success) {
        const filteredBatsmen = message.batsmen.filter(
          (batsman) =>
            !roundHistory.some(
              (round) => round.wicketPlayerDetails === batsman._id
            )
        );
        setBatsmen(filteredBatsmen);
        setBowlers(message.bowlers);
      } else {
        setError("Failed to load players.");
      }
    });

    socket.emit("getRunningPlayer");
    socket.on("getRunningPlayerSuccessMsg", (message) => {
      if (message.success) {
        setRunningPlayer(message.runningPlayer);
      } else {
        setRunningPlayer(null);
      }
    });

    return () => {
      socket.off("getAllPlayersSuccessMsg");
      socket.off("getRunningPlayerSuccessMsg");
    };
  }, [socket, roundHistory]);

  // Show popup only once when a player is out
  useEffect(() => {
    if (isPlayerOut && wicket && outPlayerDetails && runningPlayer && !hasShownPopup) {
      const outPlayerId = outPlayerDetails?.details?._id;
      if (runningPlayer?.strikerBatsman?._id === outPlayerId) {
        setEditField("striker");
        setShowChangePopup(true);
        setHasShownPopup(true); // Mark popup as shown
      } else if (runningPlayer?.nonStrikerBatsman?._id === outPlayerId) {
        setEditField("nonStriker");
        setShowChangePopup(true);
        setHasShownPopup(true); // Mark popup as shown
      }
    } else if (!isPlayerOut) {
      setHasShownPopup(false); // Reset when no player is out
      setShowChangePopup(false);
    }
  }, [isPlayerOut, wicket, outPlayerDetails, runningPlayer, hasShownPopup]);

  const handleEditClick = (field) => {
    setEditField(field);
    setSelectedPlayer("");
  };

  const handlePlayerChange = () => {
    if (!selectedPlayer) {
      setError("Please select a player.");
      return;
    }

    const data = {
      strikerBatsman: editField === "striker" ? selectedPlayer : runningPlayer?.strikerBatsman?._id,
      nonStrikerBatsman: editField === "nonStriker" ? selectedPlayer : runningPlayer?.nonStrikerBatsman?._id,
      bowler: editField === "bowler" ? selectedPlayer : runningPlayer?.bowler?._id,
    };

    setOutPlayer(data?.strikerBatsman?.name);
    socket.emit("setRunningPlayer", data);
    socket.on("setRunningPlayerSuccessMsg", (message) => {
      if (message.success) {
        setRunningPlayer(message.runningPlayer);
        setEditField(null);
        setOutPlayerDetails(null);
        setShowChangePopup(false);
        if (onPlayerReplaced) onPlayerReplaced(); // Reset parent state
      } else {
        setError("Error updating player: " + message.error);
      }
    });
  };

  const handleClosePopup = () => {
    setShowChangePopup(false);
    setEditField(null);
    if (onPlayerReplaced) onPlayerReplaced(); // Reset parent state if canceled
  };

  const isPlayerOutCheck = (playerId) => {
    return wicket && outPlayerDetails?.details?._id === playerId;
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "grey.100",
        borderRadius: 2,
        p: 2,
      }}
    >
      {error && (
        <Alert variant="danger" className="mb-2" style={{ fontSize: "0.85rem" }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Spinner animation="border" style={{ color: "#1976d2" }} />
        </Box>
      ) : (
        <>
          <Typography
            variant="h6"
            sx={{ color: "#424242", fontWeight: "bold", mb: 2 }}
          >
            Current Players
          </Typography>
          <List sx={{ padding: 0 }}>
            {/* Striker */}
            <ListItem
              className="d-flex align-items-center justify-content-between"
              sx={{
                bgcolor: "#fff",
                borderRadius: "8px",
                mb: 1,
                p: 1.5,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <ListItemText
                  primary={
                    <span style={{ fontWeight: "bold", color: "#0288d1" }}>
                      Striker:
                    </span>
                  }
                  secondary={
                    editField === "striker" ? (
                      <Select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                          width: "100%",
                          bgcolor: "#fff",
                          borderRadius: "4px",
                          ml: 1,
                        }}
                      >
                        <MenuItem value="">Select Striker</MenuItem>
                        {batsmen.map((batsman) => (
                          <MenuItem key={batsman._id} value={batsman._id}>
                            {batsman.name} - {batsman.teamId?.teamName}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <span
                        onClick={() => handleEditClick("striker")}
                        style={{
                          cursor: "pointer",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          ml: 1,
                        }}
                      >
                        {runningPlayer?.strikerBatsman?.name || "Not Set"} -{" "}
                        {runningPlayer?.strikerBatsman?.teamId?.teamName || ""}
                      </span>
                    )
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              {editField === "striker" && !showChangePopup ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePlayerChange}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    px: 2,
                    py: 0.5,
                    ml: 2,
                  }}
                >
                  Save
                </Button>
              ) : isPlayerOutCheck(runningPlayer?.strikerBatsman?._id) && !showChangePopup ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditClick("striker")}
                  sx={{
                    color: "#d32f2f",
                    borderColor: "#d32f2f",
                    "&:hover": { borderColor: "#b71c1c" },
                    ml: 2,
                  }}
                >
                  Change
                </Button>
              ) : null}
            </ListItem>

            {/* Non-Striker */}
            <ListItem
              className="d-flex align-items-center justify-content-between"
              sx={{
                bgcolor: "#fff",
                borderRadius: "8px",
                mb: 1,
                p: 1.5,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <ListItemText
                  primary={
                    <span style={{ fontWeight: "bold", color: "#388e3c" }}>
                      Non-Striker:
                    </span>
                  }
                  secondary={
                    editField === "nonStriker" ? (
                      <Select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                          width: "100%",
                          bgcolor: "#fff",
                          borderRadius: "4px",
                          ml: 1,
                        }}
                      >
                        <MenuItem value="">Select Non-Striker</MenuItem>
                        {batsmen.map((batsman) => (
                          <MenuItem key={batsman._id} value={batsman._id}>
                            {batsman.name} - {batsman.teamId?.teamName}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <span
                        onClick={() => handleEditClick("nonStriker")}
                        style={{
                          cursor: "pointer",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          ml: 1,
                        }}
                      >
                        {runningPlayer?.nonStrikerBatsman?.name || "Not Set"} -{" "}
                        {runningPlayer?.nonStrikerBatsman?.teamId?.teamName || ""}
                      </span>
                    )
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              {editField === "nonStriker" && !showChangePopup ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePlayerChange}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    px: 2,
                    py: 0.5,
                    ml: 2,
                  }}
                >
                  Save
                </Button>
              ) : isPlayerOutCheck(runningPlayer?.nonStrikerBatsman?._id) && !showChangePopup ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditClick("nonStriker")}
                  sx={{
                    color: "#d32f2f",
                    borderColor: "#d32f2f",
                    "&:hover": { borderColor: "#b71c1c" },
                    ml: 2,
                  }}
                >
                  Change
                </Button>
              ) : null}
            </ListItem>

            {/* Bowler */}
            <ListItem
              className="d-flex align-items-center justify-content-between"
              sx={{
                bgcolor: "#fff",
                borderRadius: "8px",
                mb: 1,
                p: 1.5,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <ListItemText
                  primary={
                    <span style={{ fontWeight: "bold", color: "#d81b60" }}>
                      Bowler:
                    </span>
                  }
                  secondary={
                    editField === "bowler" ? (
                      <Select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                          width: "100%",
                          bgcolor: "#fff",
                          borderRadius: "4px",
                          ml: 1,
                        }}
                      >
                        <MenuItem value="">Select Bowler</MenuItem>
                        {bowlers.map((bowler) => (
                          <MenuItem key={bowler._id} value={bowler._id}>
                            {bowler.name} - {bowler.teamId?.teamName}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <span
                        onClick={() => handleEditClick("bowler")}
                        style={{
                          cursor: "pointer",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          ml: 1,
                        }}
                      >
                        {runningPlayer?.bowler?.name || "Not Set"} -{" "}
                        {runningPlayer?.bowler?.teamId?.teamName || ""}
                      </span>
                    )
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              {editField === "bowler" && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePlayerChange}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    px: 2,
                    py: 0.5,
                    ml: 2,
                  }}
                >
                  Save
                </Button>
              )}
            </ListItem>
          </List>

          {/* Popup for changing out player */}
          <Dialog
            open={showChangePopup}
            onClose={handleClosePopup}
            aria-labelledby="change-player-dialog-title"
          >
            <DialogTitle id="change-player-dialog-title">
              Change Out Player
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Player {outPlayerDetails?.details?.name} is out ({wicket}). Please select a new player.
              </Typography>
              <Select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                displayEmpty
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Select New Player</MenuItem>
                {batsmen.map((batsman) => (
                  <MenuItem key={batsman._id} value={batsman._id}>
                    {batsman.name} - {batsman.teamId?.teamName}
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePopup} color="secondary">
                Cancel
              </Button>
              <Button onClick={handlePlayerChange} color="primary" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}