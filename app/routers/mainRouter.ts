import {Router} from 'express';
import {resolve} from 'path';

export class MainRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.config();
    }

    private config() {
        this.router.get('/*', (req, res) => {
            res.sendFile(resolve('./build/frontend/index.html'));
        });
    }
}