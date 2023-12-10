const express = require('express');
const path = require('path');
const mysql = require('mysql');

require('dotenv').config();

const session = require('express-session');

const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


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


// start Cerrar sesion
app.post('/logout', (req, res) => {
  if (req.session) {
      req.session.destroy((error) => {
          if (error) {
              return res.status(500).send('No se pudo cerrar la sesión');
          }
          res.send('Sesión cerrada');
      });
  } else {
      res.status(400).send('Sesión no iniciada');
  }
});




// Ruta principal que muestra el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.post('/login', (req, res) => {
    const { rut, clave } = req.body;
    const query = 'SELECT * FROM Usuarios WHERE rut = ?';
  
    connection.query(query, [rut], async (error, results) => {
      if (error) throw error;
  
      if (results.length === 0) {
        return res.status(401).send('Usuario no encontrado.');
      }
  
      const usuario = results[0];
  
      const claveValida = await bcrypt.compare(clave, usuario.clave);
      
      if (!claveValida) {
        return res.status(401).send('Contraseña incorrecta.');
      }
  
      // Redirige según el rol del usuario
      switch (usuario.rol_id) {
        case 1:
          res.json({ success: true, redirectUrl: 'panel-admin.html' });
          break;
          default:
          res.json({ success: true, redirectUrl: 'panel-user.html' });
          break;
      }
    });
  });


// Función para obtener las alertas de la base de datos
app.get('/api/tipoAlertas', (req, res) => {
    const query = 'SELECT id, nombre FROM TiposAlerta';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al obtener las alertas' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron alertas' });
        }

        res.json(results);
    });
});






app.post('/api/cambiarEstadoAlerta', async (req, res) => {
    const { id, estadoId } = req.body;

    try {        
        await db.query('UPDATE Alertas SET estadoId = ? WHERE id = ?', [estadoId, id]);
        res.status(200).send('Estado actualizado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el estado');
    }
});



function buscarUsuario(rut) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Usuarios WHERE rut = ?';
    connection.query(query, [rut], (error, resultados) => {
      if (error) {
        return reject(error);
      }
      if (resultados.length === 0) {
        return resolve(null);
      }
      const usuario = resultados[0];
      resolve(usuario);
    });
  });
}







const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
