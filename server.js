import express from 'express';
import logger from './src/middleware/logger';
import loggingController from './src/controllers/logging';

const app = express();

app.use(logger());

app.get('/', loggingController);

export default app;
