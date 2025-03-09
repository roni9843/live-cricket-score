import React from 'react';
import AddBowler from './AddBowler';
import AddTeam from './AddTeam';
import BatsManAdd from './BatsManAdd';
import RunningPlayer from './RunningPlayer';
import DeleteRoundAndOver from './DeleteRoundAndOver';
import MatchStateSet from './MatchStateSet';

export default function SettingPage({socket}) {
  

  return (
   <div>


     <AddBowler socket={socket} />
    <BatsManAdd  socket={socket} />


   <AddTeam  socket={socket} />




<div className="p-2">
<DeleteRoundAndOver socket={socket}  />
</div>
   


   </div>
  );
}

