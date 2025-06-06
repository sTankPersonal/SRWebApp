const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Create a new ingredient
    router.post('/', async (req, res) => {
        const { name } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) RETURNING *',
                [name]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding ingredient');
        }
    });

    // Get all ingredients
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM ingredients ORDER BY name ASC');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching ingredients');
        }
    });

    // Update an ingredient by id
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const result = await pool.query(
                'UPDATE ingredients SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).send('Ingredient not found');
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating ingredient');
        }
    });

    // Delete an ingredient by id
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM ingredients WHERE id = $1', [id]);
            res.sendStatus(204);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error deleting ingredient');
        }
    });

    return router;
};