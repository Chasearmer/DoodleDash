// Results.js
import React from 'react';
import './Results.css';
const Results = ({ gameHistory, finishedProcessing, onRestart }) => {
  const totalPoints = gameHistory.filter(entry => entry.outcome === 'completed').length;
  const processingClass = finishedProcessing ? 'finished-processing' : '';


  const [animatedPoints, setAnimatedPoints] = React.useState(0);
  const maxSize = 10; // Maximum font size for the total points

  React.useEffect(() => {
    let points = 0;
    const interval = setInterval(() => {
      if (points < totalPoints) {
        points++;
        setAnimatedPoints(points);
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [totalPoints]);

  return (
    <div className="App">
      <div className='total-points-container'>
        <div className='total-points-title'>Total Points    </div>
        <div className='total-point' style={{
          fontSize: `${Math.min(2 + animatedPoints, maxSize)}em`
        }}>
          {animatedPoints}
        </div>
      </div>
      <div className={`ai-processing-container ${processingClass}`}>
        <div className="spinner"></div>
        <i className="checkmark fas fa-check"></i>
        <p className="ai-processing-text">
          {finishedProcessing ? '' : "🧠 Please wait, I'm collecting my thoughts..."}
        </p>
      </div>
      <ul className="results-list">
        {gameHistory.map((entry, index) => (
          <li key={index} className={`card ${entry.outcome}`}>
            <div className="status-icon">
              {entry.outcome === 'completed' ? '✅' : entry.outcome === 'skipped' ? '⏭️' : '❌'}
            </div>
            <div className="result-word">{entry.word}</div>
            <div className="result-time">{entry.timeTaken}s</div>
          </li>
        ))}
      </ul>
      <button className="button-restart" onClick={onRestart}>Restart Game</button>
      <div style={{ height: '60vh' }}></div> {/* Invisible spacer */}
    </div>
  );
};

export default Results;
