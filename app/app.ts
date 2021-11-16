import server from './server';
import * as WebSocket from 'ws';

const port = parseInt(process.env.PORT || '3000');

const wss = new WebSocket.Server({ port: 80 });

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
    ws.send('Hi there, I am a WebSocket server');
});

const starter = new server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;