const ES_LOCAL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const API_URL = 'http://localhost:3000/api/incidencias';
const STORAGE_KEY = 'monitor_incidencias_demo_v1';

const DATOS_INICIALES = [
  {
    id: 1,
    municipio: 'Medellín',
    tipoFalla: 'Sobrecarga en transformador',
    precipitacionMm: 34.5,
    usuariosAfectados: 1240,
    estado: 'Resuelto',
    fecha: '2026-11-20'
  },
  {
    id: 2,
    municipio: 'Caucasia',
    tipoFalla: 'Caída de línea por tormenta',
    precipitacionMm: 68.2,
    usuariosAfectados: 3100,
    estado: 'En proceso',
    fecha: '2026-11-21'
  },
  {
    id: 3,
    municipio: 'Apartadó',
    tipoFalla: 'Descarga atmosférica',
    precipitacionMm: 52.0,
    usuariosAfectados: 890,
    estado: 'Pendiente',
    fecha: '2026-11-22'
  }
];

let grafica = null;

const filtroMunicipio = document.getElementById('filtroMunicipio');
const filtroEstado = document.getElementById('filtroEstado');
const formIncidencia = document.getElementById('formIncidencia');
const tablaIncidencias = document.getElementById('tablaIncidencias');

function obtenerDatosLocalStorage() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (!guardado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATOS_INICIALES));
    return [...DATOS_INICIALES];
  }
  return JSON.parse(guardado);
}

function guardarDatosLocalStorage(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

async function cargarIncidencias() {
  const municipio = filtroMunicipio.value;
  const estadoSeleccionado = filtroEstado.value;
  let datos = [];

  if (ES_LOCAL) {
    const respuesta = await fetch(`${API_URL}?municipio=${encodeURIComponent(municipio)}`);
    datos = await respuesta.json();
  } else {
    datos = obtenerDatosLocalStorage();
    if (municipio !== 'Todos') {
      datos = datos.filter(
        (item) => item.municipio.toLowerCase() === municipio.toLowerCase()
      );
    }
  }

  if (estadoSeleccionado !== 'Todos') {
    datos = datos.filter((item) => item.estado === estadoSeleccionado);
  }

  actualizarKPIs(datos);
  renderizarTabla(datos);
  renderizarGrafica(datos);
}

function actualizarKPIs(datos) {
  const total = datos.length;
  const usuarios = datos.reduce((acc, item) => acc + item.usuariosAfectados, 0);
  const lluviaProm = total
    ? (datos.reduce((acc, item) => acc + item.precipitacionMm, 0) / total).toFixed(1)
    : 0;
  const resueltos = datos.filter((item) => item.estado === 'Resuelto').length;
  const efectividad = total ? ((resueltos / total) * 100).toFixed(1) : 0;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiUsuarios').textContent = usuarios.toLocaleString('es-CO');
  document.getElementById('kpiLluvia').textContent = `${lluviaProm} mm`;
  document.getElementById('kpiEfectividad').textContent = `${efectividad}%`;
}

function renderizarTabla(datos) {
  tablaIncidencias.innerHTML = '';

  datos.forEach((item) => {
    const claseBadge = item.estado === 'En proceso' ? 'Proceso' : item.estado;
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${item.fecha}</td>
      <td><strong>${item.municipio}</strong></td>
      <td>${item.tipoFalla}</td>
      <td>${item.precipitacionMm} mm</td>
      <td>${item.usuariosAfectados.toLocaleString('es-CO')}</td>
      <td><span class="badge badge-${claseBadge}">${item.estado}</span></td>
      <td>
        <button class="btn-action" onclick="cambiarEstado(${item.id}, '${item.estado}')">Rotar estado</button>
        <button class="btn-action btn-delete" onclick="eliminarIncidencia(${item.id})">Eliminar</button>
      </td>
    `;
    tablaIncidencias.appendChild(fila);
  });
}

function renderizarGrafica(datos) {
  const agrupado = {};

  datos.forEach((item) => {
    if (!agrupado[item.municipio]) {
      agrupado[item.municipio] = {
        Resuelto: 0,
        'En proceso': 0,
        Pendiente: 0,
        lluvia: 0,
        conteo: 0
      };
    }
    agrupado[item.municipio][item.estado] += item.usuariosAfectados;
    agrupado[item.municipio].lluvia += item.precipitacionMm;
    agrupado[item.municipio].conteo += 1;
  });

  const etiquetas = Object.keys(agrupado);
  const resueltosData = etiquetas.map((m) => agrupado[m].Resuelto);
  const procesoData = etiquetas.map((m) => agrupado[m]['En proceso']);
  const pendientesData = etiquetas.map((m) => agrupado[m].Pendiente);
  const lluviaData = etiquetas.map((m) =>
    Number((agrupado[m].lluvia / agrupado[m].conteo).toFixed(1))
  );

  const ctx = document.getElementById('graficaIncidencias').getContext('2d');
  if (grafica) grafica.destroy();

  grafica = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Resuelto (usuarios)',
          data: resueltosData,
          backgroundColor: 'rgba(34, 197, 94, 0.75)',
          stack: 'usuarios',
          yAxisID: 'y'
        },
        {
          label: 'En proceso (usuarios)',
          data: procesoData,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          stack: 'usuarios',
          yAxisID: 'y'
        },
        {
          label: 'Pendiente (usuarios)',
          data: pendientesData,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          stack: 'usuarios',
          yAxisID: 'y'
        },
        {
          label: 'Lluvia Promedio (mm)',
          data: lluviaData,
          type: 'line',
          borderColor: '#38bdf8',
          backgroundColor: '#38bdf8',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { stacked: true, type: 'linear', position: 'left', ticks: { color: '#94a3b8' } },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#38bdf8' }
        },
        x: { stacked: true, ticks: { color: '#94a3b8' } }
      },
      plugins: {
        legend: { labels: { color: '#f8fafc' } }
      }
    }
  });
}

formIncidencia.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nueva = {
    municipio: document.getElementById('municipio').value,
    tipoFalla: document.getElementById('tipoFalla').value,
    precipitacionMm: Number(document.getElementById('precipitacionMm').value) || 0,
    usuariosAfectados: Number(document.getElementById('usuariosAfectados').value) || 0,
    estado: document.getElementById('estado').value
  };

  if (ES_LOCAL) {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    });
  } else {
    const datos = obtenerDatosLocalStorage();
    datos.unshift({
      id: Date.now(),
      ...nueva,
      fecha: new Date().toISOString().split('T')[0]
    });
    guardarDatosLocalStorage(datos);
  }

  formIncidencia.reset();
  cargarIncidencias();
});

async function cambiarEstado(id, estadoActual) {
  const orden = ['Pendiente', 'En proceso', 'Resuelto'];
  const siguiente = orden[(orden.indexOf(estadoActual) + 1) % orden.length];

  if (ES_LOCAL) {
    await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: siguiente })
    });
  } else {
    const datos = obtenerDatosLocalStorage();
    const indice = datos.findIndex((item) => item.id === id);
    if (indice !== -1) {
      datos[indice].estado = siguiente;
      guardarDatosLocalStorage(datos);
    }
  }

  cargarIncidencias();
}

async function eliminarIncidencia(id) {
  if (ES_LOCAL) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  } else {
    const datos = obtenerDatosLocalStorage().filter((item) => item.id !== id);
    guardarDatosLocalStorage(datos);
  }

  cargarIncidencias();
}

filtroMunicipio.addEventListener('change', cargarIncidencias);
filtroEstado.addEventListener('change', cargarIncidencias);
cargarIncidencias();