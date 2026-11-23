# ⚡ Monitor de Incidencias y Clima Municipal

🔗 **Demo en vivo:** [https://monitor-incidencias-alejo.netlify.app](https://monitor-incidencias-alejo.netlify.app)

Aplicación web full-stack para registrar incidencias operativas, consultar su estado y analizar la relación entre usuarios afectados, precipitación (`mm`) y efectividad de cierre a nivel municipal.

## 🚀 Funcionalidades principales
* **Operaciones CRUD completas:** Creación de nuevas incidencias, rotación de estados (`Pendiente` → `En proceso` → `Resuelto`) y eliminación de registros persistidos en JSON.
* **Filtros dinámicos:** Consulta en tiempo real por municipio y por estado.
* **KPIs en vivo:** Cálculo automático de total de incidencias, usuarios afectados, precipitación promedio y porcentaje de efectividad de cierre.
* **Visualización interactiva:** Gráfica combinada con Chart.js que apila usuarios afectados por estado y contrasta la precipitación promedio por municipio.

## 🛠️ Stack tecnológico
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS), Chart.js.
* **Backend:** Node.js, Express, CORS.
* **Persistencia:** Archivo JSON (`backend/data/incidencias.json`) servido mediante API REST.

## 📁 Estructura del proyecto
```text
monitor-incidencias-fullstack/
├── backend/
│   ├── data/
│   │   └── incidencias.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .gitignore
└── README.md
```

## 💻 Instalación y ejecución local
1. Clona el repositorio:
   ```bash
   git clone [https://github.com/ALEJO-2024/monitor-incidencias-fullstack.git](https://github.com/ALEJO-2024/monitor-incidencias-fullstack.git)
   ```
2. Entra a la carpeta del backend e instala las dependencias:
   ```bash
   cd monitor-incidencias-fullstack/backend
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. Abre tu navegador en `http://localhost:3000`.
