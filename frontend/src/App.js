import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import backImage from './Images/backImage.jpg';
import match_banner from './Images/match_banner.jpg';

const socket = io('http://localhost:5000'); // Connect to backend server
//add 
const LiveScore = () => {
  const [score, setScore] = useState(null);



  

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!score) {
        window.location.reload(); // Refresh page if no score after 5 seconds
      }
    }, 5000);

    socket.on('scoreUpdated', (newScore) => {
      console.log('Received updated score:', newScore);
      setScore(newScore);
    });

    return () => {
      socket.off('scoreUpdated');
      clearTimeout(timeout); // Clear timeout on unmount
    };
  }, [score]);

  if (!score) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading Live Scores...</div>
      </div>
    );
  }

  return (
    <div style={styles.background}>
      <div style={styles.container}>
      <h2 style={styles.title}>Live Cricket Score</h2>
        <img src={match_banner} style={styles.banner} alt="Match Banner" />

       
        <div style={styles.scoreBox}>
          <div style={styles.detailBox}>
            <p style={styles.teamText}>
              <strong>{score.team1}</strong> vs <strong>{score.team2}</strong>
            </p>
          </div>

        <div style={styles.scoreContainer}>
        
        
          <p style={styles.scoreText}>{score.score1} - {score.score2}</p>
        
          <p style={styles.statusText}>Status: {score.status}</p>
        
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <strong>Current Batsman:</strong> {score.currentBatsman}
            </div>
            <div style={styles.detailItem}>
              <strong>Current Bowler:</strong> {score.currentBowler}
            </div>
            <div style={styles.detailItem}>
              <strong>Current Over:</strong> {score.currentOver}
            </div>
            <div style={styles.detailItem}>
              <strong>Run Rate:</strong> {score.currentRunRate}
            </div>
          </div>
        </div>
        



        </div>
      </div>
    </div>
  );
};

const styles = {
  background: {
    backgroundImage: `url(${backImage})`,
    backgroundColor: '#1a1a1a', // Fallback color
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '800px',
    width: '100%',
    margin: '20px auto',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'rgb(180 41 48 / 44%)',
  },

  banner: {
    width: '100%',
    borderRadius: '10px',
    marginBottom: '15px',
    boxShadow: '0px 4px 12px rgba(232, 179, 105, 0.22)',
  },

  title: {
    fontSize: '25px',
    color: '#FFD700', // Gold color
    marginBottom: '20px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  scoreBox: {
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
    backgroundColor: 'rgb(23 0 0 / 79%)'
  },







    detailBox: {
      backgroundColor: 'rgba(218, 171, 171, 0.2)', // Inline color
      padding: '15px',
      borderRadius: '8px',
      margin: '10px 0',
      boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.3)',
    },
  
    teamText: {
      fontSize: '20px',
      color: '#FFD700', // Inline gold color
      fontWeight: 'bold',
    },
  
    scoreText: {
      fontSize: '18px',
      color: '#39FF14', // Inline neon green
      fontWeight: 'bold',
    },
  
    statusText: {
      fontSize: '16px',
      color: '#FF5733', // Inline orange-red
      fontWeight: 'bold',
    },
  
    detailsText: {
      fontSize: '14px',
      color: '#ffffff', // Inline white
    },
  
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a', // Inline dark background
    },
  
    loadingText: {
      fontSize: '22px',
      color: '#FFD700', // Inline gold color
      fontWeight: 'bold',
    },





  scoreContainer: {
    textAlign: 'center',
  //  padding: '20px',
   // backgroundColor: '#222',
    color: '#fff',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: 'auto',
  //  boxShadow: '0px 4px 10px rgba(56, 63, 59, 0.2)',
  },

  detailsGrid: {
    // display: 'grid',
    // gridTemplateColumns: '2fr 2fr',
    // gap: '10px',
    // marginTop: '10px',
  },
  detailItem: {
   // backgroundColor: '#333',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
  },







};




export default LiveScore;
