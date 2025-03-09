import React, {useState,useEffect} from 'react';
import { Container, Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { SportsCricket, Score, People, Speed } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';

import backImage from './Images/backImage.jpg';
import match_banner from './Images/match_banner.jpg';
import AllBallsDisplay from './components/AllBallsDisplay/AllBallsDisplay';

const Layout = ({socket}) => {
  // Demo data
  const demoScore = {
    team1: 'India',
    team2: 'Australia',
    score1: '245/6',
    score2: '198/4',
    status: 'India lead by 47 runs',
    currentBatsman: 'Virat Kohli (78*)',
    currentBowler: 'Pat Cummins',
    currentOver: '42.3',
    currentRunRate: '5.83',
  };

  // Simulate loading state for 2 seconds
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);



  const [score, setScore] = useState(null);

  useEffect(() => {
    socket.on('get_live_score_to_client', (newScore) => {
    //  console.log('Received updated score _1 :', newScore);
      setScore(newScore);
    });
    return () => socket.off('get_live_score_to_client');
  }, [socket]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!score) window.location.reload();
    }, 5000);

    socket.on('get_live_score_to_clint_first_load', (newScore) => {
    console.log('Received updated score :', newScore);
      setScore(newScore);
    });

    return () => clearTimeout(timeout);
  }, [score]);














  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        }}
        className="animate__animated animate__pulse infinite"
      >
        <CircularProgress
          color="warning"
          size={70}
          sx={{ animation: 'spin 1s linear infinite' }}
        />
        <Typography
          variant="h4"
          sx={{
            color: '#ffca28',
            ml: 3,
            textShadow: '0 0 10px rgba(255, 202, 40, 0.5)',
          }}
          className="animate__animated animate__bounceIn"
        >
          Loading Scores...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${backImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',
        py: { xs: 2, sm: 4 },
      }}
      className="animate__animated animate__fadeIn"
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            p: { xs: 2, sm: 3 },
          }}
          className="animate__animated animate__zoomIn"
        >
          {/* Header */}
          <Box>
        




            <img
              src={match_banner}
              alt="Match Banner"
              style={{
                width: '100%',
                height: { xs: '120px', sm: '180px' },
                objectFit: 'cover',
                borderRadius: '15px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
              className="animate__animated animate__slideInDown"
            />
          </Box>


          {
            score &&   <AllBallsDisplay score={score?.liveMatch?.roundHistory            }  />
          }

        


          {/* Main Content */}
          <Box
            sx={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '15px',
              p: { xs: 2, sm: 3 },
              mt: 2,
            }}
            className="animate__animated animate__fadeInUp"
          >
        

            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(45deg, #00ff00, #00cc00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '3rem' },
                mb: 1,
              }}
              className="animate__animated animate__pulse"
            >
              <Score sx={{ fontSize: { xs: 30, sm: 40 }, mr: 1 }} />
              {demoScore.score1} - {demoScore.score2}
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: '#ffca28',
                textAlign: 'center',
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                mb: { xs: 2, sm: 3 },
              }}
            >
              Status: {demoScore.status}
            </Typography>







           <Grid container spacing={{ xs: 1, sm: 2 }}>
  <Grid item xs={6}>
    <Paper
      sx={{
        p: { xs: 1, sm: 2 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.02)' },
      }}
      className="animate__animated animate__bounceInLeft"
    >
      <Typography sx={{ color: '#fff', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        <SportsCricket sx={{ color: '#40c4ff', fontSize: { xs: 20, sm: 25 }, mr: 1 }} />
        <strong>Striker:</strong> {score?.
            runningPlayer?.strikerBatsman?.name      }
      </Typography>
      <Typography sx={{ color: '#fff', fontSize: { xs: '0.9rem', sm: '1rem' }, mt: 1 }}>
        <SportsCricket sx={{ color: '#40c4ff', fontSize: { xs: 20, sm: 25 }, mr: 1 }} />
        <strong>Non-Striker:</strong> {demoScore.nonStrikerBatsman}
      </Typography>
    </Paper>
  </Grid>

  <Grid item xs={6}>
    <Paper
      sx={{
        p: { xs: 1, sm: 2 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.02)' },
      }}
      className="animate__animated animate__bounceInRight"
    >
      <Typography sx={{ color: '#fff', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        <Speed sx={{ color: '#40c4ff', fontSize: { xs: 20, sm: 25 }, mr: 1 }} />
        <strong>Over:</strong> {demoScore.currentOver}
      </Typography>
      <Typography sx={{ color: '#fff', fontSize: { xs: '0.9rem', sm: '1rem' }, mt: 1 }}>
        <Speed sx={{ color: '#40c4ff', fontSize: { xs: 20, sm: 25 }, mr: 1 }} />
        <strong>Run Rate:</strong> {demoScore.currentRunRate}
      </Typography>
    </Paper>
  </Grid>

  {/* Bowler Section at Bottom */}
  <Grid item xs={12}>
    <Paper
      sx={{
        p: { xs: 1, sm: 2 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.02)' },
      }}
      className="animate__animated animate__fadeInUp"
    >
      <Typography sx={{ color: '#fff', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        <SportsCricket sx={{ color: '#40c4ff', fontSize: { xs: 20, sm: 25 }, mr: 1 }} />
        <strong>Bowler:</strong> {demoScore.currentBowler}
      </Typography>
    </Paper>
  </Grid>
           </Grid>

          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Layout;