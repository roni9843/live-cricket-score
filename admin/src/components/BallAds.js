import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

export default function BallAds() {
  const [selected, setSelected] = useState(null);
  const [ballType, setBallType] = useState(null);
  const [batType, setBatType] = useState(null);

  const handleClickRun = (index) => {
    setSelected(index);
  };

  const handleClickBallType = (index) => {
    setBallType(index);
  };

  const handleClickBatType = (index) => {
    setBatType(index);
  };

  return (
    <div className="container">
      <div className=" mb-4">
        
        <div className="d-flex justify-content-center flex-wrap">
          {['0', '1', '2', '3', '4', '6'].map((value, index) => (
            <button
              key={index}
              className={`btn btn-outline-primary m-1 px-3 ${selected === index ? 'active' : ''}`}
              style={{ 
                //width: '60px', height: '60px', 
                fontSize: '1.5rem' }}
              onClick={() => handleClickRun(index)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      

      <div className="container my-4">
      <div className="row justify-content-between">




        {/* Ball Type Column */}
        <div className="col-5 col-md-4  mb-4">
    
          <div className="d-flex  flex-wrap">
            {['W', 'NB'].map((value, index) => (
              <button
                key={index}
                className={`btn btn-outline-success m-1 px-2 ${ballType === index ? 'active' : ''}`}
                style={{
                    // width: '80px', height: '50px',
                     
                     fontSize: '1.2rem' }}
                onClick={() => handleClickBallType(index)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Divider for larger screens */}
        <div className="col-1 w-0 m-0  d-md-block col-md-2 text-center">
          <hr className='w-0 m-0 ' style={{ height: '100px', width: '5px', backgroundColor: '#000' }} />
        </div>

        {/* Bat Type Column */}
        <div className="col-5 col-md-4 text-end  align-items-end">

          <div className="row justify-content-center flex-wrap">
            <button className={`col-11 btn btn-outline-warning m-2 ${batType === 0 ? 'col-md-12' : 'col-6'} ${batType === "Bat" ? 'active' : ''}`} onClick={() => handleClickBatType("Bat")}>Bat</button>
            <button className={`col-5 btn btn-outline-warning m-1 ${batType === "LB" ? 'active' : ''}`} onClick={() => handleClickBatType("LB")}>LB</button>
            <button className={`col-5 btn btn-outline-warning m-1 ${batType === "By" ? 'active' : ''}`} onClick={() => handleClickBatType("By")}>By</button>
          </div>
        </div>



      </div>
      </div>



    </div>
  );
}