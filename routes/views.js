const express = require('express');
const router = express.Router();
const products = require('../data/products.json'); // Asegúrate de tener la estructura.

router.get('/home', (req, res) => {
    res.render('home', { title: 'Inicio', products });
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
});

module.exports = router;
