import express from 'express';
import { getNutrition } from '../controllers/nutritionController';

const router = express.Router();

router.get('/', getNutrition);

export default router;
