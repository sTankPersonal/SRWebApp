import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const Trivia = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/trivia`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setCurrent(0);
        setScore(0);
        setShowScore(false);
        setSelected(null);
      });
  }, []);

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const handleAnswer = (idx) => {
    setSelected(idx);
    if (idx === questions[current].answer) {
      setScore(score + 1);
    }
    setTimeout(() => {
      setSelected(null);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
      } else {
        setShowScore(true);
      }
    }, 800);
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setShowScore(false);
    setSelected(null);
  };

  return (
    <div className="trivia-container">
      <h2>Trivia Quiz</h2>
      {showScore ? (
        <div>
          <h3>Your Score: {score} / {questions.length}</h3>
          <button onClick={handleRestart}>Restart</button>
        </div>
      ) : (
        <div>
          <div>
            <strong>Question {current + 1} of {questions.length}:</strong>
          </div>
          <div style={{ margin: '1rem 0' }}>{questions[current].question}</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {questions[current].options.map((opt, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  style={{
                    background: selected === idx
                      ? (idx === questions[current].answer ? '#a5d6a7' : '#ef9a9a')
                      : undefined,
                    minWidth: 200,
                    padding: '0.5rem',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    cursor: selected === null ? 'pointer' : 'default'
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          {selected !== null && (
            <div>
              {selected === questions[current].answer
                ? <span style={{ color: 'green' }}>Correct!</span>
                : <span style={{ color: 'red' }}>Incorrect!</span>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trivia;