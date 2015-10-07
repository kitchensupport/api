import express from 'express';
import logger from './src/middleware/logger';
import database from './src/middleware/database';
import indexController from './src/controllers/index';

const app = express();
const port = 8000;

app.use(logger('hi'));
app.use(database());

app.get('/', indexController);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
