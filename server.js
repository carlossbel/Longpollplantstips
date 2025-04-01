// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(bodyParser.json());

// Almacenamiento en memoria para los consejos
const plantTips = [
  {
    id: 'tip-1',
    title: 'Riego adecuado',
    content: 'La mayoría de las plantas prefieren que el sustrato se seque ligeramente entre riegos. Introduce un dedo en la tierra para comprobar la humedad.',
    category: 'cuidados-basicos',
    plantType: 'todas'
  },
  {
    id: 'tip-2',
    title: 'Luz indirecta',
    content: 'Muchas plantas de interior necesitan luz brillante pero indirecta. Evita la luz solar directa en especies tropicales sensibles.',
    category: 'cuidados-basicos',
    plantType: 'interior'
  },
  {
    id: 'tip-3',
    title: 'Abono en primavera',
    content: 'La primavera es el momento ideal para comenzar a abonar tus plantas, ya que entran en su fase de crecimiento activo.',
    category: 'abonado',
    plantType: 'todas'
  },
  {
    id: 'tip-4',
    title: 'Cuidado con el exceso de agua',
    content: 'El exceso de riego es la causa número uno de muerte en plantas. Asegúrate de que las macetas tengan buen drenaje.',
    category: 'cuidados-basicos',
    plantType: 'todas'
  },
  {
    id: 'tip-5',
    title: 'Rotación regular',
    content: 'Gira tus plantas de interior 1/4 de vuelta cada semana para asegurar un crecimiento equilibrado y uniforme.',
    category: 'cuidados-basicos',
    plantType: 'interior'
  },
  {
    id: 'tip-6',
    title: 'Poda de hojas secas',
    content: 'Retira regularmente las hojas amarillentas o secas para fomentar un nuevo crecimiento y prevenir enfermedades.',
    category: 'poda',
    plantType: 'todas'
  },
  {
    id: 'tip-7',
    title: 'Limpieza de hojas',
    content: 'Limpia las hojas de tus plantas de interior con un paño húmedo para eliminar el polvo y mejorar la fotosíntesis.',
    category: 'cuidados-basicos',
    plantType: 'interior'
  },
  {
    id: 'tip-8',
    title: 'Trasplante oportuno',
    content: 'Trasplanta tus plantas cuando las raíces comienzan a salir por los agujeros de drenaje, generalmente cada 1-2 años.',
    category: 'trasplante',
    plantType: 'todas'
  },
  {
    id: 'tip-9',
    title: 'Sustrato específico',
    content: 'Utiliza sustratos específicos según el tipo de planta: mezclas más drenantes para cactus y suculentas, y más ricas en materia orgánica para tropicales.',
    category: 'sustrato',
    plantType: 'todas'
  },
  {
    id: 'tip-10',
    title: 'Humedad para tropicales',
    content: 'Aumenta la humedad alrededor de tus plantas tropicales agrupándolas o colocando un humidificador cerca.',
    category: 'cuidados-basicos',
    plantType: 'tropicales'
  },
  {
    id: 'tip-11',
    title: 'Protección invernal',
    content: 'En invierno, aleja tus plantas de interior de radiadores y corrientes de aire frío que pueden dañarlas.',
    category: 'estacional',
    plantType: 'interior'
  },
  {
    id: 'tip-12',
    title: 'Reposo vegetativo',
    content: 'Muchas plantas entran en reposo durante el invierno. Reduce el riego y suspende el abonado durante esta temporada.',
    category: 'estacional',
    plantType: 'todas'
  },
  {
    id: 'tip-13',
    title: 'Multiplicación por esquejes',
    content: 'Primavera y verano son ideales para propagar plantas mediante esquejes. Usa hormonas de enraizamiento para mejorar el éxito.',
    category: 'propagacion',
    plantType: 'todas'
  },
  {
    id: 'tip-14',
    title: 'Riego de orquídeas',
    content: 'Las orquídeas prefieren ser regadas sumergiendo la maceta en agua por 15 minutos y luego dejando escurrir completamente.',
    category: 'cuidados-especificos',
    plantType: 'orquideas'
  },
  {
    id: 'tip-15',
    title: 'Cuidado de suculentas',
    content: 'Las suculentas necesitan mucha luz y poco riego. Espera a que el sustrato esté completamente seco antes de volver a regar.',
    category: 'cuidados-especificos',
    plantType: 'suculentas'
  }
];

// Nuevos consejos que se irán añadiendo para simular actualizaciones
const upcomingTips = [
  {
    title: 'Prevención de plagas',
    content: 'Inspecciona regularmente el envés de las hojas buscando plagas. Una detección temprana facilita el control.',
    category: 'plagas',
    plantType: 'todas'
  },
  {
    title: 'Exposición de cactus',
    content: 'Los cactus necesitan aclimatación gradual al sol directo para evitar quemaduras, especialmente después del invierno.',
    category: 'cuidados-especificos',
    plantType: 'cactus'
  },
  {
    title: 'Trasplante de primavera',
    content: 'La primavera temprana es el momento ideal para trasplantar la mayoría de plantas, justo cuando comienzan su ciclo de crecimiento activo.',
    category: 'trasplante',
    plantType: 'todas'
  },
  {
    title: 'Temperatura para plantas tropicales',
    content: 'Mantén tus plantas tropicales a temperaturas superiores a 15°C, evitando fluctuaciones bruscas que pueden estresarlas.',
    category: 'cuidados-especificos',
    plantType: 'tropicales'
  },
  {
    title: 'Jardinería lunar',
    content: 'Según la jardinería biodinámica, sembrar durante la luna creciente favorece el desarrollo de plantas de hojas y flores.',
    category: 'curiosidades',
    plantType: 'todas'
  }
];

// Mapa para almacenar las conexiones de longpolling
const connections = new Map();
// Control de versiones para detectar cambios
let tipVersion = 1;

// Función para simular la adición de nuevos consejos periódicamente
function simulateNewTips() {
  if (upcomingTips.length > 0) {
    const newTip = upcomingTips.shift();
    newTip.id = `tip-${plantTips.length + 1}`;
    plantTips.push(newTip);
    tipVersion++;
    
    // Notificar a todas las conexiones activas
    notifyAllConnections();
    
    // Volver a agregar el consejo al final para ciclar
    upcomingTips.push(newTip);
  }
  
  // Programar la próxima actualización (entre 30 segundos y 2 minutos)
  const nextUpdateTime = Math.floor(Math.random() * (120000 - 30000) + 30000);
  setTimeout(simulateNewTips, nextUpdateTime);
}

// Iniciar el ciclo de simulación
setTimeout(simulateNewTips, 60000);

// Función para notificar a todas las conexiones activas
function notifyAllConnections() {
  connections.forEach((res, id) => {
    try {
      res.json({
        version: tipVersion,
        updated: true,
        message: "Nuevo consejo disponible"
      });
      connections.delete(id);
    } catch (error) {
      console.error(`Error notificando a conexión ${id}:`, error);
      connections.delete(id);
    }
  });
}

// Rutas API
app.get('/', (req, res) => {
  res.json({ message: 'Plant Tips API is running!' });
});

// Endpoint para obtener todos los consejos
app.get('/api/tips', (req, res) => {
  let filteredTips = [...plantTips];
  
  // Filtrar por categoría si se especifica
  if (req.query.category) {
    filteredTips = filteredTips.filter(tip => 
      tip.category === req.query.category
    );
  }
  
  // Filtrar por tipo de planta si se especifica
  if (req.query.plantType) {
    filteredTips = filteredTips.filter(tip => 
      tip.plantType === req.query.plantType || tip.plantType === 'todas'
    );
  }
  
  // Limitar el número de resultados si se especifica
  const limit = parseInt(req.query.limit) || filteredTips.length;
  filteredTips = filteredTips.slice(0, limit);
  
  res.json({
    version: tipVersion,
    tips: filteredTips
  });
});

// Endpoint para obtener un consejo aleatorio
app.get('/api/tips/random', (req, res) => {
  let filteredTips = [...plantTips];
  
  // Filtrar por tipo de planta si se especifica
  if (req.query.plantType) {
    filteredTips = filteredTips.filter(tip => 
      tip.plantType === req.query.plantType || tip.plantType === 'todas'
    );
  }
  
  // Filtrar por categoría si se especifica
  if (req.query.category) {
    filteredTips = filteredTips.filter(tip => 
      tip.category === req.query.category
    );
  }
  
  // Seleccionar un consejo aleatorio
  const randomIndex = Math.floor(Math.random() * filteredTips.length);
  const randomTip = filteredTips[randomIndex];
  
  res.json({
    version: tipVersion,
    tip: randomTip
  });
});

// Endpoint para longpolling
app.get('/api/tips/poll', (req, res) => {
  const clientVersion = parseInt(req.query.version) || 0;
  
  // Si el cliente tiene una versión antigua, enviar actualización inmediatamente
  if (clientVersion < tipVersion) {
    return res.json({
      version: tipVersion,
      updated: true,
      message: "Nuevo consejo disponible"
    });
  }
  
  // Si no hay actualización, mantener la conexión abierta
  const connectionId = uuidv4();
  connections.set(connectionId, res);
  
  // Configurar timeout para la conexión (30 segundos)
  req.setTimeout(30000, () => {
    if (connections.has(connectionId)) {
      connections.delete(connectionId);
      res.json({
        version: tipVersion,
        updated: false,
        message: "No hay actualizaciones disponibles"
      });
    }
  });
  
  // Limpiar la conexión si el cliente se desconecta
  req.on('close', () => {
    connections.delete(connectionId);
  });
});

// Endpoint para obtener un consejo específico por ID
app.get('/api/tips/:id', (req, res) => {
  const tip = plantTips.find(t => t.id === req.params.id);
  
  if (!tip) {
    return res.status(404).json({
      message: "Consejo no encontrado"
    });
  }
  
  res.json({
    version: tipVersion,
    tip: tip
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Plant Tips API running on port ${PORT}`);
});

module.exports = app;