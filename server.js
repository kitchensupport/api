import express from 'express';
import logger from './src/middleware/logger';
import indexController from './src/controllers/index';

const app = express();

app.use(logger('hi'));

app.get('/', indexController);

export default app;
