// File: server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Recipe API is running!');
});

// Create table schema (run once, or use migration tools)
app.get('/init', async (req, res) => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        instructions TEXT
      );

      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        recipe_id INT REFERENCES recipes(id),
        ingredient_id INT REFERENCES ingredients(id),
        quantity TEXT,
        PRIMARY KEY (recipe_id, ingredient_id)
      );
    `);
        res.send('Tables initialized.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error initializing schema');
    }
});

// Add new recipe (simplified, expects title and instructions only)
app.post('/recipes', async (req, res) => {
    const { title, instructions } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO recipes (title, instructions) VALUES ($1, $2) RETURNING *',
            [title, instructions]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding recipe');
    }
});

// List all recipes
app.get('/recipes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recipes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching recipes');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
