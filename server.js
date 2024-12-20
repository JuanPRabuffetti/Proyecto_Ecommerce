const express = require('express');
const bodyParser = require('body-parser');
const { create } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, 'data', 'products.json');
const mongoose = require('mongoose');


// Inicialización de la app y el servidor HTTP
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());


// Puerto del servidor
const PORT = 8080;

const readFile = () => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error('Error leyendo el archivo:', error);
        return [];
    }
};

const writeFile = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log('Archivo guardado correctamente');
    } catch (error) {
        console.error('Error escribiendo el archivo:', error);
    }
};


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

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emitir productos al cliente cuando se conecta
    const products = readFile();
    socket.emit('updateProducts', products);

    // Manejar la creación de un producto
    socket.on('addProduct', (product) => {
        if (!product.title || !product.description || !product.price) {
            console.error("Producto inválido, falta información importante");
            return;
        }

        const products = readFile();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newId, ...product };

        products.push(newProduct);
        writeFile(products);

        io.emit('updateProducts', products); // Emitir los productos actualizados
    });

    // Manejar la eliminación de un producto
    socket.on('deleteProduct', (productId) => {
        console.log(`Eliminando producto con ID: ${productId}`);

        const products = readFile();
        const productIdNum = parseInt(productId, 10);
        const updatedProducts = products.filter(product => product.id !== productIdNum);

        writeFile(updatedProducts);

        io.emit('updateProducts', updatedProducts); // Emitir los productos actualizados
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado.');
    });
});

// Cambia el `app.listen` a `server.listen`
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts', {
        title: 'Productos en tiempo real',
    });
});


mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });