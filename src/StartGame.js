// StartGame.js
import React from 'react';

const StartGame = ({ onStartGame }) => {
  return (
    <div className="start-game-container">
      <h1 className="start-game-title">Doodle Dash 🎨</h1>
      <div className="start-game-instructions">
        <p>✍️ <strong>You (the Human)</strong>: Draw the word provided as clearly and quickly as you can.<br />
        🧠 <strong>Your Teammate (the AI):</strong> Attempts to decipher your sketch and guess the word.<br />
        🏆 <strong>Your Objective:</strong> Work together to score as many words as possible within the time limit!</p>
      </div>
      <button className="start-game-button" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  );
};

export default StartGame;
