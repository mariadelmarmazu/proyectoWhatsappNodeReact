// Importamos las dependencias necesarias
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const twilio = require('twilio');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

// Configuración del servidor Express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear carpeta 'imagenes' si no existe
const imageDir = path.join(__dirname, 'imagenes');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
}

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'imagenes/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Reemplaza con tu Account SID de Twilio
const authToken = process.env.TWILIO_AUTH_TOKEN; // Reemplaza con tu Auth Token de Twilio
const client = twilio(accountSid, authToken);

// Función para obtener el id de una familia por su nombre
const getFamilyId = (familyName) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id_familia FROM familia WHERE familia = ?';
        db.query(query, [familyName], (err, results) => {
            if (err) reject(err);
            resolve(results.length ? results[0].id_familia : null);
        });
    });
};

// Función para obtener el id de una subfamilia por su nombre y id de familia
const getSubFamilyId = (subFamilyName, familyId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id_subfamilia FROM subfamilia WHERE subfamilia = ? AND familia = ?';
        db.query(query, [subFamilyName, familyId], (err, results) => {
            if (err) reject(err);
            resolve(results.length ? results[0].id_subfamilia : null);
        });
    });
};

// Función para descargar la imagen desde la URL y guardarla en el servidor
const downloadImage = async (url, filepath) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN
          }
    });/*
    return new Promise((resolve, reject) => {
        const writer = require('fs').createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    };*/
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
                resolve(filepath);
            }
        });
    });
};

// Endpoint para recibir mensajes de WhatsApp desde Twilio
app.post('/whatsapp', async (req, res) => {
    try {
        // Desestructuramos los campos del cuerpo de la solicitud
        const { Body, From, MediaUrl0 } = req.body;

        // El mensaje recibido se espera que tenga el formato: familia;subfamilia;nombreArticulo;marca;precio
        const [familia, subfamilia, nombreArticulo, marca, precio] = Body.split(';');

        // Descargar la imagen si existe MediaUrl0
        let imageUrl = '';
        if (MediaUrl0) {
            const filename = `imagen-${uuidv4()}${path.extname(MediaUrl0)}`;
            const filepath = path.join(imageDir, filename);
            await downloadImage(MediaUrl0, filepath);
            imageUrl = filepath;
        }

        // Verificamos si la familia existe, si no, la creamos
        let familyId = await getFamilyId(familia);
        if (!familyId) {
            const query = 'INSERT INTO familia (familia) VALUES (?)';
            const result = await new Promise((resolve, reject) => {
                db.query(query, [familia], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            familyId = result.insertId;
        }

        // Verificamos si la subfamilia existe, si no, la creamos
        let subFamilyId = await getSubFamilyId(subfamilia, familyId);
        if (!subFamilyId) {
            const query = 'INSERT INTO subfamilia (familia, subfamilia) VALUES (?, ?)';
            const result = await new Promise((resolve, reject) => {
                db.query(query, [familyId, subfamilia], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            subFamilyId = result.insertId;
        }

        // Insertamos el artículo en la tabla de artículos
        const query = 'INSERT INTO articulos (familia, subfamilia, nombre, marca, precio, imagen) VALUES (?, ?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
            db.query(query, [familyId, subFamilyId, nombreArticulo, marca, parseFloat(precio), imageUrl], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        res.status(200).send('Producto añadido con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocurrió un error');
    }
});


//obtener los articulos de la tienda
app.get('/tienda', (req, res) => {
    const query = 'SELECT * FROM articulos';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Ocurrió un error al obtener los artículos');
        }
        res.json(results);
    });
});


// Iniciamos el servidor en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor iniciado en el puerto 3030');
});