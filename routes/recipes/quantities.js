const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Create a new quantity
    router.post('/', async (req, res) => {
        const { name } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO quantities (name) VALUES ($1) RETURNING *',
                [name]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding quantity');
        }
    });

    // Get all quantities
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM quantities ORDER BY name ASC');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching quantities');
        }
    });

    // Update a quantity by id
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const result = await pool.query(
                'UPDATE quantities SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).send('Quantity not found');
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating quantity');
        }
    });

    // Delete a quantity by id
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM quantities WHERE id = $1', [id]);
            res.sendStatus(204);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error deleting quantity');
        }
    });

    return router;
};