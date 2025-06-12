const express = require('express');
const fetch = require('node-fetch'); // If using Node 18+, you can use global fetch
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

// Admin: Refresh questions from OpenTDB
router.post('/refresh', async (req, res) => {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await response.json();
    if (!data.results || data.results.length !== 10) {
      return res.status(500).json({ error: 'Failed to fetch 10 questions from OpenTDB.' });
    }
    triviaQuestions = formatOpenTDBQuestions(data.results);
    res.json({ success: true, questions: triviaQuestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions from OpenTDB.' });
  }
});

module.exports = router;