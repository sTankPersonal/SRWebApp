const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Add new recipe (expects title and instructions only)
    router.post('/', async (req, res) => {
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

    // List all recipes with pagination and optional filtering by ingredient or category
    router.get('/', async (req, res) => {
        // Query params: page, pageSize, ingredient_id, category_id
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const { ingredient_id, category_id } = req.query;

        let baseQuery = 'SELECT DISTINCT r.* FROM recipes r';
        let countQuery = 'SELECT COUNT(DISTINCT r.id) FROM recipes r';
        const whereClauses = [];
        const params = [];
        let paramIndex = 1;

        // Join for ingredient filter
        if (ingredient_id) {
            baseQuery += ' JOIN recipe_ingredients ri ON r.id = ri.recipe_id';
            countQuery += ' JOIN recipe_ingredients ri ON r.id = ri.recipe_id';
            whereClauses.push(`ri.ingredient_id = $${paramIndex++}`);
            params.push(ingredient_id);
        }

        // Join for category filter
        if (category_id) {
            baseQuery += ' JOIN recipe_categories rc ON r.id = rc.recipe_id';
            countQuery += ' JOIN recipe_categories rc ON r.id = rc.recipe_id';
            whereClauses.push(`rc.category_id = $${paramIndex++}`);
            params.push(category_id);
        }

        if (whereClauses.length > 0) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
            countQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        baseQuery += ` ORDER BY r.id DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSize, offset);

        try {
            // Get total count for pagination
            const countResult = await pool.query(countQuery, params.slice(0, params.length - 2));
            const total = parseInt(countResult.rows[0].count, 10);

            // Get paginated recipes
            const result = await pool.query(baseQuery, params);
            res.json({
                page,
                pageSize,
                total,
                recipes: result.rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching recipes');
        }
    });

    // Get a recipe by ID (with ingredients and categories)
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const recipeResult = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
            if (recipeResult.rows.length === 0) {
                return res.status(404).send('Recipe not found');
            }
            const recipe = recipeResult.rows[0];

            // Get ingredients
            const ingredientsResult = await pool.query(
                `SELECT i.id, i.name, ri.quantity_amount, q.name AS quantity
                 FROM recipe_ingredients ri
                 JOIN ingredients i ON ri.ingredient_id = i.id
                 LEFT JOIN quantities q ON ri.quantity_id = q.id
                 WHERE ri.recipe_id = $1`, [id]
            );

            // Get categories
            const categoriesResult = await pool.query(
                `SELECT c.id, c.name
                 FROM recipe_categories rc
                 JOIN categories c ON rc.category_id = c.id
                 WHERE rc.recipe_id = $1`, [id]
            );

            res.json({
                ...recipe,
                ingredients: ingredientsResult.rows,
                categories: categoriesResult.rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching recipe');
        }
    });

    // Search recipes by title (case-insensitive, partial match)
    router.get('/search/:query', async (req, res) => {
        const { query } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM recipes WHERE LOWER(title) LIKE LOWER($1) ORDER BY id DESC',
                [`%${query}%`]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error searching recipes');
        }
    });

    // Edit a recipe (title and instructions)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { title, instructions } = req.body;
        try {
            const result = await pool.query(
                'UPDATE recipes SET title = $1, instructions = $2 WHERE id = $3 RETURNING *',
                [title, instructions, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).send('Recipe not found');
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating recipe');
        }
    });

    // Delete a recipe
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
            res.sendStatus(204);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error deleting recipe');
        }
    });

    // Add an ingredient to a recipe
    router.post('/:id/ingredients', async (req, res) => {
        const { id } = req.params;
        const { ingredient_id, quantity_amount, quantity_id } = req.body;
        try {
            await pool.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_amount, quantity_id)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (recipe_id, ingredient_id) DO UPDATE
                 SET quantity_amount = EXCLUDED.quantity_amount, quantity_id = EXCLUDED.quantity_id`,
                [id, ingredient_id, quantity_amount, quantity_id]
            );
            res.sendStatus(201);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding ingredient to recipe');
        }
    });

    // Remove an ingredient from a recipe
    router.delete('/:id/ingredients/:ingredient_id', async (req, res) => {
        const { id, ingredient_id } = req.params;
        try {
            await pool.query(
                'DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id = $2',
                [id, ingredient_id]
            );
            res.sendStatus(204);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error removing ingredient from recipe');
        }
    });

    // Add a category to a recipe
    router.post('/:id/categories', async (req, res) => {
        const { id } = req.params;
        const { category_id } = req.body;
        try {
            await pool.query(
                `INSERT INTO recipe_categories (recipe_id, category_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [id, category_id]
            );
            res.sendStatus(201);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding category to recipe');
        }
    });

    // Remove a category from a recipe
    router.delete('/:id/categories/:category_id', async (req, res) => {
        const { id, category_id } = req.params;
        try {
            await pool.query(
                'DELETE FROM recipe_categories WHERE recipe_id = $1 AND category_id = $2',
                [id, category_id]
            );
            res.sendStatus(204);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error removing category from recipe');
        }
    });

    return router;
};