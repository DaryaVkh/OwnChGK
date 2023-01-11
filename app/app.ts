import {Server} from './server';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });
const port = parseInt(process.env.PORT || '3000');

const starter = new Server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;