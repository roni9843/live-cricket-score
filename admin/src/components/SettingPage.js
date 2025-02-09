import React from 'react';
import AddBowler from './AddBowler';
import AddTeam from './AddTeam';
import BatsManAdd from './BatsManAdd';
import RunningPlayer from './RunningPlayer';

export default function SettingPage({socket}) {
  

  return (
   <div>
   <AddTeam  socket={socket} />
   </div>
  );
}

