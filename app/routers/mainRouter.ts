import {Router} from 'express';
import {resolve} from 'path';

export const mainRouter = () => {
    const router = Router();

    router.get('/*', (req, res) => {
        res.sendFile(resolve('./build/frontend/index.html'));
    });

    return router;
}
