const express = require('express');
const bodyParser = require('body-parser');
const { create } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, 'data', 'products.json');
const mongoose = require('mongoose');
const Product = require('./models/products'); // Asegúrate de importar el modelo


// Inicialización de la app y el servidor HTTP
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());


// Puerto del servidor
const PORT = 8080;


// Configuración de Handlebars
const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main', // Archivo principal para layouts
});
app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    req.io = io; // Agrega `io` al objeto de la solicitud
    next();
});

// Routers
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views'); // Nueva ruta para vistas

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/views', viewsRouter);

// WebSocket
let products = require('./data/products.json'); // Simulación de productos desde archivo JSON

app.get('/home', (req, res) => {
    res.render('home', {
        title: 'Lista de productos',
        products: products, // Pasa los productos a la vista
    });
});

io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    try {
        // Obtener productos desde MongoDB y emitirlos al cliente
        const products = await Product.find();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }

    // Manejar la creación de un producto
    socket.on('addProduct', async (product) => {
        try {
            if (!product.title || !product.description || !product.price) {
                console.error("Producto inválido, falta información importante");
                return;
            }

            // Crear un nuevo producto en MongoDB
            const newProduct = new Product({
                ...product,
                stock: product.stock || 0, // Valor por defecto para el stock
            });
                await newProduct.save();

            // Obtener productos actualizados desde MongoDB
            const products = await Product.find();
            io.emit('updateProducts', products); // Emitir los productos actualizados
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    });

    // Manejar la eliminación de un producto
    socket.on('deleteProduct', async (productId) => {
        try {
            console.log(`Eliminando producto con ID: ${productId}`);

            // Eliminar el producto de MongoDB
            await Product.findByIdAndDelete(productId);

            // Obtener productos actualizados desde MongoDB
            const products = await Product.find();
            io.emit('updateProducts', products); // Emitir los productos actualizados
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado.');
    });
});




// Cambia el `app.listen` a `server.listen`
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});


app.get('/home', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro de búsqueda
    const filter = query
        ? { $or: [{ title: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }] }
        : {};

    // Opciones de paginación
    const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
    };

    try {
        const result = await Product.paginate(filter, options);
        res.render('home', {
            title: 'Lista de productos',
            products: result.docs, // Productos paginados
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            limit: options.limit,
        });
    } catch (error) {
        console.error('Error al obtener productos paginados:', error);
        res.status(500).send('Error al obtener productos paginados');
    }
});


app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find(); // Obtener los productos desde MongoDB
        res.render('realtimeproducts', {
            title: 'Productos en tiempo real',
            products, // Pasamos los productos a la vista
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        res.status(500).send('Error al cargar los productos');
    }
});

app.use('/products', productsRouter); // Esto asegura que '/products' esté asociado con las rutas definidas en productsRouter

mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });