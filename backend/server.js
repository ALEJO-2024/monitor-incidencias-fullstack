const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data', 'incidencias.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const leerDatos = () => {
  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(contenido);
};

const guardarDatos = (datos) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(datos, null, 2), 'utf-8');
};

// Obtener todas las incidencias (con filtro opcional por municipio)
app.get('/api/incidencias', (req, res) => {
  const { municipio } = req.query;
  let datos = leerDatos();

  if (municipio && municipio !== 'Todos') {
    datos = datos.filter(
      (item) => item.municipio.toLowerCase() === municipio.toLowerCase()
    );
  }

  res.json(datos);
});

// Registrar una nueva incidencia
app.post('/api/incidencias', (req, res) => {
  const { municipio, tipoFalla, precipitacionMm, usuariosAfectados, estado } = req.body;

  if (!municipio || !tipoFalla) {
    return res.status(400).json({ error: 'Municipio y tipo de falla son obligatorios.' });
  }

  const datos = leerDatos();
  const nuevaIncidencia = {
    id: Date.now(),
    municipio,
    tipoFalla,
    precipitacionMm: Number(precipitacionMm) || 0,
    usuariosAfectados: Number(usuariosAfectados) || 0,
    estado: estado || 'Pendiente',
    fecha: new Date().toISOString().split('T')[0]
  };

  datos.unshift(nuevaIncidencia);
  guardarDatos(datos);
  res.status(201).json(nuevaIncidencia);
});

// Actualizar el estado de una incidencia
app.patch('/api/incidencias/:id', (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;
  const datos = leerDatos();
  const indice = datos.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Incidencia no encontrada.' });
  }

  datos[indice].estado = estado;
  guardarDatos(datos);
  res.json(datos[indice]);
});

// Eliminar una incidencia
app.delete('/api/incidencias/:id', (req, res) => {
  const id = Number(req.params.id);
  const datos = leerDatos();
  const filtrados = datos.filter((item) => item.id !== id);

  if (datos.length === filtrados.length) {
    return res.status(404).json({ error: 'Incidencia no encontrada.' });
  }

  guardarDatos(filtrados);
  res.json({ mensaje: 'Incidencia eliminada correctamente.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});