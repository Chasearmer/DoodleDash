import React, { Component } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactCanvasConfetti from 'react-canvas-confetti';
import StartGame from './StartGame';

import './App.css'; // Make sure to create an App.css file for styling
import wordsList from './words'; // make sure the path is correct
import Results from './Results'; // Assuming you've created a separate Results.js file
import {guessWordFromImage, generateRecap, generateAudio} from './AI'
import CanvasComponent from "./Canvas";


class App extends Component {
  // Define the default state as a class property
  defaultState = {
    timeRemaining: 120,
    currentWord: '',
    startTime: null,
    isWordGuessed: false,
    runConfetti: false,
    guesses: [],
    gameHistory: [],
    usedWords: [],
    gameStarted: true,
    gameEnded: false,
    performingRecap: false,
    finishedRecap: false,
    audio: [null, null]
  };

  constructor(props) {
    super(props);
    // Set the initial state directly from the default state
    this.state = this.defaultState;
    this.canvasRef = React.createRef();
  }

  // ... other methods and component logic
  restartGame = () => {
    this.clearTimers();
    this.pauseAudio();

    this.setState({...this.defaultState}, () => {
      this.startTimers();
      this.selectNewWord();
    });
  };

  componentDidMount() {
    console.log("Starting app!")
    this.setState({ gameStarted: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isWordGuessed && !prevState.isWordGuessed) {
      this.makeCelebration();
    }
  }

  componentWillUnmount() {
    // Clear the timer when the component is unmounted to prevent memory leaks
    this.clearTimers();
  }

  startGame = () => {
    this.restartGame();
  };


  startTimers = () => {
    // Clear any existing timer before starting a new one
    this.clearTimers();

    // Set up the game timer and store the interval ID so it can be cleared later
    this.timerID = setInterval(() => {
      this.setState(prevState => {
        if (prevState.timeRemaining === 1) {
          // Time's up, end the game
          this.handleTimeOut();
        } else {
          // Decrement the time remaining
          return { timeRemaining: prevState.timeRemaining - 1 };
        }
      });
    }, 1000); // Run the interval every 1000 milliseconds (1 second)
    
    this.guessWordInterval = setInterval(this.guessWord, 3000); // Guess Word every 3 seconds

  };

  clearTimers = () => {
    clearInterval(this.timerID);
    clearInterval(this.guessWordInterval)
  };

  selectNewWord = () => {
    const { usedWords } = this.state;
    const availableWords = wordsList.filter(word => !usedWords.includes(word));
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    this.setState({
      currentWord: availableWords[randomIndex],
      usedWords: [...usedWords, availableWords[randomIndex]],
      startTime: new Date(),
    });
  };

  endWord = (outcome) => {
    const { currentWord, startTime, gameHistory } = this.state;
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time taken in seconds

    const historyEntry = {
      word: currentWord,
      outcome: outcome, // 'completed', 'skipped', 'incomplete'
      timeTaken: timeTaken
    };

    this.setState({
      gameHistory: [...gameHistory, historyEntry],
      startTime: null // Reset the start time for the next word
    });
  };

  confettiAnimationInstance = null;

  makeCelebration = () => {
    this.setState({ runConfetti: Math.random() });
  };

  setRef = (instance) => {
    this.confettiAnimationInstance = instance;
  };

  resetGuesses = () => {
    this.setState({ guesses: [] });
  };

  handleOutcome = (outcome) => {
    this.endWord(outcome);
    this.resetGuesses();
    this.setState({ isWordGuessed: false });
    this.selectNewWord();
    this.canvasRef.current.reset();
  };

  handleCorrect = () => {
    this.handleOutcome('completed');
  };

  handleSkip = () => {
    this.handleOutcome('skipped');
  };

  handleCorrectGuess = () => {
    this.setState({ isWordGuessed: true });
    this.makeCelebration();
  }

  handleTimeOut = () => {
    this.endWord('incomplete');
    this.clearTimers();
    this.setState({ timeRemaining: 0, gameEnded: true });
  };

  guessWord = async () => {
    if (this.state.isWordGuessed) {return}
    
    console.log("Making Guess!");
    const { currentWord } = this.state;  // get current word at function start

    const imageURL = await this.canvasRef.current.capture();

    try {
      // Make guess
      const guessWithInflection = await guessWordFromImage(imageURL, this.state.guesses);

      // Remove any punctuation at the end of the guess
      let guess = guessWithInflection.replace(/[!?\.]$/, '');

      // If guess is new and isn't 'Nothing', speak the word and add it to the guess list
      if (guess != 'Nothing' && !this.state.guesses.includes(guess)) {

        // If we haven't moved to the next word (while guessing word) and the hasn't game ended, say the word
        if (currentWord == this.state.currentWord && !this.state.gameEnded && !this.state.isWordGuessed) {
          const wordAudio = await generateAudio(guessWithInflection);

          // ensure that we haven't moved to the next word (while generating audio) and the hasn't game ended
          if (currentWord == this.state.currentWord && !this.state.gameEnded && !this.state.isWordGuessed) {
            this.addGuess(guess);
            this.playAudio(wordAudio);

            console.log("🤔Guess: " + guess);
            console.log("📝Current Word: " + this.state.currentWord);
            
            // If guess is correct, mark as correct
            if (guess.toLowerCase() == this.state.currentWord.toLowerCase()) {
              console.log("🎉Correct Guess!");
              this.handleCorrectGuess();
            }
          }
        }
      }

    } catch (error) {
      console.error("Error in guessWordFromImage:", error);
  }
  };

  addGuess = (guess) => {
    this.setState(prevState => ({
      guesses: [...prevState.guesses, guess]
    }));
  };

  playAudio = (newAudioURL) => {
    // Unpack the existing audio and URL from the state
    const [audio, audioURL] = this.state.audio;

    // If there's an existing audio object, pause it
    if (audio) {
      audio.pause();
    }

    // Revoke the previous object URL to release memory
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    // Create a new audio object with the new URL
    const newAudio = new Audio(newAudioURL);

    // Update the state with the new audio object and URL
    this.setState({ audio: [newAudio, newAudioURL] });

    // Play the new audio
    newAudio.play();
  }

  pauseAudio = () => {
    // Unpack the existing audio from the state
    const [audio] = this.state.audio;

    // If there's an existing audio object, pause it
    if (audio) {
      audio.pause();
    }
  }

  makeShot = (particleRatio, opts) => {
    this.confettiRef.current && this.confettiRef.current({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio),
    });
  }

  startConfetti = () => {
    this.makeShot(0.25, { spread: 26, startVelocity: 55 });
    this.makeShot(0.2, { spread: 60 });
    this.makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    this.makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    this.makeShot(0.1, { spread: 120, startVelocity: 45 });
  }

  giveResultRecap = async () => {
    const recap = await generateRecap(this.state.gameHistory);
    if (this.state.gameEnded) {  // player may have restarted game
        const recapAudio = await generateAudio(recap);

        if (this.state.gameEnded) {  // player may have restarted game
          this.playAudio(recapAudio)
        }
    }
    this.setState({ finishedRecap: true });
  }

  render() {
    const { gameStarted, gameEnded, gameHistory } = this.state;

    if (!gameStarted) {
      return <StartGame onStartGame={this.startGame} />;
    }

    if (gameEnded) {
      if (!this.state.performingRecap) {
        this.setState({ performingRecap: true }, () => {
          this.giveResultRecap();
        });
      }
      return <Results gameHistory={gameHistory} finishedProcessing={this.state.finishedRecap} onRestart={this.restartGame} />;
    }

    return (
      <div className="App">
        <div className="game-area">
          {this.state.isWordGuessed && (
              <div className="correct-overlay">
                <button
                  className="correct-button-popup"
                  onClick={this.handleCorrect}
                >
                  Next Word!
                </button>
              </div>
            )}
          <ReactCanvasConfetti fire={this.state.runConfetti} refConfetti={this.setRef} style={{
            position: 'absolute',
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 10 // make sure this is above other elements
          }} />
          <div className="timer">
            Time Remaining <br />
            {this.state.timeRemaining}s
          </div>
          <div className="current-word">
            Your Word<br />
            <div className="word">{this.state.currentWord}</div>
          </div>
          <div className="game-controls">
            <button className="skip-button" onClick={this.handleSkip}>Skip</button>
          </div>
          <CanvasComponent ref={this.canvasRef} />
          <div className="guesses-list">
            <h3 className="guesses-title">Guesses</h3>
            <ul className="guesses">
              {this.state.guesses.map((guess, index) => (
                <li key={index} className="guess">{guess}</li>
              ))}
            </ul>
          </div>
          
        </div>
      </div>
    )
  }
}

export default App;
