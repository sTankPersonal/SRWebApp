const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`CREATE TABLE IF NOT EXISTS recipes (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                instructions TEXT
            );`);
            await client.query(`CREATE TABLE IF NOT EXISTS ingredients (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );`);
            await client.query(`CREATE TABLE IF NOT EXISTS quantities (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );`);
            await client.query(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
                recipe_id INT REFERENCES recipes(id),
                ingredient_id INT REFERENCES ingredients(id),
                quantity_amount NUMERIC CHECK (quantity_amount > 0),
                quantity_id INT REFERENCES quantities(id),
                PRIMARY KEY (recipe_id, ingredient_id)
            );`);
            await client.query(`CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );`);
            await client.query(`CREATE TABLE IF NOT EXISTS recipe_categories (
                recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
                category_id INT REFERENCES categories(id) ON DELETE CASCADE,
                PRIMARY KEY (recipe_id, category_id)
            );`);
            console.log('Tables created or already exist.');

            // Seed categories
            const categories = ['sandwich', 'stovetop', 'quick', 'vegetarian'];
            const categoryIds = {};
            for (const name of categories) {
                const result = await client.query(
                    'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
                    [name]
                );
                categoryIds[name] = result.rows[0].id;
            }
            console.log('Categories seeded:', categoryIds);

            // Seed quantities
            const quantities = ['slice', 'cup', 'tablespoon', 'teaspoon', 'piece'];
            const quantityIds = {};
            for (const name of quantities) {
                const result = await client.query(
                    'INSERT INTO quantities (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
                    [name]
                );
                quantityIds[name] = result.rows[0].id;
            }
            console.log('Quantities seeded:', quantityIds);

            // Seed ingredients
            const ingredients = [
                'ham', 'cheese', 'bread', 'butter', 'rice', 'water', 'salt'
            ];
            const ingredientIds = {};
            for (const name of ingredients) {
                const result = await client.query(
                    'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
                    [name]
                );
                ingredientIds[name] = result.rows[0].id;
            }
            console.log('Ingredients seeded:', ingredientIds);

            // Seed recipes
            const sandwichResult = await client.query(
                `INSERT INTO recipes (title, instructions) VALUES ($1, $2)
                 ON CONFLICT (title) DO UPDATE SET instructions=EXCLUDED.instructions RETURNING id`,
                [
                    'Ham and Cheese Sandwich',
                    '1. Butter the bread slices. 2. Place ham and cheese between bread. 3. Grill or toast as desired.'
                ]
            );
            const sandwichId = sandwichResult.rows[0].id;

            const riceResult = await client.query(
                `INSERT INTO recipes (title, instructions) VALUES ($1, $2)
                 ON CONFLICT (title) DO UPDATE SET instructions=EXCLUDED.instructions RETURNING id`,
                [
                    'Rice on the Stovetop',
                    '1. Rinse rice. 2. Add rice, water, and salt to pot. 3. Bring to boil, then simmer covered until water is absorbed.'
                ]
            );
            const riceId = riceResult.rows[0].id;
            console.log('Recipes seeded:', { sandwichId, riceId });

            // Seed recipe_ingredients for Ham and Cheese Sandwich
            await client.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_amount, quantity_id)
                 VALUES
                 ($1, $2, 2, $3),
                 ($1, $4, 2, $3),
                 ($1, $5, 1, $6),
                 ($1, $7, 1, $8)
                 ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
                [
                    sandwichId,
                    ingredientIds['bread'], quantityIds['slice'],
                    ingredientIds['cheese'], quantityIds['slice'],
                    ingredientIds['ham'], quantityIds['slice'],
                    ingredientIds['butter'], quantityIds['tablespoon']
                ]
            );
            // Seed recipe_ingredients for Rice on the Stovetop
            await client.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_amount, quantity_id)
                 VALUES
                 ($1, $2, 1, $3),
                 ($1, $4, 2, $5),
                 ($1, $6, 0.5, $7)
                 ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
                [
                    riceId,
                    ingredientIds['rice'], quantityIds['cup'],
                    ingredientIds['water'], quantityIds['cup'],
                    ingredientIds['salt'], quantityIds['teaspoon']
                ]
            );
            console.log('Recipe ingredients seeded.');

            // Seed recipe_categories for Ham and Cheese Sandwich
            await client.query(
                `INSERT INTO recipe_categories (recipe_id, category_id)
                 VALUES ($1, $2), ($1, $3)
                 ON CONFLICT DO NOTHING`,
                [sandwichId, categoryIds['sandwich'], categoryIds['quick']]
            );
            // Seed recipe_categories for Rice on the Stovetop
            await client.query(
                `INSERT INTO recipe_categories (recipe_id, category_id)
                 VALUES ($1, $2), ($1, $3)
                 ON CONFLICT DO NOTHING`,
                [riceId, categoryIds['stovetop'], categoryIds['vegetarian']]
            );
            console.log('Recipe categories seeded.');

            await client.query('COMMIT');
            res.send('Tables initialized and seeded.');
        } catch (err) {
            if (client) await client.query('ROLLBACK');
            console.error(err);
            res.status(500).send('Error initializing or seeding schema');
        } finally {
            if (client) client.release();
        }
    });

    return router;
};