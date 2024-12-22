const express = require('express');
const router = express.Router();
const Product = require('../models/products'); // Asegúrate de tener el modelo de producto

// Ruta para la página de inicio
router.get('/home', async (req, res) => {
    try {
        const products = await Product.find(); // Obtener productos desde MongoDB
        res.render('home', { title: 'Inicio', products });
    } catch (error) {
        res.status(500).send('Error al cargar los productos');
    }
});

// Ruta para productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find(); // Obtener productos desde MongoDB
        res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
    } catch (error) {
        res.status(500).send('Error al cargar los productos');
    }
});

module.exports = router;
