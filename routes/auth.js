import express from 'express';

const router = express.Router();

import { login, register } from '../controllers/auth.js';
import upload from '../helpers/imageUpload.js';

// /register
router.post("/register", upload.single("photo"), register);
router.post('/login', login);

export default router;

