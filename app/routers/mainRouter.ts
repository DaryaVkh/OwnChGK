import express, { Router } from 'express';
import {resolve} from 'path';

const router = Router();

router.get('/*', (req, res) => {
    res.sendFile(resolve("./build/frontend/index.html"));
});

export default router;