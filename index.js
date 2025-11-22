require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const http = require('http');
const app = express();
const server = http.createServer(app);
const WebSocket = require('ws');

app.use(express.json());
let unityClients = [];
let viewerClients = [];

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// WebSocket серверы на разных путях
const unityWss = new WebSocket.Server({
  server,
  path: '/unity',
  clientTracking: false, // Отключаем clientTracking
  idleTimeout: 120000,   // 2 минуты (в миллисекундах)
  handshakeTimeout: 30000  // 30 секунд (в миллисекундах)
});

const viewerWss = new WebSocket.Server({
  server,
  path: '/viewer',
  clientTracking: false, // Отключаем clientTracking
  idleTimeout: 120000,   // 2 минуты (в миллисекундах)
  handshakeTimeout: 30000  // 30 секунд (в миллисекундах)
});

function heartbeat() {
    this.isAlive = true;
}

// Unity - подключение
unityWss.on('connection', (ws) => {
    console.log('Unity WebSocket connected (path /unity)');
    unityClients.push(ws);

    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('error', (error) => {
        console.error('Unity WebSocket error:', error);
    });

    ws.on('message', (message) => {
        console.log('Message from Unity (path /unity):', message);
        for (const v of viewerClients) {
            if (v.readyState === WebSocket.OPEN) {
              try{
                 v.send(message);
              } catch(e){
                 console.error("Viewer send error:", e)
              }
            }
        }
    });

    ws.on('close', () => {
        unityClients = unityClients.filter((c) => c !== ws);
        console.log('Unity WebSocket disconnected');
    });
});

const interval = setInterval(function ping() {
  unityWss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping(() => {});
  });
}, 30000); // Check every 30 seconds - adjust as needed.


// Viewer - подключение
viewerWss.on('connection', (ws, req) => {
    const origin = req.headers.origin; // Получаем origin из headers

    // Проверяем, разрешен ли origin (очень строго! только для примера)
    if (origin !== 'http://localhost:5173') {  //Строгая проверка
        console.log(`Connection blocked from origin: ${origin}`);
        ws.close(); // Закрываем соединение
        return;
    }

    console.log('Viewer WebSocket connected (path /viewer)');
    viewerClients.push(ws);

    ws.on('close', () => {
        viewerClients = viewerClients.filter((c) => c !== ws);
        console.log('Viewer WebSocket disconnected');
    });
});


// Прямая рассылка кадра/пейлоада на Unity через HTTP -> WebSocket
app.post('/to-unity', (req, res) => {
    const payload = JSON.stringify(req.body);
    const recipients = unityClients.filter((c) => c.readyState === WebSocket.OPEN);
    recipients.forEach((client) => client.send(payload));
    res.json({ ok: true, recipients: recipients.length });
});

// Остальные роуты вашего API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));

app.get('/', (req, res) => res.json({ ok: true, msg: 'PT backend' }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (WS /unity and /viewer)`);
});
