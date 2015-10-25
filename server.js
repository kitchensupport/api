import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import {authorize} from './src/middleware/auth';
import {routes as authRouter} from './src/controllers/auth';
import {routes as recipeRouter} from './src/controllers/recipe';

const app = express();

// middleware
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// controllers
app.use(authRouter());
app.use(recipeRouter());

app.get('/protected', authorize(), (req, res) => {
    res.status(200);
    res.send(req.user);
});

app.use((err, req, res, next) => {
    console.error(`ERROR: ${err.message}`);
    next();
});

export default app;
