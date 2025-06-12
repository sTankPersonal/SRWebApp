const express = require('express');
const https = require('https');
const router = express.Router();

// In-memory store for 10 trivia questions
let triviaQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: 0
  },
  // ...add 9 more questions in the same format
];

// Helper to format OpenTDB questions
function formatOpenTDBQuestions(apiResults) {
  return apiResults.map((q, idx) => {
    // Combine correct and incorrect answers, shuffle, and track correct index
    const options = [...q.incorrect_answers, q.correct_answer];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    const answer = options.indexOf(q.correct_answer);
    return {
      id: idx + 1,
      question: q.question,
      options,
      answer
    };
  });
}

// Get all trivia questions
router.get('/', (req, res) => {
  res.json(triviaQuestions);
});

// Admin: Update all questions manually
router.put('/', (req, res) => {
  if (!Array.isArray(req.body) || req.body.length !== 10) {
    return res.status(400).json({ error: "Must provide exactly 10 questions." });
  }
  triviaQuestions = req.body;
  res.json({ success: true });
});

function getOpenTDBQuestions(callback) {
  https.get('https://opentdb.com/api.php?amount=10&type=multiple', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        callback(null, json);
      } catch (err) {
        callback(err);
      }
    });
  }).on('error', (err) => {
    callback(err);
  });
}

// Admin: Refresh questions from OpenTDB
router.post('/refresh', (req, res) => {
  getOpenTDBQuestions((err, data) => {
    if (err || !data.results || data.results.length !== 10) {
      return res.status(500).json({ error: 'Failed to fetch 10 questions from OpenTDB.' });
    }
    triviaQuestions = formatOpenTDBQuestions(data.results);
    res.json({ success: true, questions: triviaQuestions });
  });
});

module.exports = router;