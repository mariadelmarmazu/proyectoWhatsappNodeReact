const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const twilio = require('twilio');
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Crear una instancia de Express
const app = express();
const port = process.env.PORT;

// Configurar Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Configurar conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Configurar middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ruta de la carpeta donde se almacenarán las imágenes
const imagesFolder = path.join(__dirname, 'imagenes');
if (!fs.existsSync(imagesFolder)) {
  fs.mkdirSync(imagesFolder);
}

// Función para descargar la imagen y guardarla en el servidor
const downloadImage = async (url, filepath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath));
  });
};

// Endpoint para recibir mensajes de WhatsApp
app.post('/whatsapp', async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;

  console.log(`Mensaje recibido de ${from}: ${body}`);

  // Asumiendo que el mensaje tiene el formato "familia;subfamilia;nombre;marca;precio;url_imagen"
  const [familia, subfamilia, nombre, marca, precio, urlImagen] = body.split(';');

  // Procesar la imagen
  let imageFilePath = null;
  if (urlImagen) {
    const imageName = `${Date.now()}_${path.basename(urlImagen)}`;
    imageFilePath = path.join(imagesFolder, imageName);
    try {
      await downloadImage(urlImagen, imageFilePath);
      console.log(`Imagen guardada en ${imageFilePath}`);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      return res.sendStatus(500);
    }
  }

  // Insertar o verificar existencia de familia
  const insertOrGetFamiliaId = (familia, callback) => {
    const query = 'SELECT id_familia FROM familia WHERE familia = ?';
    db.query(query, [familia], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length > 0) {
        return callback(null, results[0].id_familia);
      }
      const insertQuery = 'INSERT INTO familia (familia) VALUES (?)';
      db.query(insertQuery, [familia], (err, result) => {
        if (err) {
          return callback(err);
        }
        callback(null, result.insertId);
      });
    });
  };

  // Insertar o verificar existencia de subfamilia
  const insertOrGetSubfamiliaId = (familia, subfamilia, callback) => {
    const query = 'SELECT id_subfamilia FROM subfamilia WHERE subfamilia = ? AND familia = ?';
    db.query(query, [subfamilia, familia], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length > 0) {
        return callback(null, results[0].id_subfamilia);
      }
      const insertQuery = 'INSERT INTO subfamilia (id_subfamilia, familia) VALUES (?, ?)';
      db.query(insertQuery, [id_subfamilia, familia], (err, result) => {
        if (err) {
          return callback(err);
        }
        callback(null, result.insertId);
      });
    });
  };

  // Insertar artículo
  const insertArticulo = (familia, subfamilia, nombre, marca, precio, imagePath, callback) => {
    const query = 'INSERT INTO articulos (familia, subfamilia, nombre, marca, precio, imagen) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [familia, subfamilia, nombre, marca, precio, imagePath], (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result.insertId);
    });
  };

  // Procesar las inserciones en serie
  insertOrGetFamiliaId(familia, (err, id_familia) => {
    if (err) {
      console.error('Error al insertar o recuperar familia:', err);
      return res.sendStatus(500);
    }
    insertOrGetSubfamiliaId(familia, subfamilia, (err, id_subfamilia) => {
      if (err) {
        console.error('Error al insertar o recuperar subfamilia:', err);
        return res.sendStatus(500);
      }
      insertArticulo(familia, subfamilia, nombre, marca, precio, imageFilePath, (err, id_articulo) => {
        if (err) {
          console.error('Error al insertar artículo:', err);
          return res.sendStatus(500);
        }
        console.log('Artículo insertado con éxito:', id_articulo);

        // Responder al mensaje
        client.messages.create({
          body: `Artículo "${nombre}" agregado con éxito a la base de datos.`,
          from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
          to: from
        })
        .then(message => {
          console.log(`Mensaje enviado con SID: ${message.sid}`);
          res.sendStatus(200);
        })
        .catch(err => {
          console.error('Error al enviar mensaje:', err);
          res.sendStatus(500);
        });
      });
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
