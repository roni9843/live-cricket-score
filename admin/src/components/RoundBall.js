import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BallAds from './BallAds';

export default function RoundBall() {
  const [selectedBatsman, setSelectedBatsman] = useState(null);

  const handleClickBatsman = (index) => {
    setSelectedBatsman(index);
  };

  return (
    <div className="container my-4">
      <div className="d-flex flex-column flex-md-row flex-lg-column justify-content-md-center rounded shadow-sm">

        {/* Runs and Extra Runs Section */}
        <div className="row bg-light   p-3 mb-3">
          <div className="col-6 col-md-12 col-lg-6">
            <h6 className="text-primary">Runs : <span className="font-weight-bold">77</span></h6>
            <h6 className="text-primary">Extra : <span className="font-weight-bold">77</span></h6>
            <h6 className="text-primary">Over: <span className="font-weight-bold">5.5</span></h6>
          </div>
          <div className="col-6 col-md-12 col-lg-6 d-flex align-items-center justify-content-center border border-primary rounded">
            <h6 className="text-center"> 🥎 Roni Ahmed</h6>
          </div>
        </div>


        {/* Batsman Section */}
        <div className="row bg-light p-3 align-items-center" style={{ height: '100%' }}>
          <div className="col-6 text-center">
            <button
              className={`btn ${selectedBatsman === 0 ? 'bg-success text-white' : 'bg-light text-primary'}`}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',border: '2px solid #ccc' }}
              onClick={() => handleClickBatsman(0)}
            >
              <h6><span className="font-weight-bold">{selectedBatsman === 0 && " 🏏 "} Rofiq</span></h6>
            </button>
          </div>
          <div className="col-6 text-center">
            <button
              className={`btn ${selectedBatsman === 1 ? 'bg-success text-white' : 'bg-light text-primary'}`}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',border: '2px solid #ccc' }}
              onClick={() => handleClickBatsman(1)}
            >
              <h6><span className="font-weight-bold">{selectedBatsman === 1 && " 🏏 "} Murad</span></h6>
            </button>
          </div>
        </div>

       
    

 

      </div>

       {/* Ball Ads Component */}
       <div className="border border-primary rounded p-2 mb-3 mt-3" style={{backgroundColor: '#f8f9fa'}}>
       <h6 className="text-primary">Select Runs</h6>
       <BallAds />
     </div>


   {/* Submit Button */}
   <div className="row mt-3">
   <div className="col-12 text-center">
     <button className="btn btn-primary btn-lg w-100">Submit</button>
   </div>
 </div>
      
    </div>
  );
}
