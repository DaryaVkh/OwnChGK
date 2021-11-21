import server from './server';
import * as WebSocket from 'ws';

const port = parseInt(process.env.PORT || '3000');
let timeout;
const wss = new WebSocket.Server({port: 80});
let isOpen = false;
const secondPerQuestion = 70000;
const extraSeconds = 10000;

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        if (isOpen) {
            console.log('received: %s', message);
        }
        if (message == "+10sec") {
            //тут проверочку навернуть, что это админ отправил
            const pastDelay = Math.ceil(process.uptime() * 1000 - timeout._idleStart);
            const initialDelay = timeout._idleTimeout;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log("added time end")
            }, initialDelay - pastDelay + extraSeconds); // может быть косяк с очисткой таймаута, но хз. пока не косячило
        } else if (message == "Start") {
            //и тут тоже
            console.log("startuem")
            isOpen = true;
            timeout = setTimeout(() => {
                isOpen = false;
                console.log("stopim")
            }, secondPerQuestion);
        }
    });
    ws.send('Hi there, I am a WebSocket server');
});

const starter = new server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;