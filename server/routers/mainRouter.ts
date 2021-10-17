import express, { Router } from 'express';
import {resolve} from 'path';

const router = Router();

router.get('/', (req, res) => {
    res.sendFile(resolve("../src/index.tsx"));
});

export default router;