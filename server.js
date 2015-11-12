import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import authorize from './src/middleware/auth';
import {routes as authRouter} from './src/controllers/auth';
import {routes as recipeRouter} from './src/controllers/recipe';
import {routes as likesRouter} from './src/controllers/likes';
import {routes as streamRouter} from './src/controllers/stream';
import {routes as favoritesRouter} from './src/controllers/favorites';
import {routes as completedRouter} from './src/controllers/completed';
import {routes as ingredientsRouter} from './src/controllers/ingredients';
import {routes as pantryRouter} from './src/controllers/pantry';

const app = express();

// middleware
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// controllers
app.use(authRouter());
app.use(recipeRouter());
app.use(likesRouter());
app.use(streamRouter());
app.use(favoritesRouter());
app.use(completedRouter());
app.use(ingredientsRouter());
app.use(pantryRouter());

app.get('/protected', authorize(), (req, res) => {
    res.status(200);
    res.send(req.user);
});

app.use((err, req, res, next) => {
    console.error(`ERROR: ${err.message}`);
    next();
});

export default app;
