const express = require('express');
const path = require('path');
const mysql = require('mysql');

require('dotenv').config();


const app = express();
app.use(express.json());

// Conexión a la base de datos
const connection = mysql.createConnection({
host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(error => {
    if (error) throw error;
    console.log("Conectado exitosamente a la base de datos.");
});


//Control de sesion navegador web - cookies
app.use(session({
  secret: 'rutaie23#', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que muestra el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


// Ruta API para obtener tipos de alerta
app.get('/api/alertas', (req, res) => {
    connection.query('SELECT * FROM TiposAlerta', (error, resultados) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al obtener los tipos de alerta' });
        }
        res.json(resultados);
    });
});









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
