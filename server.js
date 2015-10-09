import express from 'express';
import logger from './src/middleware/logger';
import authorize from './src/middleware/auth';
import indexController from './src/controllers/index';
import authController from './src/controllers/auth';

const app = express();

// normal middleware
app.use(logger('hi'));

// controllers
app.use(authController());

// tests
// TODO: get rid of these, eventually
app.get('/', indexController);
app.get('/protected', authorize());

export default app;
