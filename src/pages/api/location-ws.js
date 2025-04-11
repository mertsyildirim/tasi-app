import { Server } from 'ws';

const locationWs = new Server({ noServer: true });

// Bağlı istemcileri tutacak Map
const clients = new Map();

locationWs.on('connection', (ws, req) => {
  const driverId = req.url.split('?driverId=')[1];
  if (driverId) {
    clients.set(driverId, ws);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        // Tüm admin istemcilerine konum bilgisini gönder
        clients.forEach((client) => {
          if (client.readyState === 1) { // OPEN
            client.send(JSON.stringify({
              type: 'location',
              driverId: driverId,
              latitude: data.latitude,
              longitude: data.longitude,
              timestamp: new Date().toISOString()
            }));
          }
        });
      } catch (error) {
        console.error('Mesaj işlenirken hata:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(driverId);
    });
  }
});

export default function handler(req, res) {
  if (!res.socket.server.ws) {
    res.socket.server.ws = locationWs;
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 