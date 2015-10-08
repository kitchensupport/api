import express from 'express';
import logger from './src/middleware/logger';
import {instantiateDatabase, bookshelf} from './src/utils/database';
import indexController from './src/controllers/index';

const app = express();

// Initalize the database.
instantiateDatabase();

app.use(logger('hi'));

app.get('/', indexController);

export default app;
