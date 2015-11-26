import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

// initialize models
import './src/models';

import {routes as authRouter} from './src/controllers/auth';
import {routes as recipeRouter} from './src/controllers/recipe';
import {routes as userRecipesRouter} from './src/controllers/user-recipes';
import {routes as streamRouter} from './src/controllers/stream';
import {routes as ingredientsRouter} from './src/controllers/ingredients';
import {routes as pantryRouter} from './src/controllers/pantry';

const app = express();

// CORS is hard
app.use(cors());
app.options('*', cors());

// middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// controllers
app.use(authRouter());
app.use(recipeRouter());
app.use(userRecipesRouter());
app.use(streamRouter());
app.use(ingredientsRouter());
app.use(pantryRouter());

app.use((err, req, res, next) => {
    console.error(`ERROR: ${err.message}`);
    next();
});

export default app;
