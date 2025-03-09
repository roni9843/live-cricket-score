import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

import cricket_ball from "../../Images/cricket_ball.png"


// Custom styled components
const CricketBall = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'linear-gradient(145deg, #ffffff, #e0e0e0)',
  border: '2px solid #800000', // Traditional cricket ball red
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '2px 2px 4px rgba(255, 48, 48, 0.05)',
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
  color: '#333',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const ScoreContainer = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(to bottom,rgba(255, 94, 94, 0.09),rgba(231, 255, 124, 0.3))',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  border: '1px solid #d3d3d3',
}));

export default function AllBallsDisplay({ score }) {
  

    const [groupedDataWithRuns, setGroupedData] = useState([]);



  useEffect(() => {
    
    const groupedDataDemo = groupByOverNumber(score);

    setGroupedData(groupedDataDemo)

    console.log("==> ",groupedDataDemo);

  }, [score]);





  // Grouping function
  function groupByOverNumber(data) {
    return Object.values(data.reduce((acc, item) => {
      const over = item.overNumber;
      if (!acc[over]) {
        acc[over] = [];
      }
      acc[over].push(item);
      return acc;
    }, {}));
  }
  







  return (
    <ScoreContainer elevation={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Status Indicator */}
        <Box 
          minWidth={60} 
          bgcolor="#2e7d32" // Cricket pitch green
          color="white"
          p={1}
          borderRadius={1}
          mr={2}
          textAlign="center"
        >
          <Typography variant="subtitle2">Status</Typography>
          <Typography variant="h6">50</Typography>
        </Box>

        {/* Scrollable Balls */}
        <Box 
          display="flex" 
          alignItems="center" 
          overflow="auto" 
          whiteSpace="nowrap"
        >
          {groupedDataWithRuns && groupedDataWithRuns.map((overData, index) => (
            <Box 
              key={index} 
              display="flex" 
              alignItems="center" 
              mb={1} 
              style={{ backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` }} 
            >
              {overData.map((ball) => (
                <CricketBall key={ball._id}>
                  <Typography variant="subtitle2">{ball.tempore_run} / {ball.overNumber}</Typography>
                </CricketBall>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </ScoreContainer>
  );
}