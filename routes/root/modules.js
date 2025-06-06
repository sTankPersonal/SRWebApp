const express = require('express');

module.exports = () => {
    const router = express.Router();

    // GET /api/modules - List all available modules
    router.get('/', (req, res) => {
        res.json({
            modules: [
                { name: 'recipies', path: '/api/recipes' },
            ]
        });
    });

    return router;
};