const express = require('express');
const path = require('path');
const mysql = require('mysql');
const QRCode = require('qrcode');
const cors = require('cors');

require('dotenv').config();

const session = require('express-session');

const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

app.use(cors());

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
  cookie: { secure: false }
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

// Ruta principal que muestra el login
app.get('/', (req, res) => {    
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Verificacion credenciales
app.post('/', (req, res) => {
    const { rut, clave } = req.body;
    const query = 'SELECT * FROM Usuarios WHERE rut = ?';
  
    connection.query(query, [rut], async (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en el servidor');
        }
    
        if (results.length === 0) {
            return res.status(401).send('Usuario no encontrado.');
        }
    
        const usuario = results[0];
        const claveValida = await bcrypt.compare(clave, usuario.clave);
        
        if (!claveValida) {
            return res.status(401).send('Contraseña incorrecta.');
        }
    
        // Establecer la sesión del usuario aquí
        req.session.usuario = { id: usuario.id, rol: usuario.rol_id };        


        switch (usuario.rol_id) {
            case 1:
                res.json({ success: true, redirectUrl: '/panel-admin' });
                break;
            default:
                res.json({ success: true, redirectUrl: 'panel-user.html' });
                break;
        }
    });
});

// Middleware que verifica si el usuario está autenticado
function verificarAutenticacion(req, res, next) {
    if (req.session.usuario && req.session.usuario.rol === 1) {
        next();
    } else {
        res.status(401).send('No autorizado');
    }
}

// Middleware para proteger la ruta que sirve
app.get('/panel-admin', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'panel-admin.html'));
});

app.get('/panel-user.html', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'panel-user.html'));
});

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

app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT u.nombre, u.email, r.nombre as rol, u.rut, i.nombre as institucion '+
    'FROM Usuarios u '+
    'JOIN Roles r ON u.rol_id = r.id '+
    'JOIN Institucion i ON u.institucion_id = i.id';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al obtener las usuarios' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron usuarios' });
        }

        res.json(results);
    });
});

app.post('/crear-usuario', (req, res) => {
    const { rut, nombre, email, rolId, institucionId } = req.body;

    // Generar la clave a partir del rut, quitando los dos últimos caracteres
    const claveGenerada = rut.slice(0, -2);

    // Cifrar la clave antes de guardarla en la base de datos
    bcrypt.hash(claveGenerada, 10, function(err, hash) {
        if (err) {
            console.error('Error al cifrar la clave:', err);
            return res.status(500).json({ mensaje: 'Error al crear el usuario' });
        }

        // Insertar el usuario en la base de datos
        const query = 'INSERT INTO Usuarios (nombre, email, rol_id, rut, clave, institucion_id) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(query, [nombre, email, rolId, rut, hash, institucionId], (error, results) => {
            if (error) {
                console.error('Error al insertar en la base de datos:', error);
                return res.status(500).json({ mensaje: 'Error al crear el usuario' });
            }

            console.log(`Usuario creado con éxito. ID: ${results.insertId}`);
            res.json({ mensaje: 'Usuario creado con éxito', id: results.insertId });
        });
    });
});

app.get('/api/roles', (req, res) => {
    const query = 'SELECT * FROM Roles';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al obtener los roles' });
        }
        res.json(results);
    });
});

app.get('/api/instituciones', (req, res) => {
    const query = 'SELECT * FROM Institucion';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al obtener las instituciones' });
        }
        res.json(results);
    });
});

app.post('/crear-institucion', (req, res) => {
    const { nombre, detalle } = req.body;
  
    const query = 'INSERT INTO Institucion (nombre, descripcion) VALUES (?, ?)';
    connection.query(query, [nombre, detalle], (err, results) => {
      if (err) {
        console.error('Error al insertar en la base de datos:', err);
        res.status(500).json({ message: 'Error al crear la institución' });
        return;
      }      
      res.json({ message: 'Institución creada con éxito', id: results.insertId });
    });
}); 

app.get('/api/ubicaciones', (req, res) => {
    const query = 'SELECT u.nombre as nombre, u.descripcion as descripcion, i.nombre as institucion '+
    'FROM Ubicaciones u '+
    'JOIN Institucion i ON i.id = u.institucion_id';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al obtener las ubicaciones' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron ubicaciones' });
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

app.get('/generateQR', (req, res) => {
    const { institucionId, ubicacionId } = req.query;

    // Primero, validamos que ambos IDs fueron proporcionados
    if (!institucionId || !ubicacionId) {
        return res.status(400).json({ error: 'Se requieren los IDs de institución y ubicación' });
    }

    // Opcional: Buscar en la base de datos para asegurar que los IDs son válidos
    const query = 'SELECT u.nombre AS ubicacionNombre, i.nombre AS institucionNombre '+
                  'FROM Ubicaciones u '+
                  'JOIN Institucion i ON i.id = u.institucion_id '+
                  'WHERE u.id = ? AND i.id = ?';
    connection.query(query, [ubicacionId, institucionId], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ mensaje: 'Error al validar la institución y ubicación' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron la institución o ubicación con los IDs proporcionados' });
        }

        // Si todo es correcto, generamos el URL para el QR
        const { ubicacionNombre, institucionNombre } = results[0];
        const qrUrl = `https://eithelgonzalezrojas.cl/menu.html?institucionId=${institucionId}&ubicacionId=${ubicacionId}&institucionNombre=${encodeURIComponent(institucionNombre)}&ubicacionNombre=${encodeURIComponent(ubicacionNombre)}`;

        // Generar el código QR
        QRCode.toDataURL(qrUrl, (err, dataUrl) => {
            if (err) {
                res.status(500).json({ error: 'Error al generar el código QR' });
            } else {
                res.json({ qrCode: dataUrl });
            }
        });
    });
});


app.post('/crear-ubicacion', (req, res) => {
    const { nombre, detalle, institucionId } = req.body;
  
    const query = 'INSERT INTO Ubicaciones (nombre, descripcion, institucion_id) VALUES (?, ?, ?)';
    connection.query(query, [nombre, detalle, institucionId], (err, results) => {
      if (err) {
        console.error('Error al insertar en la base de datos:', err);
        res.status(500).json({ message: 'Error al crear la ubicación' });
        return;
      }
      res.json({ message: 'Ubicacion creada con éxito', id: results.insertId });
    });
}); 

app.get('/api/ubicaciones/:institucionId', (req, res) => {
    const { institucionId } = req.params;
  
    const query = 'SELECT * FROM Ubicaciones WHERE institucion_id = ?';
    connection.query(query, [institucionId], (err, results) => {
        if (err) {
            console.error('Error al consultar las ubicaciones:', err);
            res.status(500).json({ message: 'Error al obtener las ubicaciones' });
            return;
        }
        res.json(results);
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
