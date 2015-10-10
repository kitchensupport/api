import express from 'express';
import cors from './src/middleware/cors';
import logger from './src/middleware/logger';
import {authorize} from './src/middleware/auth';
import loggingController from './src/controllers/logging';
import {routes as authRouter} from './src/controllers/auth';

const app = express();

// middleware
app.use(cors());
app.use(logger());

// controllers
app.use(authRouter());

app.get('/', loggingController);
app.get('/protected', authorize());

export default app;
