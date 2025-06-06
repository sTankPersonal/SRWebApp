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
const initRecipiesRouter = require('./routes/init/recipies')(pool);
const modulesRouter = require('./routes/root/modules')();

// Base route for all recipe-related modules
app.use('/api/recipes/recipies', recipeRouter);
app.use('/api/recipes/ingredients', ingredientsRouter);
app.use('/api/recipes/categories', categoriesRouter);
app.use('/api/recipes/quantities', quantitiesRouter);
app.use('/api/init/recipies', initRecipiesRouter);

// Register the modules route
app.use('/api/modules', modulesRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
