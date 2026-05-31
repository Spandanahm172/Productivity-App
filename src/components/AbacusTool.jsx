import { useState, useEffect, useRef } from 'react';
import './AbacusTool.css';

const MODES = ['Add', 'Subtract', 'Multiply', 'Divide', 'Mix'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function generateQuestions(mode, difficulty, count = 10) {
   const questions = [];
   const getRange = (diff) => {
       if(diff === 'Easy') return { min: 1, max: 9 };
       if(diff === 'Medium') return { min: 10, max: 99 };
       return { min: 100, max: 999 };
   };

   for(let i=0; i<count; i++) {
       const m = mode === 'Mix' ? MODES[Math.floor(Math.random() * 4)] : mode;
       const { min, max } = getRange(difficulty);
       
       let n1 = Math.floor(Math.random() * (max - min + 1)) + min;
       let n2 = Math.floor(Math.random() * (max - min + 1)) + min;
       
       let q = '';
       let a = 0;

       switch(m) {
           case 'Add':
               q = `${n1} + ${n2}`;
               a = n1 + n2;
               break;
           case 'Subtract':
               if (n1 < n2) [n1, n2] = [n2, n1];
               q = `${n1} - ${n2}`;
               a = n1 - n2;
               break;
           case 'Multiply':
               if(difficulty === 'Hard') n2 = Math.floor(Math.random() * 90) + 10;
               if(difficulty === 'Medium') n2 = Math.floor(Math.random() * 9) + 1;
               q = `${n1} × ${n2}`;
               a = n1 * n2;
               break;
           case 'Divide':
               if(difficulty === 'Easy') n2 = Math.floor(Math.random() * 9) + 1;
               if(difficulty === 'Medium') n2 = Math.floor(Math.random() * 20) + 1;
               if(difficulty === 'Hard') n2 = Math.floor(Math.random() * 50) + 1;
               const product = n1 * n2;
               q = `${product} ÷ ${n2}`;
               a = n1;
               break;
       }
       questions.push({ q, a });
   }
   return questions;
}

export function AbacusTool({ addCoins, onBack }) {
   const [gameState, setGameState] = useState('config');
   const [mode, setMode] = useState('Mix');
   const [diff, setDiff] = useState('Medium');
   
   const [questions, setQuestions] = useState([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [score, setScore] = useState(0);
   const [userAnswer, setUserAnswer] = useState('');
   
   const [timeLeft, setTimeLeft] = useState(60);
   const inputRef = useRef(null);

   const startQuiz = () => {
      setQuestions(generateQuestions(mode, diff, 10));
      setCurrentIndex(0);
      setScore(0);
      setUserAnswer('');
      setTimeLeft(diff === 'Hard' ? 120 : (diff === 'Medium' ? 90 : 60));
      setGameState('playing');
   };

   useEffect(() => {
      let timer;
      if (gameState === 'playing' && timeLeft > 0) {
         timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      } else if (gameState === 'playing' && timeLeft === 0) {
         handleEndQuiz(score);
      }
      return () => clearInterval(timer);
   }, [gameState, timeLeft]);

   useEffect(() => {
      if (gameState === 'playing' && inputRef.current) {
         inputRef.current.focus();
      }
   }, [gameState, currentIndex]);

   const handleEndQuiz = (finalScore) => {
      setGameState('result');
      const diffMultiplier = diff === 'Hard' ? 3 : (diff === 'Medium' ? 2 : 1);
      const coinsToAward = finalScore * 2 * diffMultiplier;
      addCoins(coinsToAward);
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const currentQ = questions[currentIndex];
      let newScore = score;
      if (parseInt(userAnswer) === currentQ.a) {
         newScore += 1;
         setScore(newScore);
      }
      
      if (currentIndex < questions.length - 1) {
         setCurrentIndex(currentIndex + 1);
         setUserAnswer('');
      } else {
         handleEndQuiz(newScore);
      }
   };

   if (gameState === 'config') {
      return (
         <div className="abacusContainer fade-in">
            <h2>Abacus Practice</h2>
            <p className="subtitle">Train your brain, earn coins.</p>
            
            <div className="configGroup">
               <label>Mode</label>
               <div className="pillSelector">
                  {MODES.map(m => (
                     <button key={m} className={`pill ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>{m}</button>
                  ))}
               </div>
            </div>

            <div className="configGroup">
               <label>Difficulty</label>
               <div className="pillSelector">
                  {DIFFICULTIES.map(d => (
                     <button key={d} className={`pill ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)}>{d}</button>
                  ))}
               </div>
            </div>

            <button className="primaryBtn" onClick={startQuiz}>Start ⏱️</button>
         </div>
      );
   }

   if (gameState === 'playing') {
      const currentQ = questions[currentIndex];
      return (
         <div className="abacusContainer slide-up">
            <div className="quizHeader">
               <span className="qProgress">Q {currentIndex + 1}/10</span>
               <span className={`timer ${timeLeft < 10 ? 'danger' : ''}`}>⏱️ {timeLeft}s</span>
            </div>
            
            <div className="questionDisplay">
               {currentQ.q}
            </div>

            <form className="answerForm" onSubmit={handleSubmit}>
               <input 
                  type="number" 
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="?"
                  autoFocus
               />
               <button type="submit" className="primaryBtn">Submit</button>
            </form>
         </div>
      );
   }

   if (gameState === 'result') {
      const diffMultiplier = diff === 'Hard' ? 3 : (diff === 'Medium' ? 2 : 1);
      const coinsEarned = score * 2 * diffMultiplier;
      return (
         <div className="abacusContainer scale-in">
            <h2>Practice Complete!</h2>
            <div className="scoreCircle">
               <span className="scoreNum">{score}</span>
               <span className="scoreTotal">/ 10</span>
            </div>
            <p className="earningsText">
               You earned <span className="gold">+{coinsEarned} 🪙</span>
            </p>
            <div className="actionGroup">
               <button className="primaryBtn" onClick={startQuiz}>Play Again</button>
               <button className="secondaryBtn" onClick={() => setGameState('config')}>Change Settings</button>
            </div>
         </div>
      );
   }

   return null;
}
