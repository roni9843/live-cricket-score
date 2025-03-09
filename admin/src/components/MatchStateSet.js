import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Container, Row, Col } from 'react-bootstrap';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: '20px auto',
  maxWidth: 600,
  borderRadius: 8,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: '10px 20px',
}));

const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    padding: theme.spacing(2),
    minWidth: 300,
    textAlign: 'center',
    backgroundColor: '#e8f5e9', // Light green background
    boxShadow: '0 4px 20px rgba(0, 128, 0, 0.2)',
  },
}));

const SuccessMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  color: theme.palette.success.dark,
}));

export default function MatchStateSet({ socket }) {
  const [matchState, setMatchState] = useState({
    batsTeam: '',
    bowlerTeam: '',
    isMatchLive: 'stop',
    matchTarget: false,
    targetRun: 0,
    totalOver: 0,
    isMatchRunning: false,
    matchAdminMeg: ''
  });

  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openDeleteSuccessDialog, setOpenDeleteSuccessDialog] = useState(false);

  const DELETE_PASSWORD = 'admin123';

  useEffect(() => {
    fetchTeams();
    getMatchState();
    return () => {
      socket.off('getAllTeamsSuccessMsg');
      socket.off('error');
      socket.off('getMatchStateSuccessMsg');
      socket.off('setMatchStateSuccessMsg');
      socket.off('deleteMatchHistorySuccessMsg');
    };
  }, [socket]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');
      
      socket.emit('getAllTeams');
      
      socket.on('getAllTeamsSuccessMsg', (message) => {
        setLoading(false);
        if (message.success && Array.isArray(message.teams)) {
          setTeams(message.teams);
          setMatchState(prev => ({
            ...prev,
            batsTeam: message.teams[0]?._id || '',
            bowlerTeam: message.teams[1]?._id || ''
          }));
        } else {
          setError('No teams available or failed to load teams');
        }
      });

      socket.on('error', (err) => {
        setLoading(false);
        setError('Error fetching teams: ' + err.message);
      });
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred: ' + err.message);
    }
  };

  const getMatchState = async () => {
    try {
      setLoading(true);
      setError('');
      socket.emit('getMatchState');

      socket.on('getMatchStateSuccessMsg', (message) => {
        setLoading(false);
        if (message.success) {
          setMatchState(prevState => ({
            ...prevState,
            ...message.matchState,
            batsTeam: message.matchState.batsTeam?._id || '',
            bowlerTeam: message.matchState.bowlerTeam?._id || '',
          }));
        } else {
          setError('Failed to load match state');
        }
      });

      socket.on('error', (err) => {
        setLoading(false);
        setError('Error fetching match state: ' + err.message);
      });
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMatchState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'isMatchRunning' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError('');

      const formData = new FormData(e.target);
      const matchAdminMeg = formData.get('matchAdminMeg') || '';

      let passData = {
        batsTeam: matchState.batsTeam,
        bowlerTeam: matchState.bowlerTeam,
        isMatchLive: matchState.isMatchLive,
        matchTarget: matchState.matchTarget,
        targetRun: matchState.targetRun,
        totalOver: matchState.totalOver,
        isMatchRunning: matchState.isMatchRunning,
        matchAdminMeg: matchAdminMeg,
      };

      if (matchState.isMatchRunning) {
        if (!matchState.batsTeam) {
          setError('Batsman team is required when match is running');
          setSubmitLoading(false);
          return;
        }
        if (!matchState.totalOver || matchState.totalOver < 2) {
          setError('Total over should be at least 2 when match is running');
          setSubmitLoading(false);
          return;
        }
        if (matchState.matchTarget && (!matchState.targetRun || matchState.targetRun < 10)) {
          setError('Target run should be at least 10 when target match is enabled');
          setSubmitLoading(false);
          return;
        }
        passData.bowlerTeam = teams.find(team => team._id !== matchState.batsTeam)?._id || '';
        
        socket.emit('setMatchState', passData);

        socket.on('setMatchStateSuccessMsg', (message) => {
          if (message.success) {
            setMatchState(prev => ({
              ...prev,
              ...message.matchState
            }));
            setOpenSuccessDialog(true); // Show success popup
            setTimeout(() => setOpenSuccessDialog(false), 2000); // Auto-close after 2 seconds
          } else {
            setError(message.error || 'Failed to set match state');
          }
          setSubmitLoading(false);
        });
      } else {
        setOpenPasswordDialog(true);
        setSubmitLoading(false);
        return;
      }

    } catch (err) {
      setSubmitLoading(false);
      setError('Failed to submit match state: ' + err.message);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === DELETE_PASSWORD) {
      setPasswordError('');
      setOpenPasswordDialog(false);
      
      const resetData = {
        batsTeam: '',
        bowlerTeam: '',
        isMatchLive: 'stop',
        matchTarget: false,
        targetRun: 0,
        totalOver: 0,
        isMatchRunning: false,
        matchAdminMeg: matchState.matchAdminMeg
      };

      socket.emit('deleteMatchHistory');
      socket.emit('setMatchState', resetData);

      socket.on('deleteMatchHistorySuccessMsg', (message) => {
        if (message.success) {
          setOpenDeleteSuccessDialog(true); // Show delete success popup
          setTimeout(() => setOpenDeleteSuccessDialog(false), 2000); // Auto-close after 2 seconds
        }
      });

      socket.on('setMatchStateSuccessMsg', (message) => {
        if (message.success) {
          setMatchState(prev => ({
            ...prev,
            ...message.matchState
          }));
        }
      });

      setPassword('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleDialogClose = () => {
    setOpenPasswordDialog(false);
    setPassword('');
    setPasswordError('');
    setSubmitLoading(false);
  };

  const handleSuccessDialogClose = () => {
    setOpenSuccessDialog(false);
  };

  const handleDeleteSuccessDialogClose = () => {
    setOpenDeleteSuccessDialog(false);
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
              Match State Configuration
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Match Status</InputLabel>
                <Select
                  name="isMatchRunning"
                  value={matchState.isMatchRunning.toString()}
                  onChange={handleChange}
                  disabled={loading}
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: value === 'true' ? 'green' : 'red',
                          mr: 1
                        }}
                      />
                      {value === 'true' ? 'Match Start' : 'Match End'}
                    </Box>
                  )}
                >
                  <MenuItem value="true">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'green',
                          mr: 1
                        }}
                      />
                      Match Start
                    </Box>
                  </MenuItem>
                  <MenuItem value="false">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'red',
                          mr: 1
                        }}
                      />
                      Match End
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {matchState.isMatchRunning && (
                <>
                  <TextField
                    fullWidth
                    label="Admin Message"
                    name="matchAdminMeg"
                    value={matchState.matchAdminMeg}
                    onChange={handleChange}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Batting Team</InputLabel>
                    <Select
                      name="batsTeam"
                      value={matchState.batsTeam}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {teams.map(team => (
                        <MenuItem key={team._id} value={team._id}>
                          {team.teamName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Match Live Status</InputLabel>
                    <Select
                      name="isMatchLive"
                      value={matchState.isMatchLive}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="stop"> 🔴 Break</MenuItem>
                      <MenuItem value="live"> 🟩 Running</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Total Overs"
                    name="totalOver"
                    type="number"
                    value={matchState.totalOver}
                    onChange={handleChange}
                    disabled={loading}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 0 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="matchTarget"
                        checked={matchState.matchTarget}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    }
                    label={"Run Target to " + (teams.find(team => team._id !== matchState.batsTeam)?.teamName || '')}
                    sx={{ mb: 2 }}
                  />

                  {matchState.matchTarget && (
                    <TextField
                      fullWidth
                      label="Target Run"
                      name="targetRun"
                      type="number"
                      value={matchState.targetRun}
                      onChange={handleChange}
                      disabled={loading}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 0 }}
                    />
                  )}
                </>
              )}

              <StyledButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || submitLoading}
              >
                {submitLoading ? <CircularProgress size={24} /> : 'Submit'}
              </StyledButton>
            </form>
          </StyledPaper>

          {/* Password Dialog */}
          <Dialog open={openPasswordDialog} onClose={handleDialogClose}>
            <DialogTitle>Confirm Match End and History Deletion</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Enter password to end the match and delete all over/run history
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handlePasswordSubmit} variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success Popup Dialog */}
          <SuccessDialog
            open={openSuccessDialog}
            onClose={handleSuccessDialogClose}
            TransitionComponent={Fade}
            transitionDuration={500}
          >
            <DialogContent>
              <SuccessMessage>
                <CheckCircleOutlineIcon sx={{ fontSize: 60 }} />
                <Typography variant="h6">
                  Match State Updated Successfully!
                </Typography>
              </SuccessMessage>
            </DialogContent>
          </SuccessDialog>

          {/* Delete Success Popup Dialog */}
          <SuccessDialog
            open={openDeleteSuccessDialog}
            onClose={handleDeleteSuccessDialogClose}
            TransitionComponent={Fade}
            transitionDuration={500}
          >
            <DialogContent>
              <SuccessMessage>
                <DeleteIcon sx={{ fontSize: 60 }} />
                <Typography variant="h6">
                  Match History Deleted Successfully!
                </Typography>
              </SuccessMessage>
            </DialogContent>
          </SuccessDialog>
        </Col>
      </Row>
    </Container>
  );
}