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

// Import routers
const recipeRouter = require('./routes/recipes/recipe')(pool);
const ingredientsRouter = require('./routes/recipes/ingredients')(pool);
const categoriesRouter = require('./routes/recipes/categories')(pool);
const quantitiesRouter = require('./routes/recipes/quantities')(pool);

// Base route for all recipe-related modules
app.use('/recipes/recipies', recipeRouter);
app.use('/recipes/ingredients', ingredientsRouter);
app.use('/recipes/categories', categoriesRouter);
app.use('/recipes/quantities', quantitiesRouter);

// Create table schema (run once, or use migration tools)
app.get('/init/recipies', async (req, res) => {
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

      CREATE TABLE IF NOT EXISTS quantities (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        recipe_id INT REFERENCES recipes(id),
        ingredient_id INT REFERENCES ingredients(id),
        quantity_amount NUMERIC CHECK (quantity_amount > 0),
        quantity_id INT REFERENCES quantities(id),
        PRIMARY KEY (recipe_id, ingredient_id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipe_categories (
        recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (recipe_id, category_id)
      );
    `);
        res.send('Tables initialized.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error initializing schema');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
