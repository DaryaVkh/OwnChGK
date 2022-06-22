import {Router} from 'express';
import {resolve} from 'path';

export const adminAccess = new Set(["superadmin", "admin"]);
export const superAdminAccess = new Set(["superadmin"]);

export const mainRouter = () => {
    const router = Router();

    router.get('/*', (req, res) => {
        if (req.protocol == 'http') {
            res.redirect('https://' +
                req.get('host') + req.originalUrl);
        }
        res.sendFile(resolve('./build/frontend/index.html'));
    });

    return router;
}
