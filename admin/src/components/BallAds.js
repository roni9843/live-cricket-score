import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BallAds({ setDb_pass_state, batsmen_final, outPlayerDetails, setOutPlayerDetails ,outPlayer, setOutPlayer }) {
  const [selected, setSelected] = useState(0);
  const [ballsType, setBallsType] = useState(null); // W/NB
  const [wicketType, setWicketType] = useState(null);
  const [batsType, setBatsType] = useState("Bat"); // Bat/LB/By

  const { striker, nonStriker } = batsmen_final || {
    striker: null,
    nonStriker: null,
  };


  // Automatically select striker for Bold, Catch, LBW and set outPlayerDetails
  useEffect(() => {
    if (
      wicketType !== null &&
      ["Bold", "Catch", "LBW"].includes(["Bold", "Catch", "Runout", "LBW"][wicketType]) &&
      striker?.name
    ) {
      setOutPlayer(striker.name);
      setOutPlayerDetails({ details: striker, type: ["Bold", "Catch", "Runout", "LBW"][wicketType] });
      setDb_pass_state((prev) => ({
        ...prev,
        out_player: striker.name,
      }));
    }
  }, [wicketType, striker, setDb_pass_state]);

  const handleClickWicketType = ({ index, name }) => {
    const newWicketType = wicketType === index ? null : index;
    setWicketType(newWicketType);
    setDb_pass_state((prev) => ({
      ...prev,
      wicket: newWicketType === null ? null : name,
      out_player:
        newWicketType === null
          ? null
          : name === "Runout"
          ? outPlayer
          : striker?.name, // Auto-select striker for non-Runout
    }));
    // Reset outPlayer and outPlayerDetails when deselecting wicket or for Runout until manually selected
    if (newWicketType === null || (newWicketType !== null && name === "Runout")) {
      setOutPlayer(null);
      setOutPlayerDetails(null);
    }
  };

  const handleClickRun = (index, value) => {
    setSelected(index);
    setDb_pass_state((prev) => ({ ...prev, runs: parseInt(value, 10) }));
  };

  const handleClickBallsType = (type) => {
    setBallsType(ballsType === type ? null : type);
    setDb_pass_state((prev) => ({
      ...prev,
      ball_type: ballsType === type ? null : type,
    }));
  };

  const handleClickBatsType = (type) => {
    setBatsType(type);
    setDb_pass_state((prev) => ({ ...prev, bats_type: type }));
  };

  const handleOutPlayerSelect = (player, playerDetails) => {
    setOutPlayer(player);
    setOutPlayerDetails({ details: playerDetails, type: "Runout" }); // Set details for Runout
    setDb_pass_state((prev) => ({
      ...prev,
      out_player: player,
    }));
  };

  const isRunout = wicketType !== null && ["Bold", "Catch", "Runout", "LBW"][wicketType] === "Runout";

  return (
    <div className="container mt-3">
      <div className="mb-4 mt-3">
        <div className="d-flex justify-content-center flex-wrap">
          {["0", "1", "2", "3", "4", "6"].map((value, index) => (
            <button
              key={index}
              className={`btn btn-outline-primary m-1 px-3 ${
                selected === index ? "active" : ""
              }`}
              style={{ fontSize: "14px" }}
              onClick={() => handleClickRun(index, value)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="mb-4 mt-5 text-center">
          {["Bold", "Catch", "Runout", "LBW"].map((value, index) => (
            <button
              key={index}
              className="btn px-2 mx-1"
              style={{
                fontSize: "14px",
                backgroundColor: index === wicketType ? "red" : "",
                border: "1px solid red",
                color: index === wicketType ? "white" : "black",
              }}
              onClick={() => handleClickWicketType({ index, name: value })}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Show out player message or selection based on wicket type */}
        {wicketType !== null && (
          <div className="mt-3 text-center">
            {isRunout ? (
              <>
                <p>Who is out?</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className={`btn ${
                      outPlayer === striker?.name ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => {
                      handleOutPlayerSelect(striker?.name, striker);
                    }}
                    disabled={!striker?.name}
                  >
                    {striker?.name || "Striker"}
                  </button>
                  <button
                    className={`btn ${
                      outPlayer === nonStriker?.name ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => {
                      handleOutPlayerSelect(nonStriker?.name, nonStriker);
                    }}
                    disabled={!nonStriker?.name}
                  >
                    {nonStriker?.name || "Non-Striker"}
                  </button>
                </div>
              </>
            ) : (
              <p>
                Out: {outPlayer || striker?.name || "Striker"}
              </p>
            )}
          </div>
        )}

        {/* Display outPlayerDetails if available */}
        {outPlayerDetails && (
          <div className="mt-3 text-center">
            <p>
              {outPlayerDetails.details.name} is out ({outPlayerDetails.type})
            </p>
          </div>
        )}
      </div>

      <div className="container my-4">
        <div className="row justify-content-between">
          {/* Ball Type Column */}
          <div className="col-5 col-md-4 mb-4">
            <div className="d-flex flex-wrap">
              {["W", "NB"].map((value, index) => (
                <button
                  key={index}
                  className="btn m-1 px-2 mt-4"
                  style={{
                    fontSize: "1.2rem",
                    backgroundColor: ballsType === value ? "green" : "",
                    border: "1px solid black",
                    color: ballsType === value ? "white" : "black",
                  }}
                  onClick={() => handleClickBallsType(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="col-1 w-0 m-0 d-md-block col-md-2 text-center">
            <hr
              className="w-0 m-0"
              style={{ height: "100px", width: "5px", backgroundColor: "#000" }}
            />
          </div>

          {/* Bat Type Column */}
          <div className="col-5 col-md-4 text-end align-items-end">
            <div className="row justify-content-center flex-wrap">
              <button
                className={`col-11 btn btn-outline-warning m-2 ${
                  batsType === "Bat" ? "active" : ""
                }`}
                onClick={() => handleClickBatsType("Bat")}
              >
                Bat
              </button>
              <button
                className={`col-5 btn btn-outline-warning m-1 ${
                  batsType === "LB" ? "active" : ""
                }`}
                onClick={() => handleClickBatsType("LB")}
              >
                LB
              </button>
              <button
                className={`col-5 btn btn-outline-warning m-1 ${
                  batsType === "By" ? "active" : ""
                }`}
                onClick={() => handleClickBatsType("By")}
              >
                By
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}