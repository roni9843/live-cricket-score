import React from 'react';

import SettingPage from './components/SettingPage';
import RoundBall from './components/RoundBall';
import { io } from 'socket.io-client';
import RunningPlayer from './components/RunningPlayer';
import BallAds from './components/BallAds';
import BatsManAdd from './components/BatsManAdd';
import AddBowler from './components/AddBowler';


const socket = io("http://localhost:5000"); // Connect to backend




//




export default function App() {
  return (
    <div className="container">
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item">
          <a className="nav-link active" id="status-tab" data-bs-toggle="tab" href="#status" role="tab" aria-controls="status" aria-selected="true">Status 🔴</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" id="change-tab" data-bs-toggle="tab" href="#change" role="tab" aria-controls="change" aria-selected="false">Change</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" id="player-tab" data-bs-toggle="tab" href="#player" role="tab" aria-controls="player" aria-selected="false">Player</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" id="setting-tab" data-bs-toggle="tab" href="#setting" role="tab" aria-controls="setting" aria-selected="false">Setting</a>
        </li>
      </ul>
      <div className="tab-content">
        <div className="tab-pane fade show active" id="status" role="tabpanel" aria-labelledby="status-tab">
          <RoundBall socket={socket} />
        </div>
        <div className="tab-pane fade" id="change" role="tabpanel" aria-labelledby="change-tab">
         <RunningPlayer socket={socket} />
        </div>
        <div className="tab-pane fade" id="player" role="tabpanel" aria-labelledby="player-tab">
         <AddBowler socket={socket} />
         <BatsManAdd  socket={socket} />
        </div>
        <div className="tab-pane fade" id="setting" role="tabpanel" aria-labelledby="setting-tab">
          <SettingPage socket={socket}/>
        </div>
      </div>
    </div>
  );
}

