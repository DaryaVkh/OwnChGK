import express, {Request, Response, Router} from 'express';
import AdminsController from '../controllers/adminsController';
import {roleMiddleware} from '../middleware/roleMiddleware';

const router = Router();
const adminsController = new AdminsController();

router.get('/', roleMiddleware(true), adminsController.getAll);
router.post('/login', adminsController.login);
router.post('/add', adminsController.insert);
router.post('/logout', adminsController.logout);

export default router;