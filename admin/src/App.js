import React from 'react';

import SettingPage from './components/SettingPage';
import RoundBall from './components/RoundBall';
import { io } from 'socket.io-client';
import RunningPlayer from './components/RunningPlayer';
import BallAds from './components/BallAds';
import AddTeam from './components/AddTeam';
import BatsManAdd from './components/BatsManAdd';
import AddBowler from './components/AddBowler';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import MatchStateSet from './components/MatchStateSet';

const theme = createTheme();



//const socket = io("http://localhost:5000"); // Connect to backend
const socket = io("https://06nfzk6p-5000.asse.devtunnels.ms"); // Connect to backend




//




export default function App() {
  return (
    <ThemeProvider theme={theme}>
    <div className="container">
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item">
          <a className="nav-link active" id="status-tab" data-bs-toggle="tab" href="#status" role="tab" aria-controls="status" aria-selected="true">Status 🔴</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" id="Restart-tab" data-bs-toggle="tab" href="#Restart" role="tab" aria-controls="Restart" aria-selected="false">Condition</a>
        </li>
   
        <li className="nav-item">
          <a className="nav-link" id="setting-tab" data-bs-toggle="tab" href="#setting" role="tab" aria-controls="setting" aria-selected="false">Setting</a>
        </li>
      </ul>
      <div className="tab-content">
        <div className="tab-pane fade show active" id="status" role="tabpanel" aria-labelledby="status-tab">
          <RoundBall socket={socket} />
        </div>
        <div className="tab-pane fade" id="Restart" role="tabpanel" aria-labelledby="Restart-tab">
        <MatchStateSet socket={socket} />
        </div>
        <div className="tab-pane fade" id="setting" role="tabpanel" aria-labelledby="setting-tab">
          <SettingPage socket={socket}/>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}

