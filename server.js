import express from 'express';
import logger from './src/middleware/logger';
import indexController from './src/controllers/index';

const app = express();
const port = 8000;

app.use(logger());

app.get('/', indexController);

app.use(logger("Error 404: No route found."))

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
